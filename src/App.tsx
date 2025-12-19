import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
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
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <Navbar />
          <main className="flex-1 overflow-x-hidden py-2 sm:py-3 md:py-4">
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
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App

