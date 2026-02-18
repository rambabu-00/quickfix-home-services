
-- Drop ALL existing booking policies (with and without trailing spaces)
DROP POLICY IF EXISTS "Booking parties can update" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Recreate as permissive policies
CREATE POLICY "Customers can create bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING ((auth.uid() = customer_id) OR (auth.uid() = provider_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Booking parties can update"
ON public.bookings
FOR UPDATE
TO authenticated
USING ((auth.uid() = customer_id) OR (auth.uid() = provider_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Drop ALL existing review policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;

-- Recreate as permissive policies
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Customers can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);
