
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus,
  AlertTriangle,
  Activity,
  Calendar
} from 'lucide-react';

interface TankMovement {
  id: string;
  type: 'entrada' | 'salida';
  amount: number;
  date: string;
  operator: string;
  description: string;
  reference?: string;
}

const Tank = () => {
  const [tankLevel, setTankLevel] = useState(2400);
  const [tankCapacity] = useState(3200);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState('');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');

  const [movements, setMovements] = useState<TankMovement[]>([
    {
      id: '1',
      type: 'entrada',
      amount: 800,
      date: '2024-01-11T08:00:00',
      operator: 'Carlos Rodríguez',
      description: 'Recarga semanal de CO2',
      reference: 'PROV-001'
    },
    {
      id: '2',
      type: 'salida',
      amount: 50,
      date: '2024-01-11T10:30:00',
      operator: 'Juan Pérez',
      description: 'Llenado de cilindros - Lote matutino'
    },
    {
      id: '3',
      type: 'salida',
      amount: 75,
      date: '2024-01-11T14:15:00',
      operator: 'María González',
      description: 'Llenado de cilindros - Lote vespertino'
    }
  ]);

  const tankPercentage = (tankLevel / tankCapacity) * 100;
  const isLowTank = tankPercentage < 25;
  const isCriticalTank = tankPercentage < 15;

  const handleAddCO2 = () => {
    if (!amount || !operator || !description) return;
    
    const amountNum = parseFloat(amount);
    const newMovement: TankMovement = {
      id: Date.now().toString(),
      type: 'entrada',
      amount: amountNum,
      date: new Date().toISOString(),
      operator,
      description,
      reference: supplier || undefined
    };

    setMovements([newMovement, ...movements]);
    setTankLevel(prev => Math.min(prev + amountNum, tankCapacity));
    
    // Reset form
    setAmount('');
    setOperator('');
    setDescription('');
    setSupplier('');
    setShowAddForm(false);
  };

  const handleRemoveCO2 = () => {
    if (!amount || !operator || !description) return;
    
    const amountNum = parseFloat(amount);
    const newMovement: TankMovement = {
      id: Date.now().toString(),
      type: 'salida',
      amount: amountNum,
      date: new Date().toISOString(),
      operator,
      description
    };

    setMovements([newMovement, ...movements]);
    setTankLevel(prev => Math.max(prev - amountNum, 0));
    
    // Reset form
    setAmount('');
    setOperator('');
    setDescription('');
    setShowRemoveForm(false);
  };

  const getTodayMovements = () => {
    const today = new Date().toDateString();
    return movements.filter(m => new Date(m.date).toDateString() === today);
  };

  const getWeekMovements = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return movements.filter(m => new Date(m.date) >= weekAgo);
  };

  const todayMovements = getTodayMovements();
  const weekMovements = getWeekMovements();
  const todayEntries = todayMovements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.amount, 0);
  const todayExits = todayMovements.filter(m => m.type === 'salida').reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Control del Tanque Principal
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de inventario de CO2 líquido
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowRemoveForm(true)}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              <Minus className="h-4 w-4 mr-2" />
              Registrar Salida
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Entrada
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {isCriticalTank && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-red-800 font-semibold">Alerta Crítica: Nivel Muy Bajo</h3>
                <p className="text-red-700">
                  El tanque tiene solo {tankLevel}kg ({tankPercentage.toFixed(1)}%). Se requiere recarga inmediata.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLowTank && !isCriticalTank && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <h3 className="text-yellow-800 font-semibold">Aviso: Nivel Bajo</h3>
                <p className="text-yellow-700">
                  El tanque tiene {tankLevel}kg ({tankPercentage.toFixed(1)}%). Considere programar recarga.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tank Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="h-5 w-5 mr-2" />
                Estado del Tanque Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {tankLevel.toLocaleString()}kg
                  </div>
                  <div className="text-gray-600">
                    de {tankCapacity.toLocaleString()}kg disponibles
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nivel actual</span>
                    <span className={`font-semibold ${isCriticalTank ? 'text-red-600' : isLowTank ? 'text-yellow-600' : 'text-green-600'}`}>
                      {tankPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={tankPercentage} 
                    className={`h-6 ${isCriticalTank ? 'bg-red-200' : isLowTank ? 'bg-yellow-200' : 'bg-green-200'}`}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0kg</span>
                    <span>Crítico (15%)</span>
                    <span>Bajo (25%)</span>
                    <span>{tankCapacity}kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(tankCapacity - tankLevel).toLocaleString()}kg
                    </div>
                    <div className="text-sm text-gray-600">Capacidad disponible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((tankLevel / 50) * 10) / 10}
                    </div>
                    <div className="text-sm text-gray-600">Llenados estimados restantes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Resumen de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-green-800">Hoy - Entradas</div>
                    <div className="text-sm text-green-600">CO2 agregado</div>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    +{todayEntries}kg
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-red-800">Hoy - Salidas</div>
                    <div className="text-sm text-red-600">CO2 utilizado</div>
                  </div>
                  <div className="text-xl font-bold text-red-700">
                    -{todayExits}kg
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-blue-800">Balance Hoy</div>
                    <div className="text-sm text-blue-600">Diferencia neta</div>
                  </div>
                  <div className={`text-xl font-bold ${(todayEntries - todayExits) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {(todayEntries - todayExits) >= 0 ? '+' : ''}{todayEntries - todayExits}kg
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600 text-center">
                    {weekMovements.length} movimientos esta semana
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add CO2 Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Registrar Entrada de CO2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad (kg)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ejemplo: 800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Operador</label>
                  <Input
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="Nombre del operador"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Proveedor (opcional)</label>
                  <Input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del movimiento"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddCO2} className="flex-1">
                    Registrar Entrada
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Remove CO2 Form Modal */}
        {showRemoveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <Minus className="h-5 w-5 mr-2" />
                  Registrar Salida de CO2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad (kg)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ejemplo: 50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Operador</label>
                  <Input
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="Nombre del operador"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del movimiento"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleRemoveCO2} 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Registrar Salida
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRemoveForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Historial de Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movements.slice(0, 10).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {movement.type === 'entrada' ? 
                        <TrendingUp className={`h-4 w-4 text-green-600`} /> :
                        <TrendingDown className={`h-4 w-4 text-red-600`} />
                      }
                    </div>
                    <div>
                      <div className="font-medium">
                        {movement.type === 'entrada' ? '+' : '-'}{movement.amount}kg
                      </div>
                      <div className="text-sm text-gray-600">
                        {movement.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.date).toLocaleString('es-ES')} - {movement.operator}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={movement.type === 'entrada' ? 
                      'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }
                  >
                    {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tank;
