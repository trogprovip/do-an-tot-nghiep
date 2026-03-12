# Movie Status Automation

This feature automatically manages movie statuses based on their release dates.

## How it works

- **Future release date**: Status = `coming_soon` (Sắp chiếu)
- **Today or past release date**: Status = `now_showing` (Đang chiếu)
- **No release date**: Status = `coming_soon` (default)

## Implementation

### 1. Core Logic (`lib/utils/movieStatus.ts`)

The `getAutoMovieStatus()` function determines the correct status based on release date:

```typescript
export function getAutoMovieStatus(options: MovieStatusOptions): 'coming_soon' | 'now_showing' | 'ended' {
  const { releaseDate, currentStatus } = options;
  
  if (!releaseDate) {
    return (currentStatus as 'coming_soon' | 'now_showing' | 'ended') || 'coming_soon';
  }

  const release = new Date(releaseDate);
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
  release.setHours(0, 0, 0, 0);

  if (release > today) {
    return 'coming_soon';
  }
  
  return 'now_showing';
}
```

### 2. API Endpoints

#### Movie Creation (`app/api/movies/route.ts`)
- Automatically sets status based on release date when creating new movies

#### Movie Updates (`app/api/movies/[id]/route.ts`)
- Automatically updates status when release date is changed
- Preserves manual status changes if release date is not modified

#### Bulk Status Update (`app/api/movies/update-statuses/route.ts`)
- **POST**: Updates all movie statuses based on current release dates
- **GET**: Provides statistics on movies that need status updates

### 3. Admin Interface

The admin movies page (`app/admin/movies/page.tsx`) includes:
- **"Cập nhật trạng thái tự động"** button for manual bulk updates
- Automatic status updates when loading movies (with `autoUpdate: true`)

## Usage

### Manual Bulk Update
```bash
# Update all movie statuses
curl -X POST http://localhost:3000/api/movies/update-statuses

# Get status update statistics
curl -X GET http://localhost:3000/api/movies/update-statuses
```

### Automatic Updates
- New movies automatically get correct status
- Movie updates automatically adjust status when release date changes
- Admin interface shows real-time correct statuses

## Benefits

1. **Consistency**: All movies have accurate status based on release dates
2. **Automation**: No manual status management required
3. **Flexibility**: Can still manually override status if needed
4. **Performance**: Efficient bulk updates for all movies

## Future Enhancements

- Scheduled automatic updates (daily cron job)
- Extended status logic (e.g., automatically set to `ended` after X days)
- Status change notifications
- Audit trail for status changes
