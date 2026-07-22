import React from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Bell, User, Moon, Sun, Cpu } from 'lucide-react';
import { useSettingsStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Button, Card, Input, Select, Toggle } from '../../components/ui';
import { toast } from '../../components/ui/Modal';
import { cardVariants } from '../../animations/variants';

export function SettingsPage() {
  const { settings, updateSettings, setTheme } = useSettingsStore();
  const { user } = useAuthStore();
  const [form, setForm] = React.useState({ ...settings });

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 300));
    updateSettings(form);
    if (form.theme !== settings.theme) setTheme(form.theme);
    toast('Settings saved successfully', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your application preferences and company information.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <div className="space-y-4">
        {/* Company Info */}
        <motion.div variants={cardVariants} initial="hidden" animate="show">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-brand-500/10"><Building2 size={16} className="text-brand-500" /></div>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Company Information</h2>
            </div>
            <div className="space-y-3">
              <Input
                label="Company Name"
                value={form.companyName}
                onChange={e => set('companyName', e.target.value)}
                placeholder="Your Company Name"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Currency"
                  value={form.currency}
                  onChange={e => {
                    const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
                    set('currency', e.target.value);
                    set('currencySymbol', symbols[e.target.value] || '₹');
                  }}
                  options={[
                    { value: 'INR', label: 'Indian Rupee (₹)' },
                    { value: 'USD', label: 'US Dollar ($)' },
                    { value: 'EUR', label: 'Euro (€)' },
                    { value: 'GBP', label: 'British Pound (£)' },
                    { value: 'JPY', label: 'Japanese Yen (¥)' },
                  ]}
                />
                <Select
                  label="Language"
                  value={form.language}
                  onChange={e => set('language', e.target.value)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'hi', label: 'Hindi' },
                    { value: 'ta', label: 'Tamil' },
                    { value: 'te', label: 'Telugu' },
                  ]}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={cardVariants} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/10"><Moon size={16} className="text-purple-500" /></div>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Appearance</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => set('theme', 'dark')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                  form.theme === 'dark'
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600'
                }`}
              >
                <Moon size={18} className="text-dark-400 mb-2" />
                <p className="text-sm font-medium text-dark-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-dark-400 mt-0.5">Easy on the eyes, great for long sessions</p>
              </button>
              <button
                onClick={() => set('theme', 'light')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                  form.theme === 'light'
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600'
                }`}
              >
                <Sun size={18} className="text-warning-500 mb-2" />
                <p className="text-sm font-medium text-dark-900 dark:text-white">Light Mode</p>
                <p className="text-xs text-dark-400 mt-0.5">Bright and clear for daytime use</p>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={cardVariants} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-warning-500/10"><Bell size={16} className="text-warning-500" /></div>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-900 dark:text-white">Enable Notifications</p>
                  <p className="text-xs text-dark-400">Show alerts for low stock and important events</p>
                </div>
                <Toggle
                  checked={form.notificationsEnabled}
                  onChange={v => set('notificationsEnabled', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-900 dark:text-white">Email Notifications</p>
                  <p className="text-xs text-dark-400">Send alerts to your email (UI only)</p>
                </div>
                <Toggle
                  checked={form.emailNotifications}
                  onChange={v => set('emailNotifications', v)}
                />
              </div>
              <div>
                <Input
                  label="Low Stock Threshold"
                  type="number"
                  min="1"
                  value={form.lowStockThreshold}
                  onChange={e => set('lowStockThreshold', parseInt(e.target.value) || 10)}
                  hint="Products with stock at or below this value will trigger low-stock alerts"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile */}
        <motion.div variants={cardVariants} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-success-500/10"><User size={16} className="text-success-500" /></div>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Profile</h2>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-info-500 flex items-center justify-center text-white font-bold">
                {user?.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-dark-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">{user?.email}</p>
                <span className="text-xs font-medium text-brand-500 capitalize">{user?.role}</span>
              </div>
            </div>
            <p className="text-xs text-dark-400 mt-3">
              Profile editing is managed through authentication. Contact your system administrator to update credentials.
            </p>
          </Card>
        </motion.div>

        {/* Future Features */}
        <motion.div variants={cardVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
          <Card className="border-dashed border-dark-200 dark:border-dark-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-info-500/10"><Cpu size={16} className="text-info-500" /></div>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Future Improvements</h2>
            </div>
            <div className="space-y-3 text-sm text-dark-600 dark:text-dark-400">
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                <p className="font-semibold text-dark-900 dark:text-white mb-1">📊 Demand Forecasting</p>
                <p className="text-xs">Machine Learning models (ARIMA, Prophet, LSTM) can be trained on historical transaction data to predict future demand. This would enable automated restocking suggestions and prevent both stockouts and overstock situations.</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                <p className="font-semibold text-dark-900 dark:text-white mb-1">🔗 ERP Integration</p>
                <p className="text-xs">Future versions could integrate with SAP, Tally, Zoho Books, or QuickBooks via REST APIs for automated purchase order generation and financial reconciliation.</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                <p className="font-semibold text-dark-900 dark:text-white mb-1">📦 IoT & RFID</p>
                <p className="text-xs">Smart warehouse integration using RFID readers and IoT sensors for real-time stock tracking, automated stock-in/out detection, and location tracking within warehouses.</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                <p className="font-semibold text-dark-900 dark:text-white mb-1">🌐 Multi-location Support</p>
                <p className="text-xs">Support for multiple warehouses, branches, and locations with inter-branch transfer management, consolidated reporting, and location-specific dashboards.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
