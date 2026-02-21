import React from 'react'
import { User } from 'lucide-react'

export default function Reviewer({ reviewer }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <User className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium text-sm">{reviewer.name}</span>
      <span className="text-sm text-muted-foreground">{reviewer.action}</span>
    </div>
  )
}
