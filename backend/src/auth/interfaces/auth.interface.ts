export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
  };
  errors?: string[];
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  roles: string[];
}

export interface JwtPayload {
  sub: number;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
  errors?: string[];
}
