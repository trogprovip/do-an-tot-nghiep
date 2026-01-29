import axios from 'axios';

const baseUrl = '/api/tickets';

export interface Ticket {
  id: number;
  account_id: number;
  slot_id: number;
  tickets_code: string;
  qr_code_url: string | null;
  qr_code_data: string | null;
  tickets_date: string | null;
  total_amount: number;
  discount_amount: number | null;
  final_amount: number;
  payment_status: 'paid' | 'unpaid' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled' | 'used';
  note: string | null;
  is_deleted: boolean;
  promotion_id: number | null;
  promotion_code: string | null;
  accounts?: {
    id: number;
    full_name: string;
    email: string;
  };
  slots?: {
    id: number;
    show_time: string;
    movies?: {
      title: string;
    };
    rooms?: {
      room_name: string;
    };
  };
  promotions?: {
    id: number;
    promotion_code: string;
    promotion_name: string;
  };
  bookingseats?: Array<{
    id: number;
    seat_price: number;
    seats: {
      seat_number: string;
      seattypes: {
        type_name: string;
      };
    };
  }>;
  ticketsdetails?: Array<{
    id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      product_name: string;
      category: 'food' | 'drink' | 'combo' | 'voucher';
    };
  }>;
}

export interface CreateTicketForm {
  account_id: number;
  slot_id: number;
  tickets_code: string;
  total_amount: number;
  discount_amount?: number;
  final_amount: number;
  payment_status?: 'paid' | 'unpaid' | 'refunded';
  status?: 'pending' | 'confirmed' | 'cancelled' | 'used';
  note?: string;
}

export interface UpdateTicketForm {
  account_id?: number;
  slot_id?: number;
  total_amount?: number;
  discount_amount?: number;
  final_amount?: number;
  payment_status?: 'paid' | 'unpaid' | 'refunded';
  status?: 'pending' | 'confirmed' | 'cancelled' | 'used';
  note?: string;
}

export interface TicketPage {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface GetTicketsParams {
  page?: number;
  size?: number;
  search?: string;
  payment_status?: string;
  status?: string;
}

export const ticketService = {
  getTickets: async (params: GetTicketsParams = {}): Promise<TicketPage> => {
    const response = await axios.get(baseUrl, { params });
    return response.data;
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await axios.get(`${baseUrl}/${id}`);
    return response.data;
  },

  createTicket: async (data: CreateTicketForm): Promise<Ticket> => {
    const response = await axios.post(baseUrl, data);
    return response.data;
  },

  updateTicket: async (id: number, data: UpdateTicketForm): Promise<void> => {
    await axios.put(`${baseUrl}/${id}`, data);
  },

  deleteTicket: async (id: number): Promise<void> => {
    await axios.delete(`${baseUrl}/${id}`);
  },
};
