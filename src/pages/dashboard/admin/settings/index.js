/**
 * @file src/pages/dashboard/admin/settings/index.js
 * @description Global Configuration Interface
 */

import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Save, Loader2, Settings as SettingsIcon } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SystemSettings() {
  const { data, mutate } = useSWR('/api/v1/settings', fetcher);
  const [saving, setSaving] = useState(null); // specific key being saved

  // Default settings if DB is empty
  const settings = data?.data || [];
  
  // Helper to find value by key
  const getValue = (key) => settings.find(s => s.key === key)?.value || '';

  // Local state for form inputs (initialized when data loads)
  const [formState, setFormState] = useState({});

  async function handleSave(key, defaultValue) {
    setSaving(key);
    const valueToSave = formState[key] !== undefined ? formState[key] : defaultValue;

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: valueToSave }),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      toast.success(`${key} updated`);
      mutate(); // Refresh data
    } catch (err) {
      toast.error('Error saving setting');
    } finally {
      setSaving(null);
    }
  }

  const handleChange = (key, val) => {
    setFormState(prev => ({ ...prev, [key]: val }));
  };

  // Define the configurable fields for the UI
  const CONFIG_FIELDS = [
    { key: 'BASE_INTEREST_RATE', label: 'Base Interest Rate (%)', default: '5.5', type: 'number' },
    { key: 'MAX_LOAN_AMOUNT', label: 'Max Loan Amount ($)', default: '1000000', type: 'number' },
    { key: 'MAINTENANCE_MODE', label: 'Maintenance Mode', default: 'false', type: 'select', options: ['true', 'false'] },
    { key: 'ALLOW_REGISTRATION', label: 'Allow New Registrations', default: 'true', type: 'select', options: ['true', 'false'] },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="pb-4 mb-8 border-b border-slate-200">
          <h1 className="flex items-center text-2xl font-semibold text-slate-900">
            <SettingsIcon className="w-6 h-6 mr-3 text-primary-700" />
            System Configuration
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage global platform variables. Changes affect all users immediately.
          </p>
        </div>

        <div className="bg-white divide-y rounded-lg shadow divide-slate-200">
          {CONFIG_FIELDS.map((field) => {
            const dbValue = getValue(field.key) || field.default;
            const currentValue = formState[field.key] !== undefined ? formState[field.key] : dbValue;

            return (
              <div key={field.key} className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50">
                <div className="flex-1 pr-8">
                  <label className="block text-sm font-medium text-slate-900">{field.label}</label>
                  <p className="mt-1 text-xs text-slate-500">Key: <span className="font-mono">{field.key}</span></p>
                </div>
                
                <div className="flex items-center gap-4">
                  {field.type === 'select' ? (
                    <select
                      value={currentValue}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-40 input-field"
                    >
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={currentValue}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-40 text-right input-field"
                    />
                  )}

                  <button
                    onClick={() => handleSave(field.key, field.default)}
                    disabled={saving === field.key || currentValue === dbValue}
                    className="btn-primary disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {saving === field.key ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}