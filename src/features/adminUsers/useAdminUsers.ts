import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserActive,
} from '../../api/adminUsers';
import type { CreateAdminUserDTO, UpdateAdminUserDTO } from '../../api/adminUsers';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminUsers,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminUserDTO) => createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserDTO }) => updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useToggleAdminUserActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleAdminUserActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};
