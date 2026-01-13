/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Search, Save, X, Trash2, Eye } from 'lucide-react';
import { ticketService, Ticket } from '@/lib/services/ticketService';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Khởi tạo state mặc định để tránh lỗi null/undefined
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<string>('');
  const [deletingTicketId, setDeletingTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 5
  });

  useEffect(() => {
    fetchTickets();
  }, [searchTerm, statusFilter, paymentStatusFilter, pagination.currentPage]);

const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTickets({
        page: pagination.currentPage,
        size: pagination.size,
        search: searchTerm || undefined,
        // Nếu API hỗ trợ filter status thì truyền thêm vào đây
      });

      // Cập nhật dữ liệu và thông số phân trang
      if (response && response.content) {
        setTickets(response.content);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        }));
      } else {
        // Fallback nếu API trả về mảng trực tiếp
        setTickets(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
      };

  const handleEditStatus = (ticket: Ticket) => {
    setEditingTicketId(ticket.id);
    // Sửa lỗi logic: Lấy đúng trường status từ ticket
    setEditingStatus(ticket.status || 'pending'); 
    setEditingPaymentStatus(ticket.payment_status || 'unpaid');
  };

  const handleCancelEdit = () => {
    setEditingTicketId(null);
    setEditingStatus('');
    setEditingPaymentStatus('');
  };

  const handleSaveStatus = async (ticketId: number) => {
    try {
      // --- SỬA LỖI GẠCH ĐỎ ---
      // Ép kiểu (as any) để TypeScript không báo lỗi string khác với Union Type
      // Hoặc bạn cần sửa interface Ticket trong ticketService cho đúng
      await ticketService.updateTicket(ticketId, {
        status: editingStatus as any, 
        payment_status: editingPaymentStatus as any,
      });

      setTickets(prevTickets => prevTickets.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              status: editingStatus as any, 
              payment_status: editingPaymentStatus as any 
            } 
          : ticket
      ));
      
      setEditingTicketId(null);
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Có lỗi xảy ra khi cập nhật. Vui lòng kiểm tra Console (F12).');
    }
  };

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleDelete = async (ticketId: number, ticketCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vé "${ticketCode}"?`)) {
      return;
    }

    setDeletingTicketId(ticketId);
    try {
      await ticketService.deleteTicket(ticketId);
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      alert('Xóa vé thành công!');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Có lỗi xảy ra khi xóa vé!');
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Maps hiển thị tiếng Việt
  const statusMap: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    used: 'Đã sử dụng',
  };

  const paymentStatusMap: Record<string, string> = {
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    refunded: 'Đã hoàn tiền',
  };

  // Filter client-side (nếu API chưa hỗ trợ filter)
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (paymentStatusFilter && ticket.payment_status !== paymentStatusFilter) return false;
    return true;
  });

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    // Kiểm tra kỹ tên trường này khớp với API trả về (ticket_code hay tickets_code?)
    { key: 'tickets_code', label: 'Mã vé', width: '120px' }, 
    { 
      key: 'accounts', 
      label: 'Khách hàng',
      width: '200px',
      render: (value: any) => 
        value ? `${value.full_name} (${value.email})` : '-'
    },
    { 
      key: 'slots', 
      label: 'Suất chiếu',
      width: '280px',
      render: (value: any, row: Ticket) => {
        if (!value) return '-';
        const movieTitle = value.movies?.title || 'N/A';
        const roomName = value.rooms?.room_name || 'N/A';
        
        // Format giờ chiếu đúng múi giờ
        let showTime = 'N/A';
        if (value.show_time) {
          const date = new Date(value.show_time);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            showTime = `${hours}:${minutes} ${day}/${month}/${year}`;
          }
        }
        
        // Format giá vé - lấy từ final_amount của ticket
        const price = row.final_amount ? Number(row.final_amount).toLocaleString('vi-VN') : '0';
        
        return (
          <div>
            <div className="font-medium">{movieTitle}</div>
            <div className="text-xs text-gray-500">{roomName} - {showTime}</div>
            <div className="text-xs text-blue-600 font-semibold">{price} đ</div>
          </div>
        );
      }
    },
    { 
      key: 'final_amount', 
      label: 'Tổng tiền',
      width: '120px',
      render: (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`
    },
    { 
      key: 'payment_status', 
      label: 'Thanh toán',
      width: '150px',
      render: (value: string, row: Ticket) => {
        if (editingTicketId === row.id) {
          return (
            <select
              value={editingPaymentStatus}
              onChange={(e) => setEditingPaymentStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          );
        }
        const statusColors: Record<string, string> = {
          paid: 'bg-green-100 text-green-800',
          unpaid: 'bg-yellow-100 text-yellow-800',
          refunded: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {paymentStatusMap[value] || value}
          </span>
        );
      }
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '150px',
      render: (value: string, row: Ticket) => {
        if (editingTicketId === row.id) {
          return (
            <select
              value={editingStatus}
              onChange={(e) => setEditingStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="used">Đã sử dụng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          );
        }
        const statusColors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          used: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {statusMap[value] || value}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '160px',
      render: (_value: string, row: Ticket) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          {editingTicketId === row.id ? (
            <>
              <button
                onClick={() => handleSaveStatus(row.id)}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                title="Lưu"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                title="Hủy"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleEditStatus(row)}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                title="Sửa"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(row.id, row.tickets_code)}
                disabled={deletingTicketId === row.id}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                title="Xóa"
              >
                {deletingTicketId === row.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Vé</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="used">Đã sử dụng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
      </div>

{loading ? (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
) : (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <DataTable
      columns={columns}
      data={tickets} // Lưu ý: Nên dùng tickets trực tiếp nếu đã phân trang từ API
      pagination={{
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalElements: pagination.totalElements,
        size: pagination.size,
        onPageChange: handlePageChange
      }}
    />
  </div>
)}

      {/* Modal chi tiết vé */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Vé</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Thông tin vé */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Thông Tin Vé</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã vé</p>
                    <p className="font-medium text-gray-900">{selectedTicket.tickets_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày đặt vé</p>
                    <p className="font-medium text-gray-900">
                      {selectedTicket.tickets_date ? new Date(selectedTicket.tickets_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Thông Tin Khách Hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Họ tên</p>
                    <p className="font-medium text-gray-900">
                      {selectedTicket.accounts?.full_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedTicket.accounts?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin suất chiếu */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Thông Tin Suất Chiếu</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Phim</p>
                    <p className="font-medium text-gray-900">
                      {selectedTicket.slots?.movies?.title || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Phòng chiếu</p>
                      <p className="font-medium text-gray-900">
                        {selectedTicket.slots?.rooms?.room_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian chiếu</p>
                      <p className="font-medium text-gray-900">
                        {selectedTicket.slots?.show_time ? new Date(selectedTicket.slots.show_time).toLocaleString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin ghế đã đặt */}
              {selectedTicket.bookingseats && selectedTicket.bookingseats.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Ghế Đã Đặt</h3>
                  <div className="space-y-2">
                    {selectedTicket.bookingseats.map((bookingSeat) => (
                      <div key={bookingSeat.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-indigo-600">G</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Ghế {bookingSeat.seats.seat_number}</p>
                            <p className="text-xs text-gray-500">{bookingSeat.seats.seattypes.type_name}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-indigo-600">
                          {Number(bookingSeat.seat_price).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-700">Tổng tiền ghế:</p>
                        <p className="font-bold text-indigo-600">
                          {selectedTicket.bookingseats.reduce((sum, seat) => sum + Number(seat.seat_price), 0).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin sản phẩm đã mua */}
              {selectedTicket.ticketsdetails && selectedTicket.ticketsdetails.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Sản Phẩm Đã Mua</h3>
                  <div className="space-y-2">
                    {selectedTicket.ticketsdetails.map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-600">
                              {detail.products.category === 'food' ? 'F' : 
                               detail.products.category === 'drink' ? 'D' : 
                               detail.products.category === 'combo' ? 'C' : 'V'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{detail.products.product_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{detail.products.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-600">
                            {Number(detail.unit_price).toLocaleString('vi-VN')} đ x {detail.quantity}
                          </p>
                          <p className="font-semibold text-orange-700">
                            {Number(detail.total_price).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-700">Tổng tiền sản phẩm:</p>
                        <p className="font-bold text-orange-600">
                          {selectedTicket.ticketsdetails.reduce((sum, item) => sum + Number(item.total_price), 0).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin thanh toán */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Thông Tin Thanh Toán</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền</p>
                      <p className="font-medium text-gray-900">
                        {Number(selectedTicket.total_amount || 0).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Giảm giá</p>
                      <p className="font-medium text-gray-900">
                        {Number(selectedTicket.discount_amount || 0).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thành tiền</p>
                      <p className="font-bold text-lg text-blue-600">
                        {Number(selectedTicket.final_amount || 0).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTicket.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          selectedTicket.payment_status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {paymentStatusMap[selectedTicket.payment_status] || selectedTicket.payment_status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái vé</p>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTicket.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          selectedTicket.status === 'used' ? 'bg-green-100 text-green-800' :
                          selectedTicket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {statusMap[selectedTicket.status] || selectedTicket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {selectedTicket.note && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ghi Chú</h3>
                  <p className="text-gray-700">{selectedTicket.note}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}