import { useState } from 'react'
import { 
  Calculator,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  FileJson,
  FileCode,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

const returnTypes = [
  {
    id: 'gstr1',
    name: 'GSTR-1',
    fullName: 'Outward Supplies Return',
    description: 'Monthly/Quarterly return for outward supplies',
    frequency: 'Monthly/Quarterly',
    dueDate: '11th/13th of next month',
    sheets: ['B2B', 'B2CL', 'B2CS', 'EXP', 'HSN Summary'],
    color: 'blue',
    icon: FileText
  },
  {
    id: 'gstr3b',
    name: 'GSTR-3B',
    fullName: 'Monthly Summary Return',
    description: 'Monthly summary return with ITC details',
    frequency: 'Monthly',
    dueDate: '20th of next month',
    sheets: ['3.1 Outward', '3.2 Inter-State', '4 Eligible ITC'],
    color: 'green',
    icon: TrendingUp
  },
  {
    id: 'gstr4',
    name: 'GSTR-4',
    fullName: 'Composition Dealer Return',
    description: 'Annual return for composition scheme dealers',
    frequency: 'Annual',
    dueDate: '30th April',
    sheets: ['GSTR-4 Summary'],
    color: 'orange',
    icon: FileText
  },
  {
    id: 'gstr9',
    name: 'GSTR-9',
    fullName: 'Annual Return',
    description: 'Annual return for regular taxpayers',
    frequency: 'Annual',
    dueDate: '31st December',
    sheets: ['GSTR-9 Summary'],
    color: 'purple',
    icon: Calendar
  }
]

const formats = [
  { id: 'excel', name: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { id: 'csv', name: 'CSV (.csv)', icon: FileCode },
  { id: 'json', name: 'JSON (.json)', icon: FileJson }
]

export default function GstReturns() {
  const [selectedReturn, setSelectedReturn] = useState('gstr1')
  const [selectedFormat, setSelectedFormat] = useState('excel')
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const downloadReturn = async () => {
    const uploadId = localStorage.getItem('taxnow_upload_id')
    if (!uploadId) {
      setError('No data available. Please upload a file first.')
      return
    }

    setDownloading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await axios.get(
        `${API_URL}/download/${selectedReturn}/${uploadId}?format=${selectedFormat}`,
        { responseType: 'blob' }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      const extension = selectedFormat === 'excel' ? 'xlsx' : selectedFormat
      link.setAttribute('download', `${selectedReturn}_return.${extension}`)
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

  const selectedReturnData = returnTypes.find(r => r.id === selectedReturn)

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
              <Link to="/gst-returns" className="nav-link active">Returns</Link>
              <Link to="/invoices" className="nav-link">Invoices</Link>
              <Link to="/analytics" className="nav-link">Analytics</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-4 w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GST Returns</h1>
              <p className="text-gray-600">Generate and download all types of GST returns</p>
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
              Your GST return file has been downloaded successfully.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Return Types */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Select Return Type
                </CardTitle>
                <CardDescription>Choose the GST return you want to generate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {returnTypes.map((returnType) => (
                    <div
                      key={returnType.id}
                      onClick={() => setSelectedReturn(returnType.id)}
                      className={`return-card ${selectedReturn === returnType.id ? 'selected' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-${returnType.color}-100`}>
                          <returnType.icon className={`h-6 w-6 text-${returnType.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{returnType.name}</h3>
                            {selectedReturn === returnType.id && (
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{returnType.fullName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {returnType.frequency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Return Details */}
            {selectedReturnData && (
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {selectedReturnData.name} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{selectedReturnData.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Frequency</p>
                        <p className="font-semibold text-gray-900">{selectedReturnData.frequency}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Due Date</p>
                        <p className="font-semibold text-gray-900">{selectedReturnData.dueDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Included Sheets</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedReturnData.sheets.map((sheet) => (
                          <span
                            key={sheet}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {sheet}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Download Panel */}
          <div className="space-y-6">
            <Card className="shadow-md border-0 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Download Return
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Format Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Select Format</p>
                  <div className="space-y-2">
                    {formats.map((format) => (
                      <div
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedFormat === format.id
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <format.icon className={`h-5 w-5 ${
                          selectedFormat === format.id ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className={`font-medium ${
                          selectedFormat === format.id ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {format.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Download Button */}
                <Button 
                  onClick={downloadReturn} 
                  disabled={downloading}
                  className="w-full h-14 text-lg btn-shine"
                  size="lg"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download {selectedReturnData?.name}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  File will be generated based on your uploaded data
                </p>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/upload">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                      <span className="text-sm font-medium text-gray-700">Upload New Data</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                  <Link to="/summary">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                      <span className="text-sm font-medium text-gray-700">View Summary</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                  <Link to="/net-gst-payable">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                      <span className="text-sm font-medium text-gray-700">Calculate Net GST</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
