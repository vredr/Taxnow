import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import UploadData from '@/pages/UploadData'
import Invoices from '@/pages/Invoices'
import Purchases from '@/pages/Purchases'
import GstReturns from '@/pages/GstReturns'
import Reports from '@/pages/Reports'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadData />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="returns" element={<GstReturns />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App
