
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gauge, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  MapPin,
  Plus,
  Search,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  tankLevel: number;
  tankCapacity: number;
  cylindersTotal: number;
  cylindersFull: number;
  cylindersEmpty: number;
  cylindersInFilling: number;
  cylindersAtDispatch: number;
  cylindersAtStation: number;
  dailyFillings: number;
  weeklyFillings: number;
  maintenanceAlerts: number;
  lowTankAlert: boolean;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    tankLevel: 2400,
    tankCapacity: 3200,
    cylindersTotal: 156,
    cylindersFull: 42,
    cylindersEmpty: 38,
    cylindersInFilling: 4,
    cylindersAtDispatch: 65,
    cylindersAtStation: 91,
    dailyFillings: 18,
    weeklyFillings: 142,
    maintenanceAlerts: 3,
    lowTankAlert: false
  });

  const tankPercentage = (stats.tankLevel / stats.tankCapacity) * 100;
  const isLowTank = tankPercentage < 25;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Cilindros CO2
            </h1>
            <p className="text-gray-600 mt-1">
              Control de inventario y logística interna
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/cylinders/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cilindro
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/reports">
                <Download className="h-4 w-4 mr-2" />
                Reportes
              </Link>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {isLowTank && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-red-800 font-semibold">Alerta: Nivel Bajo de CO2</h3>
                <p className="text-red-700">
                  El tanque principal tiene solo {stats.tankLevel}kg ({tankPercentage.toFixed(1)}%) de CO2.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tank Status */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Gauge className="h-5 w-5 mr-2" />
                Tanque Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{stats.tankLevel}kg</span>
                    <span>{stats.tankCapacity}kg</span>
                  </div>
                  <Progress 
                    value={tankPercentage} 
                    className="h-2 bg-blue-800"
                  />
                </div>
                <p className="text-blue-100 text-sm">
                  {tankPercentage.toFixed(1)}% disponible
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cylinder Inventory */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2 text-gray-600" />
                Inventario de Cilindros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.cylindersTotal}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Llenos:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {stats.cylindersFull}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vacíos:</span>
                    <Badge variant="outline">
                      {stats.cylindersEmpty}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">En llenado:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.cylindersInFilling}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2 text-gray-600" />
                Ubicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Despacho:</span>
                  <span className="font-semibold text-lg">{stats.cylindersAtDispatch}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estación:</span>
                  <span className="font-semibold text-lg">{stats.cylindersAtStation}</span>
                </div>
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/transfers">
                      Ver Traslados
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
                Producción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hoy:</span>
                  <span className="font-semibold text-lg text-green-600">
                    {stats.dailyFillings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Esta semana:</span>
                  <span className="font-semibold text-lg">
                    {stats.weeklyFillings}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/filling">
                      Registrar Llenado
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
            <Link to="/cylinders">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Buscar Cilindros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Buscar y gestionar cilindros por número de serie, estado o ubicación.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
            <Link to="/tank">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Control de Tanque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Registrar entradas y salidas de CO2 del tanque principal.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
            <Link to="/maintenance">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Mantenimiento
                  {stats.maintenanceAlerts > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats.maintenanceAlerts}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Cilindros próximos a prueba hidrostática y mantenimiento.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Cilindro CYL-001 llenado</p>
                    <p className="text-sm text-gray-600">Operador: Juan Pérez - 10:30 AM</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Completado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Traslado: Estación → Despacho</p>
                    <p className="text-sm text-gray-600">5 cilindros - 09:45 AM</p>
                  </div>
                </div>
                <Badge variant="outline">Traslado</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Entrada de CO2 al tanque</p>
                    <p className="text-sm text-gray-600">800kg agregados - 08:00 AM</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Recarga</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
