CREATE POLICY "Admins can view all service items"
ON public.service_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));