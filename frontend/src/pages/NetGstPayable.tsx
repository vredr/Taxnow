import { useEffect, useState } from 'react'
import { 
  Calculator,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ArrowRight,
  AlertCircle,
  Receipt
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Link, useNavigate } from 'react-router-dom'
import { formatCurrency, formatNumber } from '@/lib/utils'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

interface NetGstData {
  output_tax: number
  itc_available: number
  net_gst_payable: number
  itc_carry_forward: number
}

export default function NetGstPayable() {
  const navigate = useNavigate()
  const [netGstData, setNetGstData] = useState<NetGstData | null>(null)
  const [salesSummary, setSalesSummary] = useState<any>(null)
  const [purchaseSummary, setPurchaseSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNetGstPayable = async () => {
    const salesUploadId = localStorage.getItem('taxnow_upload_id')
    const purchaseUploadId = localStorage.getItem('taxnow_purchase_upload_id')
    
    if (!salesUploadId) {
      setError('Please upload sales data first.')
      return
    }
    
    if (!purchaseUploadId) {
      setError('Please upload purchase data to calculate ITC.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch sales summary
      const salesResponse = await axios.get(`${API_URL}/summary/${salesUploadId}`)
      setSalesSummary(salesResponse.data.summary)
      
      // Fetch purchase summary
      const purchaseResponse = await axios.get(`${API_URL}/purchase-summary/${purchaseUploadId}`)
      setPurchaseSummary(purchaseResponse.data.summary)
      
      // Fetch net GST payable
      const netResponse = await axios.get(
        `${API_URL}/net-gst-payable?sales_upload_id=${salesUploadId}&purchase_upload_id=${purchaseUploadId}`
      )
      setNetGstData(netResponse.data.net_gst_payable)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate net GST payable.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNetGstPayable()
  }, [])

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
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Net GST Payable</h1>
              <p className="text-gray-600">Calculate your net GST liability after ITC</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                {!localStorage.getItem('taxnow_upload_id') && (
                  <Button size="sm" onClick={() => navigate('/upload')}>
                    Upload Sales
                  </Button>
                )}
                {!localStorage.getItem('taxnow_purchase_upload_id') && (
                  <Button size="sm" variant="outline" onClick={() => navigate('/upload-purchase')}>
                    Upload Purchases
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {netGstData && salesSummary && purchaseSummary && (
          <>
            {/* Calculation Flow */}
            <Card className="mb-6 shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  GST Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  {/* Output Tax */}
                  <div className="text-center p-6 bg-red-50 rounded-xl w-full md:w-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Output Tax</span>
                    </div>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(netGstData.output_tax)}</p>
                    <p className="text-xs text-red-600 mt-1">From sales</p>
                  </div>

                  <div className="text-2xl font-bold text-gray-400">-</div>

                  {/* ITC */}
                  <div className="text-center p-6 bg-green-50 rounded-xl w-full md:w-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">ITC Available</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(netGstData.itc_available)}</p>
                    <p className="text-xs text-green-600 mt-1">From purchases</p>
                  </div>

                  <div className="text-2xl font-bold text-gray-400">=</div>

                  {/* Net Payable */}
                  <div className="text-center p-6 bg-blue-50 rounded-xl w-full md:w-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <IndianRupee className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Net Payable</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{formatCurrency(netGstData.net_gst_payable)}</p>
                    <p className="text-xs text-blue-600 mt-1">Amount to pay</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Sales Summary */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    Output Tax (Sales)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Invoices</span>
                    <span className="font-semibold">{formatNumber(salesSummary.overall.total_invoices)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Taxable Value</span>
                    <span className="font-semibold">{formatCurrency(salesSummary.overall.total_taxable_value)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700 font-medium">Output Tax</span>
                    <span className="font-bold text-red-700">{formatCurrency(netGstData.output_tax)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500">CGST</p>
                      <p className="font-semibold text-blue-700">{formatCurrency(salesSummary.overall.total_cgst)}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500">SGST</p>
                      <p className="font-semibold text-green-700">{formatCurrency(salesSummary.overall.total_sgst)}</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-500">IGST</p>
                      <p className="font-semibold text-orange-700">{formatCurrency(salesSummary.overall.total_igst)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Summary */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    Input Tax Credit (Purchases)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Invoices</span>
                    <span className="font-semibold">{formatNumber(purchaseSummary.overall.total_invoices)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Taxable Value</span>
                    <span className="font-semibold">{formatCurrency(purchaseSummary.overall.total_taxable_value)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700 font-medium">Total ITC</span>
                    <span className="font-bold text-green-700">{formatCurrency(netGstData.itc_available)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500">ITC CGST</p>
                      <p className="font-semibold text-blue-700">{formatCurrency(purchaseSummary.overall.total_itc_cgst)}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500">ITC SGST</p>
                      <p className="font-semibold text-green-700">{formatCurrency(purchaseSummary.overall.total_itc_sgst)}</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-500">ITC IGST</p>
                      <p className="font-semibold text-orange-700">{formatCurrency(purchaseSummary.overall.total_itc_igst)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Result Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-blue-100 mb-1">Net GST Payable</p>
                    <p className="text-4xl font-bold">{formatCurrency(netGstData.net_gst_payable)}</p>
                    {netGstData.itc_carry_forward > 0 && (
                      <p className="text-blue-100 mt-2">
                        ITC Carry Forward: {formatCurrency(netGstData.itc_carry_forward)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link to="/gst-returns">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                        <Receipt className="h-5 w-5 mr-2" />
                        File Returns
                      </Button>
                    </Link>
                    <Link to="/summary">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        <ArrowRight className="h-5 w-5 mr-2" />
                        View Summary
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
