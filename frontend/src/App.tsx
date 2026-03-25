import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import TodoListPage from './pages/TodoListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo-list" element={<TodoListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

/**
 * 1. CRUD completo de las listas
 * 2. Mobile first adaptive approach
 * 3. Drag and drop for check list items. Save in localstage the order
 * 4. Light and Dark mode
 * 5. Optimistic updates for everything
 * 6. Cover with test something
 * 7. Export conversation
 */
