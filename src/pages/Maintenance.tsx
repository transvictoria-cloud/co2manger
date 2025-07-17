
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { useMaintenance, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from '@/hooks/useMaintenance';
import { useCylinders } from '@/hooks/useCylinders';
import { useTransfers } from '@/hooks/useTransfers';

const Maintenance = () => {
  const { data: maintenance, isLoading } = useMaintenance();
  const { data: cylinders } = useCylinders();
  const { data: transfers } = useTransfers();
  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [newRecord, setNewRecord] = useState({
    cylinder_id: '',
    maintenance_type: 'inspeccion',
    description: '',
    technician: '',
    date_performed: new Date().toISOString().split('T')[0],
    cost: '',
    parts_replaced: '',
    next_maintenance_date: '',
    status: 'pendiente',
    notes: '',
  });

  if (isLoading) {
    return <div className="p-6">Cargando registros de mantenimiento...</div>;
  }

  const filteredMaintenance = maintenance?.filter(record => {
    const matchesSearch = record.cylinders?.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.maintenance_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preventivo': return 'Preventivo';
      case 'correctivo': return 'Correctivo';
      case 'prueba_hidrostatica': return 'Prueba Hidrostática';
      case 'inspeccion': return 'Inspección';
      case 'reparacion': return 'Reparación';
      default: return type;
    }
  };

  const handleCreateRecord = () => {
    createMaintenance.mutate({
      ...newRecord,
      cost: newRecord.cost ? parseFloat(newRecord.cost) : null,
      next_maintenance_date: newRecord.next_maintenance_date || null,
      parts_replaced: newRecord.parts_replaced || null,
      notes: newRecord.notes || null,
    });
    setNewRecord({
      cylinder_id: '',
      maintenance_type: 'inspeccion',
      description: '',
      technician: '',
      date_performed: new Date().toISOString().split('T')[0],
      cost: '',
      parts_replaced: '',
      next_maintenance_date: '',
      status: 'pendiente',
      notes: '',
    });
  };

  const handleUpdateRecord = () => {
    if (editingRecord) {
      updateMaintenance.mutate({
        id: editingRecord.id,
        updates: {
          ...editingRecord,
          cost: editingRecord.cost ? parseFloat(editingRecord.cost) : null,
        }
      });
      setEditingRecord(null);
    }
  };

  const handleDeleteRecord = (id: string) => {
    deleteMaintenance.mutate(id);
  };

  const stats = {
    total: maintenance?.length || 0,
    completed: maintenance?.filter(r => r.status === 'completado').length || 0,
    pending: maintenance?.filter(r => r.status === 'pendiente').length || 0,
    in_progress: maintenance?.filter(r => r.status === 'en_proceso').length || 0,
    cylinders_in_maintenance: cylinders?.filter(c => c.location === 'maintenance').length || 0,
  };

  // Filtrar traslados hacia mantenimiento
  const maintenanceTransfers = transfers?.filter(t => t.to_location === 'maintenance') || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Mantenimiento</h1>
            <p className="text-gray-600 mt-1">Control de mantenimiento de cilindros</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Registro de Mantenimiento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cilindro</Label>
                  <Select value={newRecord.cylinder_id} onValueChange={(value) => setNewRecord({...newRecord, cylinder_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cilindro" />
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
                  <Label>Tipo de Mantenimiento</Label>
                  <Select value={newRecord.maintenance_type} onValueChange={(value) => setNewRecord({...newRecord, maintenance_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="correctivo">Correctivo</SelectItem>
                      <SelectItem value="prueba_hidrostatica">Prueba Hidrostática</SelectItem>
                      <SelectItem value="inspeccion">Inspección</SelectItem>
                      <SelectItem value="reparacion">Reparación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                    placeholder="Descripción del mantenimiento"
                  />
                </div>
                <div>
                  <Label>Técnico</Label>
                  <Input
                    value={newRecord.technician}
                    onChange={(e) => setNewRecord({...newRecord, technician: e.target.value})}
                    placeholder="Nombre del técnico"
                  />
                </div>
                <div>
                  <Label>Fecha Realizada</Label>
                  <Input
                    type="date"
                    value={newRecord.date_performed}
                    onChange={(e) => setNewRecord({...newRecord, date_performed: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Costo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRecord.cost}
                    onChange={(e) => setNewRecord({...newRecord, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <Button onClick={handleCreateRecord} className="w-full">
                  Crear Registro
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Wrench className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Wrench className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{stats.cylinders_in_maintenance}</div>
              <div className="text-sm text-gray-600">En Mantenimiento</div>
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
                    placeholder="Buscar por cilindro, técnico o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="prueba_hidrostatica">Prueba Hidrostática</SelectItem>
                  <SelectItem value="inspeccion">Inspección</SelectItem>
                  <SelectItem value="reparacion">Reparación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cylinders in Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Cilindros en Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Traslado</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Operador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceTransfers.slice(0, 10).map((transfer) => {
                  const cylinder = cylinders?.find(c => c.id === transfer.cylinder_id);
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell>{cylinder?.serial_number}</TableCell>
                      <TableCell>{cylinder?.capacity_kg} kg</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          {cylinder?.state}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(transfer.date_time || '').toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{transfer.notes || '-'}</TableCell>
                      <TableCell>{transfer.operator}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Maintenance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cilindro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.cylinders?.serial_number}</TableCell>
                    <TableCell>{getTypeLabel(record.maintenance_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.description}</TableCell>
                    <TableCell>{record.technician}</TableCell>
                    <TableCell>{new Date(record.date_performed).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.cost ? `$${record.cost.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingRecord(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Registro de Mantenimiento</DialogTitle>
                            </DialogHeader>
                            {editingRecord && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Estado</Label>
                                  <Select 
                                    value={editingRecord.status} 
                                    onValueChange={(value) => setEditingRecord({...editingRecord, status: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pendiente">Pendiente</SelectItem>
                                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                                      <SelectItem value="completado">Completado</SelectItem>
                                      <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Costo</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editingRecord.cost || ''}
                                    onChange={(e) => setEditingRecord({...editingRecord, cost: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Notas</Label>
                                  <Textarea
                                    value={editingRecord.notes || ''}
                                    onChange={(e) => setEditingRecord({...editingRecord, notes: e.target.value})}
                                  />
                                </div>
                                <Button onClick={handleUpdateRecord} className="w-full">
                                  Actualizar
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de mantenimiento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRecord(record.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Maintenance;
