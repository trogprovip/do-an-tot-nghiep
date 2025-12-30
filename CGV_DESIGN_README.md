# Giao diện CGV Cinema - Ant Design + TailwindCSS

## 🎬 Tổng quan

Đã tạo thành công giao diện trang chủ CGV Cinema với thiết kế giống hình ảnh bạn cung cấp, sử dụng:
- **Ant Design (antd)** - UI Component Library
- **TailwindCSS** - Utility-first CSS Framework
- **Next.js 16** - React Framework

## 📁 Cấu trúc Components

```
components/cgv/
├── CGVHeader.tsx       - Header với menu navigation và quick links
├── HeroBanner.tsx      - Hero banner với carousel
├── MovieSelection.tsx  - Danh sách phim đang chiếu
├── EventSection.tsx    - Sự kiện và ưu đãi
└── CGVFooter.tsx       - Footer với thông tin công ty

app/cgv/
└── page.tsx            - Trang chủ CGV chính
```

## 🎨 Các Component đã tạo

### 1. **CGVHeader** (`components/cgv/CGVHeader.tsx`)
- Top bar với đăng nhập/đăng ký và chuyển đổi ngôn ngữ
- Menu navigation chính: PHIM, RẠP CGV, THÀNH VIÊN, CULTUREPLEX
- Nút "MUA VÉ NGAY" nổi bật
- Quick links bar với các icon và mô tả

### 2. **HeroBanner** (`components/cgv/HeroBanner.tsx`)
- Carousel tự động chuyển slide
- Nút Previous/Next để điều khiển
- Background gạch tường (brick wall effect)
- Dots indicator cho các slide
- Thông tin khuyến mãi

### 3. **MovieSelection** (`components/cgv/MovieSelection.tsx`)
- Grid layout responsive (1-4 cột)
- Movie cards với:
  - Rating badge (P, 13+, 18+)
  - Ngày khởi chiếu
  - Nút "XEM CHI TIẾT" và "MUA VÉ"
- Hover effects và animations
- Nút "XEM TẤT CẢ PHIM"

### 4. **EventSection** (`components/cgv/EventSection.tsx`)
- Tabs: "Thành Viên CGV" và "Tin Mới & Ưu Đãi"
- Carousel cho events (4 items mỗi lần)
- Grid layout cho special offers (3 cột)
- Previous/Next buttons
- Hover effects

### 5. **CGVFooter** (`components/cgv/CGVFooter.tsx`)
- Cinema brands banner (IMAX, STARIUM, GOLDCLASS, etc.)
- 4 cột thông tin:
  - CGV Việt Nam
  - Điều khoản sử dụng
  - Kết nối với chúng tôi (Social media)
  - Chăm sóc khách hàng
- Thông tin công ty
- Brick wall bottom decoration

## 🚀 Cách sử dụng

### Truy cập trang CGV:
```
http://localhost:3000/cgv
```

### Import components:
```typescript
import CGVHeader from '@/components/cgv/CGVHeader';
import HeroBanner from '@/components/cgv/HeroBanner';
import MovieSelection from '@/components/cgv/MovieSelection';
import EventSection from '@/components/cgv/EventSection';
import CGVFooter from '@/components/cgv/CGVFooter';
```

### Sử dụng trong page:
```typescript
export default function CGVHomePage() {
  return (
    <ConfigProvider locale={viVN}>
      <div className="min-h-screen bg-white">
        <CGVHeader />
        <main>
          <HeroBanner />
          <MovieSelection />
          <EventSection />
        </main>
        <CGVFooter />
      </div>
    </ConfigProvider>
  );
}
```

## 🎨 Màu sắc chính

- **Primary Red**: `#DC2626` (red-600)
- **Secondary Red**: `#EF4444` (red-500)
- **Yellow Accent**: `#FBBF24` (yellow-400)
- **Gray Background**: `#F9FAFB` (gray-50)
- **Text Dark**: `#1F2937` (gray-800)

## 📦 Dependencies đã cài đặt

```json
{
  "antd": "^5.x.x"
}
```

## ✨ Tính năng nổi bật

### 1. **Responsive Design**
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Grid layout tự động điều chỉnh

### 2. **Ant Design Components**
- `Carousel` - Hero banner và events
- `Card` - Movie và event cards
- `Menu` - Navigation menu
- `Badge` - Movie ratings
- `ConfigProvider` - Localization (Tiếng Việt)

### 3. **TailwindCSS Utilities**
- Gradient backgrounds
- Hover effects
- Transition animations
- Shadow effects
- Responsive utilities

### 4. **Animations & Effects**
- Smooth carousel transitions
- Hover scale effects
- Button hover states
- Card shadow on hover
- Brick wall background pattern

## 🎯 Các trang cần tạo thêm (Optional)

Để hoàn thiện hệ thống, bạn có thể tạo thêm các trang:

1. **Movies Page** (`/movies`) - Danh sách tất cả phim
2. **Movie Detail** (`/movies/[id]`) - Chi tiết phim
3. **Cinemas Page** (`/cinemas`) - Danh sách rạp
4. **Booking Page** (`/booking`) - Đặt vé
5. **Member Page** (`/member`) - Thông tin thành viên
6. **Events Page** (`/events`) - Danh sách sự kiện
7. **Login/Register** (`/login`, `/register`) - Đăng nhập/Đăng ký

## 🔧 Tùy chỉnh

### Thay đổi màu sắc:
Sửa trong file component, ví dụ:
```typescript
className="bg-red-600" // Đổi thành bg-blue-600
```

### Thêm/Sửa movies:
Trong `MovieSelection.tsx`, sửa array `movies`:
```typescript
const movies = [
  {
    id: 1,
    title: 'Tên phim',
    rating: '13+',
    image: '/movies/poster.jpg',
    releaseDate: '01.01.2024',
  },
  // ...
];
```

### Thêm/Sửa events:
Trong `EventSection.tsx`, sửa array `events`:
```typescript
const events = [
  {
    id: 1,
    title: 'Tên sự kiện',
    image: '/events/banner.jpg',
    category: 'promotion',
  },
  // ...
];
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (1 cột)
- **Tablet**: 640px - 1024px (2-3 cột)
- **Desktop**: > 1024px (4 cột)

## 🎬 Demo Features

- ✅ Header với navigation menu
- ✅ Hero banner carousel tự động
- ✅ Movie selection grid responsive
- ✅ Event carousel với controls
- ✅ Footer đầy đủ thông tin
- ✅ Hover effects và animations
- ✅ Mobile responsive
- ✅ Ant Design integration
- ✅ TailwindCSS utilities

## 🚀 Chạy dự án

```bash
npm run dev
```

Truy cập: `http://localhost:3000/cgv`

---

**Lưu ý**: Các hình ảnh trong component hiện đang sử dụng placeholder paths. Bạn cần thêm hình ảnh thực tế vào thư mục `public/` để hiển thị đầy đủ.

Cấu trúc thư mục hình ảnh đề xuất:
```
public/
├── banners/
│   ├── member-day.jpg
│   ├── promotion-2.jpg
│   └── promotion-3.jpg
├── movies/
│   ├── avatar.jpg
│   ├── phu-vu.jpg
│   ├── spongebob.jpg
│   └── nha-hai-chu.jpg
├── events/
│   └── ...
└── offers/
    └── ...
```
