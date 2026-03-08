import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Calculator,
  BarChart3,
  ArrowRight,
  ShoppingCart,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts'

interface DashboardStats {
  totalUploads: number
  totalInvoices: number
  totalTaxableValue: number
  totalCGST: number
  totalSGST: number
  totalIGST: number
  totalTax: number
  totalPurchases: number
  totalITC: number
  netGSTPayable: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUploads: 0,
    totalInvoices: 0,
    totalTaxableValue: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalTax: 0,
    totalPurchases: 0,
    totalITC: 0,
    netGSTPayable: 0
  })

  useEffect(() => {
    const savedStats = localStorage.getItem('taxnow_stats')
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
      } catch (e) {
        console.error('Failed to parse stats:', e)
      }
    }
  }, [])

  const taxData = [
    { name: 'CGST', value: stats.totalCGST, color: '#3b82f6' },
    { name: 'SGST', value: stats.totalSGST, color: '#10b981' },
    { name: 'IGST', value: stats.totalIGST, color: '#f59e0b' },
  ].filter(item => item.value > 0)

  const gstPayableData = [
    { name: 'Output Tax', value: stats.totalTax, fill: '#ef4444' },
    { name: 'ITC Available', value: stats.totalITC, fill: '#10b981' },
    { name: 'Net Payable', value: stats.netGSTPayable, fill: '#8b5cf6' },
  ].filter(item => item.value > 0)

  // Sample monthly data for charts
  const monthlyData = [
    { month: 'Jan', sales: 450000, purchases: 280000 },
    { month: 'Feb', sales: 520000, purchases: 320000 },
    { month: 'Mar', sales: 480000, purchases: 290000 },
    { month: 'Apr', sales: 610000, purchases: 380000 },
    { month: 'May', sales: 580000, purchases: 350000 },
    { month: 'Jun', sales: 720000, purchases: 420000 },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome to TaxNow - Your complete GST automation solution
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Upload Data</p>
                <p className="text-xl font-bold mt-1">Process Files</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </div>
            <Link to="/upload">
              <Button variant="secondary" size="sm" className="w-full mt-4 bg-white/20 text-white hover:bg-white/30 border-0">
                Upload Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">GST Returns</p>
                <p className="text-xl font-bold mt-1">Generate</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Calculator className="h-6 w-6 text-white" />
              </div>
            </div>
            <Link to="/returns">
              <Button variant="secondary" size="sm" className="w-full mt-4 bg-white/20 text-white hover:bg-white/30 border-0">
                Generate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-lg shadow-violet-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Analytics</p>
                <p className="text-xl font-bold mt-1">View Reports</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <Link to="/analytics">
              <Button variant="secondary" size="sm" className="w-full mt-4 bg-white/20 text-white hover:bg-white/30 border-0">
                View
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg shadow-amber-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Invoices</p>
                <p className="text-xl font-bold mt-1">Manage</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <Link to="/invoices">
              <Button variant="secondary" size="sm" className="w-full mt-4 bg-white/20 text-white hover:bg-white/30 border-0">
                Manage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalTaxableValue)}</div>
            <p className="text-xs text-slate-500 mt-1">Taxable value</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Purchases</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalPurchases)}</div>
            <p className="text-xs text-slate-500 mt-1">Purchase value</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">GST Payable</CardTitle>
            <div className="bg-amber-100 p-2 rounded-lg">
              <Calculator className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalTax)}</div>
            <p className="text-xs text-slate-500 mt-1">Output tax</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Input Tax Credit</CardTitle>
            <div className="bg-violet-100 p-2 rounded-lg">
              <CreditCard className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalITC)}</div>
            <p className="text-xs text-slate-500 mt-1">ITC available</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tax Distribution */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">GST Distribution</CardTitle>
            <CardDescription>Breakdown of tax components</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={taxData.length > 0 ? taxData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(taxData.length > 0 ? taxData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Sales Trend */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Sales Trend</CardTitle>
            <CardDescription>Sales vs Purchases over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                <Area type="monotone" dataKey="purchases" stroke="#10b981" fillOpacity={1} fill="url(#colorPurchases)" name="Purchases" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Tax Liability */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">GST Liability Analysis</CardTitle>
            <CardDescription>Output tax vs ITC vs Net Payable</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gstPayableData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {gstPayableData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Return Filing Status */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Return Filing Status</CardTitle>
            <CardDescription>Upcoming due dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">GSTR-1</p>
                  <p className="text-xs text-slate-500">Monthly Return</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-600">Due in 5 days</p>
                  <p className="text-xs text-slate-500">11th March</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">GSTR-3B</p>
                  <p className="text-xs text-slate-500">Summary Return</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">Filed</p>
                  <p className="text-xs text-slate-500">20th March</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">GSTR-9</p>
                  <p className="text-xs text-slate-500">Annual Return</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500">Due in 9 months</p>
                  <p className="text-xs text-slate-500">31st December</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your recent uploads and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Sales data uploaded</p>
                <p className="text-sm text-slate-500">Amazon report - 1,234 invoices processed</p>
              </div>
              <span className="text-sm text-slate-400">2 hours ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Calculator className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">GSTR-1 generated</p>
                <p className="text-sm text-slate-500">February 2024 return file downloaded</p>
              </div>
              <span className="text-sm text-slate-400">Yesterday</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="bg-violet-100 p-2 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Purchase data uploaded</p>
                <p className="text-sm text-slate-500">Vendor invoices - 567 records processed</p>
              </div>
              <span className="text-sm text-slate-400">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
