CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS equipos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hostname TEXT UNIQUE,
    username TEXT,
    ip_local TEXT,
    disco TEXT,
    modelo TEXT,
    caracteristicas_pc TEXT,
    monitores TEXT,
    numero_serie TEXT,
    marca_pc TEXT,
    es_escritorio BOOLEAN DEFAULT false,
    es_laptop BOOLEAN DEFAULT false,
    memoria_ram TEXT,
    sistema_operativo TEXT,
    validado BOOLEAN DEFAULT true,
    -- Campos de Red e Infraestructura
    ip_switch TEXT,
    puerto_switch TEXT,
    vlan TEXT,
    -- Campos de Gestión de Activos
    ubicacion_fisica TEXT,
    codigo_activo TEXT,
    estado_garantia TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE equipos
ADD COLUMN IF NOT EXISTS monitores TEXT;

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL
);

ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agent Insert Update" ON equipos;
DROP POLICY IF EXISTS "Agent Update" ON equipos;
DROP POLICY IF EXISTS "Authenticated Read" ON equipos;
DROP POLICY IF EXISTS "Admins Full Access" ON equipos;
DROP POLICY IF EXISTS "Read Admins" ON admins;
DROP POLICY IF EXISTS "Anon Read" ON equipos;

CREATE POLICY "Agent Insert Update" ON equipos
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Agent Update" ON equipos
    FOR UPDATE TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated Read" ON equipos
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Anon Read" ON equipos
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "Admins Full Access" ON equipos
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM admins a
            WHERE a.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins a
            WHERE a.id = auth.uid()
        )
    );

CREATE POLICY "Read Admins" ON admins
    FOR SELECT TO authenticated
    USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_equipos_updated_at ON equipos;
CREATE TRIGGER update_equipos_updated_at
    BEFORE UPDATE ON equipos
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

INSERT INTO public.admins (id, email)
VALUES
  ('2a7aa50b-883d-4122-ad6d-c7f7f7287da6', 'admin@empresa.com'),
  ('f31b6c29-8d5d-4471-b973-f5e05d4689ba', 'sistemas@iceberg.com.co')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;