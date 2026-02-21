import React from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FileEdit } from 'lucide-react'
import useStore from '../store'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import ReviewCreateForm from '../components/ReviewCreateForm'

export default function ReviewCreatePage() {
  const navigate = useNavigate()
  const review = useStore((s) => s.review)
  const createReview = useStore((s) => s.createReview)
  const addReviewFile = useStore((s) => s.addReviewFile)
  const removeReviewFile = useStore((s) => s.removeReviewFile)
  const addFileObject = useStore((s) => s.addFileObject)
  const removeFileObject = useStore((s) => s.removeFileObject)
  const setCustomFields = useStore((s) => s.setCustomFields)

  const handleCreateReview = (reviewName, revieweeName) => {
    const id = uuidv4()
    createReview({
      id,
      name: reviewName,
      reviewee: { id: uuidv4(), name: revieweeName },
    })
    navigate(`/review/${id}`)
  }

  const handleSelectFile = (file) => {
    if (file) {
      addReviewFile({ name: file.name, size: file.size })
      addFileObject(file)
    }
  }

  const handleRemoveFile = (filename) => {
    if (filename) {
      removeReviewFile(filename)
      removeFileObject(filename)
    }
  }

  const handleUploadCustomFields = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        if (!Array.isArray(parsed)) {
          window.alert('Custom fields must be a JSON array')
          return
        }
        setCustomFields(parsed)
      } catch {
        window.alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          Create a New Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReviewCreateForm
          files={review.files}
          customFields={review.customFields}
          onCreateReview={handleCreateReview}
          onSelectFile={handleSelectFile}
          onRemoveFile={handleRemoveFile}
          onUploadCustomFields={handleUploadCustomFields}
        />
      </CardContent>
    </Card>
  )
}
