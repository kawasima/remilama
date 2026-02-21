export const COMMENT_CATEGORIES = [
  { id: 'bug',            label: 'Bug / Incorrect',       labelJa: '誤り',       color: { border: 'border-red-500',    bg: 'bg-red-200/90',    hover: 'hover:bg-red-200',    text: 'text-red-900',    fill: '#dc2626' } },
  { id: 'missing',        label: 'Missing',               labelJa: '欠落',       color: { border: 'border-orange-500', bg: 'bg-orange-200/90', hover: 'hover:bg-orange-200', text: 'text-orange-900', fill: '#ea580c' } },
  { id: 'inconsistency',  label: 'Inconsistency',         labelJa: '不整合',     color: { border: 'border-yellow-500', bg: 'bg-yellow-200/90', hover: 'hover:bg-yellow-200', text: 'text-yellow-900', fill: '#ca8a04' } },
  { id: 'unclear',        label: 'Unclear',               labelJa: '不明瞭',     color: { border: 'border-purple-500', bg: 'bg-purple-200/90', hover: 'hover:bg-purple-200', text: 'text-purple-900', fill: '#9333ea' } },
  { id: 'risk',           label: 'Risk',                  labelJa: 'リスク',     color: { border: 'border-pink-500',   bg: 'bg-pink-200/90',   hover: 'hover:bg-pink-200',   text: 'text-pink-900',   fill: '#db2777' } },
  { id: 'maintainability',label: 'Maintainability',       labelJa: '保守性',     color: { border: 'border-sky-500',    bg: 'bg-sky-200/90',    hover: 'hover:bg-sky-200',    text: 'text-sky-900',    fill: '#0284c7' } },
  { id: 'question',       label: 'Question / Proposal',   labelJa: '質問・提案', color: { border: 'border-green-500',  bg: 'bg-green-200/90',  hover: 'hover:bg-green-200',  text: 'text-green-900',  fill: '#16a34a' } },
]

export const DEFAULT_CATEGORY = COMMENT_CATEGORIES[0]

const VALID_IDS = new Set(COMMENT_CATEGORIES.map(c => c.id))

export function isValidCategoryId(id) {
  return id === '' || VALID_IDS.has(id)
}

export function getCategoryById(id) {
  return COMMENT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORY
}
