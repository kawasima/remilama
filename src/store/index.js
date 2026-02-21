import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isValidCategoryId } from '../lib/comment-categories'

// Clear old redux-persist data format if present
const oldData = localStorage.getItem('persist:review')
if (oldData) {
  try {
    const parsed = JSON.parse(oldData)
    if (typeof parsed.review === 'string') {
      localStorage.removeItem('persist:review')
    }
  } catch {
    // ignore
  }
}

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v)
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

const MAX_TEXT_LENGTH = 5000

function sanitizeString(v, maxLength = MAX_TEXT_LENGTH) {
  if (typeof v !== 'string') return ''
  return v.slice(0, maxLength)
}

const useStore = create(
  persist(
    (set) => ({
      // === review slice ===
      review: {
        id: null,
        name: null,
        reviewee: null,
        files: [],
        reviewers: [],
        comments: [],
        customFields: [],
        customValues: {},
      },

      createReview: (review) =>
        set((state) => ({ review: { ...state.review, ...review } })),

      initializeReview: () =>
        set({
          review: {
            id: null, name: null, reviewee: null, files: [], reviewers: [],
            comments: [], customFields: [], customValues: {},
          },
        }),

      addReviewFile: (file) =>
        set((state) => ({
          review: { ...state.review, files: [...state.review.files, file] },
        })),

      removeReviewFile: (filename) =>
        set((state) => ({
          review: {
            ...state.review,
            files: state.review.files.filter((f) => f.name !== filename),
          },
        })),

      addReviewer: ({ id, name }) =>
        set((state) => {
          if (!isNonEmptyString(id) || !isNonEmptyString(name)) return state
          if (state.review.reviewers.find((r) => r.id === id)) return state
          return {
            review: {
              ...state.review,
              reviewers: [...state.review.reviewers, { id, name: sanitizeString(name, 200) }],
            },
          }
        }),

      removeReviewer: (reviewerId) =>
        set((state) => ({
          review: {
            ...state.review,
            reviewers: state.review.reviewers.filter((r) => r.id !== reviewerId),
          },
        })),

      updateReviewerInfo: (reviewer) =>
        set((state) => {
          if (!reviewer || !isNonEmptyString(reviewer.id)) return state
          const allowed = { id: reviewer.id }
          if (isNonEmptyString(reviewer.name)) allowed.name = sanitizeString(reviewer.name, 200)
          return {
            review: {
              ...state.review,
              reviewers: state.review.reviewers.map((r) =>
                r.id === allowed.id ? { ...r, ...allowed } : r
              ),
            },
          }
        }),

      updateComments: (comments) =>
        set((state) => {
          if (!Array.isArray(comments)) return state
          return { review: { ...state.review, comments } }
        }),

      addComment: ({ id, filename, postedBy, postedAt, page, x, y, category }) => {
        if (!isNonEmptyString(id)) return
        if (!isFiniteNumber(x) || !isFiniteNumber(y)) return
        if (!isFiniteNumber(page) || page < 1) return
        const cat = (typeof category === 'string' && isValidCategoryId(category)) ? category : ''
        set((state) => ({
          review: {
            ...state.review,
            comments: [
              ...state.review.comments,
              {
                id,
                filename: sanitizeString(filename, 500),
                postedBy: postedBy && isNonEmptyString(postedBy.name)
                  ? { id: String(postedBy.id || ''), name: sanitizeString(postedBy.name, 200) }
                  : { id: '', name: '' },
                postedAt: isFiniteNumber(postedAt) ? postedAt : Date.now(),
                page: Math.floor(page),
                x,
                y,
                description: '',
                category: cat,
              },
            ],
          },
        }))
      },

      updateComment: (id, changes) =>
        set((state) => {
          if (!isNonEmptyString(id) || !changes || typeof changes !== 'object') return state
          const allowed = {}
          if (typeof changes.description === 'string') allowed.description = sanitizeString(changes.description)
          if (typeof changes.category === 'string') {
            if (isValidCategoryId(changes.category)) allowed.category = changes.category
          }
          if (isFiniteNumber(changes.x)) allowed.x = changes.x
          if (isFiniteNumber(changes.y)) allowed.y = changes.y
          if (Object.keys(allowed).length === 0) return state
          return {
            review: {
              ...state.review,
              comments: state.review.comments.map((c) =>
                c.id === id ? { ...c, ...allowed } : c
              ),
            },
          }
        }),

      removeComment: (id) =>
        set((state) => ({
          review: {
            ...state.review,
            comments: state.review.comments.filter((c) => c.id !== id),
          },
        })),

      setCustomFields: (customFields) =>
        set((state) => {
          if (!Array.isArray(customFields)) return state
          return { review: { ...state.review, customFields } }
        }),

      setCustomValue: (commentId, customFieldId, value) =>
        set((state) => ({
          review: {
            ...state.review,
            customValues: {
              ...state.review.customValues,
              [commentId]: {
                ...state.review.customValues[commentId],
                [customFieldId]: sanitizeString(String(value), 1000),
              },
            },
          },
        })),

      // === reviewer slice ===
      reviewer: {},

      joinReview: (reviewId, reviewer) =>
        set({ reviewer: { reviewId, id: reviewer.id, name: reviewer.name } }),

      showFile: (file) =>
        set((state) => ({ reviewer: { ...state.reviewer, file } })),

      // === pdf slice ===
      pdf: { page: 1, scale: 1 },

      pdfShow: (file) =>
        set((state) => ({ pdf: { ...state.pdf, file } })),

      goToPage: (page) =>
        set((state) => {
          if (!isFiniteNumber(page) || page < 1) return state
          const p = Math.floor(page)
          if (state.pdf.numPages && p > state.pdf.numPages) return state
          return { pdf: { ...state.pdf, page: p } }
        }),

      setScale: (scale) =>
        set((state) => {
          if (!isFiniteNumber(scale) || scale <= 0) return state
          return { pdf: { ...state.pdf, scale } }
        }),

      setNumPages: (numPages) =>
        set((state) => ({ pdf: { ...state.pdf, numPages } })),

      // === fileObject slice (NOT persisted) ===
      fileObjects: [],

      addFileObject: (file) =>
        set((state) => ({ fileObjects: [...state.fileObjects, file] })),

      removeFileObject: (filename) =>
        set((state) => ({
          fileObjects: state.fileObjects.filter((f) => f.name !== filename),
        })),
    }),
    {
      name: 'review',
      partialize: (state) => ({
        review: state.review,
        reviewer: { ...state.reviewer, file: undefined },
      }),
    }
  )
)

export default useStore
