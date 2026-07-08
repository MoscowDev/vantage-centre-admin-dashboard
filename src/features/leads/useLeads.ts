import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeads,
  fetchLeadById,
  updateLeadStatus,
  addLeadNote,
} from '../../api/leads';
import type { LeadsFilterParams, LeadStatus, Lead } from '../../api/leads';

export const useLeads = (params: LeadsFilterParams) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
    placeholderData: (previousData) => previousData, // keep old data visible while loading next page
  });
};

export const useLeadDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id!),
    enabled: !!id,
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateLeadStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['lead', id] });
      await queryClient.cancelQueries({ queryKey: ['leads'] });

      // Snapshot previous detail
      const previousLead = queryClient.getQueryData<Lead>(['lead', id]);

      // Optimistically update details
      if (previousLead) {
        queryClient.setQueryData<Lead>(['lead', id], {
          ...previousLead,
          status,
        });
      }

      // Optimistically update matches in leads lists
      const queryCache = queryClient.getQueryCache();
      const leadsQueries = queryCache.findAll({ queryKey: ['leads'] });
      const previousLists: Array<[any, any]> = [];

      leadsQueries.forEach((query) => {
        const queryKey = query.queryKey;
        const previousData = queryClient.getQueryData<any>(queryKey);
        if (previousData && previousData.data) {
          previousLists.push([queryKey, previousData]);
          queryClient.setQueryData<any>(queryKey, {
            ...previousData,
            data: previousData.data.map((l: any) =>
              l.id === id ? { ...l, status } : l
            ),
          });
        }
      });

      return { previousLead, previousLists };
    },
    onError: (_err, variables, context) => {
      // Rollback optimistic details
      if (context?.previousLead) {
        queryClient.setQueryData(['lead', variables.id], context.previousLead);
      }
      // Rollback optimistic lists
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      // Reconcile with actual database response
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
};

export const useAddLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => addLeadNote(id, content),
    onSuccess: (_, variables) => {
      // Refresh lead details to pull in the new note
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
};
