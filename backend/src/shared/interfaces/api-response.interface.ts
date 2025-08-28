export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  metadata?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

export interface BusinessRuleViolation {
  code: string;
  message: string;
  details?: any;
}
