import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FuelTank, 
  Plus, 
  ArrowDown, 
  ArrowUp,
  ListChecks
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
  const { data: tankInventory } = useTankInventory();
  const { data: tankMovements, isLoading } = useTankMovements();
  const createTankMovement = useCreateTankMovement();
  
  const [movementType, setMovementType] = useState('entry');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return <div className="p-6">Cargando movimientos de tanque...</div>;
  }

  const handleAddMovement = () => {
    if (!operator || !amount) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    createTankMovement.mutate({
      movement_type: movementType,
      amount_kg: parseFloat(amount),
      operator,
      supplier: supplier || null,
      notes: notes || null,
      date_time: new Date().toISOString(),
    });

    setAmount('');
    setOperator('');
    setSupplier('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión del Tanque Principal</h1>
            <p className="text-gray-600 mt-1">Control de inventario y movimientos del tanque</p>
          </div>
        </div>

        {/* Tank Inventory Card */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FuelTank className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold">
                  {tankInventory?.current_level_kg} kg / {tankInventory?.capacity_kg} kg
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Última actualización: {tankInventory?.last_updated ? new Date(tankInventory.last_updated).toLocaleString() : 'No disponible'}
              </p>
              <p className="text-sm text-gray-500">
                Operador: {tankInventory?.operator || 'No disponible'}
              </p>
              <p className="text-sm text-gray-500">
                Notas: {tankInventory?.notes || 'No hay notas'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add Movement Form */}
        <Card>
          <CardHeader>
            <CardTitle>Registrar Movimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="movementType">Tipo de Movimiento</Label>
                  <Select value={movementType} onValueChange={setMovementType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entrada</SelectItem>
                      <SelectItem value="exit">Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Cantidad (kg)</Label>
                  <Input
                    type="number"
                    id="amount"
                    placeholder="Cantidad"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operator">Operador</Label>
                  <Input
                    type="text"
                    id="operator"
                    placeholder="Nombre del operador"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Proveedor (opcional)</Label>
                  <Input
                    type="text"
                    id="supplier"
                    placeholder="Nombre del proveedor"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleAddMovement}>
                {movementType === 'entry' ? (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Registrar Entrada
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Registrar Salida
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tank Movements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad (kg)</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tankMovements?.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {movement.movement_type === 'entry' ? (
                        <span className="text-green-500">Entrada</span>
                      ) : (
                        <span className="text-red-500">Salida</span>
                      )}
                    </TableCell>
                    <TableCell>{movement.amount_kg} kg</TableCell>
                    <TableCell>{movement.operator}</TableCell>
                    <TableCell>{movement.supplier || '-'}</TableCell>
                    <TableCell>{new Date(movement.date_time || '').toLocaleString()}</TableCell>
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
