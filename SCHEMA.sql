CREATE TABLE equipos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_usuario TEXT NOT NULL,
    equipo TEXT CHECK (equipo IN ('Computador', 'Portátil')) NOT NULL,
    caracteristicas TEXT,
    hostname TEXT UNIQUE NOT NULL,
    validado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now(),
    sku TEXT
);

ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON equipos
    FOR SELECT
    TO authenticated
    USING (true);

CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read admins table" ON admins
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert" ON equipos
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Only admins can update" ON equipos
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Only admins can delete" ON equipos
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipos_updated_at
    BEFORE UPDATE ON equipos
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();