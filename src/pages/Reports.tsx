import { useState } from 'react'
import { 
  BarChart3, 
  Download, 
  FileText,
  Calendar,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Report {
  id: string
  name: string
  description: string
  type: string
  generatedAt: string
  status: 'ready' | 'generating' | 'pending'
}

const sampleReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Sales Summary',
    description: 'Comprehensive sales report with GST breakdown',
    type: 'sales',
    generatedAt: '2024-03-01',
    status: 'ready'
  },
  {
    id: '2',
    name: 'HSN-wise Summary',
    description: 'Sales grouped by HSN code',
    type: 'hsn',
    generatedAt: '2024-03-01',
    status: 'ready'
  },
  {
    id: '3',
    name: 'State-wise Sales',
    description: 'Sales distribution by state',
    type: 'state',
    generatedAt: '2024-03-01',
    status: 'ready'
  },
  {
    id: '4',
    name: 'B2B Invoice Report',
    description: 'All B2B invoices with GSTIN details',
    type: 'b2b',
    generatedAt: '2024-03-01',
    status: 'ready'
  },
  {
    id: '5',
    name: 'ITC Reconciliation',
    description: 'Input Tax Credit reconciliation report',
    type: 'itc',
    generatedAt: '2024-03-01',
    status: 'ready'
  }
]

export default function Reports() {
  const [reports] = useState<Report[]>(sampleReports)
  const [filter, setFilter] = useState('all')

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.type === filter)

  const handleDownload = (_reportId: string) => {
    toast.success('Report download started!')
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">
          Generate and download detailed GST reports
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Reports
        </Button>
        <Button
          variant={filter === 'sales' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('sales')}
        >
          Sales
        </Button>
        <Button
          variant={filter === 'hsn' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('hsn')}
        >
          HSN
        </Button>
        <Button
          variant={filter === 'state' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('state')}
        >
          State-wise
        </Button>
        <Button
          variant={filter === 'itc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('itc')}
        >
          ITC
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border-slate-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-3">{report.name}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <Calendar className="h-4 w-4" />
                <span>Generated: {report.generatedAt}</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDownload(report.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate New Report */}
      <Card className="border-slate-200 mt-8">
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>Create a custom report with specific filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Sales Analysis</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Filter className="h-6 w-6" />
              <span>GST Liability</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Period-wise</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
