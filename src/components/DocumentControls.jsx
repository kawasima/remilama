import React from 'react'
import { ZoomOut, ZoomIn, MessageSquare, MapPin } from 'lucide-react'
import { Button } from './ui/button'
import DocumentPagination from './DocumentPagination'

export default function DocumentControls(props) {
  const { onZoomOut, onZoomIn, showCommentBody, onToggleCommentMode } = props

  return (
    <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2">
      <DocumentPagination {...props} />
      <div className="flex items-center gap-1">
        <Button
          variant={showCommentBody ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToggleCommentMode?.()}
          title={showCommentBody ? 'Show pin + comment' : 'Show pins only (hover to preview)'}
        >
          {showCommentBody ? <MessageSquare className="mr-1 h-4 w-4" /> : <MapPin className="mr-1 h-4 w-4" />}
          {showCommentBody ? 'Pin + Text' : 'Pins Only'}
        </Button>
        <Button variant="outline" size="icon" onClick={() => onZoomOut()}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onZoomIn()}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
