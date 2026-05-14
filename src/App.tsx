import { BrowserRouter, Route, Routes } from 'react-router-dom'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import PlayerPage from './pages/PlayerPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/player" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
