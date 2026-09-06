import { HashRouter, Route, Routes } from 'react-router-dom'
import Marcar from './pages/Marcar'
import PersonSelect from './pages/PersonSelect'
import Resumen from './pages/Resumen'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PersonSelect />} />
        <Route path="/marcar/:persona" element={<Marcar />} />
        <Route path="/resumen" element={<Resumen />} />
      </Routes>
    </HashRouter>
  )
}
