import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

// Helper to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Validate Telegram initData using Web Crypto API
async function validateTelegramData(initData: string): Promise<{ valid: boolean; telegramId: string | null }> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    
    if (!hash) {
      console.log("No hash in initData");
      return { valid: false, telegramId: null };
    }

    // Remove hash from params and sort
    params.delete("hash");
    const dataCheckArr: string[] = [];
    
    // Sort keys alphabetically
    const sortedKeys = Array.from(params.keys()).sort();
    for (const key of sortedKeys) {
      dataCheckArr.push(`${key}=${params.get(key)}`);
    }
    
    const dataCheckString = dataCheckArr.join("\n");
    const encoder = new TextEncoder();

    // Create secret key: HMAC-SHA256("WebAppData", botToken)
    const secretKeyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const secretKeyBuffer = await crypto.subtle.sign(
      "HMAC",
      secretKeyMaterial,
      encoder.encode(TELEGRAM_BOT_TOKEN)
    );

    // Calculate hash: HMAC-SHA256(secretKey, dataCheckString)
    const dataKeyMaterial = await crypto.subtle.importKey(
      "raw",
      secretKeyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const calculatedHashBuffer = await crypto.subtle.sign(
      "HMAC",
      dataKeyMaterial,
      encoder.encode(dataCheckString)
    );
    const calculatedHash = arrayBufferToHex(calculatedHashBuffer);

    const isValid = calculatedHash === hash;

    if (isValid) {
      // Extract telegram_id from validated user data
      const userDataStr = params.get("user");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        return { valid: true, telegramId: userData.id.toString() };
      }
    }

    return { valid: false, telegramId: null };
  } catch (err) {
    console.error("Error validating Telegram data:", err);
    return { valid: false, telegramId: null };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initData, timezone, enabled, morningTime, dayTime, eveningTime } = await req.json();

    // SECURITY: Validate Telegram signature and extract telegram_id from it
    if (!initData) {
      return new Response(
        JSON.stringify({ error: "Missing initData" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validationResult = await validateTelegramData(initData);
    
    if (!validationResult.valid || !validationResult.telegramId) {
      console.log("Invalid Telegram signature for save-reminder");
      return new Response(
        JSON.stringify({ error: "Invalid Telegram signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const telegramId = validationResult.telegramId;
    console.log("Verified telegram_id from signature:", telegramId);

    // Validate input data
    if (timezone && typeof timezone !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid timezone format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate time formats (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (morningTime && !timeRegex.test(morningTime)) {
      return new Response(
        JSON.stringify({ error: "Invalid morning time format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (dayTime && !timeRegex.test(dayTime)) {
      return new Response(
        JSON.stringify({ error: "Invalid day time format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (eveningTime && !timeRegex.test(eveningTime)) {
      return new Response(
        JSON.stringify({ error: "Invalid evening time format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // First, find the user by verified telegram_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("telegram_id", telegramId)
      .single();

    if (profileError || !profile) {
      console.log("Profile not found for verified telegram_id:", telegramId);

      // Save with telegram_id only (for users not yet fully authenticated)
      const { error: upsertError } = await supabaseAdmin
        .from("reminders")
        .upsert(
          {
            telegram_id: parseInt(telegramId, 10),
            user_id: null,
            timezone: timezone || "UTC",
            enabled: enabled ?? true,
            morning_time: morningTime || null,
            day_time: dayTime || null,
            evening_time: eveningTime || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "telegram_id" }
        );

      if (upsertError) {
        console.error("Error upserting reminder:", upsertError);
        throw upsertError;
      }
    } else {
      // Profile found: still upsert by telegram_id (unique) and attach user_id
      const { error: upsertError } = await supabaseAdmin
        .from("reminders")
        .upsert(
          {
            user_id: profile.id,
            telegram_id: parseInt(telegramId, 10),
            timezone: timezone || "UTC",
            enabled: enabled ?? true,
            morning_time: morningTime || null,
            day_time: dayTime || null,
            evening_time: eveningTime || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "telegram_id" }
        );

      if (upsertError) {
        console.error("Error upserting reminder:", upsertError);
        throw upsertError;
      }
    }

    console.log("Reminder saved successfully for telegram_id:", telegramId);

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
