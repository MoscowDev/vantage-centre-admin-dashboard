import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContentBlocks, updateContentBlock } from '../../api/content';

export const useContentBlocks = (page?: string) => {
  return useQuery({
    queryKey: ['contentBlocks', page],
    queryFn: () => fetchContentBlocks(page),
  });
};

export const useUpdateContentBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, contentData }: { id: string; contentData: Record<string, any> }) =>
      updateContentBlock(id, contentData),
    onSuccess: (updatedBlock) => {
      // Invalidate both broad list query and page-filtered list query
      queryClient.invalidateQueries({ queryKey: ['contentBlocks'] });
      queryClient.invalidateQueries({ queryKey: ['contentBlocks', updatedBlock.page] });
    },
  });
};
