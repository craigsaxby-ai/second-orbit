import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TaskBoard from './pages/TaskBoard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TaskBoard />} />
      </Routes>
    </BrowserRouter>
  )
}
