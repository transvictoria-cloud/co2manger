
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCylinders, useUpdateCylinder, useCreateCylinder } from '@/hooks/useCylinders';
import { toast } from 'sonner';

const Cylinders = () => {
  const { data: cylinders, isLoading } = useCylinders();
  const updateCylinder = useUpdateCylinder();
  const createCylinder = useCreateCylinder();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [editingCylinder, setEditingCylinder] = useState<any>(null);
  const [newCylinder, setNewCylinder] = useState({
    serial_number: '',
    capacity_kg: '',
    valve_type: 'standard' as const,
    manufacture_date: '',
    last_hydrostatic_test: '',
    next_hydrostatic_test: '',
  });

  if (isLoading) {
    return <div className="p-6">Cargando cilindros...</div>;
  }

  const filteredCylinders = cylinders?.filter(cylinder => {
    const matchesSearch = cylinder.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'all' || cylinder.state === stateFilter;
    const matchesLocation = locationFilter === 'all' || cylinder.location === locationFilter;
    
    return matchesSearch && matchesState && matchesLocation;
  }) || [];

  const getStateColor = (state: string) => {
    switch (state) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'empty': return 'bg-red-100 text-red-800';
      case 'filling': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'out_of_service': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'full': return 'Lleno';
      case 'empty': return 'Vacío';
      case 'filling': return 'Llenando';
      case 'maintenance': return 'Mantenimiento';
      case 'out_of_service': return 'Fuera de Servicio';
      default: return state;
    }
  };

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'dispatch': return 'Despacho';
      case 'filling_station': return 'Estación de Llenado';
      case 'maintenance': return 'Mantenimiento';
      case 'out_of_service': return 'Fuera de Servicio';
      default: return location;
    }
  };

  const handleUpdateCylinder = (cylinder: any, updates: any) => {
    updateCylinder.mutate({ id: cylinder.id, updates });
    setEditingCylinder(null);
  };

  const handleCreateCylinder = () => {
    createCylinder.mutate({
      ...newCylinder,
      capacity_kg: parseFloat(newCylinder.capacity_kg),
      manufacture_date: newCylinder.manufacture_date || null,
      last_hydrostatic_test: newCylinder.last_hydrostatic_test || null,
      next_hydrostatic_test: newCylinder.next_hydrostatic_test || null,
      state: 'empty',
      location: 'dispatch',
    });
    setNewCylinder({
      serial_number: '',
      capacity_kg: '',
      valve_type: 'standard',
      manufacture_date: '',
      last_hydrostatic_test: '',
      next_hydrostatic_test: '',
    });
  };

  // Group cylinders by capacity and state
  const getStatsByCapacity = () => {
    if (!cylinders) return {};
    
    const capacities = [...new Set(cylinders.map(c => c.capacity_kg))].sort((a, b) => a - b);
    const statsByCapacity: Record<number, { total: number; full: number; empty: number }> = {};
    
    capacities.forEach(capacity => {
      const cylindersOfCapacity = cylinders.filter(c => c.capacity_kg === capacity);
      statsByCapacity[capacity] = {
        total: cylindersOfCapacity.length,
        full: cylindersOfCapacity.filter(c => c.state === 'full').length,
        empty: cylindersOfCapacity.filter(c => c.state === 'empty').length,
      };
    });
    
    return statsByCapacity;
  };

  const statsByCapacity = getStatsByCapacity();
  
  const stats = {
    total: cylinders?.length || 0,
    full: cylinders?.filter(c => c.state === 'full').length || 0,
    empty: cylinders?.filter(c => c.state === 'empty').length || 0,
    maintenance: cylinders?.filter(c => c.state === 'maintenance').length || 0,
    byCapacity: statsByCapacity,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Cilindros</h1>
            <p className="text-gray-600 mt-1">Control de inventario y estado de cilindros</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cilindro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Cilindro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Número de Serie</Label>
                  <Input
                    value={newCylinder.serial_number}
                    onChange={(e) => setNewCylinder({...newCylinder, serial_number: e.target.value})}
                    placeholder="CYL-001"
                  />
                </div>
                <div>
                  <Label>Capacidad (kg)</Label>
                  <Input
                    type="number"
                    value={newCylinder.capacity_kg}
                    onChange={(e) => setNewCylinder({...newCylinder, capacity_kg: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label>Tipo de Válvula</Label>
                  <Select 
                    value={newCylinder.valve_type} 
                    onValueChange={(value) => setNewCylinder({...newCylinder, valve_type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Estándar</SelectItem>
                      <SelectItem value="safety">Seguridad</SelectItem>
                      <SelectItem value="pressure_relief">Alivio de Presión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha de Fabricación</Label>
                  <Input
                    type="date"
                    value={newCylinder.manufacture_date}
                    onChange={(e) => setNewCylinder({...newCylinder, manufacture_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Última Prueba Hidrostática</Label>
                  <Input
                    type="date"
                    value={newCylinder.last_hydrostatic_test}
                    onChange={(e) => setNewCylinder({...newCylinder, last_hydrostatic_test: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Próxima Prueba Hidrostática</Label>
                  <Input
                    type="date"
                    value={newCylinder.next_hydrostatic_test}
                    onChange={(e) => setNewCylinder({...newCylinder, next_hydrostatic_test: e.target.value})}
                  />
                </div>
                <Button onClick={handleCreateCylinder} className="w-full">
                  Crear Cilindro
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Cilindros</div>
              <div className="text-xs text-gray-500 mt-1">
                {Object.entries(stats.byCapacity).map(([capacity, data]) => (
                  <div key={capacity}>{capacity}kg: {data.total}</div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.full}</div>
              <div className="text-sm text-gray-600">Cilindros Llenos</div>
              <div className="text-xs text-gray-500 mt-1">
                {Object.entries(stats.byCapacity).map(([capacity, data]) => (
                  <div key={capacity}>{capacity}kg: {data.full}</div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.empty}</div>
              <div className="text-sm text-gray-600">Cilindros Vacíos</div>
              <div className="text-xs text-gray-500 mt-1">
                {Object.entries(stats.byCapacity).map(([capacity, data]) => (
                  <div key={capacity}>{capacity}kg: {data.empty}</div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
              <div className="text-sm text-gray-600">Mantenimiento</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por número de serie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="full">Llenos</SelectItem>
                  <SelectItem value="empty">Vacíos</SelectItem>
                  <SelectItem value="filling">Llenando</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  <SelectItem value="dispatch">Despacho</SelectItem>
                  <SelectItem value="filling_station">Estación de Llenado</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cylinders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cilindros</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Serie</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Tipo de Válvula</TableHead>
                  <TableHead>Próxima Prueba</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCylinders.map((cylinder) => {
                  const needsMaintenance = cylinder.next_hydrostatic_test && 
                    new Date(cylinder.next_hydrostatic_test) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <TableRow key={cylinder.id}>
                      <TableCell className="font-medium">{cylinder.serial_number}</TableCell>
                      <TableCell>{cylinder.capacity_kg} kg</TableCell>
                      <TableCell>
                        <Badge className={getStateColor(cylinder.state)}>
                          {getStateLabel(cylinder.state)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getLocationLabel(cylinder.location)}</TableCell>
                      <TableCell>{cylinder.valve_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {cylinder.next_hydrostatic_test ? 
                              new Date(cylinder.next_hydrostatic_test).toLocaleDateString('es-ES') : 
                              'No registrada'
                            }
                          </span>
                          {needsMaintenance && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingCylinder(cylinder)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Cilindro</DialogTitle>
                            </DialogHeader>
                            {editingCylinder && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Estado</Label>
                                  <Select 
                                    value={editingCylinder.state} 
                                    onValueChange={(value) => setEditingCylinder({...editingCylinder, state: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="empty">Vacío</SelectItem>
                                      <SelectItem value="full">Lleno</SelectItem>
                                      <SelectItem value="filling">Llenando</SelectItem>
                                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                      <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Ubicación</Label>
                                  <Select 
                                    value={editingCylinder.location} 
                                    onValueChange={(value) => setEditingCylinder({...editingCylinder, location: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="dispatch">Despacho</SelectItem>
                                      <SelectItem value="filling_station">Estación de Llenado</SelectItem>
                                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                      <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  onClick={() => handleUpdateCylinder(cylinder, {
                                    state: editingCylinder.state,
                                    location: editingCylinder.location
                                  })} 
                                  className="w-full"
                                >
                                  Actualizar
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cylinders;
