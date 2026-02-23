/**
 * PDF text extraction using pdfjs-dist in Node.js.
 */

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Point to the worker file (Node.js uses a fake in-process worker).
// import.meta.resolve resolves through node_modules correctly.
GlobalWorkerOptions.workerSrc = import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')

/**
 * Extract text from a PDF ArrayBuffer, grouped by page.
 *
 * @param {ArrayBuffer} arrayBuffer - The PDF file data
 * @returns {Promise<{ numPages: number, pages: Array<{ page: number, text: string }> }>}
 */
export async function extractText(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer)
  const loadingTask = getDocument({ data })
  const pdf = await loadingTask.promise

  const pages = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const text = textContent.items
      .filter((item) => 'str' in item)
      .map((item) => item.str)
      .join(' ')
    pages.push({ page: pageNum, text })
  }

  await loadingTask.destroy()
  return { numPages: pdf.numPages, pages }
}
