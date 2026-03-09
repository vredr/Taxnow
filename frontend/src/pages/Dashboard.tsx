import { useEffect, useState } from 'react'
import { 
  FileText, 
  Upload, 
  Download, 
  TrendingUp, 
  IndianRupee,
  Calculator,
  BarChart3,
  ArrowRight,
  ShoppingCart,
  Receipt,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface DashboardStats {
  totalUploads: number
  totalInvoices: number
  totalTaxableValue: number
  totalCGST: number
  totalSGST: number
  totalIGST: number
  totalTax: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUploads: 0,
    totalInvoices: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalTax: 0
  })
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const savedStats = localStorage.getItem('taxnow_stats')
    const uploadId = localStorage.getItem('taxnow_upload_id')
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
        setHasData(!!uploadId)
      } catch (e) {
        console.error('Failed to parse stats:', e)
      }
    }
  }, [])

  const taxData = [
    { name: 'CGST', value: stats.totalCGST, color: '#3B82F6' },
    { name: 'SGST', value: stats.totalSGST, color: '#10B981' },
    { name: 'IGST', value: stats.totalIGST, color: '#F59E0B' },
  ].filter(item => item.value > 0)

  const quickActions = [
    {
      title: 'Upload Sales Data',
      description: 'Process your sales invoices',
      icon: Upload,
      href: '/upload',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Upload Purchase Data',
      description: 'Process purchases for ITC',
      icon: ShoppingCart,
      href: '/upload-purchase',
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'View Analytics',
      description: 'Detailed GST breakdown',
      icon: BarChart3,
      href: '/analytics',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Download Returns',
      description: 'Get GSTR-1, 3B, 4, 9',
      icon: Download,
      href: '/gst-returns',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  const gstReturns = [
    { id: 'gstr1', name: 'GSTR-1', desc: 'Outward supplies', due: '11th/13th of next month', status: 'available' },
    { id: 'gstr3b', name: 'GSTR-3B', desc: 'Monthly summary', due: '20th of next month', status: 'available' },
    { id: 'gstr4', name: 'GSTR-4', desc: 'Composition dealer', due: '30th April', status: 'available' },
    { id: 'gstr9', name: 'GSTR-9', desc: 'Annual return', due: '31st December', status: 'available' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaxNow
                </span>
                <span className="text-xs text-gray-500 block -mt-1">GST Automation</span>
              </div>
            </div>
            <nav className="hidden md:flex gap-1">
              <Link to="/" className="nav-link active">Dashboard</Link>
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/gst-returns" className="nav-link">Returns</Link>
              <Link to="/invoices" className="nav-link">Invoices</Link>
              <Link to="/analytics" className="nav-link">Analytics</Link>
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Welcome to TaxNow
                  </h1>
                  <p className="text-blue-100 text-lg max-w-xl">
                    Your complete GST automation platform. Upload data, calculate taxes, and file returns with ease.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/upload">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Data
                    </Button>
                  </Link>
                  <Link to="/gst-returns">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Download className="h-5 w-5 mr-2" />
                      File Returns
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="card-hover h-full border-0 shadow-md overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${action.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-${action.color}-100`}>
                      <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                    </div>
                    <ArrowRight className={`h-5 w-5 text-${action.color}-500`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Overview */}
        {hasData ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <Card className="stat-card blue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalInvoices)}</div>
                  <p className="text-xs text-gray-500 mt-1">Processed invoices</p>
                </CardContent>
              </Card>

              <Card className="stat-card green">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Taxable Value</CardTitle>
                  <IndianRupee className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalTaxableValue)}</div>
                  <p className="text-xs text-gray-500 mt-1">Total taxable amount</p>
                </CardContent>
              </Card>

              <Card className="stat-card orange">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Tax</CardTitle>
                  <Calculator className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalTax)}</div>
                  <p className="text-xs text-gray-500 mt-1">CGST + SGST + IGST</p>
                </CardContent>
              </Card>

              <Card className="stat-card purple">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalTaxableValue + stats.totalTax)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Taxable + Tax</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            {taxData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-blue-600" />
                      GST Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of tax components</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={taxData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {taxData.map((entry, index) => (
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
                    <CardDescription>Component-wise tax breakdown</CardDescription>
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
                        <span className="text-xl font-bold text-blue-700">{formatCurrency(stats.totalCGST)}</span>
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
                        <span className="text-xl font-bold text-green-700">{formatCurrency(stats.totalSGST)}</span>
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
                        <span className="text-xl font-bold text-orange-700">{formatCurrency(stats.totalIGST)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <Card className="mb-10 border-dashed border-2 bg-gray-50/50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Upload your sales or purchase data to see GST analytics and generate returns.
              </p>
              <Link to="/upload">
                <Button size="lg" className="btn-shine">
                  <Zap className="h-5 w-5 mr-2" />
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* GST Returns Section */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-purple-600" />
          Available GST Returns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gstReturns.map((returnItem) => (
            <Link key={returnItem.id} to="/gst-returns">
              <Card className="card-hover h-full border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {returnItem.name}
                    </span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">{returnItem.desc}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    Due: {returnItem.due}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">TaxNow</span>
              <span className="text-gray-500">- GST Automation Platform</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>v2.0.0</span>
              <span>Made with precision for Indian businesses</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
