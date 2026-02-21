import React, { useState, useRef, useEffect, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const PDFJS_ASSET_BASE = import.meta.env.BASE_URL || '/'
const PDFJS_DOCUMENT_OPTIONS = {
  cMapUrl: `${PDFJS_ASSET_BASE}pdfjs/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${PDFJS_ASSET_BASE}pdfjs/standard_fonts/`,
  useWorkerFetch: true,
}

const makeCancelable = (promise) => {
  let hasCanceled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(val => (
      hasCanceled ? reject({ pdf: val, isCanceled: true }) : resolve(val)
    ))
    promise.catch(error => (
      hasCanceled ? reject({ isCanceled: true }) : reject(error)
    ))
  })

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true
    }
  }
}

const calculateScale = (scale, fillWidth, fillHeight, view, parentElement) => {
  if (fillWidth) {
    const pageWidth = view[2] - view[0]
    return parentElement.clientWidth / pageWidth
  }
  if (fillHeight) {
    const pageHeight = view[3] - view[1]
    return parentElement.clientHeight / pageHeight
  }
  return scale
}

export default function PdfDocument({
  file, binaryContent, content, documentInitParameters,
  page: pageProp = 1, scale: pScale = 1.0,
  fillWidth = true, fillHeight = true, rotate,
  className, style, loading,
  onDocumentComplete, onDocumentError,
  onPageClick, onPageComplete,
  onContentAvailable, onBinaryContentAvailable, binaryToBase64,
  filename,
}) {
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageObj, setPageObj] = useState(null)
  const canvasParentRef = useRef(null)
  const documentPromiseRef = useRef(null)

  const getDocument = useCallback((val) => {
    if (documentPromiseRef.current) {
      documentPromiseRef.current.cancel()
    }

    const normalized = (() => {
      if (typeof val === 'string') return { url: val }
      if (val instanceof Uint8Array || val instanceof ArrayBuffer) return { data: val }
      return val || {}
    })()

    documentPromiseRef.current = makeCancelable(
      pdfjsLib.getDocument({ ...PDFJS_DOCUMENT_OPTIONS, ...normalized }).promise
    )
    return documentPromiseRef.current
  }, [])

  const loadByteArray = useCallback((byteArray) => getDocument(byteArray), [getDocument])

  const loadPDFDocument = useCallback((props) => {
    const docPromise = (() => {
      if (props.file) {
        if (typeof props.file === 'string') {
          return getDocument(props.file)
        }
        const reader = new FileReader()
        reader.onloadend = () => loadByteArray(new Uint8Array(reader.result))
          .promise.then(pdf => handleDocumentComplete(pdf))
          .catch(err => handleDocumentError(err))
        reader.readAsArrayBuffer(props.file)
        return null
      } else if (props.binaryContent) {
        return loadByteArray(props.binaryContent)
      } else if (props.content) {
        const bytes = window.atob(props.content)
        const byteLength = bytes.length
        const byteArray = new Uint8Array(new ArrayBuffer(byteLength))
        for (let index = 0; index < byteLength; index += 1) {
          byteArray[index] = bytes.charCodeAt(index)
        }
        return loadByteArray(byteArray)
      } else if (props.documentInitParameters) {
        return getDocument(props.documentInitParameters)
      }
      return null
    })()

    if (docPromise) {
      docPromise.promise
        .then(pdf => handleDocumentComplete(pdf))
        .catch(err => handleDocumentError(err))
    }
  }, [getDocument, loadByteArray])

  const handleDocumentComplete = useCallback((pdf) => {
    setPdfDoc(pdf)
    if (typeof onDocumentComplete === 'function') {
      onDocumentComplete(pdf.numPages)
    }
  }, [onDocumentComplete])

  const handleDocumentError = useCallback((err) => {
    if (err.isCanceled && err.pdf) {
      err.pdf.destroy()
    }
    if (typeof onDocumentError === 'function') {
      onDocumentError(err)
    }
  }, [onDocumentError])

  // Load document on mount
  useEffect(() => {
    loadPDFDocument({ file, binaryContent, content, documentInitParameters })

    return () => {
      if (documentPromiseRef.current) {
        documentPromiseRef.current.cancel()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload if source changes
  const prevFileRef = useRef(file)
  const prevBinaryRef = useRef(binaryContent)
  const prevContentRef = useRef(content)
  useEffect(() => {
    const sourceChanged =
      (file && file !== prevFileRef.current) ||
      (binaryContent && binaryContent !== prevBinaryRef.current) ||
      (content && content !== prevContentRef.current)
    prevFileRef.current = file
    prevBinaryRef.current = binaryContent
    prevContentRef.current = content

    if (sourceChanged) {
      loadPDFDocument({ file, binaryContent, content, documentInitParameters })
    }
  }, [file, binaryContent, content, documentInitParameters, loadPDFDocument])

  // Handle page/scale/rotate changes
  useEffect(() => {
    if (!pdfDoc) return

    setPageObj(null)
    pdfDoc.getPage(pageProp).then(page => {
      setPageObj(page)
      if (typeof onPageComplete === 'function') {
        onPageComplete(page.pageIndex + 1)
      }
    })
  }, [pdfDoc, pageProp, pScale, rotate, onPageComplete])

  // Render PDF to canvas
  const renderPdf = useCallback(() => {
    if (!pageObj || !canvasParentRef.current) return

    const parentElement = canvasParentRef.current
    const canvas = document.createElement('canvas')

    Object.keys(style || {}).forEach(styleField => {
      canvas.style[styleField] = style[styleField]
    })
    canvas.className = className

    const previousCanvas = parentElement.firstChild
    if (previousCanvas) {
      parentElement.replaceChild(canvas, previousCanvas)
    } else {
      parentElement.appendChild(canvas)
    }

    const canvasContext = canvas.getContext('2d')
    const dpiScale = window.devicePixelRatio || 1
    const scale = calculateScale(pScale, fillWidth, fillHeight, pageObj.view, parentElement)
    const adjustedScale = scale * dpiScale
    const viewport = pageObj.getViewport({ scale: adjustedScale, rotation: rotate })
    canvas.style.width = `${viewport.width / dpiScale}px`
    canvas.style.height = `${viewport.height / dpiScale}px`
    canvas.height = viewport.height
    canvas.width = viewport.width
    if (onPageClick) {
      let pressTimer = null
      let startPos = null
      const LONG_PRESS_MS = 500
      const MOVE_THRESHOLD = 5

      canvas.addEventListener('pointerdown', (e) => {
        startPos = { x: e.clientX, y: e.clientY }
        pressTimer = setTimeout(() => {
          const rect = e.target.getBoundingClientRect()
          onPageClick(filename, pageProp, startPos.x - rect.left, startPos.y - rect.top, pScale)
          pressTimer = null
        }, LONG_PRESS_MS)
      })
      canvas.addEventListener('pointermove', (e) => {
        if (pressTimer && startPos) {
          const dx = e.clientX - startPos.x
          const dy = e.clientY - startPos.y
          if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
            clearTimeout(pressTimer)
            pressTimer = null
          }
        }
      })
      canvas.addEventListener('pointerup', () => {
        if (pressTimer) {
          clearTimeout(pressTimer)
          pressTimer = null
        }
      })
      canvas.addEventListener('pointerleave', () => {
        if (pressTimer) {
          clearTimeout(pressTimer)
          pressTimer = null
        }
      })
    }
    pageObj.render({ canvasContext, viewport })
  }, [pageObj, pScale, fillWidth, fillHeight, rotate, className, style, onPageClick, filename, pageProp])

  useEffect(() => {
    renderPdf()
  }, [renderPdf])

  useEffect(() => {
    window.addEventListener('resize', renderPdf)
    window.addEventListener('orientationchange', renderPdf)
    return () => {
      window.removeEventListener('resize', renderPdf)
      window.removeEventListener('orientationchange', renderPdf)
    }
  }, [renderPdf])

  // Cleanup PDF on unmount
  useEffect(() => {
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy()
      }
    }
  }, [pdfDoc])

  return pageObj
    ? <div ref={canvasParentRef} />
    : loading || <div>Loading PDF...</div>
}
