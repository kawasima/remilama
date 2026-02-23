import React from 'react'
import { User } from 'lucide-react'

export default function Reviewer({ reviewer }) {
  const online = reviewer.online !== false
  return (
    <div className={`flex items-center gap-2 py-1 ${online ? '' : 'opacity-50'}`}>
      <div className="relative">
        <User className="h-5 w-5 text-muted-foreground" />
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>
      <span className="font-medium text-sm">{reviewer.name}</span>
      <span className="text-sm text-muted-foreground">{reviewer.action}</span>
    </div>
  )
}
