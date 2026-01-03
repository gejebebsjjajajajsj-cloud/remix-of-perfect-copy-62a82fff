-- Create payments table to store SyncPayments PIX cash-in data
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  type text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL,
  client_name text,
  client_cpf text,
  client_email text,
  method text NOT NULL DEFAULT 'PIX',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

-- Note: RLS is intentionally not enabled yet because the app does not
-- use authenticated users. We can tighten access later when auth is added.