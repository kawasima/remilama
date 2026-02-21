import React, { useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Copy } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import SelectReviewFile from './SelectReviewFile'

function FileItem({ file, onReSelectFile, onSelectFile, isReviewee }) {
  const filelink = (!file.object && isReviewee)
    ? (
      <span>
        <span>{file.name}</span>
        <SelectReviewFile onSelectFile={onReSelectFile} />
      </span>
    )
    : (
      <a
        className="text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer"
        onClick={() => onSelectFile(file.name)}
      >
        {file.name}
      </a>
    )
  return <li>{filelink}</li>
}

export default function Review({ id, name, files, fileObject, onReSelectFile, onSelectFile, isReviewee }) {
  const [isCopying, setIsCopying] = useState(false)

  const handleCopy = () => {
    setIsCopying(true)
    setTimeout(() => setIsCopying(false), 2000)
  }

  const fileList = (
    <ul className="list-disc list-inside space-y-1 text-sm">
      {files.map(file => {
        const enriched = { ...file, object: (fileObject || []).find(f => f.name === file.name) }
        return (
          <FileItem key={file.name}
            file={enriched}
            onSelectFile={onSelectFile}
            onReSelectFile={onReSelectFile}
            isReviewee={isReviewee} />
        )
      })}
    </ul>
  )

  const reviewerUrl = `${window.location.origin}/review/${id}/reviewer`

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">Review:</span> {name} ({id}
          <CopyToClipboard text={reviewerUrl} onCopy={handleCopy}>
            <span className="relative inline-flex items-center cursor-pointer">
              <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              {isCopying && (
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs text-background whitespace-nowrap">
                  Copied
                </span>
              )}
            </span>
          </CopyToClipboard>)
        </div>
        <div>
          {fileList}
        </div>
      </CardContent>
    </Card>
  )
}
