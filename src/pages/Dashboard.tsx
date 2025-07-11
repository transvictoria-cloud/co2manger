
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Droplets, 
  Package, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';

const Dashboard = () => {
  // Sample data - in a real app this would come from your database
  const tankLevel = 2450; // kg
  const tankCapacity = 3200; // kg
  const tankPercentage = (tankLevel / tankCapacity) * 100;

  const stats = {
    totalCylinders: 150,
    fullCylinders: 45,
    emptyCylinders: 32,
    inMaintenance: 8,
    todayFillings: 12,
    todayTransfers: 18
  };

  const recentActivities = [
    {
      id: 1,
      type: 'filling',
      description: 'Cilindro CYL-001 llenado',
      operator: 'María González',
      time: '14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'transfer',
      description: 'CYL-002 trasladado a Despacho',
      operator: 'Juan Pérez',
      time: '14:15',
      status: 'completed'
    },
    {
      id: 3,
      type: 'alert',
      description: 'Nivel de tanque bajo 75%',
      operator: 'Sistema',
      time: '13:45',
      status: 'warning'
    },
    {
      id: 4,
      type: 'filling',
      description: 'Cilindro CYL-003 llenado',
      operator: 'Carlos Rodríguez',
      time: '13:20',
      status: 'completed'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Tanque principal al 76% de capacidad',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'maintenance',
      message: '3 cilindros requieren prueba hidrostática este mes',
      priority: 'high'
    }
  ];

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
                  {Math.floor((tankLevel / 10) * 0.8)} {/* Estimate cylinders possible */}
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
              <div className="text-2xl font-bold text-gray-900">{stats.totalCylinders}</div>
              <div className="text-xs text-gray-600">Total Cilindros</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.fullCylinders}</div>
              <div className="text-xs text-gray-600">Llenos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.emptyCylinders}</div>
              <div className="text-xs text-gray-600">Vacíos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{stats.inMaintenance}</div>
              <div className="text-xs text-gray-600">Mantenimiento</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{stats.todayFillings}</div>
              <div className="text-xs text-gray-600">Llenados Hoy</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <div className="text-2xl font-bold text-indigo-600">{stats.todayTransfers}</div>
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
                {recentActivities.map((activity) => (
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
                ))}
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
                {alerts.map((alert) => (
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
                ))}
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
