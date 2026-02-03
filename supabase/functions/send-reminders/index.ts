import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

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

// Generate personalized AI message based on user context
async function generatePersonalizedMessage(params: {
  reminderType: "morning" | "day" | "evening";
  focusArea: string;
  pointB: string | null;
  mode: string | null;
  language: string;
  userName: string | null;
}): Promise<string> {
  const { reminderType, focusArea, pointB, mode, language, userName } = params;
  
  const timeContext = {
    morning: "утро, начало дня",
    day: "середина дня",
    evening: "вечер, подведение итогов"
  };
  
  const langInstructions = {
    ru: "Ответь на русском языке.",
    en: "Respond in English.",
    hi: "हिंदी में जवाब दें।"
  };

  const systemPrompt = `Ты — Анил, личный ИИ-наставник по балансу жизни.
Напиши короткое персонализированное сообщение-письмо для пользователя.

ПРАВИЛА:
- Это не push-уведомление, а маленькое живое письмо
- НЕ используй шаблонные фразы типа "Пора поработать над собой", "Не забывай о цели"
- Будь тёплым, человечным, заботливым
- Максимум 3-4 предложения
- Учитывай контекст времени суток
- Если есть Точка B пользователя — мягко напомни о ней
- Добавь 1-2 эмодзи для тепла
- ${langInstructions[language as keyof typeof langInstructions] || langInstructions.ru}

НЕ ДЕЛАЙ:
- Не давай длинных советов
- Не задавай много вопросов
- Не используй формальный тон`;

  const userPrompt = `Время: ${timeContext[reminderType]}
Имя пользователя: ${userName || "друг"}
Сфера фокуса: ${focusArea}
Точка B (цель): ${pointB || "не определена"}
Формат работы: ${mode === "astrology" ? "с астрологией" : "быстрый старт"}

Напиши персональное ${reminderType === "morning" ? "утреннее" : reminderType === "day" ? "дневное" : "вечернее"} сообщение.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", await response.text());
      return getFallbackMessage(reminderType, focusArea, language);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || getFallbackMessage(reminderType, focusArea, language);
  } catch (error) {
    console.error("Error generating AI message:", error);
    return getFallbackMessage(reminderType, focusArea, language);
  }
}

// Fallback messages if AI fails
function getFallbackMessage(type: string, focusArea: string, language: string): string {
  const messages: Record<string, Record<string, (focus: string) => string>> = {
    ru: {
      morning: (focus) => `Доброе утро 🌱\n\nСегодня мягко фокусируемся на «${focus}».\nОдин маленький шаг — уже движение вперёд.`,
      day: (focus) => `Как ты сейчас? 🌿\n\nНапоминание про фокус «${focus}».\nЕсли уже сделал шаг — отлично. Если нет — ещё можно начать.`,
      evening: (focus) => `Время подвести итоги 🌙\n\nЧто сегодня получилось?\nДаже внимание к «${focus}» — это уже практика.`,
    },
    en: {
      morning: (focus) => `Good morning 🌱\n\nToday let's gently focus on "${focus}".\nOne small step is already progress.`,
      day: (focus) => `How are you now? 🌿\n\nReminder about "${focus}".\nIf you've taken a step — great. If not — you can still start.`,
      evening: (focus) => `Time to reflect 🌙\n\nWhat worked today?\nEven attention to "${focus}" is practice.`,
    },
    hi: {
      morning: (focus) => `सुप्रभात 🌱\n\nआज धीरे से "${focus}" पर ध्यान दें।\nएक छोटा कदम भी प्रगति है।`,
      day: (focus) => `अभी कैसे हो? 🌿\n\n"${focus}" की याद दिलाना।\nअगर कदम उठाया — बढ़िया। नहीं तो अभी भी शुरू कर सकते हो।`,
      evening: (focus) => `विचार करने का समय 🌙\n\nआज क्या अच्छा रहा?\n"${focus}" पर ध्यान देना भी अभ्यास है।`,
    },
  };
  
  const langMessages = messages[language] || messages.ru;
  const getMessage = langMessages[type] || langMessages.morning;
  return getMessage(focusArea);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const nowUtc = new Date();
    console.log(`Running reminder check at UTC: ${nowUtc.toISOString()}`);

    // Fetch all enabled reminders with user's profile data
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

      // Get user's profile for personalization
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, language, mode")
        .eq("id", reminder.user_id)
        .single();

      // Get user's focus area and Point B from sphere_details
      const { data: sphereDetail } = await supabase
        .from("sphere_details")
        .select("sphere, point_b")
        .eq("user_id", reminder.user_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      // Get user's focus area from goals as fallback
      const { data: goal } = await supabase
        .from("goals")
        .select("focus_area")
        .eq("user_id", reminder.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const focusArea = sphereDetail?.sphere || goal?.focus_area || "личный рост";
      const pointB = sphereDetail?.point_b || null;
      const userName = profile?.name || null;
      const language = profile?.language || "ru";
      const mode = profile?.mode || "fast";

      // Check each reminder type
      const reminderTypes: Array<{ type: "morning" | "day" | "evening"; time: string | null }> = [
        { type: "morning", time: reminder.morning_time },
        { type: "day", time: reminder.day_time },
        { type: "evening", time: reminder.evening_time },
      ];

      for (const { type, time } of reminderTypes) {
        if (!time) continue;
        
        if (!isWithinWindow(localTime, time)) continue;

        // Atomic insert with conflict handling to prevent race conditions
        const { data: insertedLog, error: insertError } = await supabase
          .from("reminder_logs")
          .insert({
            user_id: reminder.user_id,
            reminder_type: type,
            sent_date: localDate,
          })
          .select("id")
          .single();

        // If insert failed due to unique constraint, skip (already sent)
        if (insertError) {
          if (insertError.code === "23505") {
            skippedCount++;
            continue;
          }
          console.error(`Error inserting reminder log:`, insertError);
          continue;
        }

        // Generate personalized AI message
        const messageText = await generatePersonalizedMessage({
          reminderType: type,
          focusArea,
          pointB,
          mode,
          language,
          userName,
        });

        const sent = await sendTelegramMessage(reminder.telegram_id, messageText);

        if (sent) {
          sentCount++;
          console.log(`Sent ${type} AI-personalized reminder to user ${reminder.user_id}`);
        } else {
          // If message failed to send, delete the log so it can be retried
          await supabase
            .from("reminder_logs")
            .delete()
            .eq("id", insertedLog.id);
          console.error(`Failed to send ${type} reminder, log deleted for retry`);
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
