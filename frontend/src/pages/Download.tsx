import { useState } from 'react'
import { 
  Calculator,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

export default function DownloadPage() {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const downloadGSTR1 = async () => {
    const uploadId = localStorage.getItem('taxnow_upload_id')
    if (!uploadId) {
      setError('No data available. Please upload a file first.')
      return
    }

    setDownloading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await axios.get(`${API_URL}/download/gstr1/${uploadId}?format=excel`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'gstr1_return.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const downloadSample = async () => {
    try {
      const response = await axios.get(`${API_URL}/download-sample`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'sample_sales_data.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download sample:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaxNow
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex gap-1">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/gst-returns" className="nav-link">Returns</Link>
              <Link to="/invoices" className="nav-link">Invoices</Link>
              <Link to="/analytics" className="nav-link">Analytics</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-4 w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Download className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Download GSTR-1</h1>
              <p className="text-gray-600">Download your generated GST return file</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Download Complete</AlertTitle>
            <AlertDescription className="text-green-800">
              Your GSTR-1 file has been downloaded successfully.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              GSTR-1 Return File
            </CardTitle>
            <CardDescription>Download your GST return in Excel format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-4 rounded-xl">
                  <FileSpreadsheet className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">gstr1_return.xlsx</p>
                  <p className="text-sm text-gray-600">Contains B2B, B2CL, B2CS, and HSN Summary sheets</p>
                </div>
              </div>
              <Button 
                onClick={downloadGSTR1} 
                disabled={downloading}
                size="lg"
                className="btn-shine"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              File Structure
            </CardTitle>
            <CardDescription>The GSTR-1 Excel file contains the following sheets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">B2B (Business to Business)</p>
                  <p className="text-sm text-gray-600">
                    Contains all invoices where customer GSTIN is provided. 
                    Includes GSTIN, invoice details, tax rate, and taxable value.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">B2CL (Business to Consumer Large)</p>
                  <p className="text-sm text-gray-600">
                    Contains interstate invoices to unregistered persons with value {'>'} ₹2.5 lakhs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">B2CS (Business to Consumer Small)</p>
                  <p className="text-sm text-gray-600">
                    Contains intrastate invoices and small interstate invoices to unregistered persons.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">HSN Summary</p>
                  <p className="text-sm text-gray-600">
                    Summary of all items grouped by HSN code with quantity and value details.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Sample Dataset
            </CardTitle>
            <CardDescription>Download a sample file to test the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">sample_sales_data.csv</p>
                  <p className="text-sm text-gray-500">Example dataset with GST data</p>
                </div>
              </div>
              <Button variant="outline" onClick={downloadSample}>
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
