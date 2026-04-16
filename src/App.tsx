import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import EditorHome from './pages/EditorHome'
import DraftPages from './pages/DraftPages'
import DirectingPage from './pages/DirectingPage'
import LibraryPage from './pages/LibraryPage'
import ReadPicBookPage from './pages/ReadPicBookPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<EditorHome />} />
        <Route path="/draft/pages" element={<DraftPages />} />
        <Route path="/direct/:sentenceId" element={<DirectingPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/read/:picBookId" element={<ReadPicBookPage />} />
      </Route>
    </Routes>
  )
}
