import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getUserFavorites, getPetById, getServiceById } from '../lib/database';

// Hook para buscar perfil do usuário
export const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
};

// Hook para buscar pets do usuário
export const useUserPets = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userPets', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const petsWithVaccines = await Promise.all(data.map(async (pet: any) => {
          const { data: petVaccines } = await supabase
            .from('pet_vaccines')
            .select('vaccine_id, vaccines(name)')
            .eq('pet_id', pet.id);
          type PetVaccineRow = { vaccines?: { name?: string } };
          const vaccinesArr = (petVaccines as PetVaccineRow[] | null) || [];
          return {
            ...pet,
            vaccines: vaccinesArr.map(v => v.vaccines?.name || '').filter(Boolean)
          };
        }));
        return petsWithVaccines;
      }

      return [];
    },
    enabled: !!userId,
  });
};

// Hook para buscar serviços do usuário
export const useUserServices = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userServices', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });
};

// Hook para buscar favoritos do usuário
export const useUserFavorites = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userFavorites', userId],
    queryFn: async () => {
      if (!userId) return { favorites: [], pets: [], services: [] };

      try {
        const favorites = await getUserFavorites();
        
        // Separar por tipo
        const petFavorites = favorites.filter((fav: any) => fav.item_type === 'pet');
        const serviceFavorites = favorites.filter((fav: any) => fav.item_type === 'service');
        
        // Buscar detalhes dos pets favoritos
        const pets = await Promise.all(petFavorites.map(async (fav: any) => {
          try {
            return await getPetById(fav.item_id);
          } catch {
            return null;
          }
        }));
        
        // Buscar detalhes dos serviços favoritos
        const services = await Promise.all(serviceFavorites.map(async (fav: any) => {
          try {
            return await getServiceById(fav.item_id);
          } catch {
            return null;
          }
        }));

        return {
          favorites,
          pets: pets.filter(Boolean),
          services: services.filter(Boolean)
        };
      } catch (err) {
        return { favorites: [], pets: [], services: [] };
      }
    },
    enabled: !!userId,
  });
};

// Hook para buscar vacinas disponíveis
export const useAvailableVaccines = () => {
  return useQuery({
    queryKey: ['availableVaccines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vaccines').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
  });
};

// Hook para atualizar perfil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, profileData }: { userId: string; profileData: any }) => {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return profileData;
    },
    onSuccess: (data, variables) => {
      // Invalida e refetch do perfil
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
    },
  });
};

// Hook para deletar pet
export const useDeletePet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (petId: string) => {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;
      return petId;
    },
    onSuccess: () => {
      // Invalida e refetch dos pets
      queryClient.invalidateQueries({ queryKey: ['userPets'] });
    },
  });
};

// Hook para deletar serviço
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      return serviceId;
    },
    onSuccess: () => {
      // Invalida e refetch dos serviços
      queryClient.invalidateQueries({ queryKey: ['userServices'] });
    },
  });
};

// Hook para adicionar pet
export const useAddPet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ petData, imageFile, selectedVaccines }: {
      petData: any;
      imageFile: File | null;
      selectedVaccines: string[];
    }) => {
      let imageUrl = '';
      
      if (imageFile) {
        const { v4: uuidv4 } = await import('uuid');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage.from('pets').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { data: petDataResult, error } = await supabase.from('pets').insert({
        ...petData,
        created_at: new Date().toISOString(),
        image_url: imageUrl,
      }).select().single();

      if (error || !petDataResult) {
        throw new Error('Erro ao adicionar pet!');
      }

      // Adicionar vacinas
      for (const vaccineId of selectedVaccines) {
        await supabase.from('pet_vaccines').insert({ 
          pet_id: petDataResult.id, 
          vaccine_id: vaccineId 
        });
      }

      return petDataResult;
    },
    onSuccess: () => {
      // Invalida e refetch dos pets
      queryClient.invalidateQueries({ queryKey: ['userPets'] });
    },
  });
};

// Hook para adicionar serviço
export const useAddService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ serviceData, imageFile }: {
      serviceData: any;
      imageFile: File | null;
    }) => {
      let imageUrl = '';
      
      if (imageFile) {
        const { v4: uuidv4 } = await import('uuid');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage.from('services').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('services').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase.from('services').insert({
        ...serviceData,
        image_url: imageUrl, // Será string vazia se não houver imagem
        created_at: new Date().toISOString(),
      }).select().single();

      if (error || !data) {
        throw new Error('Erro ao adicionar serviço!');
      }

      return data;
    },
    onSuccess: () => {
      // Invalida e refetch dos serviços
      queryClient.invalidateQueries({ queryKey: ['userServices'] });
    },
  });
};

// Hook para atualizar foto de perfil
export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, imageFile }: { userId: string; imageFile: File }) => {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      
      // Remove imagem antiga se existir
      await supabase.storage.from('profiles').remove([`${userId}`]);
      
      // Faz upload da nova imagem
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, imageFile, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Pega a URL pública
      const { data: publicUrlData } = supabase.storage.from('profiles').getPublicUrl(fileName);
      
      // Atualiza o perfil no banco
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', userId);
      
      if (error) throw error;
      
      return publicUrlData.publicUrl;
    },
    onSuccess: (data, variables) => {
      // Invalida e refetch do perfil
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
    },
  });
};

// Hook para remover foto de perfil
export const useRemoveProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Remove do storage
      await supabase.storage.from('profiles').remove([
        `${userId}.png`, 
        `${userId}.jpg`, 
        `${userId}.jpeg`, 
        `${userId}`
      ]);
      
      // Remove do banco
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: '' })
        .eq('id', userId);
      
      if (error) throw error;
      
      return '';
    },
    onSuccess: (data, variables) => {
      // Invalida e refetch do perfil
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables] });
    },
  });
}; 