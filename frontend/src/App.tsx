import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Summary from './pages/Summary'
import Download from './pages/Download'
import GstReturns from './pages/GstReturns'
import Invoices from './pages/Invoices'
import Analytics from './pages/Analytics'
import PurchaseUpload from './pages/PurchaseUpload'
import NetGstPayable from './pages/NetGstPayable'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/upload-purchase" element={<PurchaseUpload />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/download" element={<Download />} />
      <Route path="/gst-returns" element={<GstReturns />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/net-gst-payable" element={<NetGstPayable />} />
    </Routes>
  )
}

export default App
