import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PersistGate } from './components/PersistGate'
import { RequireMaster } from './components/RequireMaster'
import { RequireProfile } from './components/RequireProfile'
import BookshelfPage from './pages/BookshelfPage'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import MasterLoginPage from './pages/MasterLoginPage'
import MasterSetupPage from './pages/MasterSetupPage'
import PlayPage from './pages/PlayPage'
import LoginPage from './pages/LoginPage'
import SetupPage from './pages/SetupPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PersistGate>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="/master/setup" element={<MasterSetupPage />} />
        <Route path="/master/login" element={<MasterLoginPage />} />
        <Route
          path="/editor"
          element={
            <RequireMaster>
              <EditorPage />
            </RequireMaster>
          }
        />
        <Route path="/player" element={<Navigate to="/bookshelf" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PersistGate>
    </BrowserRouter>
  )
}
