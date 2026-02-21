import React, { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible'
import SelectReviewFile from './SelectReviewFile'
import CustomCommentFieldUpload from './CustomCommentFieldUpload'
import CustomCommentFields from './CustomCommentFields'
import { required } from '../validators'

function AdvancedSettings({ customFields, onUploadCustomFields }) {
  const [open, setOpen] = useState(false)

  const customCommentFields = customFields.length === 0
    ? null
    : <CustomCommentFields customFields={customFields} />

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium hover:text-foreground/80 transition-colors py-2">
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
        Advanced
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pl-5">
          <Label>Custom Fields</Label>
          {customCommentFields}
          <div className="rounded-md border border-border p-3">
            <CustomCommentFieldUpload onUploadCustomFields={onUploadCustomFields} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function ReviewCreateForm({ files, customFields, onCreateReview, onSelectFile, onRemoveFile, onUploadCustomFields }) {
  const [reviewName, setReviewName] = useState('')
  const [revieweeName, setRevieweeName] = useState('')
  const [touched, setTouched] = useState({})

  const reviewNameError = required(reviewName)
  const revieweeNameError = required(revieweeName)
  const isInvalid = !!(reviewNameError || revieweeNameError)
  const isPristine = reviewName === '' && revieweeName === ''

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isInvalid || files.length === 0) return
    onCreateReview(reviewName, revieweeName)
  }

  const fileList = files ? (
    <ul className="space-y-1">
      {files.map(file => (
        <li key={file.name} className="flex items-center gap-1 text-sm">
          {file.name}
          <button
            type="button"
            className="p-0.5 rounded-sm hover:bg-destructive/10 transition-colors"
            onClick={() => onRemoveFile(file.name)}
          >
            <X className="h-3.5 w-3.5 text-destructive" />
          </button>
        </li>
      ))}
    </ul>
  ) : null

  return (
    <div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>
            Review name <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, review_name: true }))}
            placeholder="Review name"
            className={touched.review_name && reviewNameError ? 'border-destructive' : ''}
          />
          {touched.review_name && reviewNameError && (
            <p className="text-sm text-destructive">{reviewNameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Your name (Reviewee) <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            value={revieweeName}
            onChange={(e) => setRevieweeName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, reviewee_name: true }))}
            placeholder="Your name"
            className={touched.reviewee_name && revieweeNameError ? 'border-destructive' : ''}
          />
          {touched.reviewee_name && revieweeNameError && (
            <p className="text-sm text-destructive">{revieweeNameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Review files <span className="text-destructive">*</span>
          </Label>
          {fileList}
          <SelectReviewFile onSelectFile={onSelectFile} />
        </div>

        <AdvancedSettings onUploadCustomFields={onUploadCustomFields}
          customFields={customFields} />
        <Button
          type="submit"
          disabled={isPristine || isInvalid || files.length === 0}
        >
          Create
        </Button>
      </form>
    </div>
  )
}
