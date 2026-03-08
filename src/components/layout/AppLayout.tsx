import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Upload,
  FileText,
  ShoppingCart,
  Calculator,
  BarChart3,
  PieChart,
  Settings,
  Menu,
  CalculatorIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const sidebarItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Data', icon: Upload },
  { path: '/invoices', label: 'Invoices', icon: FileText },
  { path: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { path: '/returns', label: 'GST Returns', icon: Calculator },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/analytics', label: 'Analytics', icon: PieChart },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 h-screen z-40",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-100 px-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaxNow
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                )} />
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>

        {/* Footer Credit */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 text-center">
              <p className="font-medium text-slate-700">Made by Ved Prakash Arya</p>
              <p className="mt-0.5">B.Tech CSE Student</p>
              <p className="text-slate-400">Final Year Project</p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <CalculatorIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">TaxNow</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50">
            <div className="text-xs text-slate-500 text-center">
              <p className="font-medium text-slate-700">Made by Ved Prakash Arya</p>
              <p className="mt-0.5">B.Tech CSE Student</p>
              <p className="text-slate-400">Final Year Project</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
        <Outlet />
      </main>
    </div>
  )
}
