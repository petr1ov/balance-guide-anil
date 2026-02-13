import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function md5(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  return encodeHex(new Uint8Array(hashBuffer)).toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ROBOKASSA_MERCHANT_LOGIN = Deno.env.get("ROBOKASSA_MERCHANT_LOGIN");
    const ROBOKASSA_PASSWORD1 = Deno.env.get("ROBOKASSA_PASSWORD1");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!ROBOKASSA_MERCHANT_LOGIN || !ROBOKASSA_PASSWORD1 || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("ENV variables not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claims.claims.sub;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("telegram_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.telegram_id) {
      throw new Error("Telegram ID not found");
    }

    const telegramId = profile.telegram_id;

    // Parse body and determine plan
    const body = await req.json().catch(() => ({}));
    const plan = body.plan ?? "monthly";

    let amount: number;
    let description: string;

    if (plan === "yearly") {
      amount = 2388;
      description = "Pro подписка Balance Guide — 12 месяцев";
    } else {
      amount = 299;
      description = "Pro подписка Balance Guide — 1 месяц";
    }

    const outSum = amount.toFixed(2);
    const invId = Date.now();

    // Shp params sorted alphabetically
    const shpParams = [
      `Shp_plan=${plan}`,
      `Shp_telegramId=${telegramId}`,
      `Shp_userId=${userId}`,
    ];
    shpParams.sort();

    const signatureString = `${ROBOKASSA_MERCHANT_LOGIN}:${outSum}:${invId}:${ROBOKASSA_PASSWORD1}:${shpParams.join(":")}`;
    const signature = await md5(signatureString);

    const params = new URLSearchParams({
      MerchantLogin: ROBOKASSA_MERCHANT_LOGIN,
      OutSum: outSum,
      InvId: invId.toString(),
      Description: description,
      SignatureValue: signature,
      IsTest: "1",
      Shp_plan: plan,
      Shp_userId: userId,
      Shp_telegramId: telegramId,
    });

    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;

    console.log("=== ROBOKASSA FINAL URL ===");
    console.log("Plan:", plan, "Amount:", outSum, "IsTest:", params.get("IsTest"));
    console.log("Full URL:", paymentUrl);

    return new Response(
      JSON.stringify({ success: true, paymentUrl, invId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
