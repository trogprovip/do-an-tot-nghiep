import axios from 'axios';

export interface Cinema {
  id: number;
  cinema_name: string;
  address: string;
  phone: string | null;
  email: string | null;
  province_id: number;
  latitude?: string | null;
  longitude?: string | null;
  status: string | null;
  create_at?: Date | null;
  is_deleted?: boolean | null;
}

export interface CreateCinemaForm {
  cinema_name: string;
  address: string;
  phone: string;
  email: string;
  province_id: number;
  latitude?: number;
  longitude?: number;
  status?: string;
}

export interface UpdateCinemaForm {
  cinema_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  province_id?: number;
  latitude?: number;
  longitude?: number;
  status?: string;
}

export interface CinemaPage {
  content: Cinema[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CinemaFilterForm {
  search?: string;
  status?: string;
  provinceId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

class CinemaService {
  private baseUrl = '/api/cinemas';

  async getCinemas(params?: CinemaFilterForm): Promise<CinemaPage> {
    const { data } = await axios.get<CinemaPage>(this.baseUrl, { params });
    return data;
  }

  async getCinema(id: number): Promise<Cinema> {
    const { data } = await axios.get<Cinema>(`${this.baseUrl}/${id}`);
    return data;
  }

  async createCinema(data: CreateCinemaForm): Promise<void> {
    try {
      console.log('Creating cinema with data:', data);
      await axios.post(this.baseUrl, data);
      console.log('Cinema created successfully');
    } catch (error) {
      console.error('Create cinema error:', error);
      throw error;
    }
  }

  async updateCinema(id: number, data: UpdateCinemaForm): Promise<void> {
    try {
      await axios.put(`${this.baseUrl}/${id}`, data);
      console.log('✅ Cinema updated successfully');
    } catch (error) {
      console.error('❌ Update cinema error:', error);
      throw error;
    }
  }

  async deleteCinema(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }
}

export const cinemaService = new CinemaService();
