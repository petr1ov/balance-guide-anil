import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Anil's personalized reminder messages
const MESSAGES = {
  morning: (focusArea: string) => `Доброе утро 🌱

Сегодня мягко фокусируемся на сфере «${focusArea}».

Один маленький шаг сегодня — уже движение вперёд.

Как настроение?`,
  
  day: (focusArea: string) => `Как ты сейчас? 🌿

Напоминание про фокус «${focusArea}».

Если уже сделал шаг — отлично.
Если нет — всё ещё можно начать.`,
  
  evening: (focusArea: string) => `Время подвести итоги 🌙

Что сегодня получилось?
За что можешь себя поблагодарить?

Даже внимание — это уже практика.`,
};

// Check if time is within window (±3 minutes)
function isWithinWindow(localTimeStr: string, targetTimeStr: string): boolean {
  if (!targetTimeStr) return false;
  
  const [localH, localM] = localTimeStr.split(":").map(Number);
  const [targetH, targetM] = targetTimeStr.split(":").map(Number);
  
  const localMinutes = localH * 60 + localM;
  const targetMinutes = targetH * 60 + targetM;
  
  const diff = Math.abs(localMinutes - targetMinutes);
  return diff <= 3 || diff >= (24 * 60 - 3); // handle midnight wrap
}

// Get local time string in HH:MM format for a timezone
function getLocalTimeString(utcDate: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(utcDate);
  } catch {
    // Fallback to UTC if timezone is invalid
    return utcDate.toISOString().slice(11, 16);
  }
}

// Get local date string for a timezone
function getLocalDateString(utcDate: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(utcDate);
  } catch {
    return utcDate.toISOString().slice(0, 10);
  }
}

// Send Telegram message
async function sendTelegramMessage(telegramId: string, text: string): Promise<boolean> {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`Telegram API error for ${telegramId}:`, error);
      return false;
    }

    console.log(`Message sent to ${telegramId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${telegramId}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const nowUtc = new Date();
    console.log(`Running reminder check at UTC: ${nowUtc.toISOString()}`);

    // Fetch all enabled reminders with user's focus area
    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select(`
        user_id,
        telegram_id,
        timezone,
        morning_time,
        day_time,
        evening_time
      `)
      .eq("enabled", true);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch reminders" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${reminders?.length || 0} enabled reminders`);

    let sentCount = 0;
    let skippedCount = 0;

    for (const reminder of reminders || []) {
      const localTime = getLocalTimeString(nowUtc, reminder.timezone);
      const localDate = getLocalDateString(nowUtc, reminder.timezone);

      // Get user's focus area from goals
      const { data: goal } = await supabase
        .from("goals")
        .select("focus_area")
        .eq("user_id", reminder.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const focusArea = goal?.focus_area || "личный рост";

      // Check each reminder type
      const reminderTypes = [
        { type: "morning", time: reminder.morning_time },
        { type: "day", time: reminder.day_time },
        { type: "evening", time: reminder.evening_time },
      ];

      for (const { type, time } of reminderTypes) {
        if (!time) continue;
        
        if (!isWithinWindow(localTime, time)) continue;

        // Check if already sent today
        const { data: existingLog } = await supabase
          .from("reminder_logs")
          .select("id")
          .eq("user_id", reminder.user_id)
          .eq("reminder_type", type)
          .eq("sent_date", localDate)
          .single();

        if (existingLog) {
          skippedCount++;
          continue;
        }

        // Get message text
        const getMessage = MESSAGES[type as keyof typeof MESSAGES];
        const messageText = getMessage(focusArea);

        // Send message
        const sent = await sendTelegramMessage(reminder.telegram_id, messageText);

        if (sent) {
          // Log the send
          await supabase.from("reminder_logs").insert({
            user_id: reminder.user_id,
            reminder_type: type,
            sent_date: localDate,
          });
          sentCount++;
        }
      }
    }

    console.log(`Sent: ${sentCount}, Skipped (already sent): ${skippedCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        skipped: skippedCount,
        checked: reminders?.length || 0 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-reminders:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
