-- Update trigger function to include 2% wastage factor for fillings
CREATE OR REPLACE FUNCTION public.update_tank_level_on_filling()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update tank level for approved fillings
    IF NEW.status = 'approved' THEN
        -- Decrease tank level by the amount filled plus 2% wastage factor
        UPDATE public.tank_inventory 
        SET current_level_kg = current_level_kg - (NEW.amount_kg * 1.02),
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
        
        -- Create tank movement record for the exit (including wastage)
        INSERT INTO public.tank_movements (movement_type, amount_kg, operator, notes)
        VALUES ('exit', NEW.amount_kg * 1.02, NEW.operator, 'Llenado de cilindro ' || (SELECT serial_number FROM public.cylinders WHERE id = NEW.cylinder_id) || ' (incluye 2% merma)');
        
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

-- Update trigger function to include 3% wastage factor for tank entries
CREATE OR REPLACE FUNCTION public.update_tank_inventory_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tank inventory based on movement type
    IF NEW.movement_type = 'entry' THEN
        -- Add to tank level for entries with 3% wastage factor (receive 3% less)
        UPDATE public.tank_inventory 
        SET current_level_kg = current_level_kg + (NEW.amount_kg * 0.97),
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
    ELSIF NEW.movement_type = 'exit' THEN
        -- Subtract from tank level for exits (no additional wastage here as it's handled in filling)
        UPDATE public.tank_inventory 
        SET current_level_kg = GREATEST(0, current_level_kg - NEW.amount_kg),
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;