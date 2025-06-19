import { useQuery, useMutation, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { getPets, addToFavorites, removeFromFavorites, getUserFavorites } from '../lib/database';

export const usePets = (filters: { category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['pets', filters],
    queryFn: async () => {
      const data = await getPets(filters);
      return data;
    },
  });
};

export const userFavoritesHook = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['userFavorites'],
    queryFn: async () => {
      const favorites = await getUserFavorites();
      return favorites.map((fav: any) => fav.item_id);
    },
    ...(options || {})
  });
};

export const addToFavoritesHook = (options?: Partial<UseMutationOptions<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>>) => {
  const queryClient = useQueryClient();
  return useMutation<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>({
    mutationFn: async ({ itemId, itemType }) => {
      await addToFavorites(itemId, itemType);
      return { itemId, itemType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    ...(options || {})
  });
};

export const removeFromFavoritesHook = (options?: Partial<UseMutationOptions<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>>) => {
  const queryClient = useQueryClient();
  return useMutation<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>({
    mutationFn: async ({ itemId, itemType }) => {
      await removeFromFavorites(itemId, itemType);
      return { itemId, itemType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    ...(options || {})
  });
}; 