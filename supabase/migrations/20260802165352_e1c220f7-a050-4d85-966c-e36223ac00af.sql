CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text NOT NULL,
  guest_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a booking request"
  ON public.bookings FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "Authenticated users can view bookings"
  ON public.bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update bookings"
  ON public.bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bookings"
  ON public.bookings FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.validate_booking_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.check_out_date <= NEW.check_in_date THEN
    RAISE EXCEPTION 'check_out_date must be after check_in_date';
  END IF;
  IF NEW.guests < 1 THEN
    RAISE EXCEPTION 'guests must be at least 1';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_bookings_dates
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_dates();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_bookings_location_id ON public.bookings (location_id);
CREATE INDEX idx_bookings_check_in_date ON public.bookings (check_in_date);