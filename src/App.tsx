import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Library from './pages/Library'
import Queue from './pages/Queue'
import Accounts from './pages/Accounts'
import Settings from './pages/Settings'
import TrashBin from './pages/TrashBin'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Library />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/trash" element={<TrashBin />} />
      </Route>
    </Routes>
  )
}

export default App
