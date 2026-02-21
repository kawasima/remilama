import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useDrag } from 'react-dnd'
import { X } from 'lucide-react'
import { COMMENT_CATEGORIES, getCategoryById } from '../lib/comment-categories'

function PinFilledIcon({ className, style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="m15.113 3.21l.094.083l5.5 5.5a1 1 0 0 1-1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1-.158.277l-.07.08l-1.5 1.5a1 1 0 0 1-1.32.082l-.095-.083L9 16.415l-3.793 3.792a1 1 0 0 1-1.497-1.32l.083-.094L7.585 15l-2.792-2.793a1 1 0 0 1-.083-1.32l.083-.094l1.5-1.5a1 1 0 0 1 .258-.187l.098-.042l3.796-1.425l3.171-3.17a1 1 0 0 1 1.497-1.26z"/>
    </svg>
  )
}

export default function ReviewComment({
  id, x, y, scale, description, category, postedBy,
  reviewer, showCommentBody, onDeleteComment, onMoveComment, onUpdateComment
}) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(description)
  const [hovered, setHovered] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const rootRef = useRef(null)
  const bubbleRef = useRef(null)

  const cat = getCategoryById(category)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ReviewComment',
    item: { commentId: id },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta && typeof onMoveComment === 'function') {
        onMoveComment({
          id,
          x: (x * scale + delta.x) / scale,
          y: (y * scale + delta.y) / scale
        })
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [id, x, y, scale, onMoveComment])

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    setEditing(false)
    if (typeof onUpdateComment === 'function') {
      onUpdateComment(id, editText)
    }
  }

  const handleChangeCategory = (e) => {
    e.stopPropagation()
    if (typeof onUpdateComment === 'function') {
      onUpdateComment(id, undefined, e.target.value)
    }
  }

  const editForm = (
    <form onSubmit={handleSubmitEdit}>
      <textarea
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            setEditing(false)
            if (typeof onUpdateComment === 'function') {
              onUpdateComment(id, editText)
            }
          }
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </form>
  )

  const showBubble = !!(showCommentBody || hovered || editing)

  const updateBubblePlacement = useCallback(() => {
    if (!showBubble || !rootRef.current || !bubbleRef.current) return
    const scrollContainer = rootRef.current.parentElement
    if (!scrollContainer) return

    const pinLeft = x * scale
    const visibleRight = scrollContainer.scrollLeft + scrollContainer.clientWidth
    const bubbleWidth = bubbleRef.current.offsetWidth
    const pinAndGap = 24
    const wouldOverflowRight = pinLeft + pinAndGap + bubbleWidth > visibleRight

    setAlignRight(wouldOverflowRight)
  }, [showBubble, x, scale])

  useLayoutEffect(() => {
    updateBubblePlacement()
  }, [updateBubblePlacement, description, editText, editing])

  useLayoutEffect(() => {
    if (!showBubble || !rootRef.current) return undefined
    const scrollContainer = rootRef.current.parentElement
    if (!scrollContainer) return undefined
    const onScroll = () => updateBubblePlacement()
    const onResize = () => updateBubblePlacement()
    scrollContainer.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [showBubble, updateBubblePlacement])

  const content = editing
    ? editForm
    : <p className="text-sm text-foreground whitespace-pre-wrap">{description}</p>

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        left: x * scale,
        top: y * scale,
        visibility: isDragging ? 'hidden' : 'visible',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={drag}
        type="button"
        className="flex items-center justify-center cursor-grab active:cursor-grabbing drop-shadow-md hover:drop-shadow-lg transition-[filter]"
        title={description || 'Comment'}
      >
        <PinFilledIcon className="h-5 w-5" style={{ color: cat.color.fill }} />
      </button>
      {showBubble && (
        <div
          ref={bubbleRef}
          className="absolute top-0 rounded-lg border border-border bg-popover text-popover-foreground shadow-md overflow-hidden"
          style={{
            left: alignRight ? 'auto' : '24px',
            right: alignRight ? '24px' : 'auto',
            minWidth: '280px',
            maxWidth: '420px',
          }}
          onClick={() => {
            if (!editing && typeof onUpdateComment === 'function') {
              setEditing(true)
              setEditText(description)
            }
          }}
        >
          <div className="flex" style={{ borderLeft: `3px solid ${cat.color.fill}` }}>
            <div className="flex-1 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{postedBy?.name}</span>
                  <select
                    className="h-5 rounded border border-input bg-transparent px-1 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={category || ''}
                    onChange={handleChangeCategory}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">--</option>
                    {COMMENT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label} ({c.labelJa})</option>
                    ))}
                  </select>
                </div>
                {(reviewer && reviewer.name === postedBy?.name) && (
                  <button
                    className="p-0.5 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (typeof onDeleteComment === 'function') {
                        onDeleteComment(id)
                      }
                    }}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
