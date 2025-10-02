import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  Settings as SettingsIcon,
  Building2,
  Clock,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Save,
  Phone,
  Mail,
  MapPin,
  Globe,
  Lock,
  User,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  FileText,
  Download,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useGlobal } from '../../hooks/useGlobal';

const Settings = () => {
  const { showSuccess, showError } = useGlobal();
  const [activeSection, setActiveSection] = useState('business');
  const [hasChanges, setHasChanges] = useState(false);

  // Business Settings State
  const [businessSettings, setBusinessSettings] = useState({
    businessName: 'Venkateswara Motors',
    email: 'contact@venkateswaramotors.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
    website: 'www.venkateswaramotors.com',
    address: '123 Main Street',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    gstNumber: '36AABCU9603R1ZM',
    panNumber: 'AABCU9603R'
  });

  // Service Hours State
  const [serviceHours, setServiceHours] = useState({
    monday: { open: '09:00', close: '19:00', closed: false },
    tuesday: { open: '09:00', close: '19:00', closed: false },
    wednesday: { open: '09:00', close: '19:00', closed: false },
    thursday: { open: '09:00', close: '19:00', closed: false },
    friday: { open: '09:00', close: '19:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '10:00', close: '14:00', closed: false }
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    newBookings: true,
    bookingUpdates: true,
    paymentReceived: true,
    lowInventory: true,
    customerMessages: true,
    systemUpdates: false,
    marketingEmails: false,
    weeklyReports: true,
    monthlyReports: true
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAlerts: true,
    ipWhitelisting: false,
    allowMultipleSessions: true
  });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    accentColor: 'blue',
    compactMode: false,
    showAnimations: true,
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'INR'
  });

  // Billing Settings State
  const [billingSettings, setBillingSettings] = useState({
    taxRate: '18',
    invoicePrefix: 'VM',
    invoiceStartNumber: '1001',
    paymentTerms: '30',
    acceptCash: true,
    acceptCard: true,
    acceptUPI: true,
    acceptNetBanking: true,
    autoReminders: true,
    reminderDays: '7'
  });

  const handleSave = (section) => {
    // Simulate save operation
    setTimeout(() => {
      showSuccess('Success', `${section} settings saved successfully`);
      setHasChanges(false);
    }, 500);
  };

  const handleBusinessChange = (field, value) => {
    setBusinessSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAppearanceChange = (field, value) => {
    setAppearanceSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBillingChange = (field, value) => {
    setBillingSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const sections = [
    { id: 'business', title: 'Business Info', icon: Building2 },
    { id: 'hours', title: 'Service Hours', icon: Clock },
    { id: 'notifications', title: 'Notifications', icon: Bell },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'billing', title: 'Billing & Payments', icon: CreditCard },
    { id: 'appearance', title: 'Appearance', icon: Palette }
  ];

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value={businessSettings.businessName}
              onChange={(e) => handleBusinessChange('businessName', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={businessSettings.email}
              onChange={(e) => handleBusinessChange('email', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Primary Phone
            </label>
            <input
              type="tel"
              value={businessSettings.phone}
              onChange={(e) => handleBusinessChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Smartphone className="w-4 h-4 inline mr-1" />
              Alternate Phone
            </label>
            <input
              type="tel"
              value={businessSettings.alternatePhone}
              onChange={(e) => handleBusinessChange('alternatePhone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <input
              type="text"
              value={businessSettings.website}
              onChange={(e) => handleBusinessChange('website', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={businessSettings.address}
              onChange={(e) => handleBusinessChange('address', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={businessSettings.city}
              onChange={(e) => handleBusinessChange('city', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={businessSettings.state}
              onChange={(e) => handleBusinessChange('state', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
            <input
              type="text"
              value={businessSettings.pincode}
              onChange={(e) => handleBusinessChange('pincode', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
            <input
              type="text"
              value={businessSettings.gstNumber}
              onChange={(e) => handleBusinessChange('gstNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
            <input
              type="text"
              value={businessSettings.panNumber}
              onChange={(e) => handleBusinessChange('panNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('Business')} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderServiceHours = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
        <p className="text-sm text-gray-600 mb-6">Set your business hours for each day of the week</p>
        
        <div className="space-y-4">
          {Object.entries(serviceHours).map(([day, hours]) => (
            <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 md:w-40">
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => setServiceHours(prev => ({
                    ...prev,
                    [day]: { ...prev[day], closed: !e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900 capitalize">{day}</span>
              </div>
              
              {hours.closed ? (
                <Badge variant="error" className="md:ml-auto">Closed</Badge>
              ) : (
                <div className="flex items-center gap-3 md:ml-auto">
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => setServiceHours(prev => ({
                      ...prev,
                      [day]: { ...prev[day], open: e.target.value }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => setServiceHours(prev => ({
                      ...prev,
                      [day]: { ...prev[day], close: e.target.value }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('Service Hours')} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                <p className="text-xs text-gray-500">Receive SMS alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Browser push notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'newBookings', label: 'New Bookings', desc: 'When a new booking is created' },
            { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Status changes and updates' },
            { key: 'paymentReceived', label: 'Payments', desc: 'When payments are received' },
            { key: 'lowInventory', label: 'Low Inventory', desc: 'Stock level alerts' },
            { key: 'customerMessages', label: 'Customer Messages', desc: 'New customer inquiries' },
            { key: 'systemUpdates', label: 'System Updates', desc: 'Platform updates and news' },
            { key: 'marketingEmails', label: 'Marketing', desc: 'Promotional content' },
            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Business performance reports' }
          ].map(item => (
            <div key={item.key} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings[item.key]}
                onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ml-3 mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('Notification')} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-blue-900">Security Best Practices</h4>
          <p className="text-xs text-blue-700 mt-1">
            Enable two-factor authentication and use strong passwords to keep your account secure.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Login Alerts</p>
                <p className="text-xs text-gray-500">Get notified of new logins</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.loginAlerts}
                onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
            <select
              value={securitySettings.passwordExpiry}
              onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">Allow Multiple Sessions</p>
              <p className="text-xs text-gray-500">Log in from multiple devices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.allowMultipleSessions}
                onChange={(e) => handleSecurityChange('allowMultipleSessions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Change Password
        </Button>
        <Button onClick={() => handleSave('Security')} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Prefix</label>
            <input
              type="text"
              value={billingSettings.invoicePrefix}
              onChange={(e) => handleBillingChange('invoicePrefix', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Starting Number</label>
            <input
              type="text"
              value={billingSettings.invoiceStartNumber}
              onChange={(e) => handleBillingChange('invoiceStartNumber', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={billingSettings.taxRate}
              onChange={(e) => handleBillingChange('taxRate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms (days)</label>
            <select
              value={billingSettings.paymentTerms}
              onChange={(e) => handleBillingChange('paymentTerms', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Due on Receipt</option>
              <option value="7">Net 7</option>
              <option value="15">Net 15</option>
              <option value="30">Net 30</option>
              <option value="45">Net 45</option>
              <option value="60">Net 60</option>
            </select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cash Payments</p>
                <p className="text-xs text-gray-500">Accept cash</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={billingSettings.acceptCash}
              onChange={(e) => handleBillingChange('acceptCash', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Card Payments</p>
                <p className="text-xs text-gray-500">Credit/Debit cards</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={billingSettings.acceptCard}
              onChange={(e) => handleBillingChange('acceptCard', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">UPI Payments</p>
                <p className="text-xs text-gray-500">Google Pay, PhonePe, etc.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={billingSettings.acceptUPI}
              onChange={(e) => handleBillingChange('acceptUPI', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Net Banking</p>
                <p className="text-xs text-gray-500">Online bank transfers</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={billingSettings.acceptNetBanking}
              onChange={(e) => handleBillingChange('acceptNetBanking', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Reminders</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">Automatic Reminders</p>
              <p className="text-xs text-gray-500">Send payment reminders automatically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={billingSettings.autoReminders}
                onChange={(e) => handleBillingChange('autoReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {billingSettings.autoReminders && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Frequency (days before due)</label>
              <select
                value={billingSettings.reminderDays}
                onChange={(e) => handleBillingChange('reminderDays', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="3">3 days before</option>
                <option value="5">5 days before</option>
                <option value="7">7 days before</option>
                <option value="14">14 days before</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('Billing')} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'auto', label: 'Auto', icon: Monitor }
          ].map(theme => (
            <div
              key={theme.value}
              onClick={() => handleAppearanceChange('theme', theme.value)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                appearanceSettings.theme === theme.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <theme.icon className={`w-6 h-6 ${
                  appearanceSettings.theme === theme.value ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="font-medium text-gray-900">{theme.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accent Color</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[
            { value: 'blue', color: 'bg-blue-500' },
            { value: 'purple', color: 'bg-purple-500' },
            { value: 'pink', color: 'bg-pink-500' },
            { value: 'red', color: 'bg-red-500' },
            { value: 'orange', color: 'bg-orange-500' },
            { value: 'green', color: 'bg-green-500' },
            { value: 'teal', color: 'bg-teal-500' },
            { value: 'indigo', color: 'bg-indigo-500' }
          ].map(color => (
            <div
              key={color.value}
              onClick={() => handleAppearanceChange('accentColor', color.value)}
              className={`w-12 h-12 ${color.color} rounded-lg cursor-pointer transition-all hover:scale-110 ${
                appearanceSettings.accentColor === color.value
                  ? 'ring-4 ring-gray-300'
                  : ''
              }`}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">Compact Mode</p>
              <p className="text-xs text-gray-500">Reduce spacing and padding</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appearanceSettings.compactMode}
                onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">Show Animations</p>
              <p className="text-xs text-gray-500">Enable smooth transitions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appearanceSettings.showAnimations}
                onChange={(e) => handleAppearanceChange('showAnimations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={appearanceSettings.language}
              onChange={(e) => handleAppearanceChange('language', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={appearanceSettings.currency}
              onChange={(e) => handleAppearanceChange('currency', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">₹ INR - Indian Rupee</option>
              <option value="USD">$ USD - US Dollar</option>
              <option value="EUR">€ EUR - Euro</option>
              <option value="GBP">£ GBP - British Pound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={appearanceSettings.dateFormat}
              onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={appearanceSettings.timeFormat}
              onChange={(e) => handleAppearanceChange('timeFormat', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('Appearance')} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-gray-700" />
            Settings
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your application settings and preferences</p>
        </div>
        {hasChanges && (
          <Badge variant="warning" className="animate-pulse">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unsaved Changes
          </Badge>
        )}
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-sm">{section.title}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {sections.find(s => s.id === activeSection)?.icon && 
                React.createElement(sections.find(s => s.id === activeSection).icon, { className: "w-6 h-6" })}
              {sections.find(s => s.id === activeSection)?.title}
            </CardTitle>
            <CardDescription>
              Configure your {sections.find(s => s.id === activeSection)?.title.toLowerCase()} preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSection === 'business' && renderBusinessSettings()}
            {activeSection === 'hours' && renderServiceHours()}
            {activeSection === 'notifications' && renderNotificationSettings()}
            {activeSection === 'security' && renderSecuritySettings()}
            {activeSection === 'billing' && renderBillingSettings()}
            {activeSection === 'appearance' && renderAppearanceSettings()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

