import React from 'react'
import PropTypes from 'prop-types'

import PDFJS from 'pdfjs-dist'

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

class PdfDocument extends React.Component {
  static defaultProps = {
    page: 1,
    scale: 1.0,
    fillWidth: false,
    fillHeight: false
  }

  state = {}
  static defaultBinaryToBase64(arrayBuffer) {
    let base64 = ''
    const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    const bytes = new Uint8Array(arrayBuffer)
    const byteRemainder = byteLength % 3
    const mainLength = byteLength - byteRemainder

    let a, b, c, d, chunk
f
    for (let i = 0; i < mainLength; i += 3) {
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

      a = (chunk & 16515072) >> 18
      b = (chunk & 258048) >> 12
      c = (chunk & 4032) >> 6
      d = chunk & 63

      base64 = [base64, encodings[a], encodings[b], encodings[c], encodings[d]].join('')
    }

    if (byteRemainder === 1) {
      chunk = bytes[mainLength]

      a = (chunk & 252) >> 2
      b = (chunk & 3) << 4
      base64 = [base64, encodings[a], encodings[b], '=='].join('')
    } else if (byteRemainder === 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

      a = (chunk & 64512) >> 10
      b = (chunk & 1008) >> 4
      c = (chunk & 15) << 2

      base64 = [base64, encodings[a], encodings[b], encodings[c], '='].join('')
    }
    return base64
  }

  componentDidMount() {
    this.loadPDFDocument(this.props)
    this.renderPdf()


    window.addEventListener('resize', this.renderPdf)
    window.addEventListener('orientationchange', this.renderPdf)
  }

  componentWillReceiveProps(newProps) {
    const { pdf } = this.state

    const newDocInit = (newProps.documentInitParameters && newProps.documentInitParameters.url) ?
          newProps.documentInitParameters.url : null
    const docInit = (this.props.documentInitParameters && this.props.documentInitParameters.url) ?
          this.props.documentInitParameters.url : null

    let newSource = newProps.file
    let oldSource = newSource ? this.props.file : null
    newSource = newSource || newProps.binaryContent
    oldSource = newSource && !oldSource ? this.props.binaryContent : oldSource
    newSource = newSource || newProps.content
    oldSource = newSource && !oldSource ? this.props.content : oldSource
    newSource = newSource || newDocInit
    oldSource = newSource && !oldSource ? docInit : oldSource

    if (newSource && newSource !== oldSource &&
        ((newProps.file && newProps.file !== this.props.file) ||
         (newProps.content && newProps.content !== this.props.content) ||
         (newProps.binaryContent && newProps.binaryContent !== this.props.binaryContent) ||
         (newDocInit && JSON.stringify(newDocInit) !== JSON.stringify(docInit)))) {
      this.loadPDFDocument(newProps)
    }

    if (pdf && ((newProps.page && newProps.page !== this.props.page) ||
                (newProps.scale && newProps.scale !== this.props.scale) ||
                (newProps.rotate && newProps.rotate !== this.props.rotate))) {
      this.setState({ page: null })
      pdf.getPage(newProps.page).then(this.onPageComplete)
    }
  }

  componentWillUnmount() {
    const { pdf } = this.state
    if (pdf) {
      pdf.destroy()
    }
    if (this.documentPromise) {
      this.documentPromise.cancel()
    }

    window.removeEventListener('resize', this.renderPdf)
    window.removeEventListener('orientationchange', this.renderPdf)
  }

  onGetPdfRaw = pdfRaw => {
    const { onContentAvailable, onBinaryContentAvailable, binaryToBase64 } = this.props
    if (typeof onBinaryContentAvailable === 'function') {
      onBinaryContentAvailable(pdfRaw)
    }
    if (typeof onContentAvailable === 'function') {
      let convertBinaryToBase64 = this.defaultBinaryToBase64
      if (typeof binaryToBase64 === 'function') {
        convertBinaryToBae64 = binaryToBase64
      }
      onContentAvailable(convertBinaryToBase64(pdfRaw))
    }
  }

  onDocumentComplete = pdf => {
    this.setState({ pdf })
    const { onDocumentComplete, onContentAvailable, onBinaryContentAvailable } = this.props
    if (typeof onDocumentComplete === 'function') {
      onDocumentComplete(pdf.numPages)
    }
    if (typeof onContentAvailable === 'function' || typeof onBinaryContentAvailable === 'function') {
      pdf.getData().then(this.onGetPdfRaw)
    }
    pdf.getPage(this.props.page).then(this.onPageComplete)
  }

  onDocumentError = err => {
    if (err.isCanceled && err.pdf) {
      err.pdf.destroy()
    }
    if (typeof this.props.onDocumentError === 'function') {
      this.props.onDocumentError(err)
    }
  }

  onPageComplete = page => {
    this.setState({ page })
    this.renderPdf()
    const { onPageComplete } = this.props
    if (typeof onPageComplete === 'function') {
      onPageComplete(page.pageIndex + 1)
    }
  }

  getDocument = val => {
    if (this.documentPromise) {
      this.documentPromise.cancel()
    }
    this.documentPromise = makeCancelable(PDFJS.getDocument(val).promise)
    this.documentPromise
      .promise
      .then(this.onDocumentComplete)
      .catch(this.onDocumentError)

    return this.documentPromise
  }


  loadByteArray = byteArray => this.getDocument(byteArray)

  loadPDFDocument = props => {
    if (props.file) {
      if (typeof props.file === 'string') {
        return this.getDocument(props.file)
      }

      const reader = new FileReader()
      reader.onloadend = () =>
        this.loadByteArray(new Uint8Array(reader.result))
      reader.readAsArrayBuffer(props.file)
    } else if (props.binaryContent) {
      this.loadByteArray(props.binaryContent)
    } else if (props.content) {
      const bytes = window.atob(props.content)
      const byteLength = bytes.length
      const byteArray = new Uint8Array(new ArrayBuffer(byteLength))
      for (let index = 0; index < byteLength; index += 1) {
        byteArray[index] = bytes.charCodeAt(index)
      }
      this.loadByteArray(byteArray)
    } else if (props.documentInitParameters) {
      return this.getDocument(props.documentInitParameters)
    } else {
      throw new Error('react-pdf-js works with a file(URL) or (base64)content. At least one needs to be provided!')
    }
  }

  renderPdf() {
    const { page } = this.state
    if (page) {
      const {
        fillWidth,
        fillHeight,
        rotate,
        scale: pScale,
        className,
        style
      } = this.props

      const canvas = document.createElement('canvas')

      Object.keys(style || {}).forEach(styleField => {
        canvas.style[styleField] = style[styleField]
      })
      canvas.className = className

      const parentElement = this.canvasParent
      const previousCanvas = parentElement.firstChild
      if (previousCanvas) {
        parentElement.replaceChild(canvas, previousCanvas)
      } else {
        parentElement.appendChild(canvas)
      }

      const canvasContext = canvas.getContext('2d')
      const dpiScale = window.devicePixelRatio || 1
      const scale = calculateScale(pScale, fillWidth, fillHeight, page.view, parentElement)
      const adjustedScale = scale * dpiScale
      const viewport = page.getViewport(adjustedScale, rotate)
      canvas.style.width = `${viewport.width / dpiScale}px`
      canvas.style.height = `${viewport.height / dpiScale}px`
      canvas.height = viewport.height
      canvas.width = viewport.width
      if (this.props.onPageClick) {
        canvas.addEventListener('click', (e) => {
          const rect = e.target.getBoundingClientRect()
          this.props.onPageClick(
            this.props.filename,
            this.props.page,
            e.clientX - rect.left,
            e.clientY - rect.top,
            this.props.scale)})
      }
      page.render({ canvasContext, viewport })
    }
  }

  render() {
    const {
      loading,
      onRenderedCanvas
    } = this.props
    const { page } = this.state

    return page ?
      (
        <div ref={(parentDiv) => {
            if (parentDiv) {
              this.canvasParent = parentDiv
            }
          }}/>
      )
      :
      loading || <div>Loading PDF...</div>
  }
}

PdfDocument.propTypes = {
  content: PropTypes.string,
  documentInitParameters: PropTypes.shape({
    url: PropTypes.string
  }),
  binaryContent: PropTypes.shape({
    data: PropTypes.any
  }),
  filename: PropTypes.string,
  file: PropTypes.any,
  loading: PropTypes.any,
  page: PropTypes.number,
  scale: PropTypes.number,
  fillWidth: PropTypes.bool,
  fillHeight: PropTypes.bool,
  rotate: PropTypes.number,
  onContentAvailable: PropTypes.func,
  onBinaryContentAvailable: PropTypes.func,
  binaryToBase64: PropTypes.func,
  onDocumentComplete: PropTypes.func,
  onDocumentError: PropTypes.func,
  onPageClick: PropTypes.func,
  onPageComplete: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  onRenderedCanvas: PropTypes.func
}

export default PdfDocument
