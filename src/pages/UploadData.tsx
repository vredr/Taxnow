import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Download,
  ShoppingCart,
  Store,
  Globe,
  Package,
  Tag,
  ShoppingBasket,
  Shirt,
  Sparkles,
  Calculator
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

const platforms = [
  { id: 'amazon', name: 'Amazon', icon: ShoppingCart, color: 'bg-amber-500' },
  { id: 'flipkart', name: 'Flipkart', icon: ShoppingBasket, color: 'bg-blue-500' },
  { id: 'meesho', name: 'Meesho', icon: Package, color: 'bg-pink-500' },
  { id: 'myntra', name: 'Myntra', icon: Shirt, color: 'bg-rose-500' },
  { id: 'glowroad', name: 'GlowRoad', icon: Sparkles, color: 'bg-violet-500' },
  { id: 'jiomart', name: 'JioMart', icon: Store, color: 'bg-emerald-500' },
  { id: 'ajio', name: 'Ajio', icon: Tag, color: 'bg-indigo-500' },
  { id: 'limeroad', name: 'LimeRoad', icon: ShoppingBasket, color: 'bg-cyan-500' },
  { id: 'shopify', name: 'Shopify', icon: Globe, color: 'bg-green-600' },
  { id: 'generic', name: 'Generic CSV/Excel', icon: FileSpreadsheet, color: 'bg-slate-500' },
]

export default function UploadData() {
  const [selectedPlatform, setSelectedPlatform] = useState('generic')
  const [dataType, setDataType] = useState('sales')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<any>(null)
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
        `${API_URL}/upload/${dataType}?platform=${selectedPlatform}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
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
        localStorage.setItem(`taxnow_${dataType}_upload_id`, response.data.upload_id)
        toast.success(`${dataType === 'sales' ? 'Sales' : 'Purchase'} data uploaded successfully!`)
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Upload failed. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setUploading(false)
    }
  }, [selectedPlatform, dataType])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

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
      toast.success('Sample file downloaded!')
    } catch (err) {
      toast.error('Failed to download sample file')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload Data</h1>
        <p className="text-slate-600 mt-1">
          Import your e-commerce sales or purchase data for GST processing
        </p>
      </div>

      {/* Data Type Tabs */}
      <Tabs value={dataType} onValueChange={setDataType} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sales">Sales Data</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Data</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Selection */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Select Platform</CardTitle>
              <CardDescription>Choose your e-commerce platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedPlatform === platform.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`${platform.color} p-2 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{platform.name}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-slate-200 mt-6">
            <CardHeader>
              <CardTitle>Required Columns</CardTitle>
              <CardDescription>Your file should contain these columns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {['invoice_number', 'invoice_date', 'place_of_supply', 'taxable_value', 'tax_rate'].map((col) => (
                      <span key={col} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md font-medium">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Optional</h4>
                  <div className="flex flex-wrap gap-2">
                    {['customer_gstin', 'hsn_code', 'quantity', 'supplier_state'].map((col) => (
                      <span key={col} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Selected: <span className="font-medium text-slate-900">
                  {platforms.find(p => p.id === selectedPlatform)?.name}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
                  ${uploading ? 'pointer-events-none opacity-50' : ''}
                `}
              >
                <input {...getInputProps()} />
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                {isDragActive ? (
                  <p className="text-lg text-blue-600 font-medium">Drop the file here...</p>
                ) : (
                  <>
                    <p className="text-lg text-slate-700 font-medium mb-2">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      or click to browse files
                    </p>
                    <p className="text-xs text-slate-400">
                      Supported formats: Excel (.xlsx, .xls) and CSV (.csv)
                    </p>
                  </>
                )}
              </div>

              {uploading && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Uploading...</span>
                    <span className="font-medium text-slate-900">{uploadProgress}%</span>
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
                <Alert className="mt-6 bg-emerald-50 border-emerald-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <AlertTitle className="text-emerald-900">Upload Successful</AlertTitle>
                  <AlertDescription className="text-emerald-800">
                    Processed {uploadResult.rows_processed} rows from {uploadResult.filename}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sample Data */}
          <Card className="border-slate-200 mt-6">
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
              <CardDescription>Download a sample file to see the expected format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">sample_sales_data.csv</p>
                    <p className="text-sm text-slate-500">Example dataset with GST data</p>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadSample}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {uploadResult?.success && (
            <Card className="border-slate-200 mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-blue-900">What's Next?</CardTitle>
                <CardDescription className="text-blue-700">
                  Your data has been processed. Choose your next action:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/invoices">
                    <Button variant="outline" className="w-full bg-white hover:bg-slate-50">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      View Invoices
                    </Button>
                  </Link>
                  <Link to="/returns">
                    <Button variant="outline" className="w-full bg-white hover:bg-slate-50">
                      <Calculator className="h-4 w-4 mr-2" />
                      Generate Returns
                    </Button>
                  </Link>
                  <Link to="/analytics">
                    <Button variant="outline" className="w-full bg-white hover:bg-slate-50">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
