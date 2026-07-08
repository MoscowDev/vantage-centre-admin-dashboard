import { apiClient } from './client';

export type UserRole = 'STAFF' | 'SUPER_ADMIN';

export interface RawAdminUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface LoginResponseDTO {
  token: string;
  user: RawAdminUserDTO;
}

export interface AuthSession {
  token: string;
  user: AdminUser;
}

// Mapper to decouple UI from API DTO shapes
export const mapRawUserToAdminUser = (raw: RawAdminUserDTO): AdminUser => ({
  id: raw.id,
  name: raw.name,
  email: raw.email,
  role: (raw.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF') as UserRole,
  isActive: raw.active,
});

export const loginAdmin = async (password: string, email: string): Promise<AuthSession> => {
  const response = await apiClient.post<LoginResponseDTO>('/admin/auth/login', {
    email,
    password,
  });

  return {
    token: response.data.token,
    user: mapRawUserToAdminUser(response.data.user),
  };
};
