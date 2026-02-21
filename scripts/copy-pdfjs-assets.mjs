import { cpSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

const cmapsSrc = resolve(rootDir, 'node_modules/pdfjs-dist/cmaps')
const fontsSrc = resolve(rootDir, 'node_modules/pdfjs-dist/standard_fonts')
const cmapsDst = resolve(rootDir, 'public/pdfjs/cmaps')
const fontsDst = resolve(rootDir, 'public/pdfjs/standard_fonts')

mkdirSync(cmapsDst, { recursive: true })
mkdirSync(fontsDst, { recursive: true })

cpSync(cmapsSrc, cmapsDst, { recursive: true })
cpSync(fontsSrc, fontsDst, { recursive: true })

console.log('Copied pdf.js assets to public/pdfjs')
