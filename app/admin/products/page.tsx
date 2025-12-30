'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
      });
      
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.content || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'image_url', 
      label: 'Hình ảnh',
      render: (value: string) => value ? (
        <img src={value} alt="Product" className="w-16 h-16 object-cover rounded" />
      ) : <span className="text-gray-400">No image</span>
    },
    { key: 'product_name', label: 'Tên sản phẩm' },
    { 
      key: 'category', 
      label: 'Loại',
      render: (value: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categoryMap: any = {
          food: { label: 'Đồ ăn', class: 'bg-orange-100 text-orange-800' },
          drink: { label: 'Đồ uống', class: 'bg-blue-100 text-blue-800' },
          combo: { label: 'Combo', class: 'bg-purple-100 text-purple-800' },
          voucher: { label: 'Voucher', class: 'bg-green-100 text-green-800' },
        };
        const cat = categoryMap[value] || { label: value, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.class}`}>
            {cat.label}
          </span>
        );
      }
    },
    { 
      key: 'price', 
      label: 'Giá',
      render: (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    },
    { key: 'description', label: 'Mô tả' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="food">Đồ ăn</option>
            <option value="drink">Đồ uống</option>
            <option value="combo">Combo</option>
            <option value="voucher">Voucher</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
        />
      )}
    </div>
  );
}
