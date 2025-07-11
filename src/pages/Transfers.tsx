import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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

const Transfers = () => {
  const { data: cylinders } = useCylinders();
  const { data: transfers, isLoading } = useTransfers();
  const createTransfer = useCreateTransfer();

  const [selectedCylinder, setSelectedCylinder] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [operator, setOperator] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return <div className="p-6">Cargando traslados...</div>;
  }

  const handleTransfer = () => {
    if (!selectedCylinder || !fromLocation || !toLocation || !operator) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    createTransfer.mutate({
      cylinder_id: selectedCylinder,
      from_location: fromLocation,
      to_location: toLocation,
      operator,
      notes: notes || null,
      date_time: new Date().toISOString(),
    });

    setSelectedCylinder('');
    setFromLocation('');
    setToLocation('');
    setOperator('');
    setNotes('');
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
              <Label>Cilindro</Label>
              <Select value={selectedCylinder} onValueChange={setSelectedCylinder}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cilindro" />
                </SelectTrigger>
                <SelectContent>
                  {cylinders?.map((cylinder) => (
                    <SelectItem key={cylinder.id} value={cylinder.id}>
                      {cylinder.serial_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Desde</Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ubicación de origen" />
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
                <Label>Hacia</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ubicación de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatch">Despacho</SelectItem>
                    <SelectItem value="filling_station">Estación de Llenado</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <Button onClick={handleTransfer} className="w-full">
              Registrar Traslado
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
