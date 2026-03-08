import { useState, useEffect } from 'react'
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
import { 
  TrendingUp, 
  MapPin, 
  Package,
  BarChart3,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const uploadId = localStorage.getItem('taxnow_sales_upload_id')
      if (!uploadId) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${API_URL}/analytics/${uploadId}`)
        setAnalytics(response.data.analytics)
      } catch (err) {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Sample data for demonstration
  const taxDistributionData = analytics?.charts?.tax_distribution || [
    { name: 'CGST', value: 45000 },
    { name: 'SGST', value: 45000 },
    { name: 'IGST', value: 25000 }
  ]

  const invoiceTypeData = analytics?.charts?.invoice_type_distribution || [
    { name: 'B2B', value: 150 },
    { name: 'B2CL', value: 45 },
    { name: 'B2CS', value: 320 }
  ]

  const monthlyTrendData = analytics?.charts?.monthly_trend || [
    { month: 'Jan', sales: 450000, tax: 81000 },
    { month: 'Feb', sales: 520000, tax: 93600 },
    { month: 'Mar', sales: 480000, tax: 86400 },
    { month: 'Apr', sales: 610000, tax: 109800 },
    { month: 'May', sales: 580000, tax: 104400 },
    { month: 'Jun', sales: 720000, tax: 129600 }
  ]

  const topStates = analytics?.top_states || [
    { place_of_supply: 'Maharashtra', taxable_value: 850000, total_tax: 153000 },
    { place_of_supply: 'Karnataka', taxable_value: 620000, total_tax: 111600 },
    { place_of_supply: 'Delhi', taxable_value: 480000, total_tax: 86400 },
    { place_of_supply: 'Tamil Nadu', taxable_value: 390000, total_tax: 70200 },
    { place_of_supply: 'Gujarat', taxable_value: 320000, total_tax: 57600 }
  ]

  const topHSN = analytics?.top_hsn || [
    { hsn_code: '8517', taxable_value: 950000, total_tax: 171000 },
    { hsn_code: '8471', taxable_value: 720000, total_tax: 129600 },
    { hsn_code: '8528', taxable_value: 580000, total_tax: 162400 },
    { hsn_code: '8541', taxable_value: 420000, total_tax: 75600 },
    { hsn_code: '9001', taxable_value: 280000, total_tax: 50400 }
  ]

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">
          Deep insights into your GST data and business performance
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tax">Tax Analysis</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tax Distribution */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Tax Distribution
                </CardTitle>
                <CardDescription>CGST, SGST, and IGST breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taxDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taxDistributionData.map((_entry: any, index: number) => (
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
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Invoice Types
                </CardTitle>
                <CardDescription>B2B, B2CL, and B2CS distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={invoiceTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip formatter={(value: number) => value.toString()} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {invoiceTypeData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-violet-600" />
                Monthly Trend
              </CardTitle>
              <CardDescription>Sales and tax liability over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                  <Area type="monotone" dataKey="tax" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTax)" name="Tax" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Analysis Tab */}
        <TabsContent value="tax" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Total CGST</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(taxDistributionData.find((d: any) => d.name === 'CGST')?.value || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Total SGST</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(taxDistributionData.find((d: any) => d.name === 'SGST')?.value || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Total IGST</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-600">
                  {formatCurrency(taxDistributionData.find((d: any) => d.name === 'IGST')?.value || 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-rose-600" />
                Top States by Sales
              </CardTitle>
              <CardDescription>Sales distribution across states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">State</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Taxable Value</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Tax Amount</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStates.map((state: any, index: number) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{state.place_of_supply}</td>
                        <td className="p-3 text-right">{formatCurrency(state.taxable_value)}</td>
                        <td className="p-3 text-right">{formatCurrency(state.total_tax)}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(state.taxable_value / topStates[0].taxable_value) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500">
                              {Math.round((state.taxable_value / topStates[0].taxable_value) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-600" />
                Top HSN Codes by Value
              </CardTitle>
              <CardDescription>Product-wise sales analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">HSN Code</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Taxable Value</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Tax Amount</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHSN.map((hsn: any, index: number) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{hsn.hsn_code}</td>
                        <td className="p-3 text-right">{formatCurrency(hsn.taxable_value)}</td>
                        <td className="p-3 text-right">{formatCurrency(hsn.total_tax)}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(hsn.taxable_value / topHSN[0].taxable_value) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500">
                              {Math.round((hsn.taxable_value / topHSN[0].taxable_value) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
