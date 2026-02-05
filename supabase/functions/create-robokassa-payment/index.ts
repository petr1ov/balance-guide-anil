 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 // MD5 hash function
 async function md5(message: string): Promise<string> {
   const encoder = new TextEncoder();
   const data = encoder.encode(message);
   const hashBuffer = await crypto.subtle.digest("MD5", data);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
 }
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const ROBOKASSA_MERCHANT_LOGIN = Deno.env.get("ROBOKASSA_MERCHANT_LOGIN");
     const ROBOKASSA_PASSWORD1 = Deno.env.get("ROBOKASSA_PASSWORD1");
     const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
     const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
 
     if (!ROBOKASSA_MERCHANT_LOGIN || !ROBOKASSA_PASSWORD1) {
       throw new Error("Robokassa credentials not configured");
     }
 
     // Validate auth
     const authHeader = req.headers.get("Authorization");
     if (!authHeader?.startsWith("Bearer ")) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
       global: { headers: { Authorization: authHeader } },
     });
 
     const token = authHeader.replace("Bearer ", "");
     const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
     
     if (claimsError || !claimsData?.claims) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const userId = claimsData.claims.sub as string;
 
     // Get user's telegram_id from profile
     const { data: profile } = await supabase
       .from("profiles")
       .select("telegram_id")
       .eq("id", userId)
       .single();
 
     const telegramId = profile?.telegram_id;
 
     const { amount = 300, description = "Pro подписка на 30 дней" } = await req.json().catch(() => ({}));
 
     // Generate unique invoice ID
     const invId = Date.now();
 
     // Create signature: MerchantLogin:OutSum:InvId:Password1
     const signatureString = `${ROBOKASSA_MERCHANT_LOGIN}:${amount}:${invId}:${ROBOKASSA_PASSWORD1}`;
     const signature = await md5(signatureString);
 
     // Build payment URL
     const params = new URLSearchParams({
       MerchantLogin: ROBOKASSA_MERCHANT_LOGIN,
       OutSum: amount.toString(),
       InvId: invId.toString(),
       Description: description,
       SignatureValue: signature,
       IsTest: "0", // Set to "1" for test mode
     });
 
     // Add custom parameters for webhook
     if (userId) {
       params.append("Shp_userId", userId);
     }
     if (telegramId) {
       params.append("Shp_telegramId", telegramId);
     }
 
     // Recalculate signature with custom params (alphabetically sorted)
     const shpParams: string[] = [];
     if (userId) shpParams.push(`Shp_userId=${userId}`);
     if (telegramId) shpParams.push(`Shp_telegramId=${telegramId}`);
     shpParams.sort();
 
     const signatureWithShp = shpParams.length > 0
       ? `${ROBOKASSA_MERCHANT_LOGIN}:${amount}:${invId}:${ROBOKASSA_PASSWORD1}:${shpParams.join(":")}`
       : signatureString;
     
     const finalSignature = await md5(signatureWithShp);
     params.set("SignatureValue", finalSignature);
 
     const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
 
     console.log(`Payment URL generated for user ${userId}, invId: ${invId}`);
 
     return new Response(
       JSON.stringify({
         success: true,
         paymentUrl,
         invId,
       }),
       {
         status: 200,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   } catch (error) {
     console.error("Error creating payment:", error);
     return new Response(
       JSON.stringify({
         success: false,
         error: error instanceof Error ? error.message : "Unknown error",
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });