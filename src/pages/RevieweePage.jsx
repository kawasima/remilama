import React, { useRef, useEffect, useCallback } from 'react'
import Peer from 'peerjs'
import { v4 as uuidv4 } from 'uuid'
import isArrayBuffer from 'is-array-buffer'
import { MessageSquareText } from 'lucide-react'
import useStore from '../store'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import PdfViewer from '../components/PdfViewer'
import Review from '../components/Review'
import Reviewer from '../components/Reviewer'
import ReviewCommentTable from '../components/ReviewCommentTable'
import detectPort from '../utils/detectPort'

export default function RevieweePage() {
  const peerRef = useRef(null)
  const dataConnectionsRef = useRef({})

  const review = useStore((s) => s.review)
  const reviewer = useStore((s) => s.reviewer)
  const pdf = useStore((s) => s.pdf)
  const fileObjects = useStore((s) => s.fileObjects)

  // Create Peer on mount
  useEffect(() => {
    const { review: currentReview } = useStore.getState()

    const peer = new Peer(currentReview.id, {
      host: '/',
      port: detectPort(window.location),
      path: '/peerjs',
      debug: 3,
    })

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        const { review: r } = useStore.getState()
        conn.send({
          type: 'REVIEW_INFO',
          review: {
            id: r.id,
            name: r.name,
            files: r.files.map((f) => ({ name: f.name })),
          },
        })
      })

      conn.on('data', (message) => {
        const store = useStore.getState()
        switch (message.type) {
          case 'REVIEWER':
            dataConnectionsRef.current = {
              ...dataConnectionsRef.current,
              [message.reviewer.id]: conn,
            }
            const existing = store.review.reviewers.find(
              (r) => r.name === message.reviewer.name
            )
            if (!existing) {
              store.addReviewer(message.reviewer)
            }
            break
          case 'FILE_REQUEST': {
            const file = store.fileObjects.find((f) => f.name === message.filename)
            const reader = new FileReader()
            reader.onload = () => {
              // Convert ArrayBuffer to Base64 and send in chunks
              // because PeerJS 0.3.14's binarypack can't serialize ArrayBuffer,
              // and large JSON messages crash the WebRTC data channel.
              const bytes = new Uint8Array(reader.result)
              let binary = ''
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i])
              }
              const base64 = btoa(binary)
              const CHUNK_SIZE = 16 * 1024 // 16KB per chunk
              const totalChunks = Math.ceil(base64.length / CHUNK_SIZE)
              for (let i = 0; i < totalChunks; i++) {
                conn.send({
                  type: 'FILE_CHUNK',
                  name: file.name,
                  chunk: base64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
                  index: i,
                  total: totalChunks,
                })
              }
            }
            reader.readAsArrayBuffer(file)
            break
          }
          case 'UPDATE_REVIEWER':
            store.updateReviewerInfo(message.reviewer)
            break
          case 'REVIEW/ADD_COMMENT':
            store.addComment(message)
            break
          case 'REVIEW/UPDATE_COMMENT':
            store.updateComment(message.id, message.changes)
            break
          case 'REVIEW/REMOVE_COMMENT':
            store.removeComment(message.id)
            break
        }
      })

      conn.on('close', () => {
        const { review: r } = useStore.getState()
        const conns = dataConnectionsRef.current
        r.reviewers.forEach((rev) => {
          if (conns[rev.id] === conn) {
            useStore.getState().removeReviewer(rev.id)
          }
        })
      })
    })

    peerRef.current = peer

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy()
      }
    }
  }, [])

  // Broadcast comment updates to connected reviewers
  const prevCommentsRef = useRef(review.comments)
  useEffect(() => {
    if (prevCommentsRef.current === review.comments) return
    prevCommentsRef.current = review.comments

    if (!review.reviewers) return
    review.reviewers.forEach((rev) => {
      const conn = dataConnectionsRef.current[rev.id]
      if (conn) {
        conn.send({
          type: 'REVIEW/UPDATE_COMMENTS',
          comments: review.comments,
        })
      }
    })
  }, [review.comments, review.reviewers])

  // Broadcast navigation (page/file) to connected reviewers
  const prevNavRef = useRef({ filename: reviewer.file?.name, page: pdf.page })
  useEffect(() => {
    const filename = reviewer.file?.name
    const page = pdf.page
    const prev = prevNavRef.current
    if (prev.filename === filename && prev.page === page) return
    prevNavRef.current = { filename, page }

    if (!filename) return
    if (!review.reviewers) return
    review.reviewers.forEach((rev) => {
      const conn = dataConnectionsRef.current[rev.id]
      if (conn) {
        conn.send({ type: 'NAVIGATE', filename, page })
      }
    })
  }, [reviewer.file, pdf.page, review.reviewers])

  const handleSelectFile = useCallback((filename) => {
    const file = useStore.getState().fileObjects.find((f) => f.name === filename)
    const reader = new FileReader()
    reader.onload = () => useStore.getState().showFile({ name: file.name, blob: reader.result })
    reader.readAsArrayBuffer(file)
  }, [])

  const handleReSelectFile = useCallback((file) => {
    if (file) {
      useStore.getState().addFileObject(file)
    }
  }, [])

  const handleGoToPage = useCallback((page) => {
    useStore.getState().goToPage(page)
  }, [])

  const handleChangeCustomValue = useCallback((commentId, fieldId, value) => {
    useStore.getState().setCustomValue(commentId, fieldId, value)
  }, [])

  const handlePostComment = useCallback((filename, page, x, y, scale) => {
    const { review: r } = useStore.getState()
    const revieweeName = r.reviewee?.name
    if (!revieweeName) return

    useStore.getState().addComment({
      type: 'REVIEW/ADD_COMMENT',
      id: uuidv4(),
      postedAt: Date.now(),
      postedBy: { id: r.reviewee?.id || 'reviewee', name: revieweeName },
      x: x / scale,
      y: y / scale,
      page,
      filename,
    })
  }, [])

  const handleUpdateComment = useCallback((id, description, category) => {
    const changes = {}
    if (description !== undefined) changes.description = description
    if (category !== undefined) changes.category = category
    useStore.getState().updateComment(id, changes)
  }, [])

  const handleMoveComment = useCallback(({ id, x, y }) => {
    useStore.getState().updateComment(id, { x, y })
  }, [])

  const handleDeleteComment = useCallback((id) => {
    useStore.getState().removeComment(id)
  }, [])

  const documentView = isArrayBuffer(reviewer.file && reviewer.file.blob) ? (
    <PdfViewer
      review={{
        ...review,
        onMoveComment: handleMoveComment,
        onUpdateComment: handleUpdateComment,
        onDeleteComment: handleDeleteComment,
      }}
      reviewer={review.reviewee}
      filename={reviewer.file.name}
      binaryContent={reviewer.file.blob}
      onPageComplete={() => {}}
      onPageClick={handlePostComment}
    />
  ) : null

  const commentTable = (review.comments.length > 0) ? (
    <ReviewCommentTable
      comments={review.comments}
      customFields={review.customFields}
      customValues={review.customValues}
      onChangeCustomValue={handleChangeCustomValue}
      onGoToPage={handleGoToPage}
      onSelectFile={handleSelectFile}
    />
  ) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Review {...review}
          onSelectFile={handleSelectFile}
          onReSelectFile={handleReSelectFile}
          fileObject={fileObjects}
          isReviewee={true} />

        {review.reviewers.map(rev => <Reviewer key={rev.id} reviewer={rev} />)}
        {documentView}
        {commentTable}
      </CardContent>
    </Card>
  )
}
