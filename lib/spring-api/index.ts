// Export tất cả Spring API services
export { springMovieService } from './movie-service';
export { springApiClient } from './api-client';
export { SPRING_API_CONFIG, SPRING_API_ENDPOINTS } from './config';

// Export types
export type {
  MovieDTO,
  PageResponse,
  CreateMovieForm,
  UpdateMovieForm,
  MovieFilterForm,
  DateDTO
} from './types';
