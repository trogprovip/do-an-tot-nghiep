'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    weekdayPrice: 80000,
    weekendPrice: 120000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings?type=ticket_price');
      const data = await response.json();
      if (data.config_data) {
        setSettings({
          weekdayPrice: data.config_data.weekdayPrice || 80000,
          weekendPrice: data.config_data.weekendPrice || 120000,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ticket_price',
          config_data: settings,
        }),
      });

      if (response.ok) {
        alert('Lưu cài đặt thành công!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Có lỗi xảy ra khi lưu cài đặt!');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Cài đặt giá vé</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá vé ngày thường (VNĐ)
            </label>
            <input
              type="number"
              value={settings.weekdayPrice}
              onChange={(e) => setSettings({ ...settings, weekdayPrice: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá vé cuối tuần (VNĐ)
            </label>
            <input
              type="number"
              value={settings.weekendPrice}
              onChange={(e) => setSettings({ ...settings, weekendPrice: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
