
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const useReportsData = () => {
  return useQuery({
    queryKey: ['reports-data'],
    queryFn: async () => {
      const [cylinders, maintenance, fillings, transfers, tankMovements] = await Promise.all([
        supabase.from('cylinders').select('*'),
        supabase.from('maintenance_records').select(`
          *,
          cylinders (serial_number, capacity_kg)
        `),
        supabase.from('fillings').select(`
          *,
          cylinders (serial_number, capacity_kg)
        `),
        supabase.from('transfers').select(`
          *,
          cylinders (serial_number, capacity_kg)
        `),
        supabase.from('tank_movements').select('*')
      ]);

      if (cylinders.error) throw cylinders.error;
      if (maintenance.error) throw maintenance.error;
      if (fillings.error) throw fillings.error;
      if (transfers.error) throw transfers.error;
      if (tankMovements.error) throw tankMovements.error;

      return {
        cylinders: cylinders.data,
        maintenance: maintenance.data,
        fillings: fillings.data,
        transfers: transfers.data,
        tankMovements: tankMovements.data
      };
    },
  });
};

export const useExportExcel = () => {
  const { data } = useReportsData();

  const exportToExcel = (reportType: 'all' | 'cylinders' | 'maintenance' | 'fillings' | 'transfers' | 'tank') => {
    if (!data) {
      toast.error('No hay datos disponibles para exportar');
      return;
    }

    const wb = XLSX.utils.book_new();

    try {
      if (reportType === 'all' || reportType === 'cylinders') {
        const cylindersSheet = XLSX.utils.json_to_sheet(data.cylinders);
        XLSX.utils.book_append_sheet(wb, cylindersSheet, 'Cilindros');
      }

      if (reportType === 'all' || reportType === 'maintenance') {
        const maintenanceSheet = XLSX.utils.json_to_sheet(data.maintenance);
        XLSX.utils.book_append_sheet(wb, maintenanceSheet, 'Mantenimiento');
      }

      if (reportType === 'all' || reportType === 'fillings') {
        const fillingsSheet = XLSX.utils.json_to_sheet(data.fillings);
        XLSX.utils.book_append_sheet(wb, fillingsSheet, 'Llenados');
      }

      if (reportType === 'all' || reportType === 'transfers') {
        const transfersSheet = XLSX.utils.json_to_sheet(data.transfers);
        XLSX.utils.book_append_sheet(wb, transfersSheet, 'Traslados');
      }

      if (reportType === 'all' || reportType === 'tank') {
        const tankSheet = XLSX.utils.json_to_sheet(data.tankMovements);
        XLSX.utils.book_append_sheet(wb, tankSheet, 'Movimientos Tanque');
      }

      const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Reporte exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar reporte: ' + (error as Error).message);
    }
  };

  return { exportToExcel };
};
