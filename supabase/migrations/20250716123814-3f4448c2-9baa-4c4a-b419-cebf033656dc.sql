-- Actualizar cilindros que están en ubicación de mantenimiento para que tengan estado 'maintenance'
UPDATE public.cylinders 
SET state = 'maintenance', 
    updated_at = NOW()
WHERE location = 'maintenance' AND state != 'maintenance';

-- Actualizar la función de trigger para que cuando se transfiera a mantenimiento también cambie el estado
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
    -- Si el traslado es hacia mantenimiento, cambiar estado a 'maintenance'
    ELSIF NEW.to_location = 'maintenance' THEN
        UPDATE public.cylinders 
        SET state = 'maintenance', 
            location = NEW.to_location,
            updated_at = NOW()
        WHERE id = NEW.cylinder_id;
    -- Si el traslado es desde mantenimiento hacia otra ubicación, cambiar estado a 'empty'
    ELSIF NEW.from_location = 'maintenance' THEN
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