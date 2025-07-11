
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRightLeft, 
  MapPin, 
  QrCode, 
  Clock,
  User,
  Package,
  TrendingRight
} from 'lucide-react';

interface Transfer {
  id: string;
  cylinderId: string;
  serialNumber: string;
  fromLocation: 'dispatch' | 'filling_station' | 'maintenance';
  toLocation: 'dispatch' | 'filling_station' | 'maintenance';
  operator: string;
  date: string;
  notes?: string;
}

const Transfers = () => {
  const { toast } = useToast();
  const [cylinderSerial, setCylinderSerial] = useState('');
  const [fromLocation, setFromLocation] = useState<'dispatch' | 'filling_station' | 'maintenance'>('filling_station');
  const [toLocation, setToLocation] = useState<'dispatch' | 'filling_station' | 'maintenance'>('dispatch');
  const [operator, setOperator] = useState('');
  const [notes, setNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: '1',
      cylinderId: 'cyl-001',
      serialNumber: 'CYL-001',
      fromLocation: 'filling_station',
      toLocation: 'dispatch',
      operator: 'María González',
      date: '2024-01-11T14:30:00',
      notes: 'Cilindro lleno listo para entrega'
    },
    {
      id: '2',
      cylinderId: 'cyl-002',
      serialNumber: 'CYL-002',
      fromLocation: 'dispatch',
      toLocation: 'filling_station',
      operator: 'Juan Pérez',
      date: '2024-01-11T11:15:00',
      notes: 'Cilindro vacío para rellenado'
    },
    {
      id: '3',
      cylinderId: 'cyl-003',
      serialNumber: 'CYL-003',
      fromLocation: 'filling_station',
      toLocation: 'maintenance',
      operator: 'Carlos Rodríguez',
      date: '2024-01-11T09:00:00',
      notes: 'Válvula requiere inspección'
    }
  ]);

  const locationNames = {
    dispatch: 'Despacho',
    filling_station: 'Estación de Llenado',
    maintenance: 'Mantenimiento'
  };

  const locationColors = {
    dispatch: 'bg-purple-100 text-purple-800',
    filling_station: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800'
  };

  const handleScanQR = () => {
    setIsScanning(true);
    setTimeout(() => {
      setCylinderSerial('CYL-005');
      setIsScanning(false);
      toast({
        title: "Cilindro escaneado",
        description: "Cilindro CYL-005 identificado correctamente",
      });
    }, 2000);
  };

  const handleSubmitTransfer = () => {
    if (!cylinderSerial || !operator || fromLocation === toLocation) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos y seleccione ubicaciones diferentes",
        variant: "destructive"
      });
      return;
    }

    const newTransfer: Transfer = {
      id: Date.now().toString(),
      cylinderId: cylinderSerial.toLowerCase(),
      serialNumber: cylinderSerial,
      fromLocation,
      toLocation,
      operator,
      date: new Date().toISOString(),
      notes: notes || undefined
    };

    setTransfers([newTransfer, ...transfers]);

    // Reset form
    setCylinderSerial('');
    setOperator('');
    setNotes('');

    toast({
      title: "Traslado registrado",
      description: `Cilindro ${cylinderSerial} trasladado de ${locationNames[fromLocation]} a ${locationNames[toLocation]}`,
    });
  };

  const todayTransfers = transfers.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.date).toDateString() === today;
  });

  const transferStats = {
    toDispatch: todayTransfers.filter(t => t.toLocation === 'dispatch').length,
    toStation: todayTransfers.filter(t => t.toLocation === 'filling_station').length,
    toMaintenance: todayTransfers.filter(t => t.toLocation === 'maintenance').length,
    total: todayTransfers.length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Control de Traslados
            </h1>
            <p className="text-gray-600 mt-1">
              Registro de movimientos internos de cilindros
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-lg font-bold text-blue-600">{transferStats.total}</div>
              <div className="text-xs text-gray-600">Total hoy</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-lg font-bold text-purple-600">{transferStats.toDispatch}</div>
              <div className="text-xs text-gray-600">A Despacho</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-lg font-bold text-blue-600">{transferStats.toStation}</div>
              <div className="text-xs text-gray-600">A Estación</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-lg font-bold text-orange-600">{transferStats.toMaintenance}</div>
              <div className="text-xs text-gray-600">A Mantenim.</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRightLeft className="h-5 w-5 mr-2" />
                Nuevo Traslado
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
              </div>

              {/* Locations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Origen</label>
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dispatch">Despacho</option>
                    <option value="filling_station">Estación de Llenado</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Destino</label>
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dispatch">Despacho</option>
                    <option value="filling_station">Estación de Llenado</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
              </div>

              {/* Transfer Preview */}
              {fromLocation !== toLocation && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-3">
                    <Badge className={locationColors[fromLocation]}>
                      {locationNames[fromLocation]}
                    </Badge>
                    <TrendingRight className="h-4 w-4 text-blue-600" />
                    <Badge className={locationColors[toLocation]}>
                      {locationNames[toLocation]}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Operator */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Operador</label>
                <Input
                  placeholder="Nombre del operador"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Notas (opcional)</label>
                <Input
                  placeholder="Observaciones del traslado..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSubmitTransfer}
                className="w-full"
                size="lg"
                disabled={fromLocation === toLocation}
              >
                Registrar Traslado
              </Button>

              {fromLocation === toLocation && (
                <p className="text-sm text-red-600 text-center">
                  Las ubicaciones de origen y destino deben ser diferentes
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Traslados Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transfers.slice(0, 8).map((transfer) => (
                  <div key={transfer.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{transfer.serialNumber}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transfer.date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Badge variant="outline" className={locationColors[transfer.fromLocation]}>
                        {locationNames[transfer.fromLocation]}
                      </Badge>
                      <TrendingRight className="h-3 w-3 text-gray-400" />
                      <Badge variant="outline" className={locationColors[transfer.toLocation]}>
                        {locationNames[transfer.toLocation]}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {transfer.operator}
                      </div>
                    </div>

                    {transfer.notes && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                        {transfer.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Flow Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Flujo de Traslados del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-8">
              {/* Despacho */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <div className="font-medium text-purple-800">Despacho</div>
                <div className="text-2xl font-bold text-purple-600">
                  {transferStats.toDispatch}
                </div>
                <div className="text-xs text-gray-600">entraron hoy</div>
              </div>

              {/* Arrows */}
              <div className="flex items-center space-x-4">
                <TrendingRight className="h-6 w-6 text-gray-400" />
                <TrendingRight className="h-6 w-6 text-gray-400 rotate-180" />
              </div>

              {/* Estación de Llenado */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="font-medium text-blue-800">Estación</div>
                <div className="text-2xl font-bold text-blue-600">
                  {transferStats.toStation}
                </div>
                <div className="text-xs text-gray-600">entraron hoy</div>
              </div>

              {/* Arrows */}
              <div className="flex items-center space-x-4">
                <TrendingRight className="h-6 w-6 text-gray-400" />
                <TrendingRight className="h-6 w-6 text-gray-400 rotate-180" />
              </div>

              {/* Mantenimiento */}
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="font-medium text-orange-800">Mantenimiento</div>
                <div className="text-2xl font-bold text-orange-600">
                  {transferStats.toMaintenance}
                </div>
                <div className="text-xs text-gray-600">entraron hoy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transfers;
