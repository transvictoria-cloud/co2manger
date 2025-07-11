
-- Create enum types for cylinder states and locations
CREATE TYPE cylinder_state AS ENUM ('empty', 'full', 'filling', 'maintenance', 'out_of_service');
CREATE TYPE cylinder_location AS ENUM ('dispatch', 'filling_station', 'maintenance', 'out_of_service');
CREATE TYPE valve_type AS ENUM ('standard', 'safety', 'pressure_relief');
CREATE TYPE transfer_direction AS ENUM ('filling_to_dispatch', 'dispatch_to_filling');

-- Create cylinders table
CREATE TABLE public.cylinders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    capacity_kg DECIMAL(5,2) NOT NULL,
    valve_type valve_type NOT NULL DEFAULT 'standard',
    manufacture_date DATE,
    last_hydrostatic_test DATE,
    next_hydrostatic_test DATE,
    state cylinder_state NOT NULL DEFAULT 'empty',
    location cylinder_location NOT NULL DEFAULT 'dispatch',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tank inventory table
CREATE TABLE public.tank_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    current_level_kg DECIMAL(8,2) NOT NULL DEFAULT 0,
    capacity_kg DECIMAL(8,2) NOT NULL DEFAULT 3200,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator VARCHAR(100),
    notes TEXT
);

-- Create tank movements table (entries and exits)
CREATE TABLE public.tank_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entry', 'exit')),
    amount_kg DECIMAL(8,2) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator VARCHAR(100) NOT NULL,
    supplier VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fillings table
CREATE TABLE public.fillings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cylinder_id UUID REFERENCES public.cylinders(id) NOT NULL,
    operator VARCHAR(100) NOT NULL,
    amount_kg DECIMAL(5,2) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transfers table
CREATE TABLE public.transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cylinder_id UUID REFERENCES public.cylinders(id) NOT NULL,
    from_location cylinder_location NOT NULL,
    to_location cylinder_location NOT NULL,
    operator VARCHAR(100) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial tank inventory record
INSERT INTO public.tank_inventory (current_level_kg, capacity_kg, operator, notes)
VALUES (2450, 3200, 'Sistema', 'Nivel inicial del tanque');

-- Insert some sample cylinders
INSERT INTO public.cylinders (serial_number, capacity_kg, valve_type, manufacture_date, last_hydrostatic_test, next_hydrostatic_test, state, location)
VALUES 
    ('CYL-001', 10.0, 'standard', '2020-01-15', '2023-01-15', '2028-01-15', 'full', 'dispatch'),
    ('CYL-002', 5.0, 'standard', '2021-03-20', '2023-03-20', '2028-03-20', 'empty', 'filling_station'),
    ('CYL-003', 10.0, 'safety', '2019-07-10', '2022-07-10', '2027-07-10', 'maintenance', 'maintenance'),
    ('CYL-004', 15.0, 'standard', '2022-05-12', '2024-05-12', '2029-05-12', 'full', 'dispatch'),
    ('CYL-005', 10.0, 'standard', '2021-11-08', '2023-11-08', '2028-11-08', 'empty', 'dispatch');

-- Enable Row Level Security (all tables will be public for now since no authentication is mentioned)
ALTER TABLE public.cylinders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tank_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tank_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fillings ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since no authentication system is specified)
CREATE POLICY "Allow public access to cylinders" ON public.cylinders FOR ALL USING (true);
CREATE POLICY "Allow public access to tank_inventory" ON public.tank_inventory FOR ALL USING (true);
CREATE POLICY "Allow public access to tank_movements" ON public.tank_movements FOR ALL USING (true);
CREATE POLICY "Allow public access to fillings" ON public.fillings FOR ALL USING (true);
CREATE POLICY "Allow public access to transfers" ON public.transfers FOR ALL USING (true);

-- Create function to update tank level when filling is recorded
CREATE OR REPLACE FUNCTION update_tank_level_on_filling()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update tank level for approved fillings
    IF NEW.status = 'approved' THEN
        -- Decrease tank level by the amount filled
        UPDATE public.tank_inventory 
        SET current_level_kg = current_level_kg - NEW.amount_kg,
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
        
        -- Create tank movement record for the exit
        INSERT INTO public.tank_movements (movement_type, amount_kg, operator, notes)
        VALUES ('exit', NEW.amount_kg, NEW.operator, 'Llenado de cilindro ' || (SELECT serial_number FROM public.cylinders WHERE id = NEW.cylinder_id));
        
        -- Update cylinder state to full and location to filling_station
        UPDATE public.cylinders 
        SET state = 'full', 
            location = 'filling_station',
            updated_at = NOW()
        WHERE id = NEW.cylinder_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tank level updates
CREATE TRIGGER trigger_update_tank_level_on_filling
    AFTER INSERT ON public.fillings
    FOR EACH ROW
    EXECUTE FUNCTION update_tank_level_on_filling();

-- Create function to update cylinder location on transfer
CREATE OR REPLACE FUNCTION update_cylinder_location_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- Update cylinder location
    UPDATE public.cylinders 
    SET location = NEW.to_location,
        updated_at = NOW()
    WHERE id = NEW.cylinder_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cylinder location updates
CREATE TRIGGER trigger_update_cylinder_location_on_transfer
    AFTER INSERT ON public.transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_cylinder_location_on_transfer();
