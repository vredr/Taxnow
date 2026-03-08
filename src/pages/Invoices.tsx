import { useState, useEffect } from 'react'
import { 
  FileText, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  ArrowUpRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

interface Invoice {
  invoice_number: string
  invoice_date: string
  customer_gstin: string
  place_of_supply: string
  hsn_code: string
  tax_rate: number
  taxable_value: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_tax: number
  total_amount: number
  invoice_type: string
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })

  const fetchInvoices = async () => {
    const uploadId = localStorage.getItem('taxnow_sales_upload_id')
    if (!uploadId) {
      toast.error('Please upload sales data first')
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/invoices/${uploadId}`, {
        params: {
          page: pagination.page,
          page_size: pagination.pageSize,
          invoice_type: filterType === 'all' ? undefined : filterType
        }
      })
      
      setInvoices(response.data.invoices)
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.total_pages
      }))
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [pagination.page, filterType])

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer_gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.place_of_supply?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInvoiceTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      'B2B': 'bg-blue-100 text-blue-700 border-blue-200',
      'B2CL': 'bg-amber-100 text-amber-700 border-amber-200',
      'B2CS': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'EXPORT': 'bg-violet-100 text-violet-700 border-violet-200'
    }
    return styles[type] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-600 mt-1">
          View and manage your sales invoices
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(pagination.total)}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">B2B Invoices</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(invoices.filter(i => i.invoice_type === 'B2B').length)}
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
                <p className="text-sm text-slate-500">B2C Invoices</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(invoices.filter(i => i.invoice_type === 'B2CS' || i.invoice_type === 'B2CL').length)}
                </p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0))}
                </p>
              </div>
              <div className="bg-violet-100 p-2 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by invoice number, GSTIN, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'B2B' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('B2B')}
              >
                B2B
              </Button>
              <Button
                variant={filterType === 'B2CL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('B2CL')}
              >
                B2CL
              </Button>
              <Button
                variant={filterType === 'B2CS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('B2CS')}
              >
                B2CS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>Showing {filteredInvoices.length} invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices found</p>
              <p className="text-sm text-slate-400 mt-1">Upload sales data to view invoices</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Invoice</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Date</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Place of Supply</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Taxable Value</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">CGST</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">SGST</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">IGST</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                          {invoice.customer_gstin && (
                            <p className="text-xs text-slate-500">{invoice.customer_gstin}</p>
                          )}
                        </td>
                        <td className="p-3 text-sm text-slate-600">{invoice.invoice_date}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={getInvoiceTypeBadge(invoice.invoice_type)}>
                            {invoice.invoice_type}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-slate-600">{invoice.place_of_supply}</td>
                        <td className="p-3 text-right text-sm font-medium">{formatCurrency(invoice.taxable_value)}</td>
                        <td className="p-3 text-right text-sm text-blue-600">{formatCurrency(invoice.cgst_amount)}</td>
                        <td className="p-3 text-right text-sm text-emerald-600">{formatCurrency(invoice.sgst_amount)}</td>
                        <td className="p-3 text-right text-sm text-amber-600">{formatCurrency(invoice.igst_amount)}</td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(invoice.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
