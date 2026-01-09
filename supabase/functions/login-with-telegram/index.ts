import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Helper to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Validate Telegram initData using Web Crypto API
async function validateTelegramData(initData: string): Promise<{ valid: boolean; data: Record<string, string> | null }> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    
    if (!hash) {
      console.log("No hash in initData");
      return { valid: false, data: null };
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
    console.log("Data check string:", dataCheckString);

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

    console.log("Calculated hash:", calculatedHash);
    console.log("Received hash:", hash);

    const isValid = calculatedHash === hash;

    if (isValid) {
      const data: Record<string, string> = {};
      for (const [key, value] of params.entries()) {
        data[key] = value;
      }
      return { valid: true, data };
    }

    return { valid: false, data: null };
  } catch (err) {
    console.error("Error validating Telegram data:", err);
    return { valid: false, data: null };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    
    if (!initData) {
      return new Response(JSON.stringify({ error: "Missing initData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Received initData:", initData);

    // Validate Telegram signature
    const validationResult = await validateTelegramData(initData);
    
    if (!validationResult.valid || !validationResult.data) {
      console.log("Invalid Telegram signature");
      return new Response(JSON.stringify({ error: "Invalid Telegram signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = validationResult.data;

    // Parse user data from validated initData
    const userDataStr = data.user;
    if (!userDataStr) {
      return new Response(JSON.stringify({ error: "No user data in initData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userData = JSON.parse(userDataStr);
    const telegramId = userData.id.toString();
    const firstName = userData.first_name || "";
    const lastName = userData.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "User";
    const languageCode = userData.language_code || "en";

    console.log(`Authenticated user: ${telegramId} (${fullName})`);

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create unique email for this Telegram user
    const email = `telegram_${telegramId}@balance-mentor.app`;
    const password = `tg_${telegramId}_${TELEGRAM_BOT_TOKEN.slice(-10)}`;

    // Try to sign in existing user first
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    let session = signInData?.session;
    let userId = signInData?.user?.id;

    if (signInError) {
      console.log("Sign in failed, creating new user:", signInError.message);
      
      // Create new user
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          full_name: fullName,
        },
      });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        return new Response(JSON.stringify({ error: "Failed to create user" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      userId = signUpData.user?.id;
      console.log("Created new user:", userId);

      // Now sign in the new user to get a session
      const { data: newSignInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (newSignInError || !newSignInData.session) {
        console.error("Error signing in new user:", newSignInError);
        return new Response(JSON.stringify({ error: "Failed to create session" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      session = newSignInData.session;

      // Create profile for new user
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          telegram_id: telegramId,
          name: fullName,
          language: languageCode === "ru" ? "ru" : languageCode === "hi" ? "hi" : "en",
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    } else {
      console.log("User signed in successfully:", userId);
      
      // Update profile with latest info
      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({ name: fullName })
          .eq("id", userId);
      }
    }

    if (!session) {
      return new Response(JSON.stringify({ error: "Failed to create session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return the session
    return new Response(JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      user: {
        id: userId,
        telegram_id: telegramId,
        name: fullName,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error in login-with-telegram:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});