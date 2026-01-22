// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  meta?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta?: {
    pagination: PaginationMeta;
  };
}

// Transfer Types
export interface Transfer {
  id: string;
  player_id: string;
  from_club_id: string;
  to_club_id: string;
  transfer_date: string;
  transfer_type: 'Loan' | 'Permanent' | 'Free Transfer' | 'N/A';
  transfer_value_usd?: number;
  fee_usd?: number;
  status: 'confirmed' | 'rumours';
  window: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  from_club?: Club;
  to_club?: Club;
  player?: Player;
}

export interface Club {
  id: string;
  name: string;
  logo_url?: string;
  league_id: string;
  founded_year?: number;
  stadium?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  height?: number;
  weight?: number;
  created_at: string;
  updated_at: string;
}

// Summary Types
export interface SummaryData {
  todayCount: number;
  windowTotal: number;
  totalSpend: number;
  mostActiveTeam: {
    id: string;
    name: string;
    logoUrl?: string;
    transferCount: number;
  };
  averageDailyTransfers: number;
  recordHigh: boolean;
  windowContext: 'MID-SEASON' | 'SUMMER' | 'WINTER';
}

// Query Parameter Types
export interface TransfersQueryParams {
  page?: number;
  limit?: number;
  leagues?: string[];
  positions?: string[];
  transferTypes?: string[];
  minValue?: number;
  maxValue?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  status?: 'all' | 'confirmed' | 'rumours';
  sortBy?: 'transfer_date' | 'transfer_value' | 'player_full_name';
  sortOrder?: 'asc' | 'desc';
}

export interface SummaryQueryParams {
  window?: string;
}

export interface TopTransfersQueryParams {
  window?: string;
  limit?: number;
}

// Error Types
export interface APIError {
  status: number;
  message: string;
  details?: any;
}

// Rate Limit Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

// Request Log Types
export interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration: string;
  userAgent?: string;
  ip?: string;
  error?: string;
}
