
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Filling = Tables<'fillings'>;

export const useFillings = () => {
  return useQuery({
    queryKey: ['fillings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fillings')
        .select(`
          *,
          cylinders (
            serial_number,
            capacity_kg
          )
        `)
        .order('date_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFilling = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (filling: Omit<Filling, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('fillings')
        .insert(filling)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fillings'] });
      queryClient.invalidateQueries({ queryKey: ['cylinders'] });
      queryClient.invalidateQueries({ queryKey: ['tank-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['tank-movements'] });
      toast.success('Llenado registrado correctamente');
    },
    onError: (error) => {
      toast.error('Error al registrar llenado: ' + error.message);
    },
  });
};
