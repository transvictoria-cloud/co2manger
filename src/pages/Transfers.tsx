
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRightLeft, 
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCylinders } from '@/hooks/useCylinders';
import { useTransfers, useCreateTransfer } from '@/hooks/useTransfers';
import { toast } from 'sonner';

const Transfers = () => {
  const { data: cylinders } = useCylinders();
  const { data: transfers, isLoading } = useTransfers();
  const createTransfer = useCreateTransfer();
  
  const [newTransfer, setNewTransfer] = useState({
    cylinder_id: '',
    from_location: '' as any,
    to_location: '' as any,
    operator: '',
    notes: '',
  });

  const handleCreateTransfer = () => {
    if (!newTransfer.cylinder_id || !newTransfer.from_location || !newTransfer.to_location || !newTransfer.operator) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    if (newTransfer.from_location === newTransfer.to_location) {
      toast.error('La ubicación de origen y destino no pueden ser iguales');
      return;
    }

    createTransfer.mutate({
      ...newTransfer,
      notes: newTransfer.notes || null,
    });

    setNewTransfer({
      cylinder_id: '',
      from_location: '',
      to_location: '',
      operator: '',
      notes: '',
    });
  };

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'dispatch': return 'Despacho';
      case 'filling_station': return 'Estación de Llenado';
      case 'maintenance': return 'Mantenimiento';
      case 'out_of_service': return 'Fuera de Servicio';
      default: return location;
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'dispatch': return 'bg-blue-100 text-blue-800';
      case 'filling_station': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'out_of_service': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando traslados...</div>;
  }

  const todayTransfers = transfers?.filter(t => 
    new Date(t.date_time || '').toDateString() === new Date().toDateString()
  ) || [];

  const stats = {
    today: todayTransfers.length,
    toDispatch: todayTransfers.filter(t => t.to_location === 'dispatch').length,
    toFilling: todayTransfers.filter(t => t.to_location === 'filling_station').length,
    toMaintenance: todayTransfers.filter(t => t.to_location === 'maintenance').length,
  };

  const availableCylinders = cylinders?.filter(c => 
    c.location !== 'out_of_service'
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Control de Traslados</h1>
            <p className="text-gray-600 mt-1">Gestión de movimientos internos de cilindros</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
              <div className="text-sm text-gray-600">Traslados Hoy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.toDispatch}</div>
              <div className="text-sm text-gray-600">A Despacho</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{stats.toFilling}</div>
              <div className="text-sm text-gray-600">A Llenado</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{stats.toMaintenance}</div>
              <div className="text-sm text-gray-600">A Mantenimiento</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle>Registrar Nuevo Traslado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cilindro</Label>
                <Select 
                  value={newTransfer.cylinder_id} 
                  onValueChange={(value) => {
                    const cylinder = cylinders?.find(c => c.id === value);
                    setNewTransfer({
                      ...newTransfer, 
                      cylinder_id: value,
                      from_location: cylinder?.location || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cilindro" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCylinders.map((cylinder) => (
                      <SelectItem key={cylinder.id} value={cylinder.id}>
                        {cylinder.serial_number} - {getLocationLabel(cylinder.location)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ubicación Actual</Label>
                <Input
                  value={getLocationLabel(newTransfer.from_location)}
                  disabled
                  placeholder="Se completará automáticamente"
                />
              </div>

              <div>
                <Label>Destino</Label>
                <Select 
                  value={newTransfer.to_location} 
                  onValueChange={(value) => setNewTransfer({...newTransfer, to_location: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destino" />
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
                  value={newTransfer.operator}
                  onChange={(e) => setNewTransfer({...newTransfer, operator: e.target.value})}
                  placeholder="Nombre del operador"
                />
              </div>

              <div>
                <Label>Observaciones (Opcional)</Label>
                <Textarea
                  value={newTransfer.notes}
                  onChange={(e) => setNewTransfer({...newTransfer, notes: e.target.value})}
                  placeholder="Notas adicionales sobre el traslado..."
                />
              </div>

              <Button 
                onClick={handleCreateTransfer} 
                className="w-full"
                disabled={createTransfer.isPending}
              >
                {createTransfer.isPending ? 'Registrando...' : 'Registrar Traslado'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Traslados Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transfers?.slice(0, 10).map((transfer) => (
                  <div key={transfer.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {(transfer as any).cylinders?.serial_number || 'Cilindro'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transfer.date_time || '').toLocaleString('es-ES')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getLocationColor(transfer.from_location)}>
                        {getLocationLabel(transfer.from_location)}
                      </Badge>
                      <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                      <Badge className={getLocationColor(transfer.to_location)}>
                        {getLocationLabel(transfer.to_location)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Operador: {transfer.operator}
                    </div>
                    {transfer.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        {transfer.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfers History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Traslados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Cilindro</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers?.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      {new Date(transfer.date_time || '').toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {(transfer as any).cylinders?.serial_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getLocationColor(transfer.from_location)}>
                        {getLocationLabel(transfer.from_location)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLocationColor(transfer.to_location)}>
                        {getLocationLabel(transfer.to_location)}
                      </Badge>
                    </TableCell>
                    <TableCell>{transfer.operator}</TableCell>
                    <TableCell>{transfer.notes || '-'}</TableCell>
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
