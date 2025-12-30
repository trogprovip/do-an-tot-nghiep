# Hướng dẫn kết nối Next.js Frontend với Spring Boot Backend

## 🔧 Cấu hình đã hoàn thành

### ✅ Đã sửa các lỗi:
1. ✅ Sửa lỗi chính tả `anty` → `any` trong `app/api/products/route.ts`
2. ✅ Sửa lỗi URL API `mmovies` → `movies` trong `lib/services/springMovieService.ts`
3. ✅ Sửa lỗi TypeScript index signature trong `UserQueryParams` và `ProductQueryParams`
4. ✅ Thêm params vào các service methods

## 🚀 Cách kết nối với Spring Boot API

### Bước 1: Đảm bảo Spring Boot API đang chạy

Kiểm tra Spring Boot API của bạn đang chạy tại:
```
http://localhost:8080
```

### Bước 2: Kiểm tra endpoint trong Spring Boot Controller

Trong file `MovieController.java` của bạn:
```java
@RestController
@RequestMapping("api/v1/movies")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MovieController {
    // ... các method
}
```

### Bước 3: Cấu hình URL trong Frontend

File `lib/services/springMovieService.ts` đã được cấu hình:
```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

### Bước 4: Xử lý xác thực (nếu cần)

Nếu Spring Boot API yêu cầu xác thực, bỏ comment dòng này trong `springMovieService.ts`:
```typescript
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Basic ' + btoa('username:password') // Bỏ comment và thay username:password
};
```

### Bước 5: Kiểm tra CORS

Đảm bảo Spring Boot đã cấu hình CORS cho phép frontend kết nối:
```java
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
```

Hoặc cấu hình global CORS:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

## 🧪 Test kết nối

### Test bằng PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/movies" -Method GET
```

### Test bằng browser:
Mở trình duyệt và truy cập:
```
http://localhost:3000/admin/movies
```

## 📝 Các trang admin đã tạo

1. **Danh sách phim**: `/admin/movies`
2. **Thêm phim mới**: `/admin/movies/create`
3. **Sửa phim**: `/admin/movies/edit/[id]`

## 🔍 Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra xác thực trong Spring Boot
- Thêm thông tin đăng nhập vào `AUTH_HEADERS`

### Lỗi CORS
- Kiểm tra cấu hình `@CrossOrigin` trong Controller
- Thêm global CORS configuration

### Lỗi Connection Refused
- Đảm bảo Spring Boot đang chạy
- Kiểm tra port 8080 không bị chiếm dụng

### Lỗi 404 Not Found
- Kiểm tra URL endpoint trong Controller
- Đảm bảo `@RequestMapping` đúng với URL trong frontend

## 📊 Cấu trúc API Endpoints

```
GET    /api/v1/movies              - Lấy danh sách phim
GET    /api/v1/movies/{id}         - Lấy chi tiết phim
GET    /api/v1/movies/{id}/dates   - Lấy ngày chiếu
POST   /api/v1/movies              - Tạo phim mới
PUT    /api/v1/movies/{id}         - Cập nhật phim
DELETE /api/v1/movies/{id}         - Xóa phim
```

## ✨ Tính năng đã hoàn thành

- ✅ Kết nối với Spring Boot API
- ✅ CRUD operations cho Movies
- ✅ Form thêm/sửa phim
- ✅ Xóa phim với xác nhận
- ✅ Tìm kiếm và lọc phim
- ✅ Hiển thị danh sách với pagination

## 🎯 Bước tiếp theo

1. Khởi động Spring Boot API
2. Khởi động Next.js frontend: `npm run dev`
3. Truy cập: `http://localhost:3000/admin/movies`
4. Test các chức năng thêm/sửa/xóa phim

---

**Lưu ý**: Đảm bảo cả Spring Boot API và Next.js frontend đều đang chạy để hệ thống hoạt động đúng.
