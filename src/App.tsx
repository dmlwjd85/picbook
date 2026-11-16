import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PersistGate } from './components/PersistGate'
import { RequireMaster } from './components/RequireMaster'
import { RequireUserOrMaster } from './components/RequireUserOrMaster'
import BookshelfPage from './pages/BookshelfPage'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import MasterLoginPage from './pages/MasterLoginPage'
import MasterSetupPage from './pages/MasterSetupPage'
import { EditorErrorBoundary } from './components/EditorErrorBoundary'
import { PlayErrorBoundary } from './components/PlayErrorBoundary'
import PlayPage from './pages/PlayPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RankingPage from './pages/RankingPage'
import MyPage from './pages/MyPage'
import PassesPage from './pages/PassesPage'
import AdminEditorPage from './pages/AdminEditorPage'
import { RequireAdmin } from './components/RequireAdmin'
import { prewarmCatalogPacks } from './lib/prewarmPacks'

prewarmCatalogPacks()

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PersistGate>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/setup" element={<Navigate to="/signup" replace />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/passes" element={<PassesPage />} />
        <Route
          path="/mypage"
          element={
            <RequireUserOrMaster>
              <MyPage />
            </RequireUserOrMaster>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <EditorErrorBoundary>
                <AdminEditorPage />
              </EditorErrorBoundary>
            </RequireAdmin>
          }
        />
        <Route
          path="/bookshelf"
          element={
            <RequireUserOrMaster>
              <BookshelfPage />
            </RequireUserOrMaster>
          }
        />
        <Route
          path="/play/:bookId"
          element={
            // 로그인 없이도 열린다 — 권한이 없으면 PlayPage가 앞의 몇 문장만 체험으로 보여 준다
            <PlayErrorBoundary>
              <PlayPage />
            </PlayErrorBoundary>
          }
        />
        <Route path="/master/setup" element={<MasterSetupPage />} />
        <Route path="/master/login" element={<MasterLoginPage />} />
        <Route
          path="/editor"
          element={
            <RequireMaster>
              <EditorErrorBoundary>
                <EditorPage />
              </EditorErrorBoundary>
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
