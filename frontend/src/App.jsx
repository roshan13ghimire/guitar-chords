
import { Route, Routes } from 'react-router-dom'

import Layout from './components/layout/Layout'

import Home from './pages/Home'
import SongDetail from './pages/SongDetail'
import LearnChords from './pages/LearnChords'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route
          path="songs/:slug"
          element={<SongDetail />}
        />

        <Route
          path="chords"
          element={<LearnChords />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Route>
    </Routes>
  )
}
