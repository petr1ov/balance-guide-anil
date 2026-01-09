import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-bot`;
    
    console.log("Setting webhook to:", webhookUrl);

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );

    const result = await response.json();
    console.log("setWebhook result:", JSON.stringify(result));

    // Also get webhook info
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const info = await infoResponse.json();
    console.log("Webhook info:", JSON.stringify(info));

    return new Response(JSON.stringify({ 
      setWebhook: result, 
      webhookInfo: info,
      webhookUrl 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error setting webhook:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});