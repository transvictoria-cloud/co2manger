-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_tank_inventory_on_movement ON public.tank_movements;
DROP FUNCTION IF EXISTS public.update_tank_inventory_on_movement();

-- Create trigger function to update tank inventory on tank movements
CREATE OR REPLACE FUNCTION public.update_tank_inventory_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tank inventory based on movement type
    IF NEW.movement_type = 'entry' THEN
        -- Add to tank level for entries
        UPDATE public.tank_inventory 
        SET current_level_kg = current_level_kg + NEW.amount_kg,
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
    ELSIF NEW.movement_type = 'exit' THEN
        -- Subtract from tank level for exits
        UPDATE public.tank_inventory 
        SET current_level_kg = GREATEST(0, current_level_kg - NEW.amount_kg),
            last_updated = NOW(),
            operator = NEW.operator
        WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tank movements
CREATE TRIGGER trigger_update_tank_inventory_on_movement
    AFTER INSERT ON public.tank_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tank_inventory_on_movement();