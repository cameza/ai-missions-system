# API Documentation - Data Analyst Mission

## Overview

This document describes the REST API endpoints for the Football Transfer Data Analyst application. The API provides access to transfer data, dashboard statistics, and top transfer information with proper caching, rate limiting, and error handling.

## Base URL

```
/api
```

For local development:
```
http://localhost:3000/api
```

## Authentication

Currently, the API uses service role authentication for Supabase access. In production, proper authentication should be implemented.

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per IP
- **Heavy endpoints**: 20 requests per minute per IP
- Rate limit headers are included in all responses:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Time when rate limit resets

## Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 1500,
      "hasMore": true
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Invalid query parameters",
    "details": [...]
  }
}
```

## Endpoints

### 1. GET /api/transfers

Returns paginated transfer data with comprehensive filtering support.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 100, max: 250) - Results per page
- `leagues` (string[]) - Filter by league IDs
- `positions` (string[]) - Filter by player positions
- `transferTypes` (string[]) - Filter by transfer types ('Loan', 'Permanent', 'Free Transfer', 'N/A')
- `minValue` (number) - Minimum transfer value in USD cents
- `maxValue` (number) - Maximum transfer value in USD cents
- `startDate` (string) - ISO date string for start date filter
- `endDate` (string) - ISO date string for end date filter
- `search` (string) - Player name search (max 100 characters)
- `status` (string, default: 'all') - Filter by status ('all', 'confirmed', 'rumours')
- `sortBy` (string, default: 'transfer_date') - Sort field ('transfer_date', 'transfer_value', 'player_name')
- `sortOrder` (string, default: 'desc') - Sort order ('asc', 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transfer-123",
      "player_id": "player-456",
      "from_club_id": "club-789",
      "to_club_id": "club-101",
      "transfer_date": "2024-01-15",
      "transfer_type": "Permanent",
      "transfer_value_usd": 50000000,
      "status": "confirmed",
      "window": "WINTER",
      "from_club": {
        "id": "club-789",
        "name": "Manchester United",
        "logo_url": "https://example.com/logo.png",
        "league_id": "league-1"
      },
      "to_club": {
        "id": "club-101",
        "name": "Real Madrid",
        "logo_url": "https://example.com/logo2.png",
        "league_id": "league-2"
      },
      "player": {
        "id": "player-456",
        "name": "Jude Bellingham",
        "position": "Midfielder",
        "age": 20,
        "nationality": "England"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 1500,
      "hasMore": true
    }
  }
}
```

**Caching:** 5 minutes fresh, 10 minutes stale

---

### 2. GET /api/summary

Returns dashboard summary statistics and KPIs.

**Query Parameters:**
- `window` (string, optional) - Filter by specific window (e.g., 'WINTER', 'SUMMER')

**Response:**
```json
{
  "success": true,
  "data": {
    "todayCount": 15,
    "windowTotal": 342,
    "totalSpend": 1250000000,
    "mostActiveTeam": {
      "id": "club-123",
      "name": "Chelsea",
      "logoUrl": "https://example.com/chelsea.png",
      "transferCount": 12
    },
    "averageDailyTransfers": 8.5,
    "recordHigh": false,
    "windowContext": "WINTER"
  }
}
```

**Caching:** 15 minutes fresh, 30 minutes stale

---

### 3. GET /api/top-transfers

Returns top transfers by value.

**Query Parameters:**
- `window` (string, optional) - Filter by specific window
- `limit` (number, default: 5, max: 10) - Number of results to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transfer-789",
      "player_id": "player-101",
      "from_club_id": "club-202",
      "to_club_id": "club-303",
      "transfer_date": "2024-01-10",
      "transfer_type": "Permanent",
      "transfer_value_usd": 180000000,
      "status": "confirmed",
      "window": "WINTER",
      "from_club": {
        "id": "club-202",
        "name": "Paris Saint-Germain",
        "logo_url": "https://example.com/psg.png"
      },
      "to_club": {
        "id": "club-303",
        "name": "Real Madrid",
        "logo_url": "https://example.com/rm.png"
      },
      "player": {
        "id": "player-101",
        "name": "Kylian Mbappé",
        "position": "Forward",
        "age": 25,
        "nationality": "France"
      }
    }
  ]
}
```

**Caching:** 10 minutes fresh, 15 minutes stale

---

## Error Handling

The API returns appropriate HTTP status codes and error messages:

| Status Code | Description | Example |
|-------------|-------------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid query parameters |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Invalid query parameters",
    "details": [
      {
        "path": ["limit"],
        "message": "Limit must be between 1 and 250"
      }
    ]
  }
}
```

## HTTP Headers

### Cache Headers
All endpoints include appropriate cache headers:
- `Cache-Control`: `s-maxage=X, stale-while-revalidate=Y`

### CORS Headers
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Performance Considerations

1. **Database Indexes**: Ensure proper indexes on frequently queried columns
2. **Query Optimization**: Use specific field selection instead of `SELECT *`
3. **Caching**: Respect cache headers to reduce server load
4. **Rate Limiting**: Implement exponential backoff on client side

## Testing

### Example Requests

```bash
# Get transfers with pagination
curl "https://your-domain.com/api/transfers?page=1&limit=50"

# Filter by leagues and position
curl "https://your-domain.com/api/transfers?leagues=league1,league2&positions=Midfielder,Forward"

# Search for players
curl "https://your-domain.com/api/transfers?search=Bellingham"

# Get summary statistics
curl "https://your-domain.com/api/summary"

# Get top 10 transfers
curl "https://your-domain.com/api/top-transfers?limit=10"
```

## SDK Examples

### JavaScript/TypeScript
```typescript
interface TransferResponse {
  success: boolean;
  data: Transfer[];
  meta?: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

async function getTransfers(params: TransfersQueryParams = {}): Promise<TransferResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      searchParams.set(key, value.join(','));
    } else if (value !== undefined) {
      searchParams.set(key, value.toString());
    }
  });
  
  const response = await fetch(`/api/transfers?${searchParams}`);
  return response.json();
}

// Usage
const transfers = await getTransfers({
  page: 1,
  limit: 50,
  leagues: ['premier-league', 'la-liga'],
  sortBy: 'transfer_value',
  sortOrder: 'desc'
});
```

## Monitoring

The API includes request logging for monitoring and debugging:

```typescript
// Log format
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "GET",
  "url": "/api/transfers?page=1&limit=50",
  "status": 200,
  "duration": "150ms",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## Future Enhancements

1. **Authentication**: Implement JWT-based authentication
2. **GraphQL**: Consider GraphQL for complex queries
3. **WebSocket**: Real-time updates for live transfer data
4. **API Versioning**: Implement versioning strategy
5. **OpenAPI/Swagger**: Generate interactive API documentation
