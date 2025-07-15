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
import { useCreateTransfer } from '@/hooks/useTransfers';

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

  const handleTransfer = async () => {
    if (selectedCylinders.length === 0 || !fromLocation || !toLocation || !operator) {
      toast.error('Por favor completa todos los campos y selecciona al menos un cilindro');
      return;
    }

    try {
      // Crear traslados para todos los cilindros seleccionados
      for (const cylinderId of selectedCylinders) {
        await createTransfer.mutateAsync({
          cylinder_id: cylinderId,
          from_location: fromLocation,
          to_location: toLocation,
          operator,
          notes: notes || null,
          date_time: new Date().toISOString(),
        });
      }
      
      // Limpiar formulario
      setSelectedCylinders([]);
      setFromLocation('');
      setToLocation('');
      setOperator('');
      setNotes('');
      
      toast.success(`${selectedCylinders.length} traslado(s) registrado(s) correctamente`);
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
                </SelectContent>
              </Select>
            </div>
            
            {fromLocation && (
              <div>
                <Label>Cilindros Disponibles en {fromLocation === 'dispatch' ? 'Despacho' : 
                  fromLocation === 'filling_station' ? 'Estación de Llenado' : 
                  fromLocation === 'maintenance' ? 'Mantenimiento' : 'Fuera de Servicio'}</Label>
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
              disabled={selectedCylinders.length === 0 || !fromLocation || !toLocation || !operator}
            >
              Registrar {selectedCylinders.length > 0 ? selectedCylinders.length : ''} Traslado{selectedCylinders.length > 1 ? 's' : ''}
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
                  <TableHead>Cilindro</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hacia</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers?.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{transfer.cylinder_id}</TableCell>
                    <TableCell>{transfer.from_location}</TableCell>
                    <TableCell>{transfer.to_location}</TableCell>
                    <TableCell>{transfer.operator}</TableCell>
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
