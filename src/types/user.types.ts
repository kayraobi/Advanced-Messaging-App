export interface User {
  _id: string;
  username: string;
  email: string;
  type: string; // "GM" or other roles — will expand once confirmed with Ibrahim
  name?: string;
  phone?: string;
  interests?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  token: string;
  user?: Partial<User>;
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

// Payload structure inside JWT
export interface JwtPayload {
  user: User;
  iat: number;
  exp: number;
}