-- Create trigger to update tank level when fillings are approved
CREATE OR REPLACE FUNCTION update_tank_level_on_filling()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update tank level for approved fillings
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Decrease tank level by the amount filled plus 2% wastage factor
        UPDATE public.tank_inventory 
        SET current_level_kg = current_level_kg - (NEW.amount_kg * 1.02),
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
        
        -- Create tank movement record for the exit (including wastage)
        INSERT INTO public.tank_movements (movement_type, amount_kg, operator, notes, date_time)
        VALUES ('exit', NEW.amount_kg * 1.02, NEW.operator, 'Llenado de cilindro ' || (SELECT serial_number FROM public.cylinders WHERE id = NEW.cylinder_id) || ' (incluye 2% merma)', NEW.date_time);
        
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

-- Create the trigger
CREATE TRIGGER trigger_update_tank_level_on_filling
    AFTER INSERT OR UPDATE ON public.fillings
    FOR EACH ROW
    EXECUTE FUNCTION update_tank_level_on_filling();

-- Create trigger to update tank inventory when tank movements are added
CREATE TRIGGER trigger_update_tank_inventory_on_movement
    AFTER INSERT ON public.tank_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_tank_inventory_on_movement();