type ConfirmHotelRequest = {
  hotelBookingId: string;
};

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => ({}))) as Partial<ConfirmHotelRequest>;

  if (!payload.hotelBookingId) {
    return Response.json({ error: "hotelBookingId is required" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ status: "prepared", message: "Supabase environment is not configured." }, { status: 503 });
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.rpc("confirm_hotel_booking", {
    p_hotel_booking_id: payload.hotelBookingId,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  return Response.json({ confirmed: data });
});
