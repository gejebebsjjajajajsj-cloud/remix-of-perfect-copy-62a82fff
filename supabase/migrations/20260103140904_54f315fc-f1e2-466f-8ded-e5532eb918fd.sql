-- 1) Criar tabela de pedidos para controlar pagamentos
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('subscription', 'whatsapp')),
  amount_cents integer NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Habilitar RLS e permitir acesso público apenas para leitura
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;

-- Permitir que qualquer visitante leia o status dos pedidos (não há dado pessoal)
CREATE POLICY "Public can read orders" ON public.orders
FOR SELECT
USING (true);

-- Nenhum insert/update/delete é permitido via cliente público; apenas edge functions (service role) manipulam.

-- 3) Usar REPLICA IDENTITY FULL e habilitar realtime para orders
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 4) Atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at_orders()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_on_orders ON public.orders;
CREATE TRIGGER set_timestamp_on_orders
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at_orders();