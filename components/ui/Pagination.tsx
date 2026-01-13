'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalElements, 
  onPageChange 
}: PaginationProps) {
  
  const getVisiblePages = () => {
    const range: (number | string)[] = [];
    const delta = 1; // Hiển thị 1 trang xung quanh trang hiện tại

    for (let i = 0; i < totalPages; i++) {
      // Luôn hiển thị trang đầu, trang cuối và các trang lân cận trang hiện tại
      if (
        i === 0 || 
        i === totalPages - 1 || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } 
      // Thêm dấu ba chấm
      else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        if (range[range.length - 1] !== '...') {
          range.push('...');
        }
      }
    }
    return range;
  };

  if (totalPages <= 1) {
    return (
      <div className="px-4 py-3 bg-white border-t border-gray-100 text-center">
        <span className="text-sm text-gray-500 font-medium">
          Tổng số: <span className="text-blue-600 font-bold">{totalElements}</span> kết quả
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-100 gap-4">
      {/* Hiển thị tổng số phần tử bên trái */}
      <div className="order-2 sm:order-1">
        <span className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          Tổng cộng: <span className="text-blue-600 font-bold">{totalElements.toLocaleString('vi-VN')}</span> kết quả
        </span>
      </div>

      {/* Thanh điều hướng bên phải */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm mr-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="w-8 text-center text-gray-400 font-bold">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[36px] h-9 px-2 rounded-md text-sm font-semibold transition-all ${
                    page === currentPage
                      ? 'bg-blue-600 border border-blue-600 text-white shadow-md shadow-blue-100'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {(page as number) + 1}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm ml-1"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}