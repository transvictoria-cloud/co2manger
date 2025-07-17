
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
      console.log('Creating filling:', filling);
      
      const { data, error } = await supabase
        .from('fillings')
        .insert(filling)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating filling:', error);
        throw error;
      }
      
      console.log('Filling created successfully:', data);
      console.log('Trigger should now update tank inventory and create movement record');
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
      console.error('Filling error:', error);
      toast.error('Error al registrar llenado: ' + error.message);
    },
  });
};
