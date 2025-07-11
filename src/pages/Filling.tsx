
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardList, 
  Package,
  CheckCircle,
  XCircle,
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
import { useFillings, useCreateFilling } from '@/hooks/useFillings';
import { toast } from 'sonner';

const Filling = () => {
  const { data: cylinders } = useCylinders();
  const { data: fillings, isLoading } = useFillings();
  const createFilling = useCreateFilling();
  
  const [newFilling, setNewFilling] = useState({
    cylinder_id: '',
    operator: '',
    amount_kg: '',
    status: 'approved' as const,
    rejection_reason: '',
  });

  const availableCylinders = cylinders?.filter(c => 
    c.state === 'empty' && c.location === 'filling_station'
  ) || [];

  const handleCreateFilling = () => {
    if (!newFilling.cylinder_id || !newFilling.operator || !newFilling.amount_kg) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    createFilling.mutate({
      ...newFilling,
      amount_kg: parseFloat(newFilling.amount_kg),
      rejection_reason: newFilling.status === 'rejected' ? newFilling.rejection_reason : null,
    });

    setNewFilling({
      cylinder_id: '',
      operator: '',
      amount_kg: '',
      status: 'approved',
      rejection_reason: '',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'approved' ? 'Aprobado' : 'Rechazado';
  };

  if (isLoading) {
    return <div className="p-6">Cargando llenados...</div>;
  }

  const todayFillings = fillings?.filter(f => 
    new Date(f.date_time || '').toDateString() === new Date().toDateString()
  ) || [];

  const stats = {
    today: todayFillings.length,
    approved: todayFillings.filter(f => f.status === 'approved').length,
    rejected: todayFillings.filter(f => f.status === 'rejected').length,
    totalKg: todayFillings
      .filter(f => f.status === 'approved')
      .reduce((sum, f) => sum + (f.amount_kg || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de Llenados</h1>
            <p className="text-gray-600 mt-1">Control de llenado de cilindros de CO2</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
              <div className="text-sm text-gray-600">Llenados Hoy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Aprobados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rechazados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{stats.totalKg.toFixed(1)}</div>
              <div className="text-sm text-gray-600">kg CO2 Hoy</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Filling Form */}
          <Card>
            <CardHeader>
              <CardTitle>Registrar Nuevo Llenado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cilindro</Label>
                <Select 
                  value={newFilling.cylinder_id} 
                  onValueChange={(value) => setNewFilling({...newFilling, cylinder_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cilindro" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCylinders.map((cylinder) => (
                      <SelectItem key={cylinder.id} value={cylinder.id}>
                        {cylinder.serial_number} - {cylinder.capacity_kg}kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {availableCylinders.length} cilindros disponibles para llenar
                </p>
              </div>

              <div>
                <Label>Operador</Label>
                <Input
                  value={newFilling.operator}
                  onChange={(e) => setNewFilling({...newFilling, operator: e.target.value})}
                  placeholder="Nombre del operador"
                />
              </div>

              <div>
                <Label>Cantidad de CO2 (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newFilling.amount_kg}
                  onChange={(e) => setNewFilling({...newFilling, amount_kg: e.target.value})}
                  placeholder="10.0"
                />
              </div>

              <div>
                <Label>Estado</Label>
                <Select 
                  value={newFilling.status} 
                  onValueChange={(value) => setNewFilling({...newFilling, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newFilling.status === 'rejected' && (
                <div>
                  <Label>Razón de Rechazo</Label>
                  <Textarea
                    value={newFilling.rejection_reason}
                    onChange={(e) => setNewFilling({...newFilling, rejection_reason: e.target.value})}
                    placeholder="Indique la razón del rechazo..."
                  />
                </div>
              )}

              <Button 
                onClick={handleCreateFilling} 
                className="w-full"
                disabled={createFilling.isPending}
              >
                {createFilling.isPending ? 'Registrando...' : 'Registrar Llenado'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Fillings */}
          <Card>
            <CardHeader>
              <CardTitle>Llenados Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {fillings?.slice(0, 10).map((filling) => (
                  <div key={filling.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {(filling as any).cylinders?.serial_number || 'Cilindro'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {filling.operator} • {filling.amount_kg}kg
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(filling.date_time || '').toLocaleString('es-ES')}
                      </div>
                    </div>
                    <Badge className={getStatusColor(filling.status)}>
                      {getStatusLabel(filling.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fillings History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Llenados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Cilindro</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Cantidad (kg)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fillings?.map((filling) => (
                  <TableRow key={filling.id}>
                    <TableCell>
                      {new Date(filling.date_time || '').toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {(filling as any).cylinders?.serial_number || 'N/A'}
                    </TableCell>
                    <TableCell>{filling.operator}</TableCell>
                    <TableCell>{filling.amount_kg} kg</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(filling.status)}>
                        {getStatusLabel(filling.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {filling.rejection_reason || '-'}
                    </TableCell>
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

export default Filling;
