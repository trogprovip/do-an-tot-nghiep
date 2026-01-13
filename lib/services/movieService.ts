/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface Movie {
  age_rating: any;
  rating: any;
  id: number;
  title: string;
  description: string | null;
  duration: number;
  release_date: Date | null;
  director: string | null;
  cast: string | null;
  genre: string | null;
  language: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  status: string | null;
  create_at: Date | null;
  update_at: Date | null;
  is_deleted: boolean | null;
  reviews?: {
    id: number;
    rating: number;
    comment: string | null;
    create_at: string;
    accounts: {
      id: number;
      full_name: string;
      username: string;
    };
  }[];
  _count?: {
    favorites: number;
  };
}

export interface CreateMovieDto {
  title: string;
  description?: string;
  duration?: number;
  release_date?: string;
  director?: string;
  cast?: string;
  genre?: string;
  language?: string;
  poster_url?: string;
  trailer_url?: string;
  status?: string;
}

export interface UpdateMovieDto {
  title?: string;
  description?: string;
  duration?: number;
  release_date?: string;
  director?: string;
  cast?: string;
  genre?: string;
  language?: string;
  poster_url?: string;
  trailer_url?: string;
  status?: string;
}

export interface MoviePage {
  content: Movie[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DateDTO {
  date: Date;
}

export interface MovieFilterParams {
  search?: string;
  status?: string;
  title?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const getPublicMovies = async (status?: string) => {
  try {
    const url = status 
      ? `/api/movies/public?status=${status}`
      : '/api/movies/public';
    
    const { data } = await axios.get(url);
    return data.data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

class MovieService {
  private baseUrl = '/api/movies';

  async getMovies(params?: MovieFilterParams): Promise<MoviePage> {
    const { data } = await axios.get<MoviePage>(this.baseUrl, { params });
    return data;
  }

  async getMovie(id: number): Promise<Movie> {
    const { data } = await axios.get<Movie>(`${this.baseUrl}/${id}`);
    return data;
  }

  async getShowDatesByMovieId(id: number): Promise<DateDTO[]> {
    const { data } = await axios.get<DateDTO[]>(`${this.baseUrl}/${id}/dates`);
    return data;
  }

  async createMovie(data: CreateMovieDto): Promise<void> {
    try {
      console.log('Creating movie with data:', data);
      await axios.post(this.baseUrl, data);
      console.log('Movie created successfully');
    } catch (error) {
      console.error('Create movie error:', error);
      throw error;
    }
  }

  async updateMovie(id: number, data: UpdateMovieDto): Promise<void> {
    try {
      console.log('🔵 Updating movie:', id, data);
      const response = await axios.put(`${this.baseUrl}/${id}`, data);
      console.log('🔵 Response:', response.data);
      console.log('✅ Movie updated successfully');
    } catch (error) {
      console.error('❌ Update movie error:', error);
      throw error;
    }
  }

  async deleteMovie(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Delete movie error:', error);
      throw error;
    }
  }
}

export const movieService = new MovieService();