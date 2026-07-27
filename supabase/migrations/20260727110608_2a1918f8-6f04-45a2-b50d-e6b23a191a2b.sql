
REVOKE ALL ON FUNCTION public.current_shop_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decrement_stock_on_sale() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_next_service_date() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_shop_id() TO authenticated;
