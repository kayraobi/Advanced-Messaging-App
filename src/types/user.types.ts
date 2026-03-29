export interface User {
  _id: string;
  username: string;
  email: string;
  type: string; // "GM" veya başka roller — Ibrahim'den öğrenince genişletiriz
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Response sadece token döndürüyor
export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// JWT içindeki payload yapısı
export interface JwtPayload {
  user: User;
  iat: number;
  exp: number;
}