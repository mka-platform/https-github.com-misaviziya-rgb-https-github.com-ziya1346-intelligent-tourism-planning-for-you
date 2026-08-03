DROP POLICY IF EXISTS "Authenticated users can view bookings" ON public.bookings;

CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));