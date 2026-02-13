import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function md5(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  return encodeHex(new Uint8Array(hashBuffer));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ROBOKASSA_PASSWORD2 = Deno.env.get("ROBOKASSA_PASSWORD2");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!ROBOKASSA_PASSWORD2) {
      throw new Error("ROBOKASSA_PASSWORD2 not configured");
    }

    let params: URLSearchParams;
    if (req.method === "GET") {
      params = new URL(req.url).searchParams;
    } else {
      const body = await req.text();
      params = new URLSearchParams(body);
    }

    const outSum = params.get("OutSum");
    const invId = params.get("InvId");
    const signatureValue = params.get("SignatureValue")?.toLowerCase();
    const shpPlan = params.get("Shp_plan");
    const shpUserId = params.get("Shp_userId");
    const shpTelegramId = params.get("Shp_telegramId");

    console.log("Robokassa webhook received:", {
      outSum, invId, shpPlan, shpUserId, shpTelegramId,
    });

    if (!outSum || !invId || !signatureValue) {
      throw new Error("Missing required parameters");
    }

    // Build signature string with custom params (alphabetically sorted)
    const shpParams: string[] = [];
    if (shpPlan) shpParams.push(`Shp_plan=${shpPlan}`);
    if (shpTelegramId) shpParams.push(`Shp_telegramId=${shpTelegramId}`);
    if (shpUserId) shpParams.push(`Shp_userId=${shpUserId}`);
    shpParams.sort();

    const signatureString = shpParams.length > 0
      ? `${outSum}:${invId}:${ROBOKASSA_PASSWORD2}:${shpParams.join(":")}`
      : `${outSum}:${invId}:${ROBOKASSA_PASSWORD2}`;

    const expectedSignature = await md5(signatureString);

    console.log("Signature verification:", {
      expected: expectedSignature,
      received: signatureValue,
      signatureString,
    });

    if (signatureValue !== expectedSignature) {
      console.error("Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }

    // Determine duration based on plan
    const durationDays = shpPlan === "yearly" ? 365 : 30;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    if (shpUserId) {
      const { error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: shpUserId,
          telegram_id: shpTelegramId,
          plan: "pro",
          subscription_type: shpPlan === "yearly" ? "pro_yearly" : "pro_monthly",
          status: "active",
          payment_provider: "robokassa",
          payment_id: invId,
          price_usd: parseFloat(outSum) / 100,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          trial_ends_at: null,
          metadata: {
            robokassa_inv_id: invId,
            amount_rub: outSum,
            plan: shpPlan || "monthly",
            duration_days: durationDays,
          },
        }, {
          onConflict: "user_id",
        });

      if (error) {
        console.error("Error updating subscription:", error);
        throw error;
      }

      await supabase.from("events").insert({
        user_id: shpUserId,
        telegram_id: shpTelegramId,
        event: "subscription_purchased",
        metadata: {
          plan: shpPlan || "monthly",
          payment_id: invId,
          amount_rub: outSum,
          duration_days: durationDays,
        },
      });

      console.log(`Subscription activated for user ${shpUserId}, plan: ${shpPlan}, duration: ${durationDays} days`);
    }

    return new Response(`OK${invId}`, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 }
    );
  }
});
