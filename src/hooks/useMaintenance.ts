
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type MaintenanceRecord = Tables<'maintenance_records'>;

export const useMaintenance = () => {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          cylinders (
            serial_number,
            capacity_kg
          )
        `)
        .order('date_performed', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (maintenance: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert(maintenance)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Registro de mantenimiento creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear registro de mantenimiento: ' + error.message);
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceRecord> }) => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Registro de mantenimiento actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar registro de mantenimiento: ' + error.message);
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Registro de mantenimiento eliminado correctamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar registro de mantenimiento: ' + error.message);
    },
  });
};
