export interface LoginRequest {
  email: string;
  password: string;
}
export interface User {
  id: number;
  email?: string;
  username?: string;
  password?: string;
  Firstname?: string;
  Lastname?: string;
  mobile?: string;
  Role?: string;
  isActive?: boolean;
  timeSpend?: string | null;
  verified?: boolean | null;
}
export interface LoginResponse {
  isLoggedIn: boolean;
  message: string;
  user_id?: string | number;
  user?: User;
  token?: string;
}
export interface UserRegistration {
  message: string;
  user_id: number;
  user: User;
}
export interface Settings {
  message?: string;
  user: User;
}
export interface RequestData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}
