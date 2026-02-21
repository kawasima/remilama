/**
 * Minimal .xlsx writer — zero dependencies.
 *
 * An .xlsx file is a ZIP archive containing XML files.
 * We build the XML by hand and zip it with the Compression Streams API
 * (supported in all modern browsers).
 */

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

function buildSheetXml(headers, rows) {
  const cells = []
  // header row
  headers.forEach((h, ci) => {
    const ref = colRef(ci) + '1'
    cells.push(`<c r="${ref}" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`)
  })
  // data rows
  rows.forEach((row, ri) => {
    const r = ri + 2
    headers.forEach((h, ci) => {
      const ref = colRef(ci) + r
      const val = row[h]
      if (val == null || val === '') return
      if (typeof val === 'number') {
        cells.push(`<c r="${ref}"><v>${val}</v></c>`)
      } else {
        cells.push(`<c r="${ref}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`)
      }
    })
  })

  const totalRows = rows.length + 1
  const totalCols = headers.length
  const dimension = `A1:${colRef(totalCols - 1)}${totalRows}`

  // Group cells into rows
  const rowXmls = []
  // header row
  const headerCells = []
  headers.forEach((h, ci) => {
    const ref = colRef(ci) + '1'
    headerCells.push(`<c r="${ref}" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`)
  })
  rowXmls.push(`<row r="1">${headerCells.join('')}</row>`)

  rows.forEach((row, ri) => {
    const r = ri + 2
    const dataCells = []
    headers.forEach((h, ci) => {
      const ref = colRef(ci) + r
      const val = row[h]
      if (val == null || val === '') return
      if (typeof val === 'number') {
        dataCells.push(`<c r="${ref}"><v>${val}</v></c>`)
      } else {
        dataCells.push(`<c r="${ref}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`)
      }
    })
    rowXmls.push(`<row r="${r}">${dataCells.join('')}</row>`)
  })

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="${dimension}"/>
<sheetData>${rowXmls.join('')}</sheetData>
</worksheet>`
}

function colRef(index) {
  let s = ''
  let i = index
  do {
    s = String.fromCharCode(65 + (i % 26)) + s
    i = Math.floor(i / 26) - 1
  } while (i >= 0)
  return s
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const WORKBOOK = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Comments" sheetId="1" r:id="rId1"/></sheets>
</workbook>`

const WORKBOOK_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`

/**
 * Build a ZIP file (no compression — STORE method) from a list of {name, data} entries.
 * data is a Uint8Array.
 */
function buildZip(entries) {
  const enc = new TextEncoder()
  const parts = []
  const centralDir = []
  let offset = 0

  for (const { name, data } of entries) {
    const nameBytes = enc.encode(name)
    // Local file header
    const local = new ArrayBuffer(30 + nameBytes.length)
    const lv = new DataView(local)
    lv.setUint32(0, 0x04034b50, true)  // signature
    lv.setUint16(4, 20, true)           // version needed
    lv.setUint16(6, 0, true)            // flags
    lv.setUint16(8, 0, true)            // compression: STORE
    lv.setUint16(10, 0, true)           // mod time
    lv.setUint16(12, 0, true)           // mod date
    lv.setUint32(14, crc32(data), true) // crc32
    lv.setUint32(18, data.length, true) // compressed size
    lv.setUint32(22, data.length, true) // uncompressed size
    lv.setUint16(26, nameBytes.length, true)
    lv.setUint16(28, 0, true)           // extra field length
    new Uint8Array(local).set(nameBytes, 30)

    parts.push(new Uint8Array(local))
    parts.push(data)

    // Central directory entry
    const cdir = new ArrayBuffer(46 + nameBytes.length)
    const cv = new DataView(cdir)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0, true)
    cv.setUint16(10, 0, true)
    cv.setUint16(12, 0, true)
    cv.setUint16(14, 0, true)
    cv.setUint32(16, crc32(data), true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint16(30, 0, true)
    cv.setUint16(32, 0, true)
    cv.setUint16(34, 0, true)
    cv.setUint16(36, 0, true)
    cv.setUint32(38, 0x20, true)
    cv.setUint32(42, offset, true)
    new Uint8Array(cdir).set(nameBytes, 46)
    centralDir.push(new Uint8Array(cdir))

    offset += local.byteLength + data.length
  }

  const cdirStart = offset
  let cdirSize = 0
  for (const c of centralDir) {
    parts.push(c)
    cdirSize += c.length
  }

  // End of central directory
  const eocd = new ArrayBuffer(22)
  const ev = new DataView(eocd)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(4, 0, true)
  ev.setUint16(6, 0, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, cdirSize, true)
  ev.setUint32(16, cdirStart, true)
  ev.setUint16(20, 0, true)
  parts.push(new Uint8Array(eocd))

  const totalSize = parts.reduce((s, p) => s + p.length, 0)
  const result = new Uint8Array(totalSize)
  let pos = 0
  for (const p of parts) {
    result.set(p, pos)
    pos += p.length
  }
  return result
}

/** CRC-32 (ISO 3309) */
const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  return table
})()

function crc32(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

/**
 * Generate and download an .xlsx file.
 * @param {string[]} headers - Column headers
 * @param {Object[]} rows - Array of row objects keyed by header names
 * @param {string} filename - Download filename
 */
export function downloadXlsx(headers, rows, filename) {
  const enc = new TextEncoder()
  const sheetXml = buildSheetXml(headers, rows)

  const entries = [
    { name: '[Content_Types].xml', data: enc.encode(CONTENT_TYPES) },
    { name: '_rels/.rels', data: enc.encode(RELS) },
    { name: 'xl/workbook.xml', data: enc.encode(WORKBOOK) },
    { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(WORKBOOK_RELS) },
    { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheetXml) },
  ]

  const zip = buildZip(entries)
  const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
