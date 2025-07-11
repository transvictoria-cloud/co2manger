
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  QrCode, 
  Package, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Gauge
} from 'lucide-react';

interface FillingRecord {
  id: string;
  cylinderId: string;
  serialNumber: string;
  operator: string;
  amount: number;
  date: string;
  status: 'approved' | 'rejected';
  reason?: string;
}

const Filling = () => {
  const { toast } = useToast();
  const [cylinderSerial, setCylinderSerial] = useState('');
  const [operator, setOperator] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'approved' | 'rejected'>('approved');
  const [reason, setReason] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const [recentFillings, setRecentFillings] = useState<FillingRecord[]>([
    {
      id: '1',
      cylinderId: 'cyl-001',
      serialNumber: 'CYL-001',
      operator: 'Juan Pérez',
      amount: 10,
      date: '2024-01-11T10:30:00',
      status: 'approved'
    },
    {
      id: '2',
      cylinderId: 'cyl-002',
      serialNumber: 'CYL-002',
      operator: 'María González',
      amount: 5,
      date: '2024-01-11T09:15:00',
      status: 'approved'
    },
    {
      id: '3',
      cylinderId: 'cyl-003',
      serialNumber: 'CYL-003',
      operator: 'Carlos Rodríguez',
      amount: 0,
      date: '2024-01-11T08:45:00',
      status: 'rejected',
      reason: 'Válvula defectuosa'
    }
  ]);

  const handleScanQR = () => {
    setIsScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setCylinderSerial('CYL-004');
      setIsScanning(false);
      toast({
        title: "Cilindro escaneado",
        description: "Cilindro CYL-004 identificado correctamente",
      });
    }, 2000);
  };

  const handleSubmitFilling = () => {
    if (!cylinderSerial || !operator || (status === 'approved' && !amount)) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const newFilling: FillingRecord = {
      id: Date.now().toString(),
      cylinderId: cylinderSerial.toLowerCase(),
      serialNumber: cylinderSerial,
      operator,
      amount: status === 'approved' ? parseFloat(amount) : 0,
      date: new Date().toISOString(),
      status,
      reason: status === 'rejected' ? reason : undefined
    };

    setRecentFillings([newFilling, ...recentFillings]);

    // Reset form
    setCylinderSerial('');
    setOperator('');
    setAmount('');
    setStatus('approved');
    setReason('');

    toast({
      title: "Llenado registrado",
      description: `${status === 'approved' ? 'Llenado aprobado' : 'Llenado rechazado'} para cilindro ${cylinderSerial}`,
    });
  };

  const todayFillings = recentFillings.filter(f => {
    const today = new Date().toDateString();
    return new Date(f.date).toDateString() === today;
  });

  const approvedToday = todayFillings.filter(f => f.status === 'approved').length;
  const rejectedToday = todayFillings.filter(f => f.status === 'rejected').length;
  const totalCO2Today = todayFillings.filter(f => f.status === 'approved').reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Registro de Llenados
            </h1>
            <p className="text-gray-600 mt-1">
              Control de llenado de cilindros de CO2
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-xl font-bold text-green-600">{approvedToday}</div>
              <div className="text-xs text-gray-600">Aprobados hoy</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-xl font-bold text-red-600">{rejectedToday}</div>
              <div className="text-xs text-gray-600">Rechazados hoy</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-xl font-bold text-blue-600">{totalCO2Today}kg</div>
              <div className="text-xs text-gray-600">CO2 total hoy</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filling Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Nuevo Registro de Llenado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cylinder Identification */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Cilindro</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Número de serie (ej: CYL-001)"
                    value={cylinderSerial}
                    onChange={(e) => setCylinderSerial(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleScanQR}
                    disabled={isScanning}
                    className="px-3"
                  >
                    {isScanning ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isScanning && (
                  <p className="text-sm text-blue-600">Escaneando código QR...</p>
                )}
              </div>

              {/* Operator */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Operador</label>
                <Input
                  placeholder="Nombre del operador"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                />
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Estado del llenado</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="approved"
                      checked={status === 'approved'}
                      onChange={(e) => setStatus(e.target.value as 'approved')}
                      className="text-green-600"
                    />
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Aprobado</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="rejected"
                      checked={status === 'rejected'}
                      onChange={(e) => setStatus(e.target.value as 'rejected')}
                      className="text-red-600"
                    />
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Rechazado</span>
                  </label>
                </div>
              </div>

              {/* Amount (only for approved) */}
              {status === 'approved' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Cantidad de CO2 (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ejemplo: 10.5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              )}

              {/* Reason (only for rejected) */}
              {status === 'rejected' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Motivo del rechazo</label>
                  <Input
                    placeholder="Ejemplo: Válvula defectuosa, cilindro dañado..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              )}

              <Button 
                onClick={handleSubmitFilling}
                className="w-full"
                size="lg"
              >
                {status === 'approved' ? 'Confirmar Llenado' : 'Registrar Rechazo'}
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
                {recentFillings.slice(0, 8).map((filling) => (
                  <div 
                    key={filling.id} 
                    className={`p-3 rounded-lg border-l-4 ${
                      filling.status === 'approved' 
                        ? 'border-l-green-500 bg-green-50' 
                        : 'border-l-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {filling.status === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">{filling.serialNumber}</div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {filling.operator}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {filling.status === 'approved' ? (
                          <div className="font-bold text-green-700 flex items-center">
                            <Gauge className="h-4 w-4 mr-1" />
                            {filling.amount}kg
                          </div>
                        ) : (
                          <Badge variant="destructive">Rechazado</Badge>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(filling.date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    {filling.reason && (
                      <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                        <strong>Motivo:</strong> {filling.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{approvedToday}</div>
                <div className="text-sm text-green-600">Llenados Aprobados</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{rejectedToday}</div>
                <div className="text-sm text-red-600">Llenados Rechazados</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{totalCO2Today}kg</div>
                <div className="text-sm text-blue-600">CO2 Total Llenado</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">
                  {approvedToday > 0 ? (totalCO2Today / approvedToday).toFixed(1) : 0}kg
                </div>
                <div className="text-sm text-gray-600">Promedio por Cilindro</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Filling;
