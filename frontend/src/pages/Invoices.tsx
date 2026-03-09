import { useEffect, useState } from 'react'
import { 
  Calculator,
  ArrowLeft,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

interface Invoice {
  invoice_number: string
  invoice_date: string
  customer_gstin?: string
  place_of_supply: string
  hsn_code?: string
  tax_rate: number
  taxable_value: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_tax: number
  total_amount: number
  invoice_type: string
}

const invoiceTypes = [
  { id: 'all', name: 'All Invoices', color: 'bg-gray-500' },
  { id: 'B2B', name: 'B2B', color: 'bg-blue-500' },
  { id: 'B2CL', name: 'B2CL', color: 'bg-orange-500' },
  { id: 'B2CS', name: 'B2CS', color: 'bg-green-500' },
  { id: 'EXPORT', name: 'Export', color: 'bg-purple-500' },
]

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchInvoices = async () => {
    const uploadId = localStorage.getItem('taxnow_upload_id')
    if (!uploadId) {
      setError('No data available. Please upload a file first.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('page_size', '20')
      if (filter !== 'all') {
        params.append('invoice_type', filter)
      }

      const response = await axios.get(`${API_URL}/invoices/${uploadId}?${params}`)
      setInvoices(response.data.invoices)
      setTotal(response.data.total)
      setTotalPages(response.data.total_pages)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch invoices.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [page, filter])

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.place_of_supply.toLowerCase().includes(search.toLowerCase())
  )

  const getInvoiceTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      'B2B': 'bg-blue-100 text-blue-700',
      'B2CL': 'bg-orange-100 text-orange-700',
      'B2CS': 'bg-green-100 text-green-700',
      'EXPORT': 'bg-purple-100 text-purple-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

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
              <Link to="/invoices" className="nav-link active">Invoices</Link>
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
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-600">View and manage all your processed invoices</p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading invoices...</span>
          </div>
        )}

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <>
            {/* Filters */}
            <Card className="mb-6 shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {invoiceTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={filter === type.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setFilter(type.id)
                          setPage(1)
                        }}
                      >
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card className="shadow-md border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Invoice List
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    Showing {filteredInvoices.length} of {total} invoices
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-700">Invoice #</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Place of Supply</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Taxable Value</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Tax</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{invoice.invoice_number}</div>
                            {invoice.hsn_code && (
                              <div className="text-xs text-gray-500">HSN: {invoice.hsn_code}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {invoice.invoice_date}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceTypeBadge(invoice.invoice_type)}`}>
                              {invoice.invoice_type}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {invoice.place_of_supply}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {formatCurrency(invoice.taxable_value)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-sm">{formatCurrency(invoice.total_tax)}</div>
                            <div className="text-xs text-gray-500">
                              {invoice.cgst_amount > 0 && `CGST: ${formatCurrency(invoice.cgst_amount)}`}
                              {invoice.igst_amount > 0 && `IGST: ${formatCurrency(invoice.igst_amount)}`}
                            </div>
                          </td>
                          <td className="p-4 text-right font-semibold">
                            {formatCurrency(invoice.total_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
