import { apiClient } from './client';
import type { RawAdminUserDTO, AdminUser } from './auth';
import { mapRawUserToAdminUser } from './auth';

export interface CreateAdminUserDTO {
  name: string;
  email: string;
  role: 'STAFF' | 'SUPER_ADMIN';
  password?: string; // option for initialization
}

export interface UpdateAdminUserDTO {
  name?: string;
  email?: string;
  role?: 'STAFF' | 'SUPER_ADMIN';
  active?: boolean;
}

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get<RawAdminUserDTO[]>('/admin/users');
  return response.data.map(mapRawUserToAdminUser);
};

export const createAdminUser = async (data: CreateAdminUserDTO): Promise<AdminUser> => {
  const response = await apiClient.post<RawAdminUserDTO>('/admin/users', data);
  return mapRawUserToAdminUser(response.data);
};

export const updateAdminUser = async (id: string, data: UpdateAdminUserDTO): Promise<AdminUser> => {
  const response = await apiClient.put<RawAdminUserDTO>(`/admin/users/${id}`, data);
  return mapRawUserToAdminUser(response.data);
};

export const toggleAdminUserActive = async (id: string, active: boolean): Promise<AdminUser> => {
  const response = await apiClient.patch<RawAdminUserDTO>(`/admin/users/${id}/status`, { active });
  return mapRawUserToAdminUser(response.data);
};
