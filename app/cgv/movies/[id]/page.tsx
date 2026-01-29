/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { movieService, Movie } from "@/lib/services/movieService";
import CGVHeader from "@/components/cgv/CGVHeader";
import CGVFooter from "@/components/cgv/CGVFooter";
import BackButton from "@/components/ui/BackButton";
import ImageHoverZoom from "@/components/ui/ImageHoverZoom";
import MovieReviewSection from "@/components/MovieReviewSection";
import { authService, User } from "@/lib/services/authService";
import {
  PlayCircleFilled,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { Spin } from "antd";
import Link from "next/link";

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params?.id as string;
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  useEffect(() => {
    if (currentUser && movieId) {
      fetchFavoriteStatus();
    }
  }, [currentUser, movieId]);

  // Listen for favorites updates from other pages
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      if (currentUser && movieId) {
        fetchFavoriteStatus();
      }
    };

    window.addEventListener("favorites_updated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("favorites_updated", handleFavoritesUpdate);
    };
  }, [currentUser, movieId]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const data = await movieService.getMovie(parseInt(movieId));
      setMovie(data);

      // Fetch favorite status and count
      if (currentUser) {
        await fetchFavoriteStatus();
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      // Check if user has favorited this movie
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const favoriteIds = new Set(
            result.data.map((movie: { id: number }) => movie.id),
          );
          setIsFavorited(favoriteIds.has(parseInt(movieId)));
        }
      }

      // Get favorite count for this movie
      const countResponse = await fetch(`/api/favorites?movieId=${movieId}`);
      if (countResponse.ok) {
        const countResult = await countResponse.json();
        if (countResult.success) {
          setFavoriteCount(countResult.count);
        }
      }
    } catch (error) {
      console.error("Error fetching favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      // Redirect to login page instead of showing alert
      window.location.href = "/auth/login";
      return;
    }

    try {
      const isCurrentlyFavorited = isFavorited;

      if (isCurrentlyFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?movieId=${movieId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsFavorited(false);
          setFavoriteCount((prev) => Math.max(0, prev - 1));

          // Notify other pages about favorite change
          localStorage.setItem("favorites_updated", Date.now().toString());
          window.dispatchEvent(new Event("favorites_updated"));
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId: parseInt(movieId) }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setIsFavorited(true);
            setFavoriteCount((prev) => prev + 1);

            // Notify other pages about favorite change
            localStorage.setItem("favorites_updated", Date.now().toString());
            window.dispatchEvent(new Event("favorites_updated"));
          }
        } else if (response.status === 400) {
          // Movie already in favorites, update UI
          setIsFavorited(true);

          // Notify other pages about favorite change
          localStorage.setItem("favorites_updated", Date.now().toString());
          window.dispatchEvent(new Event("favorites_updated"));
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <>
        <CGVHeader />
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600 font-bold">
              Đang tải thông tin phim...
            </p>
          </div>
        </div>
        <CGVFooter />
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <CGVHeader />
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy phim
          </h1>
          <div className="container mx-auto px-4 py-8">
            <BackButton
              onClick={() => window.history.back()}
              text="Quay lại danh sách phim"
            />
          </div>
          <CGVFooter />
        </div>
      </>
    );
  }

  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailer_url);

  return (
    <>
      <CGVHeader />

      <div className="min-h-screen bg-white">
        {/* Page Title */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Nội Dung Phim</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Poster - Left Column */}
              <div className="lg:col-span-3">
                {movie.poster_url ? (
                  <div className="aspect-2/3">
                    <ImageHoverZoom
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full rounded-lg shadow-lg"
                      zoomLevel={2.5}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-2/3 bg-gray-200 flex items-center justify-center rounded-lg">
                    <PlayCircleFilled className="text-6xl text-gray-400" />
                  </div>
                )}
              </div>

              {/* Movie Info - Right Column */}
              <div className="lg:col-span-9">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
                  {movie.title}
                </h1>

                {/* Movie Details */}
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">
                      Đạo diễn:
                    </span>
                    <span className="text-gray-600">
                      {movie.director || "Đang cập nhật"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">
                      Diễn viên:
                    </span>
                    <span className="text-gray-600">
                      {movie.cast || "Đang cập nhật"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">
                      Thể loại:
                    </span>
                    <span className="text-gray-600">
                      {movie.genre || "Đang cập nhật"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">
                      Thời lượng:
                    </span>
                    <span className="text-gray-600">{movie.duration} phút</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">
                      Ngôn ngữ:
                    </span>
                    <span className="text-gray-600">
                      {movie.language || "Tiếng Anh"} - Phụ đề Tiếng Việt
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">Rated:</span>
                    <span className="text-gray-600">
                      {movie.age_rating || "T13"} - PHIM ĐƯỢC PHỔ BIẾN ĐẾN NGƯỜI
                      XEM TỪ ĐỦ 13 TUỔI TRỞ LÊN (13+)
                    </span>
                  </div>
                </div>

                {/* Social & Buttons */}
                <div className="flex gap-3 mb-6">
                  <Link href={`/cgv/movies/${movie.id}/showtimes`}>
                    <button className="bg-red-600 text-white px-6 py-2 font-bold hover:bg-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-600/50">
                      <ShoppingCartOutlined />
                      MUA VÉ
                    </button>
                  </Link>

                  <button
                    onClick={toggleFavorite}
                    className={`px-6 py-2 font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-lg/50 ${
                      isFavorited
                        ? "bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-red-600/50"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-gray-600/50"
                    }`}
                  >
                    {isFavorited ? (
                      <HeartFilled className="text-lg" />
                    ) : (
                      <HeartOutlined className="text-lg" />
                    )}
                    {isFavorited ? "ĐÃ YÊU THÍCH" : "YÊU THÍCH"}
                  </button>

                  {trailerEmbedUrl && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-purple-600/50"
                    >
                      <PlayCircleFilled />
                      XEM TRAILER
                    </button>
                  )}
                </div>

                {/* Favorite Count */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm text-gray-600">
                    {favoriteCount} người đã yêu thích phim này
                  </span>
                </div>

                {/* Description */}
                {movie.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-700 leading-relaxed text-justify">
                      {movie.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="container mx-auto px-4 py-8">
          <MovieReviewSection
            movieId={parseInt(movieId)}
            userId={currentUser?.id}
          />
        </div>
      </div>

      <CGVFooter />

      {/* Trailer Modal */}
      {showTrailer && trailerEmbedUrl && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 -right-2 flex items-center gap-2 
             text-gray-300 hover:text-white transition-colors 
             font-medium uppercase tracking-tighter group"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-500 group-hover:border-red-500 transition-colors">
                <span className="text-sm">✕</span>
              </div>
              <span className="text-xs">Đóng Trailer</span>
            </button>
            <iframe
              src={`${trailerEmbedUrl}?autoplay=1`}
              className="w-full h-full rounded-2xl shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <CGVFooter />
    </>
  );
}
