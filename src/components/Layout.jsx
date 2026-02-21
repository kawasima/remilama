import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 flex items-center h-12 gap-6">
          <span className="font-semibold text-sm">Remilama</span>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm transition-colors hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`
            }
          >
            Home
          </NavLink>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
