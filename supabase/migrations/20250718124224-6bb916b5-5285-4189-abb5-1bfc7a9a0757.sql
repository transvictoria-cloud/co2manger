-- Agregar las nuevas ubicaciones al enum cylinder_location
ALTER TYPE cylinder_location ADD VALUE 'assignments';
ALTER TYPE cylinder_location ADD VALUE 'returns';

-- Agregar los nuevos campos requeridos a la tabla transfers
ALTER TABLE public.transfers 
ADD COLUMN client_name character varying,
ADD COLUMN cylinder_capacity_kg numeric,
ADD COLUMN cylinder_quantity integer DEFAULT 1,
ADD COLUMN delivery_note_number character varying,
ADD COLUMN driver_name character varying;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_transfers_client_name ON public.transfers(client_name);
CREATE INDEX idx_transfers_date_time ON public.transfers(date_time);
CREATE INDEX idx_transfers_delivery_note ON public.transfers(delivery_note_number);

-- Actualizar la tabla transfers para que algunos campos anteriormente obligatorios puedan ser opcionales
-- para los nuevos tipos de traslados
ALTER TABLE public.transfers 
ALTER COLUMN cylinder_id DROP NOT NULL;