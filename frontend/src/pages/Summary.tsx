import { useEffect, useState } from 'react'
import { 
  Calculator,
  ArrowLeft,
  RefreshCw,
  FileText,
  IndianRupee,
  Building2,
  ShoppingCart,
  TrendingUp,
  PieChart as PieChartIcon,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link, useNavigate } from 'react-router-dom'
import { formatCurrency, formatNumber } from '@/lib/utils'
import axios from 'axios'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

interface SummaryData {
  overall: {
    total_invoices: number
    total_taxable_value: number
    total_cgst: number
    total_sgst: number
    total_igst: number
    total_tax: number
    total_amount: number
  }
  by_type: {
    [key: string]: {
      invoice_count: number
      taxable_value: number
      cgst: number
      sgst: number
      igst: number
      total_tax: number
      total_amount: number
    }
  }
  hsn_summary: Array<{
    hsn_code: string
    taxable_value: number
    total_tax: number
    quantity: number
  }>
  state_summary: Array<{
    place_of_supply: string
    invoice_count: number
    taxable_value: number
    total_tax: number
  }>
  monthly_summary: Array<{
    month: string
    invoice_count: number
    taxable_value: number
    total_tax: number
  }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899']

export default function SummaryPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    const uploadId = localStorage.getItem('taxnow_upload_id')
    if (!uploadId) {
      setError('No data available. Please upload a file first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_URL}/summary/${uploadId}`)
      setSummary(response.data.summary)
      
      const stats = {
        totalUploads: 1,
        totalInvoices: response.data.summary.overall.total_invoices,
        totalTaxableValue: response.data.summary.overall.total_taxable_value,
        totalCGST: response.data.summary.overall.total_cgst,
        totalSGST: response.data.summary.overall.total_sgst,
        totalIGST: response.data.summary.overall.total_igst,
        totalTax: response.data.summary.overall.total_tax
      }
      localStorage.setItem('taxnow_stats', JSON.stringify(stats))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch summary.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const invoiceTypeData = summary ? Object.entries(summary.by_type).map(([type, data]) => ({
    name: type,
    count: data.invoice_count,
    value: data.taxable_value,
    tax: data.total_tax
  })) : []

  const taxBreakdownData = summary ? [
    { name: 'CGST', value: summary.overall.total_cgst, color: '#3B82F6' },
    { name: 'SGST', value: summary.overall.total_sgst, color: '#10B981' },
    { name: 'IGST', value: summary.overall.total_igst, color: '#F59E0B' },
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-4 w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <PieChartIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">GST Summary</h1>
                <p className="text-gray-600">Detailed breakdown of your GST data</p>
              </div>
            </div>
            <Button onClick={fetchSummary} disabled={loading} variant="outline" className="shadow-sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!summary && !error && !loading && (
          <Alert className="mb-6">
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Please upload a dataset first to view the summary.</span>
              <Button onClick={() => navigate('/upload')} className="ml-4">
                Go to Upload
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {summary && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="stat-card blue shadow-md border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatNumber(summary.overall.total_invoices)}</div>
                </CardContent>
              </Card>

              <Card className="stat-card green shadow-md border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Taxable Value</CardTitle>
                  <IndianRupee className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(summary.overall.total_taxable_value)}</div>
                </CardContent>
              </Card>

              <Card className="stat-card orange shadow-md border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Tax</CardTitle>
                  <Calculator className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(summary.overall.total_tax)}</div>
                </CardContent>
              </Card>

              <Card className="stat-card purple shadow-md border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(summary.overall.total_amount)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white shadow-sm border p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="by-type" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  By Invoice Type
                </TabsTrigger>
                <TabsTrigger value="tax-breakdown" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Tax Breakdown
                </TabsTrigger>
                <TabsTrigger value="hsn" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Package className="h-4 w-4 mr-2" />
                  HSN Summary
                </TabsTrigger>
                <TabsTrigger value="state" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <MapPin className="h-4 w-4 mr-2" />
                  State-wise
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-blue-600" />
                        Tax Distribution
                      </CardTitle>
                      <CardDescription>CGST, SGST, and IGST breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={taxBreakdownData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {taxBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        Tax Details
                      </CardTitle>
                      <CardDescription>Component-wise tax amounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <span className="text-white font-bold text-sm">CG</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">CGST</p>
                              <p className="text-xs text-gray-500">Central GST</p>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-blue-700">{formatCurrency(summary.overall.total_cgst)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <span className="text-white font-bold text-sm">SG</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">SGST</p>
                              <p className="text-xs text-gray-500">State GST</p>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-green-700">{formatCurrency(summary.overall.total_sgst)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <span className="text-white font-bold text-sm">IG</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">IGST</p>
                              <p className="text-xs text-gray-500">Integrated GST</p>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-orange-700">{formatCurrency(summary.overall.total_igst)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="by-type">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Invoices by Type
                    </CardTitle>
                    <CardDescription>B2B, B2CL, and B2CS breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={invoiceTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="count" fill="#3B82F6" name="Invoice Count" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="value" fill="#10B981" name="Taxable Value" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      {Object.entries(summary.by_type).map(([type, data]) => (
                        <Card key={type} className="border-0 shadow-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{type}</CardTitle>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                type === 'B2B' ? 'bg-blue-100 text-blue-700' :
                                type === 'B2CL' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {type}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Invoices:</span>
                              <span className="font-medium">{formatNumber(data.invoice_count)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taxable Value:</span>
                              <span className="font-medium">{formatCurrency(data.taxable_value)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Tax:</span>
                              <span className="font-medium">{formatCurrency(data.total_tax)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tax-breakdown">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Tax Breakdown by Invoice Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={Object.entries(summary.by_type).map(([type, data]) => ({
                        name: type,
                        CGST: data.cgst,
                        SGST: data.sgst,
                        IGST: data.igst
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="CGST" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="SGST" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="IGST" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hsn">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      HSN Summary
                    </CardTitle>
                    <CardDescription>Summary by HSN code</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summary.hsn_summary && summary.hsn_summary.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-4 font-semibold text-gray-700">HSN Code</th>
                              <th className="text-right p-4 font-semibold text-gray-700">Quantity</th>
                              <th className="text-right p-4 font-semibold text-gray-700">Taxable Value</th>
                              <th className="text-right p-4 font-semibold text-gray-700">Tax Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.hsn_summary.map((item, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{item.hsn_code}</td>
                                <td className="p-4 text-right">{formatNumber(item.quantity)}</td>
                                <td className="p-4 text-right">{formatCurrency(item.taxable_value)}</td>
                                <td className="p-4 text-right">{formatCurrency(item.total_tax)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No HSN data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="state">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      State-wise Summary
                    </CardTitle>
                    <CardDescription>Sales distribution by state</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summary.state_summary && summary.state_summary.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-4 font-semibold text-gray-700">State</th>
                              <th className="text-right p-4 font-semibold text-gray-700">Invoices</th>
                              <th className="text-right p-4 font-semibold text-gray-700">Taxable Value</th>
                              <th className="text-right p-4 font-semibold text-gray-700">Tax Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.state_summary.map((item, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{item.place_of_supply}</td>
                                <td className="p-4 text-right">{formatNumber(item.invoice_count)}</td>
                                <td className="p-4 text-right">{formatCurrency(item.taxable_value)}</td>
                                <td className="p-4 text-right">{formatCurrency(item.total_tax)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No state data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/gst-returns">
                <Button size="lg" className="btn-shine">
                  <Download className="h-5 w-5 mr-2" />
                  Download Returns
                </Button>
              </Link>
              <Link to="/analytics">
                <Button size="lg" variant="outline">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link to="/net-gst-payable">
                <Button size="lg" variant="outline">
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculate Net GST
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
