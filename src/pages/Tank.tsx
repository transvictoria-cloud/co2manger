
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Droplets, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTankInventory, useTankMovements, useCreateTankMovement } from '@/hooks/useTank';
import { toast } from 'sonner';

const Tank = () => {
  const { data: tankData, isLoading: tankLoading } = useTankInventory();
  const { data: movements, isLoading: movementsLoading } = useTankMovements();
  const createMovement = useCreateTankMovement();
  
  const [newMovement, setNewMovement] = useState({
    movement_type: 'entry' as const,
    amount_kg: '',
    operator: '',
    supplier: '',
    notes: '',
  });

  const handleCreateMovement = () => {
    if (!newMovement.amount_kg || !newMovement.operator) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    createMovement.mutate({
      ...newMovement,
      amount_kg: parseFloat(newMovement.amount_kg),
      supplier: newMovement.supplier || null,
      notes: newMovement.notes || null,
    });

    setNewMovement({
      movement_type: 'entry',
      amount_kg: '',
      operator: '',
      supplier: '',
      notes: '',
    });
  };

  if (tankLoading || movementsLoading) {
    return <div className="p-6">Cargando información del tanque...</div>;
  }

  const tankLevel = tankData?.current_level_kg || 0;
  const tankCapacity = tankData?.capacity_kg || 3200;
  const tankPercentage = (tankLevel / tankCapacity) * 100;

  const todayMovements = movements?.filter(m => 
    new Date(m.date_time || '').toDateString() === new Date().toDateString()
  ) || [];

  const stats = {
    totalEntries: todayMovements.filter(m => m.movement_type === 'entry').length,
    totalExits: todayMovements.filter(m => m.movement_type === 'exit').length,
    totalEntryKg: todayMovements
      .filter(m => m.movement_type === 'entry')
      .reduce((sum, m) => sum + (m.amount_kg || 0), 0),
    totalExitKg: todayMovements
      .filter(m => m.movement_type === 'exit')
      .reduce((sum, m) => sum + (m.amount_kg || 0), 0),
  };

  const getMovementColor = (type: string) => {
    return type === 'entry' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getMovementLabel = (type: string) => {
    return type === 'entry' ? 'Entrada' : 'Salida';
  };

  const getMovementIcon = (type: string) => {
    return type === 'entry' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión del Tanque Principal</h1>
            <p className="text-gray-600 mt-1">Control de inventario de CO2 líquido</p>
          </div>
        </div>

        {/* Tank Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Estado Actual del Tanque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Nivel Actual</span>
                  <span className="text-2xl font-bold text-blue-600">{tankLevel.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-300 ${
                      tankPercentage > 80 ? 'bg-green-500' : 
                      tankPercentage > 50 ? 'bg-yellow-500' : 
                      tankPercentage > 25 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(tankPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  {tankPercentage.toFixed(1)}% de capacidad total
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tankCapacity} kg</div>
                <div className="text-sm text-gray-600">Capacidad Total</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(tankCapacity - tankLevel).toFixed(1)} kg
                </div>
                <div className="text-sm text-gray-600">Espacio Disponible</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  {tankPercentage < 25 && (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  )}
                  <div className={`text-2xl font-bold ${
                    tankPercentage > 50 ? 'text-green-600' : 
                    tankPercentage > 25 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {tankPercentage > 50 ? 'Óptimo' : 
                     tankPercentage > 25 ? 'Alerta' : 'Crítico'}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Estado del Nivel</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.totalEntries}</div>
              <div className="text-sm text-gray-600">Entradas Hoy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.totalExits}</div>
              <div className="text-sm text-gray-600">Salidas Hoy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.totalEntryKg.toFixed(1)}</div>
              <div className="text-sm text-gray-600">kg Añadidos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Droplets className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.totalExitKg.toFixed(1)}</div>
              <div className="text-sm text-gray-600">kg Utilizados</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Movement Form */}
          <Card>
            <CardHeader>
              <CardTitle>Registrar Movimiento del Tanque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Movimiento</Label>
                <Select 
                  value={newMovement.movement_type} 
                  onValueChange={(value) => setNewMovement({...newMovement, movement_type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrada (Recarga de CO2)</SelectItem>
                    <SelectItem value="exit">Salida (Uso manual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cantidad (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMovement.amount_kg}
                  onChange={(e) => setNewMovement({...newMovement, amount_kg: e.target.value})}
                  placeholder="500.0"
                />
              </div>

              <div>
                <Label>Operador</Label>
                <Input
                  value={newMovement.operator}
                  onChange={(e) => setNewMovement({...newMovement, operator: e.target.value})}
                  placeholder="Nombre del operador"
                />
              </div>

              {newMovement.movement_type === 'entry' && (
                <div>
                  <Label>Proveedor (Opcional)</Label>
                  <Input
                    value={newMovement.supplier}
                    onChange={(e) => setNewMovement({...newMovement, supplier: e.target.value})}
                    placeholder="Nombre del proveedor"
                  />
                </div>
              )}

              <div>
                <Label>Observaciones (Opcional)</Label>
                <Textarea
                  value={newMovement.notes}
                  onChange={(e) => setNewMovement({...newMovement, notes: e.target.value})}
                  placeholder="Notas adicionales sobre el movimiento..."
                />
              </div>

              <Button 
                onClick={handleCreateMovement} 
                className="w-full"
                disabled={createMovement.isPending}
              >
                {createMovement.isPending ? 'Registrando...' : 'Registrar Movimiento'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {movements?.slice(0, 10).map((movement) => {
                  const Icon = getMovementIcon(movement.movement_type);
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {movement.amount_kg} kg
                          </div>
                          <div className="text-sm text-gray-600">
                            {movement.operator}
                            {movement.supplier && ` • ${movement.supplier}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(movement.date_time || '').toLocaleString('es-ES')}
                          </div>
                        </div>
                      </div>
                      <Badge className={getMovementColor(movement.movement_type)}>
                        {getMovementLabel(movement.movement_type)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movements History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad (kg)</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements?.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.date_time || '').toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getMovementColor(movement.movement_type)}>
                        {getMovementLabel(movement.movement_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {movement.movement_type === 'entry' ? '+' : '-'}{movement.amount_kg} kg
                    </TableCell>
                    <TableCell>{movement.operator}</TableCell>
                    <TableCell>{movement.supplier || '-'}</TableCell>
                    <TableCell>{movement.notes || '-'}</TableCell>
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

export default Tank;
