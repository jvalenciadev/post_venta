-- =====================================================
-- POS RESTAURANTE — SCHEMA SQL COMPLETO
-- Supabase PostgreSQL
-- =====================================================

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: profiles (extiende auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'cajero' CHECK (role IN ('admin', 'cajero')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- =====================================================
-- TABLA: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#f97316',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLA: products
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_active_idx   ON public.products(active);
CREATE INDEX IF NOT EXISTS products_name_idx     ON public.products USING GIN (to_tsvector('spanish', name));

-- =====================================================
-- TABLA: orders
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS orders_number_seq START 1;

CREATE TABLE IF NOT EXISTS public.orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER NOT NULL DEFAULT NEXTVAL('orders_number_seq'),
  status       TEXT NOT NULL DEFAULT 'pendiente'
                 CHECK (status IN ('pendiente', 'preparando', 'completado', 'cancelado')),
  total        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  notes        TEXT,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS orders_number_unique_idx ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS orders_status_idx       ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx   ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_created_by_idx   ON public.orders(created_by);

-- =====================================================
-- TABLA: order_items
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal   NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS order_items_order_idx   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_idx ON public.order_items(product_id);

-- =====================================================
-- TABLA: payments
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  amount       NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  method       TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash', 'card', 'transfer')),
  change_given NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (change_given >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS payments_order_idx  ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS payments_method_idx ON public.payments(method);

-- =====================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE OR REPLACE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cajero')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments   ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- POLÍTICAS: profiles
-- -------------------------------------------------------

-- Todos los usuarios autenticados pueden ver perfiles
CREATE POLICY "profiles: ver propio" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin puede ver todos
CREATE POLICY "profiles: admin ve todos" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin puede actualizar roles
CREATE POLICY "profiles: admin actualiza" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------
-- POLÍTICAS: categories
-- -------------------------------------------------------

CREATE POLICY "categories: lectura autenticados" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "categories: escritura admin" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cajero puede crear categorías
CREATE POLICY "categories: cajero insert" ON public.categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- -------------------------------------------------------
-- POLÍTICAS: products
-- -------------------------------------------------------

CREATE POLICY "products: lectura autenticados" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "products: admin CRUD" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cajero puede crear y editar (no eliminar)
CREATE POLICY "products: cajero insert" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products: cajero update" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- -------------------------------------------------------
-- POLÍTICAS: orders
-- -------------------------------------------------------

CREATE POLICY "orders: lectura autenticados" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders: cajero insert" ON public.orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "orders: cajero actualiza estado propio" ON public.orders
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "orders: admin elimina" ON public.orders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------
-- POLÍTICAS: order_items
-- -------------------------------------------------------

CREATE POLICY "order_items: lectura autenticados" ON public.order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "order_items: insert autenticados" ON public.order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "order_items: admin delete" ON public.order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------
-- POLÍTICAS: payments
-- -------------------------------------------------------

CREATE POLICY "payments: lectura autenticados" ON public.payments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "payments: insert autenticados" ON public.payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "payments: admin delete" ON public.payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DATOS DE PRUEBA (SEEDS)
-- =====================================================

-- Categorías de ejemplo
INSERT INTO public.categories (name, color, description) VALUES
  ('Tacos',      '#f97316', 'Tacos de todo tipo'),
  ('Bebidas',    '#3b82f6', 'Refrescos, aguas y más'),
  ('Postres',    '#ec4899', 'Dulces y postres'),
  ('Antojitos',  '#8b5cf6', 'Sopes, tlayudas, huaraches'),
  ('Proteínas',  '#10b981', 'Carnes y proteínas')
ON CONFLICT DO NOTHING;

-- Productos de ejemplo
INSERT INTO public.products (name, description, price, category_id, active)
SELECT 'Taco de Asada', 'Tortilla de maíz con carne asada, cilantro y cebolla', 25.00, id, true
FROM public.categories WHERE name = 'Tacos' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, price, category_id, active)
SELECT 'Taco de Pastor', 'Tortilla de maíz con carne al pastor y piña', 22.00, id, true
FROM public.categories WHERE name = 'Tacos' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, price, category_id, active)
SELECT 'Agua de Jamaica', 'Agua fresca de flor de jamaica', 18.00, id, true
FROM public.categories WHERE name = 'Bebidas' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, price, category_id, active)
SELECT 'Refresco 600ml', 'Refresco en botella 600ml', 20.00, id, true
FROM public.categories WHERE name = 'Bebidas' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, price, category_id, active)
SELECT 'Sope de Pollo', 'Sope con pollo guisado, frijoles y salsa', 35.00, id, true
FROM public.categories WHERE name = 'Antojitos' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, description, price, category_id, active)
SELECT 'Churros con chocolate', '3 churros con dipping de chocolate', 30.00, id, true
FROM public.categories WHERE name = 'Postres' LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
