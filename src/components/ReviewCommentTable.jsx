import React, { useCallback } from 'react'
import { Download } from 'lucide-react'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from './ui/table'
import { Button } from './ui/button'
import { getCategoryById } from '../lib/comment-categories'
import { downloadXlsx } from '../lib/xlsx-writer'

export default function ReviewCommentTable({ comments, customFields, customValues, onChangeCustomValue, onGoToPage, onSelectFile }) {
  const handleDownload = useCallback(() => {
    const headers = ['ID', 'Category', 'PostedBy', 'Description', 'Document name', 'Page', ...customFields.map(f => f.label)]
    const rows = comments.map(comment => {
      const cat = getCategoryById(comment.category)
      const row = {
        'ID': comment.id.replace(/-.*$/, ''),
        'Category': comment.category ? `${cat.label} (${cat.labelJa})` : '',
        'PostedBy': comment.postedBy?.name || '',
        'Description': comment.description || '',
        'Document name': comment.filename || '',
        'Page': comment.page,
      }
      customFields.forEach(f => {
        row[f.label] = (customValues[comment.id] && customValues[comment.id][f.id]) || ''
      })
      return row
    })

    downloadXlsx(headers, rows, 'review-comments.xlsx')
  }, [comments, customFields, customValues])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">List of Comments</h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Excel
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>PostedBy</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Document name</TableHead>
            <TableHead>Page</TableHead>
            {customFields.map(f => <TableHead key={f.id}>{f.label}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map(comment => {
            const cat = getCategoryById(comment.category)
            return (
              <TableRow key={comment.id}>
                <TableCell>
                  <a
                    href="#"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                    onClick={(e) => {
                      e.preventDefault()
                      onSelectFile(comment.filename)
                      onGoToPage(comment.page)
                    }}
                  >
                    {comment.id.replace(/-.*$/, '')}
                  </a>
                </TableCell>
                <TableCell>
                  {comment.category && (
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: cat.color.fill + '22', color: cat.color.fill }}
                    >
                      {cat.labelJa}
                    </span>
                  )}
                </TableCell>
                <TableCell>{comment.postedBy?.name}</TableCell>
                <TableCell>{comment.description}</TableCell>
                <TableCell>{comment.filename}</TableCell>
                <TableCell>{comment.page}</TableCell>
                {customFields.map(f => (
                  <TableCell key={f.id}>
                    {f.type === 'dropdown' ? (
                      <select
                        className="h-8 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={(customValues[comment.id] && customValues[comment.id][f.id]) || ''}
                        onChange={(e) => onChangeCustomValue(comment.id, f.id, e.target.value)}
                      >
                        <option value=""></option>
                        {f.source.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={(customValues[comment.id] && customValues[comment.id][f.id]) || ''}
                        onChange={(e) => onChangeCustomValue(comment.id, f.id, e.target.value)}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
