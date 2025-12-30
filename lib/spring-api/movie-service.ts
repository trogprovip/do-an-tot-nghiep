import { springApiClient } from './api-client';
import { SPRING_API_ENDPOINTS } from './config';
import { 
  MovieDTO, 
  PageResponse, 
  CreateMovieForm, 
  UpdateMovieForm, 
  MovieFilterForm,
  DateDTO
} from './types';

/**
 * Service để kết nối với MovieService của Spring Boot backend
 */
export const springMovieService = {
  /**
   * Lấy danh sách phim có phân trang và lọc
   * Tương ứng với getAllMovie() trong MovieService Java
   */
  getAllMovies: async (
    page: number = 0, 
    size: number = 10, 
    filterForm: MovieFilterForm = {}
  ): Promise<PageResponse<MovieDTO>> => {
    const params = {
      page,
      size,
      ...filterForm
    };
    
    return springApiClient.get<PageResponse<MovieDTO>>(
      SPRING_API_ENDPOINTS.MOVIES, 
      params
    );
  },

  /**
   * Lấy thông tin chi tiết phim theo ID
   * Tương ứng với getById() trong MovieService Java
   */
  getMovieById: async (id: number): Promise<MovieDTO> => {
    return springApiClient.get<MovieDTO>(SPRING_API_ENDPOINTS.MOVIE_BY_ID(id));
  },

  /**
   * Lấy danh sách ngày chiếu của một phim
   * Tương ứng với getShowDatesByMovieId() trong MovieService Java
   */
  getShowDatesByMovieId: async (movieId: number): Promise<DateDTO[]> => {
    return springApiClient.get<DateDTO[]>(SPRING_API_ENDPOINTS.MOVIE_DATES(movieId));
  },

  /**
   * Tạo phim mới
   * Tương ứng với createMovie() trong MovieService Java
   */
  createMovie: async (form: CreateMovieForm): Promise<void> => {
    return springApiClient.post<void>(SPRING_API_ENDPOINTS.MOVIES, form);
  },

  /**
   * Cập nhật thông tin phim
   * Tương ứng với updateMovie() trong MovieService Java
   */
  updateMovie: async (id: number, form: UpdateMovieForm): Promise<void> => {
    return springApiClient.put<void>(SPRING_API_ENDPOINTS.MOVIE_BY_ID(id), form);
  },

  /**
   * Xóa phim (soft delete)
   * Tương ứng với deleteMovie() trong MovieService Java
   */
  deleteMovie: async (id: number): Promise<void> => {
    return springApiClient.delete<void>(SPRING_API_ENDPOINTS.MOVIE_BY_ID(id));
  }
};
