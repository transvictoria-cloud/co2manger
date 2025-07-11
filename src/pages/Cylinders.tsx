
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Package, 
  Calendar,
  MapPin,
  Edit,
  Eye,
  QrCode
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Cylinder {
  id: string;
  serialNumber: string;
  capacity: number;
  valveType: string;
  manufacturingDate: string;
  lastHydroTest: string;
  nextHydroTest: string;
  status: 'empty' | 'full' | 'filling' | 'maintenance' | 'out_of_service';
  location: 'dispatch' | 'filling_station' | 'maintenance' | 'out_of_service';
  lastFilling?: string;
  fillCount: number;
}

const Cylinders = () => {
  const [cylinders, setCylinders] = useState<Cylinder[]>([
    {
      id: '1',
      serialNumber: 'CYL-001',
      capacity: 10,
      valveType: 'CGA-320',
      manufacturingDate: '2020-03-15',
      lastHydroTest: '2023-03-15',
      nextHydroTest: '2028-03-15',
      status: 'full',
      location: 'dispatch',
      lastFilling: '2024-01-10',
      fillCount: 145
    },
    {
      id: '2',
      serialNumber: 'CYL-002',
      capacity: 5,
      valveType: 'CGA-320',
      manufacturingDate: '2019-08-22',
      lastHydroTest: '2022-08-22',
      nextHydroTest: '2027-08-22',
      status: 'empty',
      location: 'filling_station',
      lastFilling: '2024-01-08',
      fillCount: 203
    },
    {
      id: '3',
      serialNumber: 'CYL-003',
      capacity: 10,
      valveType: 'CGA-320',
      manufacturingDate: '2021-01-10',
      lastHydroTest: '2024-01-10',
      nextHydroTest: '2029-01-10',
      status: 'filling',
      location: 'filling_station',
      lastFilling: '2024-01-09',
      fillCount: 89
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      empty: { label: 'Vacío', className: 'bg-gray-100 text-gray-800' },
      full: { label: 'Lleno', className: 'bg-green-100 text-green-800' },
      filling: { label: 'En Llenado', className: 'bg-yellow-100 text-yellow-800' },
      maintenance: { label: 'Mantenimiento', className: 'bg-blue-100 text-blue-800' },
      out_of_service: { label: 'Fuera de Servicio', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getLocationBadge = (location: string) => {
    const locationConfig = {
      dispatch: { label: 'Despacho', className: 'bg-purple-100 text-purple-800' },
      filling_station: { label: 'Estación de Llenado', className: 'bg-blue-100 text-blue-800' },
      maintenance: { label: 'Mantenimiento', className: 'bg-orange-100 text-orange-800' },
      out_of_service: { label: 'Fuera de Servicio', className: 'bg-red-100 text-red-800' }
    };
    
    const config = locationConfig[location as keyof typeof locationConfig];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const isMaintenanceNeeded = (nextHydroTest: string) => {
    const nextDate = new Date(nextHydroTest);
    const today = new Date();
    const monthsUntilMaintenance = (nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24 * 30);
    return monthsUntilMaintenance <= 6;
  };

  const filteredCylinders = cylinders.filter(cylinder => {
    const matchesSearch = cylinder.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cylinder.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || cylinder.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Cilindros
            </h1>
            <p className="text-gray-600 mt-1">
              Control de inventario y estado de cilindros
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Escanear QR
            </Button>
            <Button asChild>
              <Link to="/cylinders/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cilindro
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número de serie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="empty">Vacío</option>
                <option value="full">Lleno</option>
                <option value="filling">En Llenado</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="out_of_service">Fuera de Servicio</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las ubicaciones</option>
                <option value="dispatch">Despacho</option>
                <option value="filling_station">Estación de Llenado</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="out_of_service">Fuera de Servicio</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{cylinders.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cylinders.filter(c => c.status === 'full').length}
                </div>
                <div className="text-sm text-gray-600">Llenos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {cylinders.filter(c => c.status === 'empty').length}
                </div>
                <div className="text-sm text-gray-600">Vacíos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {cylinders.filter(c => c.status === 'filling').length}
                </div>
                <div className="text-sm text-gray-600">En Llenado</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {cylinders.filter(c => isMaintenanceNeeded(c.nextHydroTest)).length}
                </div>
                <div className="text-sm text-gray-600">Próx. Mant.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cylinders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cilindros ({filteredCylinders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Número de Serie
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Capacidad
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Ubicación
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Último Llenado
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Próx. Mantenimiento
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCylinders.map((cylinder) => (
                    <tr key={cylinder.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {cylinder.serialNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {cylinder.valveType}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{cylinder.capacity}kg</div>
                        <div className="text-sm text-gray-600">
                          {cylinder.fillCount} llenados
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(cylinder.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getLocationBadge(cylinder.location)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {cylinder.lastFilling ? 
                            new Date(cylinder.lastFilling).toLocaleDateString('es-ES') 
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`text-sm ${isMaintenanceNeeded(cylinder.nextHydroTest) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          {new Date(cylinder.nextHydroTest).toLocaleDateString('es-ES')}
                        </div>
                        {isMaintenanceNeeded(cylinder.nextHydroTest) && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Urgente
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/cylinders/${cylinder.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/cylinders/${cylinder.id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cylinders;
