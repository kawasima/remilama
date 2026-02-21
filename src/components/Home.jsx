import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { MessageSquare } from 'lucide-react'
import useStore from '../store'
import { required, composeValidators, mustBeUUID } from '../validators'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

export default function Home() {
  const navigate = useNavigate()
  const initializeReview = useStore((s) => s.initializeReview)
  const joinReview = useStore((s) => s.joinReview)

  const [reviewId, setReviewId] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [touched, setTouched] = useState({})

  const reviewIdError = composeValidators(required, mustBeUUID)(reviewId)
  const reviewerNameError = required(reviewerName)
  const isInvalid = !!(reviewIdError || reviewerNameError)
  const isPristine = reviewId === '' && reviewerName === ''

  const handleNewReview = () => {
    initializeReview()
    navigate('/review/new')
  }

  const handleJoinReview = (e) => {
    e.preventDefault()
    if (isInvalid) return
    joinReview(reviewId, { id: uuidv4(), name: reviewerName })
    navigate(`/review/${reviewId}/reviewer`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Remilama</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Remilama is a realtime review tool.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Reviewee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Create a review</p>
            <Button onClick={handleNewReview}>Create</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Reviewer</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleJoinReview}>
              <div className="space-y-2">
                <Label>
                  Review ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  value={reviewId}
                  onChange={(e) => setReviewId(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, review_id: true }))}
                  placeholder="Review ID"
                  className={touched.review_id && reviewIdError ? 'border-destructive' : ''}
                />
                {touched.review_id && reviewIdError && (
                  <p className="text-sm text-destructive">{reviewIdError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Reviewer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, reviewer_name: true }))}
                  placeholder="Your name"
                  className={touched.reviewer_name && reviewerNameError ? 'border-destructive' : ''}
                />
                {touched.reviewer_name && reviewerNameError && (
                  <p className="text-sm text-destructive">{reviewerNameError}</p>
                )}
              </div>
              <Button type="submit" disabled={isPristine || isInvalid}>
                Join
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
