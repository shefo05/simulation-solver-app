import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LCG from './pages/LCG'
import MidSquare from './pages/MidSquare'
import SingleServer from './pages/SingleServer'
import MultiServer from './pages/MultiServer'
import Inventory from './pages/Inventory'
import QueuingCalc from './pages/QueuingCalc'
import KSTest from './pages/KSTest'
import Autocorrelation from './pages/Autocorrelation'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LCG />} />
          <Route path="/midsquare" element={<MidSquare />} />
          <Route path="/single-server" element={<SingleServer />} />
          <Route path="/multi-server" element={<MultiServer />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/queuing-calc" element={<QueuingCalc />} />
          <Route path="/ks-test" element={<KSTest />} />
          <Route path="/autocorrelation" element={<Autocorrelation />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

