
-- Create maintenance records table
CREATE TABLE public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cylinder_id UUID REFERENCES public.cylinders(id) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('preventivo', 'correctivo', 'prueba_hidrostatica', 'inspeccion', 'reparacion')),
    description TEXT NOT NULL,
    technician VARCHAR(100) NOT NULL,
    date_performed DATE NOT NULL DEFAULT CURRENT_DATE,
    cost DECIMAL(10,2),
    parts_replaced TEXT,
    next_maintenance_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'completado' CHECK (status IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for maintenance records
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to maintenance records
CREATE POLICY "Allow public access to maintenance_records" ON public.maintenance_records FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_maintenance_records_cylinder_id ON public.maintenance_records(cylinder_id);
CREATE INDEX idx_maintenance_records_date ON public.maintenance_records(date_performed);
CREATE INDEX idx_maintenance_records_status ON public.maintenance_records(status);

-- Insert some sample maintenance records
INSERT INTO public.maintenance_records (cylinder_id, maintenance_type, description, technician, date_performed, cost, status)
SELECT 
    c.id,
    'inspeccion',
    'Inspección rutinaria de válvulas y estado general',
    'Juan Pérez',
    CURRENT_DATE - INTERVAL '30 days',
    150.00,
    'completado'
FROM public.cylinders c
LIMIT 3;

INSERT INTO public.maintenance_records (cylinder_id, maintenance_type, description, technician, date_performed, cost, status, next_maintenance_date)
SELECT 
    c.id,
    'prueba_hidrostatica',
    'Prueba hidrostática quinquenal',
    'María González',
    CURRENT_DATE - INTERVAL '60 days',
    300.00,
    'completado',
    CURRENT_DATE + INTERVAL '5 years'
FROM public.cylinders c
WHERE c.serial_number IN ('CYL-001', 'CYL-004');
