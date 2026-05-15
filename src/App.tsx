import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireProfile } from './components/RequireProfile'
import BookshelfPage from './pages/BookshelfPage'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import PlayPage from './pages/PlayPage'
import SetupPage from './pages/SetupPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route
          path="/bookshelf"
          element={
            <RequireProfile>
              <BookshelfPage />
            </RequireProfile>
          }
        />
        <Route
          path="/play/:bookId"
          element={
            <RequireProfile>
              <PlayPage />
            </RequireProfile>
          }
        />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/player" element={<Navigate to="/bookshelf" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
