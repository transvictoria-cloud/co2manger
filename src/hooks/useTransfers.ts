
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Transfer = Tables<'transfers'>;

export type TransferInput = {
  cylinder_id?: string | null;
  from_location: 'dispatch' | 'filling_station' | 'maintenance' | 'out_of_service' | 'assignments' | 'returns';
  to_location: 'dispatch' | 'filling_station' | 'maintenance' | 'out_of_service' | 'assignments' | 'returns';
  operator: string;
  notes?: string | null;
  client_name?: string | null;
  cylinder_capacity_kg?: number | null;
  cylinder_quantity?: number | null;
  delivery_note_number?: string | null;
  driver_name?: string | null;
  date_time: string;
};

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
    mutationFn: async (transfer: TransferInput) => {
      console.log('Creating transfer:', transfer);
      
      const { data, error } = await supabase
        .from('transfers')
        .insert(transfer)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating transfer:', error);
        throw error;
      }
      
      console.log('Transfer created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['cylinders'] });
      toast.success('Traslado registrado correctamente');
    },
    onError: (error) => {
      console.error('Transfer error:', error);
      toast.error('Error al registrar traslado: ' + error.message);
    },
  });
};
