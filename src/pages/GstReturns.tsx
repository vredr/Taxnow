import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calculator, 
  FileText, 
  Calendar, 
  Download, 
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
  FileJson,
  FileCode
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://taxnow-production.up.railway.app'

interface ReturnType {
  id: string
  name: string
  description: string
  frequency: string
  dueDate: string
  icon: typeof Calculator
  color: string
  bgColor: string
  supported: boolean
}

const returnTypes: ReturnType[] = [
  {
    id: 'gstr1',
    name: 'GSTR-1',
    description: 'Monthly/Quarterly return for outward supplies. Contains details of all sales invoices including B2B, B2C, and exports.',
    frequency: 'Monthly/Quarterly',
    dueDate: '11th/13th of next month',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    supported: true
  },
  {
    id: 'gstr3b',
    name: 'GSTR-3B',
    description: 'Monthly summary return with consolidated sales, purchases, and tax liability. Self-declaration return.',
    frequency: 'Monthly',
    dueDate: '20th of next month',
    icon: Calculator,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    supported: true
  },
  {
    id: 'gstr4',
    name: 'GSTR-4',
    description: 'Annual return for composition taxable persons. Simplified return for small businesses.',
    frequency: 'Annual',
    dueDate: '30th April',
    icon: FileSpreadsheet,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    supported: true
  },
  {
    id: 'gstr5',
    name: 'GSTR-5',
    description: 'Return for non-resident taxable persons. For foreign businesses supplying in India.',
    frequency: 'Monthly',
    dueDate: '20th of next month',
    icon: FileCode,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    supported: false
  },
  {
    id: 'gstr6',
    name: 'GSTR-6',
    description: 'Return for Input Service Distributors (ISD). For distributing ITC to branches.',
    frequency: 'Monthly',
    dueDate: '13th of next month',
    icon: FileJson,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    supported: false
  },
  {
    id: 'gstr7',
    name: 'GSTR-7',
    description: 'Return for TDS deductors. For government departments and PSUs deducting TDS.',
    frequency: 'Monthly',
    dueDate: '10th of next month',
    icon: FileText,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    supported: false
  },
  {
    id: 'gstr8',
    name: 'GSTR-8',
    description: 'Return for e-commerce operators. For platforms collecting TCS on supplies.',
    frequency: 'Monthly',
    dueDate: '10th of next month',
    icon: FileSpreadsheet,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    supported: false
  },
  {
    id: 'gstr9',
    name: 'GSTR-9',
    description: 'Annual return with consolidated yearly data. Reconciliation of monthly returns.',
    frequency: 'Annual',
    dueDate: '31st December',
    icon: Calculator,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    supported: true
  }
]

export default function GstReturns() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (returnType: string, format: string = 'excel') => {
    const salesUploadId = localStorage.getItem('taxnow_sales_upload_id')
    
    if (!salesUploadId) {
      toast.error('Please upload sales data first')
      return
    }

    setDownloading(returnType)

    try {
      const response = await axios.get(
        `${API_URL}/download/${returnType}/${salesUploadId}?format=${format}`,
        { responseType: 'blob' }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      const extension = format === 'excel' ? 'xlsx' : format
      link.setAttribute('download', `${returnType}_return.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success(`${returnType.toUpperCase()} downloaded successfully!`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Download failed')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">GST Returns</h1>
        <p className="text-slate-600 mt-1">
          Generate and download your GST return files in multiple formats
        </p>
      </div>

      {/* Info Alert */}
      {!localStorage.getItem('taxnow_sales_upload_id') && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">No Data Available</AlertTitle>
          <AlertDescription className="text-amber-800">
            Please upload your sales data first to generate GST returns.
            <Link to="/upload">
              <Button variant="link" className="text-amber-700 p-0 h-auto ml-2">
                Upload Data <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Return Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {returnTypes.map((returnType) => {
          const Icon = returnType.icon
          return (
            <Card key={returnType.id} className="border-slate-200 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`${returnType.bgColor} p-3 rounded-xl`}>
                    <Icon className={`h-6 w-6 ${returnType.color}`} />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {returnType.frequency}
                    </Badge>
                    {!returnType.supported && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-4">{returnType.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {returnType.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Due: {returnType.dueDate}</span>
                  </div>
                </div>

                {returnType.supported ? (
                  <div className="mt-auto space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleDownload(returnType.id, 'excel')}
                      disabled={downloading === returnType.id}
                    >
                      {downloading === returnType.id ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download Excel
                        </>
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(returnType.id, 'csv')}
                        disabled={downloading === returnType.id}
                      >
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(returnType.id, 'json')}
                        disabled={downloading === returnType.id}
                      >
                        JSON
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button className="w-full mt-auto" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Return Structure Info */}
      <Card className="border-slate-200 mt-8">
        <CardHeader>
          <CardTitle>GSTR-1 File Structure</CardTitle>
          <CardDescription>The generated GSTR-1 Excel file contains the following sheets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">B2B</span>
              </div>
              <p className="text-sm text-blue-700">
                Business to Business invoices with customer GSTIN
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-900">B2CL</span>
              </div>
              <p className="text-sm text-amber-700">
                Large B2C invoices (interstate &gt; ₹2.5L)
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">B2CS</span>
              </div>
              <p className="text-sm text-emerald-700">
                Small B2C invoices (aggregated by state)
              </p>
            </div>
            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-violet-600" />
                <span className="font-semibold text-violet-900">HSN</span>
              </div>
              <p className="text-sm text-violet-700">
                HSN-wise summary of all supplies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
