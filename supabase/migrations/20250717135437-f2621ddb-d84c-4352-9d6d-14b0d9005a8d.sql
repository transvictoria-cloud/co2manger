
-- Primero eliminamos los triggers existentes si existen
DROP TRIGGER IF EXISTS trigger_update_tank_level_on_filling ON public.fillings;
DROP TRIGGER IF EXISTS trigger_update_tank_inventory_on_movement ON public.tank_movements;

-- Recreamos la función del trigger para actualizar el tanque cuando se aprueban llenados
CREATE OR REPLACE FUNCTION public.update_tank_level_on_filling()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actualizar el nivel del tanque para llenados aprobados
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Disminuir el nivel del tanque por la cantidad llenada más el 2% de merma
        UPDATE public.tank_inventory 
        SET current_level_kg = current_level_kg - (NEW.amount_kg * 1.02),
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
        
        -- Crear registro de movimiento del tanque para la salida (incluyendo merma)
        INSERT INTO public.tank_movements (movement_type, amount_kg, operator, notes, date_time)
        VALUES ('exit', NEW.amount_kg * 1.02, NEW.operator, 'Llenado de cilindro ' || (SELECT serial_number FROM public.cylinders WHERE id = NEW.cylinder_id) || ' (incluye 2% merma)', NEW.date_time);
        
        -- Actualizar estado del cilindro a lleno y ubicación a estación de llenado
        UPDATE public.cylinders 
        SET state = 'full', 
            location = 'filling_station',
            updated_at = NOW()
        WHERE id = NEW.cylinder_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreamos el trigger
CREATE TRIGGER trigger_update_tank_level_on_filling
    AFTER INSERT OR UPDATE ON public.fillings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tank_level_on_filling();

-- Recreamos también el trigger para movimientos del tanque
CREATE TRIGGER trigger_update_tank_inventory_on_movement
    AFTER INSERT ON public.tank_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tank_inventory_on_movement();
