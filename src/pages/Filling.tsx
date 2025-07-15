import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Fuel } from 'lucide-react';
import { useCylinders } from '@/hooks/useCylinders';
import { useCreateFilling } from '@/hooks/useFillings';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Filling = () => {
  const { data: cylinders } = useCylinders();
  const createFilling = useCreateFilling();

  const [selectedCylinders, setSelectedCylinders] = useState<{id: string, amount: string}[]>([]);
  const [operator, setOperator] = useState('');
  const [notes, setNotes] = useState('');

  // Filtrar cilindros vacíos en estación de llenado
  const emptyCylinders = useMemo(() => {
    if (!cylinders) return [];
    return cylinders.filter(cylinder => 
      cylinder.location === 'filling_station' && cylinder.state === 'empty'
    );
  }, [cylinders]);

  const handleCylinderSelection = (cylinderId: string, checked: boolean) => {
    if (checked) {
      setSelectedCylinders(prev => [...prev, { id: cylinderId, amount: '' }]);
    } else {
      setSelectedCylinders(prev => prev.filter(item => item.id !== cylinderId));
    }
  };

  const updateCylinderAmount = (cylinderId: string, amount: string) => {
    setSelectedCylinders(prev => 
      prev.map(item => 
        item.id === cylinderId ? { ...item, amount } : item
      )
    );
  };

  const handleFilling = async () => {
    if (selectedCylinders.length === 0 || !operator) {
      toast.error('Por favor selecciona al menos un cilindro y completa el operador');
      return;
    }

    const cylindersWithoutAmount = selectedCylinders.filter(item => !item.amount || parseFloat(item.amount) <= 0);
    if (cylindersWithoutAmount.length > 0) {
      toast.error('Por favor ingresa una cantidad válida para todos los cilindros');
      return;
    }

    try {
      for (const cylinder of selectedCylinders) {
        await createFilling.mutateAsync({
          cylinder_id: cylinder.id,
          operator,
          amount_kg: parseFloat(cylinder.amount),
          status: 'approved',
          rejection_reason: null,
          date_time: new Date().toISOString(),
        });
      }

      setSelectedCylinders([]);
      setOperator('');
      setNotes('');
      
      toast.success(`${selectedCylinders.length} llenado(s) registrado(s) correctamente`);
    } catch (error) {
      toast.error('Error al procesar los llenados');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de Llenado</h1>
            <p className="text-gray-600 mt-1">Registra el llenado de cilindros de forma rápida</p>
          </div>
        </div>

        {/* Filling Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Llenado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cilindros Vacíos en Estación de Llenado</Label>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                {emptyCylinders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay cilindros vacíos disponibles en la estación de llenado</p>
                ) : (
                  <div className="space-y-2">
                    {emptyCylinders.map((cylinder) => (
                      <div key={cylinder.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={cylinder.id}
                          checked={selectedCylinders.some(item => item.id === cylinder.id)}
                          onCheckedChange={(checked) => 
                            handleCylinderSelection(cylinder.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={cylinder.id} className="text-sm">
                          {cylinder.serial_number} - {cylinder.capacity_kg}kg
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCylinders.length > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  {selectedCylinders.length} cilindro(s) seleccionado(s) para llenar
                </p>
              )}
            </div>
            {selectedCylinders.length > 0 && (
              <div>
                <Label>Cantidad por Cilindro (kg)</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cilindro</TableHead>
                      <TableHead>Capacidad</TableHead>
                      <TableHead>Cantidad (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCylinders.map((selectedCylinder) => {
                      const cylinder = emptyCylinders.find(c => c.id === selectedCylinder.id);
                      return (
                        <TableRow key={selectedCylinder.id}>
                          <TableCell>{cylinder?.serial_number}</TableCell>
                          <TableCell>{cylinder?.capacity_kg}kg</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="Cantidad"
                              value={selectedCylinder.amount}
                              onChange={(e) => updateCylinderAmount(selectedCylinder.id, e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

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
              <Textarea
                placeholder="Notas adicionales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleFilling}
              disabled={selectedCylinders.length === 0 || !operator}
            >
              <Fuel className="h-4 w-4 mr-2" />
              Registrar {selectedCylinders.length > 0 ? selectedCylinders.length : ''} Llenado{selectedCylinders.length > 1 ? 's' : ''}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Filling;
