
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Transfer = Tables<'transfers'>;

export const useTransfers = () => {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
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

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transfer: Omit<Transfer, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transfers')
        .insert(transfer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['cylinders'] });
      toast.success('Traslado registrado correctamente');
    },
    onError: (error) => {
      toast.error('Error al registrar traslado: ' + error.message);
    },
  });
};
