-- Inicializar el tank_inventory si está vacío
INSERT INTO public.tank_inventory (capacity_kg, current_level_kg, operator, notes)
SELECT 3200, 3020, 'Sistema - Inicialización', 'Inventario inicial basado en movimientos'
WHERE NOT EXISTS (SELECT 1 FROM public.tank_inventory);

-- Recalcular el inventario del tanque basado en los movimientos existentes
UPDATE public.tank_inventory 
SET current_level_kg = (
  SELECT COALESCE(
    SUM(CASE WHEN movement_type = 'entry' THEN amount_kg ELSE -amount_kg END), 
    0
  ) 
  FROM public.tank_movements
),
last_updated = NOW(),
operator = 'Sistema - Recálculo automático'
WHERE id = (SELECT id FROM public.tank_inventory ORDER BY last_updated DESC LIMIT 1);