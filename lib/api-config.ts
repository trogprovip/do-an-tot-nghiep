// Cấu hình API Backend
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Movies
  MOVIES: '/movies',
  MOVIE_BY_ID: (id: number) => `/movies/${id}`,
  
  // Cinemas
  CINEMAS: '/cinemas',
  CINEMA_BY_ID: (id: number) => `/cinemas/${id}`,
  
  // Users/Accounts
  USERS: '/accounts',
  USER_BY_ID: (id: number) => `/accounts/${id}`,
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: number) => `/products/${id}`,
  
  // News
  NEWS: '/news',
  NEWS_BY_ID: (id: number) => `/news/${id}`,
  
  // Tickets
  TICKETS: '/tickets',
  TICKET_BY_ID: (id: number) => `/tickets/${id}`,
  
  // Provinces
  PROVINCES: '/provinces',
  PROVINCE_BY_ID: (id: number) => `/provinces/${id}`,
  
  // Rooms
  ROOMS: '/rooms',
  ROOM_BY_ID: (id: number) => `/rooms/${id}`,
  
  // Slots
  SLOTS: '/slots',
  SLOT_BY_ID: (id: number) => `/slots/${id}`,
  
  // Settings
  SETTINGS: '/settings',
};
