import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import TaskBoard from './pages/TaskBoard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<TaskBoard />} />
      </Routes>
    </BrowserRouter>
  )
}
