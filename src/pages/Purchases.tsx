import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Upload,
  Building2,
  CreditCard,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

export default function Purchases() {
  const [summary, setSummary] = useState<any>(null)

  const fetchPurchases = async () => {
    const uploadId = localStorage.getItem('taxnow_purchase_upload_id')
    if (!uploadId) return

    try {
      const response = await axios.get(`${API_URL}/purchase-summary/${uploadId}`)
      setSummary(response.data.summary)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to fetch purchases')
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [])

  const hasPurchaseData = !!localStorage.getItem('taxnow_purchase_upload_id')

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Purchases</h1>
        <p className="text-slate-600 mt-1">
          Manage your purchase invoices and Input Tax Credit (ITC)
        </p>
      </div>

      {!hasPurchaseData ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Purchase Data</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Upload your purchase invoices to track Input Tax Credit (ITC) and calculate net GST payable.
            </p>
            <Link to="/upload">
              <Button size="lg">
                <Upload className="h-5 w-5 mr-2" />
                Upload Purchase Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ITC Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Purchases</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(summary?.overall?.total_taxable_value || 0)}
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total ITC</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(summary?.overall?.total_itc || 0)}
                    </p>
                  </div>
                  <div className="bg-violet-100 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">CGST ITC</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(summary?.overall?.total_itc_cgst || 0)}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">IGST ITC</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(summary?.overall?.total_itc_igst || 0)}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net GST Payable */}
          <Card className="border-slate-200 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle>Net GST Payable Calculation</CardTitle>
              <CardDescription>Output tax liability after ITC adjustment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Output Tax (Sales)</p>
                  <p className="text-2xl font-bold text-amber-600">₹0.00</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Less: ITC Available</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    -{formatCurrency(summary?.overall?.total_itc || 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-100 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-blue-600 mb-1">Net GST Payable</p>
                  <p className="text-3xl font-bold text-blue-700">₹0.00</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link to="/returns">
                  <Button>
                    Generate GSTR-3B
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Summary */}
          {summary?.supplier_summary && summary.supplier_summary.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Supplier-wise ITC Summary</CardTitle>
                <CardDescription>Input Tax Credit by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left p-3 text-sm font-semibold text-slate-700">Supplier GSTIN</th>
                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Invoices</th>
                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Taxable Value</th>
                        <th className="text-right p-3 text-sm font-semibold text-slate-700">ITC Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.supplier_summary.map((supplier: any, index: number) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-900">{supplier.supplier_gstin}</td>
                          <td className="p-3 text-right">{formatNumber(supplier.invoice_count)}</td>
                          <td className="p-3 text-right">{formatCurrency(supplier.taxable_value)}</td>
                          <td className="p-3 text-right font-semibold text-emerald-600">
                            {formatCurrency(supplier.itc_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
