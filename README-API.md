# Hướng dẫn kết nối Frontend với Backend API

## Cấu hình

### 1. Tạo file `.env.local` trong thư mục root:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Lưu ý:** Thay `http://localhost:8080/api` bằng URL backend API của bạn.

### 2. Cấu trúc API đã tạo:

```
lib/
├── api-config.ts          # Cấu hình URL và endpoints
├── api-client.ts          # HTTP client (GET, POST, PUT, DELETE)
└── services/
    ├── movieService.ts    # Service cho Movies
    ├── userService.ts     # Service cho Users/Accounts
    ├── productService.ts  # Service cho Products
    └── cinemaService.ts   # Service cho Cinemas (đã có sẵn)
```

## Cách sử dụng

### Ví dụ 1: Lấy danh sách phim

```typescript
import { movieService } from '@/lib/services/movieService';

// Trong component
const fetchMovies = async () => {
  try {
    const data = await movieService.getAll({
      page: 0,
      size: 10,
      search: 'Avengers',
      status: 'now_showing'
    });
    
    console.log(data.content); // Danh sách phim
    console.log(data.totalElements); // Tổng số phim
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ví dụ 2: Tạo phim mới

```typescript
const createMovie = async () => {
  try {
    const newMovie = await movieService.create({
      title: 'Spider-Man',
      duration: 120,
      status: 'coming_soon',
      // ... các field khác
    });
    
    console.log('Created:', newMovie);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ví dụ 3: Cập nhật phim

```typescript
const updateMovie = async (id: number) => {
  try {
    const updated = await movieService.update(id, {
      status: 'now_showing'
    });
    
    console.log('Updated:', updated);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ví dụ 4: Xóa phim

```typescript
const deleteMovie = async (id: number) => {
  try {
    await movieService.delete(id);
    console.log('Deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## API Services có sẵn

### movieService
- `getAll(params)` - Lấy danh sách phim
- `getById(id)` - Lấy chi tiết phim
- `create(data)` - Tạo phim mới
- `update(id, data)` - Cập nhật phim
- `delete(id)` - Xóa phim

### userService
- `getAll(params)` - Lấy danh sách người dùng
- `getById(id)` - Lấy chi tiết người dùng
- `create(data)` - Tạo người dùng mới
- `update(id, data)` - Cập nhật người dùng
- `delete(id)` - Xóa người dùng

### productService
- `getAll(params)` - Lấy danh sách sản phẩm
- `getById(id)` - Lấy chi tiết sản phẩm
- `create(data)` - Tạo sản phẩm mới
- `update(id, data)` - Cập nhật sản phẩm
- `delete(id)` - Xóa sản phẩm

## Cập nhật trang admin để sử dụng backend API

Thay đổi trong file `app/admin/movies/page.tsx`:

```typescript
// Thay vì:
const response = await fetch(`/api/movies?${params}`);

// Sử dụng:
import { movieService } from '@/lib/services/movieService';

const data = await movieService.getAll({
  page: 0,
  size: 100,
  search: searchTerm,
  status: statusFilter,
});
```

## Yêu cầu Backend API

Backend API của bạn cần có các endpoints sau:

### Movies
- `GET /api/movies` - Lấy danh sách (hỗ trợ pagination, search, filter)
- `GET /api/movies/{id}` - Lấy chi tiết
- `POST /api/movies` - Tạo mới
- `PUT /api/movies/{id}` - Cập nhật
- `DELETE /api/movies/{id}` - Xóa

### Users/Accounts
- `GET /api/accounts`
- `GET /api/accounts/{id}`
- `POST /api/accounts`
- `PUT /api/accounts/{id}`
- `DELETE /api/accounts/{id}`

### Products
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### Cinemas, News, Tickets, Provinces, Rooms, Slots
Tương tự như trên.

## Response Format

Backend API nên trả về format:

```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0
}
```

## CORS Configuration

Backend cần enable CORS để frontend có thể gọi API:

```java
// Spring Boot example
@CrossOrigin(origins = "http://localhost:3000")
```

## Troubleshooting

### Lỗi CORS
- Kiểm tra backend đã enable CORS chưa
- Kiểm tra URL trong `.env.local` đúng chưa

### Lỗi 404
- Kiểm tra endpoint trong `lib/api-config.ts`
- Kiểm tra backend API đang chạy

### Timeout
- Tăng timeout trong `lib/api-config.ts` (mặc định 30s)
