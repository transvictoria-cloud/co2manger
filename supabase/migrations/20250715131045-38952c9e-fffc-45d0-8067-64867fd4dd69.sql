-- Verificar si hay registros en tank_inventory
INSERT INTO public.tank_inventory (capacity_kg, current_level_kg, operator, notes, last_updated)
SELECT 3200, 3080, 'Sistema', 'Registro inicial automático', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tank_inventory);

-- Crear o reemplazar el trigger para cambio de estado en traslados
CREATE OR REPLACE FUNCTION public.update_cylinder_state_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el traslado es de Despacho a Estación de llenado, cambiar estado a 'empty'
    IF NEW.from_location = 'dispatch' AND NEW.to_location = 'filling_station' THEN
        UPDATE public.cylinders 
        SET state = 'empty', 
            location = NEW.to_location,
            updated_at = NOW()
        WHERE id = NEW.cylinder_id;
    ELSE
        -- Para otros traslados, solo actualizar la ubicación
        UPDATE public.cylinders 
        SET location = NEW.to_location,
            updated_at = NOW()
        WHERE id = NEW.cylinder_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS update_cylinder_location_on_transfer_trigger ON public.transfers;
CREATE TRIGGER update_cylinder_location_on_transfer_trigger
    AFTER INSERT ON public.transfers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cylinder_state_on_transfer();