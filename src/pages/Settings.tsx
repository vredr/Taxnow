import { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Building2, 
  Bell, 
  Shield,
  Save,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    gstin: '',
    address: '',
    state: '',
    pincode: '',
    email: '',
    phone: ''
  })

  const [notifications, setNotifications] = useState({
    returnDue: true,
    paymentReminder: true,
    dataUpload: false,
    monthlyReport: true
  })

  const handleSave = () => {
    setSaved(true)
    toast.success('Settings saved successfully!')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your business information and preferences
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Business Info Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business Information
              </CardTitle>
              <CardDescription>
                Your business details will be used in GST returns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    value={businessInfo.businessName}
                    onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    placeholder="27AAPFU0939F1ZV"
                    value={businessInfo.gstin}
                    onChange={(e) => setBusinessInfo({...businessInfo, gstin: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your business address"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    value={businessInfo.state}
                    onChange={(e) => setBusinessInfo({...businessInfo, state: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    value={businessInfo.pincode}
                    onChange={(e) => setBusinessInfo({...businessInfo, pincode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  {saved ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Return Due Reminders</p>
                    <p className="text-sm text-slate-500">Get notified before GST return due dates</p>
                  </div>
                  <Switch
                    checked={notifications.returnDue}
                    onCheckedChange={(checked) => setNotifications({...notifications, returnDue: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Payment Reminders</p>
                    <p className="text-sm text-slate-500">Reminders for GST payment due dates</p>
                  </div>
                  <Switch
                    checked={notifications.paymentReminder}
                    onCheckedChange={(checked) => setNotifications({...notifications, paymentReminder: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Data Upload Confirmation</p>
                    <p className="text-sm text-slate-500">Get notified when data upload is complete</p>
                  </div>
                  <Switch
                    checked={notifications.dataUpload}
                    onCheckedChange={(checked) => setNotifications({...notifications, dataUpload: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Monthly Summary Report</p>
                    <p className="text-sm text-slate-500">Receive monthly GST summary via email</p>
                  </div>
                  <Switch
                    checked={notifications.monthlyReport}
                    onCheckedChange={(checked) => setNotifications({...notifications, monthlyReport: checked})}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  {saved ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="font-medium text-slate-900 mb-2">Change Password</p>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="mt-3" variant="outline">Update Password</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* About / Credit */}
      <Card className="border-slate-200 mt-8">
        <CardHeader>
          <CardTitle className="text-lg">About TaxNow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">TaxNow - GST Automation Platform</p>
              <p className="text-sm text-slate-500">Version 2.0.0</p>
              <div className="mt-2 text-sm text-slate-600">
                <p>Made by <span className="font-medium text-slate-900">Ved Prakash Arya</span></p>
                <p>B.Tech CSE Student - Final Year Engineering Project</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
