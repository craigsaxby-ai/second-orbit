import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import TaskBoard from './pages/TaskBoard'
import Automation from './pages/Automation'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/automation" element={<Automation />} />
      </Routes>
    </BrowserRouter>
  )
}
