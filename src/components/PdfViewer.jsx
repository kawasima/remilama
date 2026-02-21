import React, { useState } from 'react'
import useStore from '../store'
import PdfDocument from './PdfDocument'
import ReviewComment from './ReviewComment'
import SelectReviewFile from './SelectReviewFile'
import DocumentControls from './DocumentControls'

function extractComments(review, reviewer, filename, page, scale, showCommentBody) {
  if (!review) return null

  return review.comments
    .filter(comment => comment.page === page && comment.filename === filename)
    .map(comment => (
      <ReviewComment {...comment}
        key={comment.id}
        scale={scale}
        reviewer={reviewer}
        showCommentBody={showCommentBody}
        onMoveComment={review.onMoveComment}
        onUpdateComment={review.onUpdateComment}
        onDeleteComment={review.onDeleteComment} />
    ))
}

export default function PdfViewer({ review, reviewer, filename, binaryContent, file, onPageComplete, onPageClick }) {
  const pdf = useStore((s) => s.pdf)
  const setNumPages = useStore((s) => s.setNumPages)
  const goToPage = useStore((s) => s.goToPage)
  const setScale = useStore((s) => s.setScale)
  const pdfShow = useStore((s) => s.pdfShow)
  const [showCommentBody, setShowCommentBody] = useState(false)

  const handleNext = () => goToPage(pdf.page + 1)
  const handlePrevious = () => goToPage(pdf.page - 1)
  const handleZoomIn = () => setScale(pdf.scale * 1.2)
  const handleZoomOut = () => setScale(pdf.scale / 1.2)

  const comments = extractComments(review, reviewer, filename, pdf.page, pdf.scale, showCommentBody)

  return (file || binaryContent) ? (
    <div>
      <DocumentControls
        page={pdf.page} numPages={pdf.numPages} scale={pdf.scale}
        onNext={handleNext} onPrevious={handlePrevious}
        onGoToPage={goToPage} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut}
        showCommentBody={showCommentBody}
        onToggleCommentMode={() => setShowCommentBody((v) => !v)}
      />
      <div style={{ position: 'relative', overflow: 'scroll', border: '1px solid #cccccc' }}>
        <PdfDocument
          page={pdf.page} scale={pdf.scale} filename={filename}
          file={file} binaryContent={binaryContent}
          onDocumentComplete={setNumPages}
          onPageComplete={onPageComplete}
          onPageClick={onPageClick}
        />
        {comments}
      </div>
    </div>
  ) : (
    <SelectReviewFile onSelectFile={pdfShow} />
  )
}
