import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Peer from 'peerjs'
import { v4 as uuidv4 } from 'uuid'
import isArrayBuffer from 'is-array-buffer'
import { MessageSquareText, Radio } from 'lucide-react'
import useStore from '../store'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import Review from '../components/Review'
import PdfViewer from '../components/PdfViewer'
import ReviewCommentTable from '../components/ReviewCommentTable'
import detectPort from '../utils/detectPort'
import { required } from '../validators'

export default function ReviewerPage() {
  const { id: reviewIdFromUrl } = useParams()
  const peerRef = useRef(null)
  const dataConnectionRef = useRef(null)

  const review = useStore((s) => s.review)
  const reviewer = useStore((s) => s.reviewer)

  const needsJoin = reviewIdFromUrl !== reviewer.reviewId

  // Reviewer name form state
  const [reviewerName, setReviewerName] = useState('')
  const [touched, setTouched] = useState({})
  const [followMode, setFollowMode] = useState(true)
  const followModeRef = useRef(followMode)
  followModeRef.current = followMode

  // Connect to reviewee via PeerJS
  useEffect(() => {
    if (needsJoin) return

    const peer = new Peer({
      host: '/',
      path: '/peerjs',
      port: detectPort(window.location),
      debug: 3,
    })
    peer.on('error', (err) => console.error('peer error:', err.type))

    // Buffer for reassembling chunked file transfers
    const fileChunks = {}

    peer.on('open', () => {
      const { reviewer: r } = useStore.getState()
      const conn = peer.connect(r.reviewId, { serialization: 'json' })
      conn.on('open', () => {
        console.log('PeerJS connection opened')
      })
      conn.on('data', (message) => {
        const store = useStore.getState()
        switch (message.type) {
          case 'REVIEW_INFO':
            conn.send({
              type: 'REVIEWER',
              reviewer: { id: store.reviewer.id, name: store.reviewer.name },
            })
            store.createReview(message.review)
            break
          case 'FILE_CHUNK': {
            const key = message.name
            if (!fileChunks[key]) {
              fileChunks[key] = { chunks: new Array(message.total), received: 0 }
            }
            const buf = fileChunks[key]
            buf.chunks[message.index] = message.chunk
            buf.received++
            if (buf.received === message.total) {
              const base64 = buf.chunks.join('')
              delete fileChunks[key]
              const binary = atob(base64)
              const bytes = new Uint8Array(binary.length)
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
              }
              store.showFile({ name: key, blob: bytes.buffer })
            }
            break
          }
          case 'REVIEW/UPDATE_COMMENTS':
            store.updateComments(message.comments)
            break
          case 'NAVIGATE':
            // Follow reviewee's (reviewer's) document/page navigation
            if (!followModeRef.current) break
            if (message.filename) {
              const currentFile = store.reviewer.file
              if (!currentFile || currentFile.name !== message.filename) {
                // Request the file we don't have yet
                conn.send({ type: 'FILE_REQUEST', filename: message.filename })
              }
            }
            if (message.page) {
              store.goToPage(message.page)
            }
            break
        }
      })
      conn.on('error', (err) => console.error('conn error:', err))

      dataConnectionRef.current = conn
    })

    peerRef.current = peer

    return () => {
      if (peerRef.current) {
        peerRef.current.disconnect()
        peerRef.current.destroy()
      }
    }
  }, [needsJoin])

  const handleJoinReview = (e) => {
    e.preventDefault()
    const nameError = required(reviewerName)
    if (nameError) {
      setTouched({ reviewer_name: true })
      return
    }
    useStore.getState().joinReview(reviewIdFromUrl, { id: uuidv4(), name: reviewerName })
  }

  const handlePageComplete = useCallback((page) => {
    const { reviewer: r, pdf } = useStore.getState()
    dataConnectionRef.current?.send({
      type: 'UPDATE_REVIEWER',
      reviewer: {
        id: r.id,
        action: `Show the ${pdf.page} page on ${r.file?.name}`
      }
    })
  }, [])

  const handleSelectFile = useCallback((filename) => {
    dataConnectionRef.current?.send({
      type: 'FILE_REQUEST',
      filename,
    })
  }, [])

  const handlePostComment = useCallback((filename, page, x, y, scale) => {
    const { reviewer: r } = useStore.getState()
    dataConnectionRef.current?.send({
      type: 'REVIEW/ADD_COMMENT',
      id: uuidv4(),
      postedAt: Date.now(),
      postedBy: { id: r.id, name: r.name },
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
    dataConnectionRef.current?.send({
      type: 'REVIEW/UPDATE_COMMENT',
      id,
      changes,
    })
  }, [])

  const handleMoveComment = useCallback(({ id, x, y }) => {
    // Optimistic update: apply locally first to avoid snap-back
    useStore.getState().updateComment(id, { x, y })
    dataConnectionRef.current?.send({
      type: 'REVIEW/UPDATE_COMMENT',
      id,
      changes: { x, y },
    })
  }, [])

  const handleDeleteComment = useCallback((id) => {
    dataConnectionRef.current?.send({
      type: 'REVIEW/REMOVE_COMMENT',
      id,
    })
  }, [])

  const handleGoToPage = useCallback((page) => {
    useStore.getState().goToPage(page)
  }, [])

  const handleChangeCustomValue = useCallback((commentId, fieldId, value) => {
    useStore.getState().setCustomValue(commentId, fieldId, value)
  }, [])

  const documentView = isArrayBuffer(reviewer.file && reviewer.file.blob) ? (
    <PdfViewer
      review={{
        ...review,
        onMoveComment: handleMoveComment,
        onUpdateComment: handleUpdateComment,
        onDeleteComment: handleDeleteComment,
      }}
      reviewer={reviewer}
      filename={reviewer.file.name}
      binaryContent={reviewer.file.blob}
      onPageComplete={handlePageComplete}
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

  const reviewerNameError = required(reviewerName)

  if (needsJoin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5" />
            Join Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{reviewIdFromUrl}</p>
          <form className="flex items-end gap-3" onSubmit={handleJoinReview}>
            <div className="space-y-2">
              <Label>
                Reviewer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                onBlur={() => setTouched({ reviewer_name: true })}
                placeholder="Your name"
                className={touched.reviewer_name && reviewerNameError ? 'border-destructive' : ''}
              />
              {touched.reviewer_name && reviewerNameError && (
                <p className="text-sm text-destructive">{reviewerNameError}</p>
              )}
            </div>
            <Button type="submit" disabled={!reviewerName}>
              Join
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          Review
        </CardTitle>
        <Button
          variant={followMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFollowMode((v) => !v)}
          title={followMode ? 'Follow mode ON: following presenter navigation' : 'Follow mode OFF: free navigation'}
        >
          <Radio className="h-4 w-4 mr-1.5" />
          {followMode ? 'Follow ON' : 'Follow OFF'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Review {...review} onSelectFile={handleSelectFile} />
        {documentView}
        {commentTable}
      </CardContent>
    </Card>
  )
}
