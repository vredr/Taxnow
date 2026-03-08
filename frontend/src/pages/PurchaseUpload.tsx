import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Calculator,
  ArrowLeft,
  Download,
  ShoppingCart,
  Building2,
  Package,
  Globe,
  FileText,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

const platforms = [
  { id: 'amazon', name: 'Amazon', icon: ShoppingCart, color: 'bg-orange-500' },
  { id: 'flipkart', name: 'Flipkart', icon: Package, color: 'bg-blue-500' },
  { id: 'meesho', name: 'Meesho', icon: Package, color: 'bg-pink-500' },
  { id: 'shopify', name: 'Shopify', icon: Globe, color: 'bg-green-500' },
  { id: 'generic', name: 'Generic CSV/Excel', icon: FileText, color: 'bg-gray-500' },
]

export default function PurchaseUpload() {
  const navigate = useNavigate()
  const [selectedPlatform, setSelectedPlatform] = useState('generic')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    upload_id?: string
    message?: string
    rows_processed?: number
    preview?: any[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setUploadProgress(0)
    setError(null)
    setUploadResult(null)

    try {
      const response = await axios.post(
        `${API_URL}/upload?platform=${selectedPlatform}&data_type=purchase`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress(progress)
            }
          }
        }
      )

      setUploadResult(response.data)
      
      if (response.data.upload_id) {
        localStorage.setItem('taxnow_purchase_upload_id', response.data.upload_id)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [selectedPlatform])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-4 w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Purchase Data</h1>
              <p className="text-gray-600">Upload your purchase invoices for ITC calculation</p>
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <Card className="mb-6 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Select Platform
            </CardTitle>
            <CardDescription>Choose your supplier platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`platform-card ${selectedPlatform === platform.id ? 'selected' : ''}`}
                >
                  <div className={`${platform.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
                    <platform.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{platform.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card className="mb-6 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              File Upload
            </CardTitle>
            <CardDescription>Upload your purchase data to calculate ITC</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                drop-zone border-green-300
                ${isDragActive ? 'active border-green-500 bg-green-50' : ''}
                ${uploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="float">
                <ShoppingCart className="h-16 w-16 text-green-300 mx-auto mb-4" />
              </div>
              {isDragActive ? (
                <p className="text-xl text-green-600 font-medium">Drop the file here...</p>
              ) : (
                <>
                  <p className="text-xl text-gray-700 mb-2 font-medium">
                    Drag and drop your purchase file here
                  </p>
                  <p className="text-sm text-gray-500">
                    Excel or CSV files up to 10MB
                  </p>
                </>
              )}
            </div>

            {uploading && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Uploading...</span>
                  <span className="text-green-600 font-semibold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {uploadResult?.success && (
              <Alert className="mt-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Upload Successful</AlertTitle>
                <AlertDescription className="text-green-800">
                  {uploadResult.message}. Processed {uploadResult.rows_processed} rows.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {uploadResult?.success && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Button onClick={() => navigate('/net-gst-payable')} className="h-14 text-lg btn-shine bg-green-600 hover:bg-green-700">
              <TrendingUp className="h-5 w-5 mr-2" />
              Calculate Net GST
            </Button>
            <Button onClick={() => navigate('/gst-returns')} variant="outline" className="h-14 text-lg">
              <Receipt className="h-5 w-5 mr-2" />
              File Returns
            </Button>
          </div>
        )}

        {/* Required Columns */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Required Columns for Purchase Data
            </CardTitle>
            <CardDescription>Your purchase dataset should contain these columns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Required
                </h4>
                <div className="space-y-2">
                  {['invoice_number', 'invoice_date', 'supplier_gstin', 'taxable_value', 'tax_rate'].map((col) => (
                    <div key={col} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-red-500" />
                      <code className="text-sm text-red-700 font-medium">{col}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Optional
                </h4>
                <div className="space-y-2">
                  {['hsn_code', 'quantity', 'supplier_state', 'recipient_state'].map((col) => (
                    <div key={col} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <code className="text-sm text-blue-700 font-medium">{col}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Sales Data Link */}
        <Card className="mt-6 shadow-md border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Need to upload sales data?</h3>
                  <p className="text-sm text-gray-600">Upload your sales invoices first</p>
                </div>
              </div>
              <Link to="/upload">
                <Button variant="outline" className="bg-white hover:bg-blue-50 border-blue-200">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Upload Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
