
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Droplets, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';
import { useTankInventory } from '@/hooks/useTank';
import { useCylinders } from '@/hooks/useCylinders';
import { useFillings } from '@/hooks/useFillings';
import { useTransfers } from '@/hooks/useTransfers';

const Dashboard = () => {
  const { data: tankData, isLoading: tankLoading } = useTankInventory();
  const { data: cylinders, isLoading: cylindersLoading } = useCylinders();
  const { data: fillings, isLoading: fillingsLoading } = useFillings();
  const { data: transfers, isLoading: transfersLoading } = useTransfers();

  if (tankLoading || cylindersLoading || fillingsLoading || transfersLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  const tankLevel = tankData?.current_level_kg || 0;
  const tankCapacity = tankData?.capacity_kg || 3200;
  const tankPercentage = (tankLevel / tankCapacity) * 100;

  const cylinderStats = {
    total: cylinders?.length || 0,
    full: cylinders?.filter(c => c.state === 'full').length || 0,
    empty: cylinders?.filter(c => c.state === 'empty').length || 0,
    maintenance: cylinders?.filter(c => c.state === 'maintenance').length || 0,
  };

  const today = new Date().toDateString();
  const todayFillings = fillings?.filter(f => 
    new Date(f.date_time || '').toDateString() === today && f.status === 'approved'
  ).length || 0;
  
  const todayTransfers = transfers?.filter(t => 
    new Date(t.date_time || '').toDateString() === today
  ).length || 0;

  const recentActivities = [
    ...(fillings?.slice(0, 2).map(f => ({
      id: f.id,
      type: 'filling',
      description: `Cilindro llenado - ${f.amount_kg}kg`,
      operator: f.operator,
      time: new Date(f.date_time || '').toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: f.status === 'approved' ? 'completed' : 'warning'
    })) || []),
    ...(transfers?.slice(0, 2).map(t => ({
      id: t.id,
      type: 'transfer',
      description: `Traslado: ${t.from_location} → ${t.to_location}`,
      operator: t.operator,
      time: new Date(t.date_time || '').toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed'
    })) || [])
  ].slice(0, 4);

  const alerts = [];
  if (tankPercentage < 25) {
    alerts.push({
      id: 1,
      type: 'warning',
      message: `Tanque principal al ${tankPercentage.toFixed(1)}% de capacidad`,
      priority: 'high'
    });
  }

  const cylindersNeedingMaintenance = cylinders?.filter(c => {
    if (!c.next_hydrostatic_test) return false;
    const testDate = new Date(c.next_hydrostatic_test);
    const today = new Date();
    const monthsUntilTest = (testDate.getTime() - today.getTime()) / (1000 * 3600 * 24 * 30);
    return monthsUntilTest <= 3;
  }).length || 0;

  if (cylindersNeedingMaintenance > 0) {
    alerts.push({
      id: 2,
      type: 'maintenance',
      message: `${cylindersNeedingMaintenance} cilindros requieren prueba hidrostática pronto`,
      priority: 'medium'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - Gestión de CO2
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Ver Reportes
            </Button>
          </div>
        </div>

        {/* Tank Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Estado del Tanque Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Nivel Actual</span>
                  <span className="text-lg font-bold text-blue-600">{tankLevel} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      tankPercentage > 80 ? 'bg-green-500' : 
                      tankPercentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${tankPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {tankPercentage.toFixed(1)}% de capacidad
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tankCapacity - tankLevel} kg</div>
                <div className="text-sm text-gray-600">Disponible para llenado</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor((tankLevel / 10) * 0.8)}
                </div>
                <div className="text-sm text-gray-600">Cilindros estimados (10kg)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{cylinderStats.total}</div>
              <div className="text-xs text-gray-600">Total Cilindros</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{cylinderStats.full}</div>
              <div className="text-xs text-gray-600">Llenos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{cylinderStats.empty}</div>
              <div className="text-xs text-gray-600">Vacíos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{cylinderStats.maintenance}</div>
              <div className="text-xs text-gray-600">Mantenimiento</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{todayFillings}</div>
              <div className="text-xs text-gray-600">Llenados Hoy</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <div className="text-2xl font-bold text-indigo-600">{todayTransfers}</div>
              <div className="text-xs text-gray-600">Traslados Hoy</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' : 
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-600">
                        {activity.operator} • {activity.time}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">No hay actividad reciente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                Alertas y Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length > 0 ? alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.priority === 'high' ? 'border-red-500 bg-red-50' :
                    alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </div>
                      <Badge variant={
                        alert.priority === 'high' ? 'destructive' :
                        alert.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {alert.priority === 'high' ? 'Alta' :
                         alert.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">No hay alertas activas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Package className="h-6 w-6" />
                <span className="text-sm">Nuevo Llenado</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Registrar Traslado</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Droplets className="h-6 w-6" />
                <span className="text-sm">Actualizar Tanque</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Activity className="h-6 w-6" />
                <span className="text-sm">Ver Reportes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
