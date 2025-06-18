import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPets, addToFavorites, removeFromFavorites, getUserFavorites } from '../lib/database';

// Hook para buscar pets com filtros
export const usePets = (filters: { category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['pets', filters],
    queryFn: async () => {
      const data = await getPets(filters);
      return data;
    },
  });
};

// Hook para buscar favoritos do usuário
export const useUserFavorites = () => {
  return useQuery({
    queryKey: ['userFavorites'],
    queryFn: async () => {
      const favorites = await getUserFavorites();
      return favorites.map((fav: any) => fav.item_id);
    },
  });
};

// Hook para adicionar aos favoritos
export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: string }) => {
      await addToFavorites(itemId, itemType);
      return { itemId, itemType };
    },
    onSuccess: () => {
      // Invalida e refetch dos favoritos
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
  });
};

// Hook para remover dos favoritos
export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: string }) => {
      await removeFromFavorites(itemId, itemType);
      return { itemId, itemType };
    },
    onSuccess: () => {
      // Invalida e refetch dos favoritos
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
  });
}; 