-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT on payments
CREATE POLICY "Public can read payments"
ON public.payments
FOR SELECT
USING (true);

-- Allow public INSERT on payments
CREATE POLICY "Public can insert payments"
ON public.payments
FOR INSERT
WITH CHECK (true);

-- Allow public UPDATE on payments
CREATE POLICY "Public can update payments"
ON public.payments
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow public DELETE on payments
CREATE POLICY "Public can delete payments"
ON public.payments
FOR DELETE
USING (true);