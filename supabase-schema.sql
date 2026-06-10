-- ===========================================
-- SCHEMA: Ensaio Casal IA — Dia dos Namorados
-- Execute no SQL Editor do Supabase
-- ===========================================

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  package_type TEXT NOT NULL,
  reference_ids JSONB DEFAULT '[]',
  client_photos JSONB DEFAULT '[]',
  preview_photos JSONB DEFAULT '[]',
  selected_photo_ids JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_production', 'preview_sent', 'selected', 'paid', 'delivered')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_whatsapp ON orders(whatsapp);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- STORAGE: criar bucket 'ensaio-photos'
-- ===========================================
-- No painel Supabase: Storage > New bucket
-- Nome: ensaio-photos
-- Public: TRUE (para URLs públicas das prévias)

-- RLS: desabilitar para usar service_role na API
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: service role tem acesso total (usado via getAdminClient)
-- O frontend NÃO acessa o banco diretamente, só via API routes

-- Policy pública: nenhuma (toda leitura é via API com service key)
-- Isto é seguro pois o SUPABASE_SERVICE_ROLE_KEY fica apenas no servidor
