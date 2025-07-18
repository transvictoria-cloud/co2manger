import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  ArrowRightLeft,
  Users,
  Undo2,
} from 'lucide-react';
import { useTransfers } from '@/hooks/useTransfers';
import { useCylinders } from '@/hooks/useCylinders';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCreateTransfer, type TransferInput } from '@/hooks/useTransfers';

import { Enums } from '@/integrations/supabase/types';

type CylinderLocation = Enums<'cylinder_location'>;

const Transfers = () => {
  const { data: cylinders } = useCylinders();
  const { data: transfers, isLoading } = useTransfers();
  const createTransfer = useCreateTransfer();

  const [selectedCylinders, setSelectedCylinders] = useState<string[]>([]);
  const [fromLocation, setFromLocation] = useState<CylinderLocation | ''>('');
  const [toLocation, setToLocation] = useState<CylinderLocation | ''>('');
  const [operator, setOperator] = useState('');
  const [notes, setNotes] = useState('');
  
  // Nuevos campos para asignaciones y devoluciones
  const [clientName, setClientName] = useState('');
  const [cylinderCapacityKg, setCylinderCapacityKg] = useState('');
  const [cylinderQuantity, setCylinderQuantity] = useState('1');
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [driverName, setDriverName] = useState('');

  if (isLoading) {
    return <div className="p-6">Cargando traslados...</div>;
  }

  // Filtrar cilindros por ubicación seleccionada
  const availableCylinders = useMemo(() => {
    if (!cylinders || !fromLocation) return [];
    return cylinders.filter(cylinder => cylinder.location === fromLocation);
  }, [cylinders, fromLocation]);

  const handleCylinderSelection = (cylinderId: string, checked: boolean) => {
    if (checked) {
      setSelectedCylinders(prev => [...prev, cylinderId]);
    } else {
      setSelectedCylinders(prev => prev.filter(id => id !== cylinderId));
    }
  };

  // Verificar si es un traslado de asignación o devolución que requiere campos especiales
  const isAssignmentOrReturn = toLocation === 'assignments' || fromLocation === 'returns' || toLocation === 'returns';
  
  const handleTransfer = async () => {
    // Validación básica
    if (!fromLocation || !toLocation || !operator) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validación específica para asignaciones y devoluciones
    if (isAssignmentOrReturn) {
      if (!clientName || !cylinderCapacityKg || !cylinderQuantity || !deliveryNoteNumber || !driverName) {
        toast.error('Para asignaciones y devoluciones, todos los campos del cliente son obligatorios');
        return;
      }
    } else {
      // Para traslados normales, validar que haya cilindros seleccionados
      if (selectedCylinders.length === 0) {
        toast.error('Por favor selecciona al menos un cilindro para el traslado');
        return;
      }
    }

    try {
      if (isAssignmentOrReturn) {
        // Para asignaciones y devoluciones, crear un solo registro sin cylinder_id específico
        const transferData: TransferInput = {
          cylinder_id: null,
          from_location: fromLocation,
          to_location: toLocation,
          operator,
          notes: notes || null,
          client_name: clientName,
          cylinder_capacity_kg: parseFloat(cylinderCapacityKg),
          cylinder_quantity: parseInt(cylinderQuantity),
          delivery_note_number: deliveryNoteNumber,
          driver_name: driverName,
          date_time: new Date().toISOString(),
        };
        
        await createTransfer.mutateAsync(transferData);
        
        // Limpiar campos específicos
        setClientName('');
        setCylinderCapacityKg('');
        setCylinderQuantity('1');
        setDeliveryNoteNumber('');
        setDriverName('');
        
        toast.success('Traslado registrado correctamente');
      } else {
        // Para traslados normales, crear traslados para todos los cilindros seleccionados
        for (const cylinderId of selectedCylinders) {
          const transferData: TransferInput = {
            cylinder_id: cylinderId,
            from_location: fromLocation,
            to_location: toLocation,
            operator,
            notes: notes || null,
            client_name: null,
            cylinder_capacity_kg: null,
            cylinder_quantity: null,
            delivery_note_number: null,
            driver_name: null,
            date_time: new Date().toISOString(),
          };
          
          await createTransfer.mutateAsync(transferData);
        }
        
        setSelectedCylinders([]);
        toast.success(`${selectedCylinders.length} traslado(s) registrado(s) correctamente`);
      }
      
      // Limpiar campos comunes
      setFromLocation('');
      setToLocation('');
      setOperator('');
      setNotes('');
      
    } catch (error) {
      toast.error('Error al procesar los traslados');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Traslado de Cilindro</h1>
          <p className="text-gray-600 mt-1">Realiza el registro de traslados de cilindros entre ubicaciones</p>
        </div>

        {/* Transfer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Traslado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ubicación de Origen</Label>
              <Select value={fromLocation} onValueChange={(value) => {
                setFromLocation(value as CylinderLocation);
                setSelectedCylinders([]); // Limpiar selección al cambiar origen
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación de origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dispatch">Despacho</SelectItem>
                  <SelectItem value="filling_station">Estación de Llenado</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                  <SelectItem value="assignments">Asignaciones</SelectItem>
                  <SelectItem value="returns">Devoluciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {fromLocation && !isAssignmentOrReturn && (
              <div>
                <Label>Cilindros Disponibles en {
                  fromLocation === 'dispatch' ? 'Despacho' : 
                  fromLocation === 'filling_station' ? 'Estación de Llenado' : 
                  fromLocation === 'maintenance' ? 'Mantenimiento' : 
                  fromLocation === 'out_of_service' ? 'Fuera de Servicio' :
                  fromLocation === 'assignments' ? 'Asignaciones' : 'Devoluciones'
                }</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  {availableCylinders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay cilindros disponibles en esta ubicación</p>
                  ) : (
                    <div className="space-y-2">
                      {availableCylinders.map((cylinder) => (
                        <div key={cylinder.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={cylinder.id}
                            checked={selectedCylinders.includes(cylinder.id)}
                            onCheckedChange={(checked) => 
                              handleCylinderSelection(cylinder.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={cylinder.id} className="text-sm">
                            {cylinder.serial_number} - {cylinder.capacity_kg}kg ({cylinder.state})
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCylinders.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {selectedCylinders.length} cilindro(s) seleccionado(s)
                  </p>
                )}
              </div>
            )}
            
            {/* Campos específicos para asignaciones y devoluciones */}
            {isAssignmentOrReturn && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {toLocation === 'assignments' ? <Users className="h-4 w-4" /> : <Undo2 className="h-4 w-4" />}
                  <Label className="font-semibold">
                    {toLocation === 'assignments' ? 'Información de Asignación' : 'Información de Devolución'}
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Cliente *</Label>
                    <Input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Capacidad del Cilindro (kg) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="10, 15, 45..."
                      value={cylinderCapacityKg}
                      onChange={(e) => setCylinderCapacityKg(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Cantidad de Cilindros *</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={cylinderQuantity}
                      onChange={(e) => setCylinderQuantity(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Nº Control Nota de Entrega *</Label>
                    <Input
                      type="text"
                      placeholder="NE-2024-001"
                      value={deliveryNoteNumber}
                      onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Conductor *</Label>
                    <Input
                      type="text"
                      placeholder="Nombre del conductor"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label>Ubicación de Destino</Label>
              <Select value={toLocation} onValueChange={(value) => setToLocation(value as CylinderLocation)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación de destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dispatch">Despacho</SelectItem>
                  <SelectItem value="filling_station">Estación de Llenado</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                  <SelectItem value="assignments">Asignaciones</SelectItem>
                  <SelectItem value="returns">Devoluciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operador</Label>
              <Input
                type="text"
                placeholder="Nombre del operador"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
              />
            </div>
            <div>
              <Label>Notas (Opcional)</Label>
              <Input
                type="text"
                placeholder="Notas adicionales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleTransfer} 
              className="w-full" 
              disabled={
                !fromLocation || !toLocation || !operator || 
                (isAssignmentOrReturn ? 
                  (!clientName || !cylinderCapacityKg || !cylinderQuantity || !deliveryNoteNumber || !driverName) : 
                  selectedCylinders.length === 0
                )
              }
            >
              {isAssignmentOrReturn ? 
                `Registrar ${toLocation === 'assignments' ? 'Asignación' : 'Devolución'}` :
                `Registrar ${selectedCylinders.length > 0 ? selectedCylinders.length : ''} Traslado${selectedCylinders.length > 1 ? 's' : ''}`
              }
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>Traslados Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cilindro/Cliente</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hacia</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers?.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      {transfer.client_name ? 
                        `Cliente: ${transfer.client_name}` : 
                        (transfer.cylinders?.serial_number || transfer.cylinder_id || 'N/A')
                      }
                    </TableCell>
                    <TableCell>
                      {transfer.from_location === 'dispatch' ? 'Despacho' :
                       transfer.from_location === 'filling_station' ? 'Estación de Llenado' :
                       transfer.from_location === 'maintenance' ? 'Mantenimiento' :
                       transfer.from_location === 'out_of_service' ? 'Fuera de Servicio' :
                       transfer.from_location === 'assignments' ? 'Asignaciones' :
                       transfer.from_location === 'returns' ? 'Devoluciones' :
                       transfer.from_location}
                    </TableCell>
                    <TableCell>
                      {transfer.to_location === 'dispatch' ? 'Despacho' :
                       transfer.to_location === 'filling_station' ? 'Estación de Llenado' :
                       transfer.to_location === 'maintenance' ? 'Mantenimiento' :
                       transfer.to_location === 'out_of_service' ? 'Fuera de Servicio' :
                       transfer.to_location === 'assignments' ? 'Asignaciones' :
                       transfer.to_location === 'returns' ? 'Devoluciones' :
                       transfer.to_location}
                    </TableCell>
                    <TableCell>{transfer.operator}</TableCell>
                    <TableCell>
                      {transfer.cylinder_quantity ? 
                        `${transfer.cylinder_quantity} x ${transfer.cylinder_capacity_kg}kg` : 
                        '1'
                      }
                    </TableCell>
                    <TableCell>{transfer.delivery_note_number || 'N/A'}</TableCell>
                    <TableCell>{new Date(transfer.date_time || '').toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transfers;
