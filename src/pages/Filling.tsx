import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Fuel } from 'lucide-react';
import { useCylinders } from '@/hooks/useCylinders';
import { useCreateFilling } from '@/hooks/useFillings';
import { toast } from 'sonner';

const Filling = () => {
  const { data: cylinders } = useCylinders();
  const createFilling = useCreateFilling();

  const [selectedCylinder, setSelectedCylinder] = useState('');
  const [operator, setOperator] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleFilling = () => {
    if (!selectedCylinder || !operator || !amount) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    createFilling.mutate({
      cylinder_id: selectedCylinder,
      operator,
      amount_kg: parseFloat(amount),
      status: 'approved',
      rejection_reason: null,
      date_time: new Date().toISOString(),
    });

    setSelectedCylinder('');
    setOperator('');
    setAmount('');
    setNotes('');
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
              <Label>Cilindro</Label>
              <Select value={selectedCylinder} onValueChange={setSelectedCylinder}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cilindro" />
                </SelectTrigger>
                <SelectContent>
                  {cylinders?.map((cylinder) => (
                    <SelectItem key={cylinder.id} value={cylinder.id}>
                      {cylinder.serial_number} - {cylinder.capacity_kg}kg
                    </SelectItem>
                  ))}
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
              <Label>Cantidad (kg)</Label>
              <Input
                type="number"
                placeholder="Cantidad de gas"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
            <Button className="w-full" onClick={handleFilling}>
              <Fuel className="h-4 w-4 mr-2" />
              Registrar Llenado
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Filling;
