
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
        // Formatear datos de cilindros con serial número como primera columna
        const cylindersData = data.cylinders.map(cylinder => ({
          'Número de Serie': cylinder.serial_number,
          'Capacidad (kg)': cylinder.capacity_kg,
          'Estado': cylinder.state,
          'Ubicación': cylinder.location,
          'Tipo de Válvula': cylinder.valve_type,
          'Fecha de Fabricación': cylinder.manufacture_date,
          'Última Prueba Hidrostática': cylinder.last_hydrostatic_test,
          'Próxima Prueba Hidrostática': cylinder.next_hydrostatic_test,
          'Fecha de Creación': cylinder.created_at,
          'Última Actualización': cylinder.updated_at
        }));
        const cylindersSheet = XLSX.utils.json_to_sheet(cylindersData);
        XLSX.utils.book_append_sheet(wb, cylindersSheet, 'Cilindros');
      }

      if (reportType === 'all' || reportType === 'maintenance') {
        // Formatear datos de mantenimiento con serial del cilindro
        const maintenanceData = data.maintenance.map(record => ({
          'Serial del Cilindro': record.cylinders?.serial_number || 'N/A',
          'Capacidad del Cilindro (kg)': record.cylinders?.capacity_kg || 'N/A',
          'Tipo de Mantenimiento': record.maintenance_type,
          'Descripción': record.description,
          'Técnico': record.technician,
          'Fecha Realizada': record.date_performed,
          'Estado': record.status,
          'Costo': record.cost,
          'Partes Reemplazadas': record.parts_replaced,
          'Próximo Mantenimiento': record.next_maintenance_date,
          'Notas': record.notes,
          'Fecha de Creación': record.created_at,
          'Última Actualización': record.updated_at
        }));
        const maintenanceSheet = XLSX.utils.json_to_sheet(maintenanceData);
        XLSX.utils.book_append_sheet(wb, maintenanceSheet, 'Mantenimiento');
      }

      if (reportType === 'all' || reportType === 'fillings') {
        // Formatear datos de llenados con serial del cilindro
        const fillingsData = data.fillings.map(filling => ({
          'Serial del Cilindro': filling.cylinders?.serial_number || 'N/A',
          'Capacidad del Cilindro (kg)': filling.cylinders?.capacity_kg || 'N/A',
          'Cantidad Llenada (kg)': filling.amount_kg,
          'Operador': filling.operator,
          'Estado': filling.status,
          'Motivo de Rechazo': filling.rejection_reason,
          'Fecha y Hora': filling.date_time,
          'Fecha de Creación': filling.created_at
        }));
        const fillingsSheet = XLSX.utils.json_to_sheet(fillingsData);
        XLSX.utils.book_append_sheet(wb, fillingsSheet, 'Llenados');
      }

      if (reportType === 'all' || reportType === 'transfers') {
        // Formatear datos de traslados con serial del cilindro
        const transfersData = data.transfers.map(transfer => ({
          'Serial del Cilindro': transfer.cylinders?.serial_number || 'N/A',
          'Capacidad del Cilindro (kg)': transfer.cylinders?.capacity_kg || 'N/A',
          'Desde': transfer.from_location,
          'Hacia': transfer.to_location,
          'Operador': transfer.operator,
          'Notas': transfer.notes,
          'Fecha y Hora': transfer.date_time,
          'Fecha de Creación': transfer.created_at
        }));
        const transfersSheet = XLSX.utils.json_to_sheet(transfersData);
        XLSX.utils.book_append_sheet(wb, transfersSheet, 'Traslados');
      }

      if (reportType === 'all' || reportType === 'tank') {
        // Formatear datos de movimientos de tanque (sin serial ya que es movimiento del tanque principal)
        const tankData = data.tankMovements.map(movement => ({
          'Tipo de Movimiento': movement.movement_type,
          'Cantidad (kg)': movement.amount_kg,
          'Operador': movement.operator,
          'Proveedor': movement.supplier,
          'Notas': movement.notes,
          'Fecha y Hora': movement.date_time,
          'Fecha de Creación': movement.created_at
        }));
        const tankSheet = XLSX.utils.json_to_sheet(tankData);
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
