-- Actualizar los triggers para manejar las nuevas ubicaciones de asignaciones y devoluciones
-- Primero, actualizamos el trigger de actualización de estado de cilindros

CREATE OR REPLACE FUNCTION public.update_cylinder_state_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actualizar cilindros específicos si cylinder_id no es null
    IF NEW.cylinder_id IS NOT NULL THEN
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
        -- Para traslados a asignaciones (cuando salen a clientes), cambiar a 'assigned'
        ELSIF NEW.to_location = 'assignments' THEN
            UPDATE public.cylinders 
            SET state = 'assigned', 
                location = NEW.to_location,
                updated_at = NOW()
            WHERE id = NEW.cylinder_id;
        -- Para traslados desde devoluciones, establecer estado según el tipo de cilindro
        ELSIF NEW.from_location = 'returns' THEN
            UPDATE public.cylinders 
            SET location = NEW.to_location,
                updated_at = NOW()
            WHERE id = NEW.cylinder_id;
        ELSE
            -- Para otros traslados, solo actualizar la ubicación
            UPDATE public.cylinders 
            SET location = NEW.to_location,
                updated_at = NOW()
            WHERE id = NEW.cylinder_id;
        END IF;
    END IF;
    -- Note: Para asignaciones y devoluciones sin cylinder_id específico, no se actualiza nada
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;