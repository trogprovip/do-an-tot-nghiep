import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 async redirects() {
    return [
      {
        source: '/',        // Nguồn: Trang chủ
        destination: '/cgv', // Đích: Trang bạn muốn đến (ví dụ /cgv hoặc /movies)
        permanent: true,     // Lưu lại cache (true = 308, false = 307)
      },
    ];
  },
  reactCompiler: true,
};

export default nextConfig;
