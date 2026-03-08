import { useEffect, useState } from 'react'
import { 
  Calculator,
  ArrowLeft,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  MapPin,
  Package,
  Calendar,
  IndianRupee,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  Line,
  AreaChart,
  Area
} from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

interface AnalyticsData {
  summary: {
    overall: {
      total_invoices: number
      total_taxable_value: number
      total_cgst: number
      total_sgst: number
      total_igst: number
      total_tax: number
    }
    by_type: { [key: string]: any }
  }
  charts: {
    tax_distribution: Array<{ name: string; value: number }>
    invoice_type_distribution: Array<{ name: string; value: number }>
    monthly_trend: Array<{ month: string; taxable_value: number; total_tax: number }>
  }
  top_states: Array<{ place_of_supply: string; invoice_count: number; taxable_value: number }>
  top_hsn: Array<{ hsn_code: string; taxable_value: number; total_tax: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899']

export default function Analytics() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    const uploadId = localStorage.getItem('taxnow_upload_id')
    if (!uploadId) {
      setError('No data available. Please upload a file first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_URL}/analytics/${uploadId}`)
      setAnalytics(response.data.analytics)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

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
              <Link to="/analytics" className="nav-link active">Analytics</Link>
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
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Deep insights into your GST data</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="shadow-md border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.summary.overall.total_invoices)}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Taxable Value</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.overall.total_taxable_value)}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl">
                      <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Tax</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary.overall.total_tax)}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg Invoice Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(analytics.summary.overall.total_taxable_value / analytics.summary.overall.total_invoices)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Tax Distribution */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-blue-600" />
                    Tax Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={analytics.charts.tax_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.charts.tax_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Invoice Type Distribution */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Invoice Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analytics.charts.invoice_type_distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            {analytics.charts.monthly_trend && analytics.charts.monthly_trend.length > 0 && (
              <Card className="shadow-md border-0 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Monthly Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.charts.monthly_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="taxable_value" name="Taxable Value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="total_tax" name="Tax Amount" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top States & HSN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top States */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    Top States by Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.top_states && analytics.top_states.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.top_states.map((state, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{state.place_of_supply}</p>
                              <p className="text-xs text-gray-500">{state.invoice_count} invoices</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">{formatCurrency(state.taxable_value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No state data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Top HSN */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-pink-600" />
                    Top HSN Codes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.top_hsn && analytics.top_hsn.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.top_hsn.map((hsn, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">HSN {hsn.hsn_code}</p>
                              <p className="text-xs text-gray-500">Tax: {formatCurrency(hsn.total_tax)}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">{formatCurrency(hsn.taxable_value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No HSN data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
