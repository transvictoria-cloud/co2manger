
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type TankInventory = Tables<'tank_inventory'>;
export type TankMovement = Tables<'tank_movements'>;

export const useTankInventory = () => {
  return useQuery({
    queryKey: ['tank-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tank_inventory')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useTankMovements = () => {
  return useQuery({
    queryKey: ['tank-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tank_movements')
        .select('*')
        .order('date_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateTankMovement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movement: Omit<TankMovement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tank_movements')
        .insert(movement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tank-movements'] });
      queryClient.invalidateQueries({ queryKey: ['tank-inventory'] });
      toast.success('Movimiento de tanque registrado correctamente');
    },
    onError: (error) => {
      toast.error('Error al registrar movimiento: ' + error.message);
    },
  });
};
