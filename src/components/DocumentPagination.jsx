import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

export default function DocumentPagination({ page, numPages, onPrevious, onNext, onGoToPage }) {
  const [pageInput, setPageInput] = useState(page)

  useEffect(() => {
    setPageInput(page)
  }, [page])

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        disabled={page === 1}
        onClick={() => onPrevious()}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1 text-sm">
        <input
          type="number"
          className="w-10 rounded-md border border-input bg-transparent px-1 py-0.5 text-right text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={pageInput}
          onChange={e => {
            setPageInput(e.target.value)
            const intVal = parseInt(e.target.value)
            if (!isNaN(intVal) && intVal > 0 && intVal <= numPages) {
              onGoToPage(intVal)
            }
          }}
        />
        <span className="text-muted-foreground">/</span>
        <span>{numPages}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={page === numPages}
        onClick={() => onNext()}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
