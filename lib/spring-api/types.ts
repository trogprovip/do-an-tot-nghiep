// Định nghĩa các interface tương ứng với DTO từ Spring Boot backend

// MovieDTO
export interface MovieDTO {
  id: number;
  title: string;
  description?: string;
  duration: number;
  releaseDate?: Date | string;
  director?: string;
  cast?: string;
  genre?: string;
  language?: string;
  posterUrl?: string;
  trailerUrl?: string;
  status?: 'coming_soon' | 'now_showing' | 'ended';
  createAt?: Date | string;
  updateAt?: Date | string;
  isDeleted?: boolean;
}

// DateDTO
export interface DateDTO {
  date: Date | string;
}

// CreateMovieForm
export interface CreateMovieForm {
  title: string;
  description?: string;
  duration: number;
  releaseDate?: Date | string;
  director?: string;
  cast?: string;
  genre?: string;
  language?: string;
  posterUrl?: string;
  trailerUrl?: string;
}

// UpdateMovieForm
export interface UpdateMovieForm {
  title?: string;
  description?: string;
  duration?: number;
  releaseDate?: Date | string;
  director?: string;
  cast?: string;
  genre?: string;
  language?: string;
  posterUrl?: string;
  trailerUrl?: string;
  status?: 'coming_soon' | 'now_showing' | 'ended';
}

// MovieFilterForm
export interface MovieFilterForm {
  search?: string;
  status?: string;
  minDuration?: number;
  maxDuration?: number;
  genre?: string;
}

// Page response từ Spring Boot
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
