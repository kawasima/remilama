import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Layout from './Layout'
import Home from './Home'
import ReviewCreatePage from '../pages/ReviewCreatePage'
import RevieweePage from '../pages/RevieweePage'
import ReviewerPage from '../pages/ReviewerPage'

const App = () => (
  <DndProvider backend={HTML5Backend}>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review/new" element={<ReviewCreatePage />} />
          <Route path="/review/:id/reviewer" element={<ReviewerPage />} />
          <Route path="/review/:id" element={<RevieweePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </DndProvider>
)

export default App
