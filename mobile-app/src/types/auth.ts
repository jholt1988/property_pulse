export type UserRole = 'TENANT' | 'PROPERTY_MANAGER' | 'OWNER' | 'ADMIN';

export interface LoginResponse {
  token?: string;
  access_token?: string;
  user?: {
    id?: string;
    username?: string;
    role?: UserRole | 'PM';
  };
}
