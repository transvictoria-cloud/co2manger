
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Cylinder = Tables<'cylinders'>;

export const useCylinders = () => {
  return useQuery({
    queryKey: ['cylinders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cylinders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateCylinder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Cylinder> }) => {
      const { data, error } = await supabase
        .from('cylinders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cylinders'] });
      toast.success('Cilindro actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar cilindro: ' + error.message);
    },
  });
};

export const useCreateCylinder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cylinder: Omit<Cylinder, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('cylinders')
        .insert(cylinder)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cylinders'] });
      toast.success('Cilindro creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear cilindro: ' + error.message);
    },
  });
};
