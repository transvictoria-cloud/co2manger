
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  Download, 
  BarChart3,
  TrendingUp,
  Package,
  Wrench,
  Fuel,
  ArrowRightLeft
} from 'lucide-react';
import { useReportsData, useExportExcel } from '@/hooks/useReports';
import { useCylinders } from '@/hooks/useCylinders';
import { useTankInventory } from '@/hooks/useTank';

const Reports = () => {
  const { data: reportsData, isLoading } = useReportsData();
  const { data: cylinders } = useCylinders();
  const { data: tankInventory } = useTankInventory();
  const { exportToExcel } = useExportExcel();

  if (isLoading) {
    return <div className="p-6">Cargando datos para reportes...</div>;
  }

  const stats = {
    totalCylinders: cylinders?.length || 0,
    fullCylinders: cylinders?.filter(c => c.state === 'full').length || 0,
    emptyCylinders: cylinders?.filter(c => c.state === 'empty').length || 0,
    maintenanceRecords: reportsData?.maintenance?.length || 0,
    fillings: reportsData?.fillings?.length || 0,
    transfers: reportsData?.transfers?.length || 0,
    tankLevel: tankInventory?.current_level_kg || 0,
    tankCapacity: tankInventory?.capacity_kg || 0,
  };

  const fillPercentage = (stats.tankLevel / stats.tankCapacity) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
            <p className="text-gray-600 mt-1">Análisis de datos y exportación de reportes</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalCylinders}</div>
                  <div className="text-sm text-gray-600">Total Cilindros</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.fullCylinders}</div>
                  <div className="text-sm text-gray-600">Cilindros Llenos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.maintenanceRecords}</div>
                  <div className="text-sm text-gray-600">Mantenimientos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Fuel className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{fillPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Nivel Tanque</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tank Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Tanque Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Nivel Actual</span>
                <span className="text-sm text-gray-600">{stats.tankLevel} / {stats.tankCapacity} kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
              <div className="text-center text-sm text-gray-600">
                {fillPercentage.toFixed(1)}% de capacidad utilizada
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cylinder Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Cilindros por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Llenos</span>
                <span className="text-sm text-green-600">{stats.fullCylinders} ({((stats.fullCylinders / stats.totalCylinders) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(stats.fullCylinders / stats.totalCylinders) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Vacíos</span>
                <span className="text-sm text-red-600">{stats.emptyCylinders} ({((stats.emptyCylinders / stats.totalCylinders) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(stats.emptyCylinders / stats.totalCylinders) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={() => exportToExcel('all')} 
                className="flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Reporte Completo
              </Button>
              <Button 
                onClick={() => exportToExcel('cylinders')} 
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Package className="h-4 w-4" />
                Solo Cilindros
              </Button>
              <Button 
                onClick={() => exportToExcel('maintenance')} 
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Wrench className="h-4 w-4" />
                Mantenimiento
              </Button>
              <Button 
                onClick={() => exportToExcel('fillings')} 
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Fuel className="h-4 w-4" />
                Llenados
              </Button>
              <Button 
                onClick={() => exportToExcel('transfers')} 
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Traslados
              </Button>
              <Button 
                onClick={() => exportToExcel('tank')} 
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Movimientos Tanque
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Llenados</span>
                  <span className="text-sm text-blue-600">{stats.fillings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Traslados</span>
                  <span className="text-sm text-purple-600">{stats.transfers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Registros Mantenimiento</span>
                  <span className="text-sm text-orange-600">{stats.maintenanceRecords}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estado de Operaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sistema</span>
                  <span className="text-sm text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Operativo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Base de Datos</span>
                  <span className="text-sm text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Conectada
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Última Actualización</span>
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
