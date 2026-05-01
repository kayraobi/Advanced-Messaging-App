export interface User {
  _id: string;
  username: string;
  email: string;
  type: string; // "GM" veya başka roller — Ibrahim'den öğrenince genişletiriz
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

// JWT içindeki payload yapısı
export interface JwtPayload {
  user: User;
  iat: number;
  exp: number;
}