import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// MD5 hash function using Deno std library
async function md5(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  return encodeHex(new Uint8Array(hashBuffer));
}
 
 Deno.serve(async (req) => {
   // Handle both GET and POST for Robokassa result_url
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
 
     // Parse parameters from GET or POST
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
     const shpUserId = params.get("Shp_userId");
     const shpTelegramId = params.get("Shp_telegramId");
 
     console.log("Robokassa webhook received:", {
       outSum,
       invId,
       shpUserId,
       shpTelegramId,
     });
 
     if (!outSum || !invId || !signatureValue) {
       throw new Error("Missing required parameters");
     }
 
     // Build signature string with custom params (alphabetically sorted)
     const shpParams: string[] = [];
     if (shpTelegramId) shpParams.push(`Shp_telegramId=${shpTelegramId}`);
     if (shpUserId) shpParams.push(`Shp_userId=${shpUserId}`);
     shpParams.sort();
 
     // Signature for result_url: OutSum:InvId:Password2:Shp_params
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
 
     // Signature valid - update subscription
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     // Calculate expiration (30 days from now)
     const expiresAt = new Date();
     expiresAt.setDate(expiresAt.getDate() + 30);
 
     // Update or create subscription
     if (shpUserId) {
       const { error } = await supabase
         .from("subscriptions")
         .upsert({
           user_id: shpUserId,
           telegram_id: shpTelegramId,
           plan: "pro",
           subscription_type: "pro",
           status: "active",
           payment_provider: "robokassa",
           payment_id: invId,
           price_usd: parseFloat(outSum) / 100, // Convert rubles to approximate USD
           started_at: new Date().toISOString(),
           expires_at: expiresAt.toISOString(),
           trial_ends_at: null,
           metadata: {
             robokassa_inv_id: invId,
             amount_rub: outSum,
           },
         }, {
           onConflict: "user_id",
         });
 
       if (error) {
         console.error("Error updating subscription:", error);
         throw error;
       }
 
       // Track event
       await supabase.from("events").insert({
         user_id: shpUserId,
         telegram_id: shpTelegramId,
         event: "subscription_purchased",
         metadata: {
           plan: "pro",
           payment_id: invId,
           amount_rub: outSum,
         },
       });
 
       console.log(`Subscription activated for user ${shpUserId}`);
     }
 
     // Robokassa expects "OK" + InvId as response
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