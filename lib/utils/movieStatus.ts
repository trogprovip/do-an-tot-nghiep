/**
 * Utility functions for automatic movie status management
 */

export interface MovieStatusOptions {
  releaseDate: Date | string | null;
  currentStatus?: string;
}

/**
 * Automatically determines movie status based on release date
 * - If release date is in future: "coming_soon" (Sắp chiếu)
 * - If release date is today or in past: "now_showing" (Đang chiếu)
 * - If no release date: keeps current status or defaults to "coming_soon"
 */
export function getAutoMovieStatus(options: MovieStatusOptions): 'coming_soon' | 'now_showing' | 'ended' {
  const { releaseDate, currentStatus } = options;

  // If no release date, keep current status or default to coming_soon
  if (!releaseDate) {
    return (currentStatus as 'coming_soon' | 'now_showing' | 'ended') || 'coming_soon';
  }

  const release = new Date(releaseDate);
  const today = new Date();
  
  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  release.setHours(0, 0, 0, 0);

  // If release date is in the future -> coming_soon
  if (release > today) {
    return 'coming_soon';
  }
  
  // If release date is today or in the past -> now_showing
  return 'now_showing';
}

/**
 * Updates movie status automatically based on release date
 * This can be used in API endpoints or database operations
 */
export function updateMovieStatusAuto(movie: {
  release_date: Date | string | null;
  status?: string;
}): 'coming_soon' | 'now_showing' | 'ended' {
  return getAutoMovieStatus({
    releaseDate: movie.release_date,
    currentStatus: movie.status
  });
}
