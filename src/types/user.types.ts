// Swagger'daki gerçek User şeması
export interface User {
  username: string;
  email: string;
}

// POST /api/users/login → request body
export interface LoginRequest {
  email: string;
  password: string;
}

// Auth netleşince burası güncellenecek
export interface LoginResponse {
  username: string;
  email: string;
  // token: string  ← cookie mi body mi geldiği belli değil
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
