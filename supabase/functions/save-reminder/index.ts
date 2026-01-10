import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramId, timezone, enabled, morningTime, dayTime, eveningTime } = await req.json();

    console.log("Saving reminder for telegram_id:", telegramId);

    if (!telegramId) {
      return new Response(
        JSON.stringify({ error: "Missing telegramId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // First, find the user by telegram_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("telegram_id", telegramId)
      .single();

    if (profileError || !profile) {
      console.log("Profile not found for telegram_id:", telegramId, profileError);
      
      // If no profile exists, we might need to create one or handle differently
      // For now, we'll use telegram_id as the reference
      const { error: upsertError } = await supabaseAdmin
        .from("reminders")
        .upsert(
          {
            telegram_id: telegramId,
            user_id: null, // Will be null if no auth
            timezone: timezone || "UTC",
            enabled: enabled ?? true,
            morning_time: morningTime,
            day_time: dayTime,
            evening_time: eveningTime,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "telegram_id" }
        );

      if (upsertError) {
        console.error("Error upserting reminder:", upsertError);
        throw upsertError;
      }
    } else {
      // Profile found, save with user_id
      const { error: upsertError } = await supabaseAdmin
        .from("reminders")
        .upsert(
          {
            user_id: profile.id,
            telegram_id: telegramId,
            timezone: timezone || "UTC",
            enabled: enabled ?? true,
            morning_time: morningTime,
            day_time: dayTime,
            evening_time: eveningTime,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("Error upserting reminder:", upsertError);
        throw upsertError;
      }
    }

    console.log("Reminder saved successfully");

    return new Response(
      JSON.stringify({ ok: true, message: "Reminder saved successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error saving reminder:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
