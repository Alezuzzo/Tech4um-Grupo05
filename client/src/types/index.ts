export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}