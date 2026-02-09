import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 3000; // 3 seconds between requests
const MAX_MESSAGES_PER_REQUEST = 30;
const MAX_MESSAGE_LENGTH = 1000;

// In-memory rate limit store (per user)
const rateLimitStore = new Map<string, number>();

// Validate a single message
function validateMessage(content: unknown): boolean {
  if (!content || typeof content !== "string") return false;
  if (content.trim().length === 0) return false;
  if (content.length > MAX_MESSAGE_LENGTH) return false;
  return true;
}

// Check rate limit for user
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(userId);
  
  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    return false; // Rate limited
  }
  
  rateLimitStore.set(userId, now);
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS * 10;
    for (const [key, time] of rateLimitStore.entries()) {
      if (time < cutoff) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  return true;
}

// AITunnel API call (OpenAI-compatible)
async function callAITunnel(messages: { role: string; content: string }[]) {
  const AITUNNEL_API_KEY = Deno.env.get("AITUNNEL_API_KEY");
  const AITUNNEL_BASE_URL = Deno.env.get("AITUNNEL_BASE_URL") || "https://api.aitunnel.ru/v1";

  if (!AITUNNEL_API_KEY) {
    throw new Error("AITUNNEL_API_KEY is not configured");
  }

  const response = await fetch(`${AITUNNEL_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AITUNNEL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AITunnel error:", response.status, errorText);
    throw new Error(`AITunnel error: ${response.status}`);
  }

  return response.json();
}

// Track AI usage in database
async function trackAIUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  model: string,
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
) {
  try {
    const { error } = await supabase.from("ai_usage").insert({
      user_id: userId,
      usage_type: "chat",
      model,
      input_tokens: usage.prompt_tokens ?? 0,
      output_tokens: usage.completion_tokens ?? 0,
      total_tokens: usage.total_tokens ?? 0,
      cost_usd: calculateCost(usage.total_tokens ?? 0, model),
      metadata: { source: "chat-with-anil" },
    });

    if (error) {
      console.error("Failed to track AI usage:", error);
    }
  } catch (e) {
    console.error("Error tracking AI usage:", e);
  }
}

// Calculate cost based on model and tokens
function calculateCost(totalTokens: number, model: string): number {
  // Pricing per 1K tokens (approximate for Gemini Flash via AITunnel)
  const pricePerThousand: Record<string, number> = {
    "gemini-2.5-flash": 0.00035,
    "gemini-2.5-pro": 0.0015,
    "gpt-4o-mini": 0.0003,
    "gpt-4o": 0.005,
  };

  const price = pricePerThousand[model] ?? 0.0005;
  return (totalTokens / 1000) * price;
}

// Get system prompt with optional Jyotish context
function getSystemPrompt(mode: string = "fast", jyotishSummary?: Record<string, unknown>): string {
  const basePrompt = `Ты — Anil, мудрый, спокойный, поддерживающий ИИ-наставник.

🎯 ТВОЯ МИССИЯ
Помочь человеку:
1. Осознать баланс своей жизни (7 сфер, оценка 1-10)
2. Определить Точку A (текущее состояние) по каждой сфере
3. Определить Точку B (желаемый результат) по каждой сфере
4. Ежедневно сопровождать рекомендациями

🌍 ЯЗЫК
Всегда отвечай на языке пользователя:
- ru — русский
- en — английский  
- hi — хинди
❗ Никогда не переключай язык сам.

🧩 7 СФЕР ЖИЗНИ (СТРОГО ПО ПОРЯДКУ)
1. Духовность / Внутренняя гармония / Смысл
2. Отношения
3. Здоровье и энергия
4. Финансы
5. Реализация и дело
6. Отдых и радость
7. Окружение и среда

❗ КРИТИЧНО:
- Никогда не пропускай сферу
- Никогда не зацикливайся на одной сфере
- Каждая сфера задаётся ОДИН раз
- После ответа пользователя — переходи к следующей

📊 ЭТАП 1: ОЦЕНКА СФЕР (1-10)
Формат вопроса:
"Насколько ты сейчас доволен сферой «{название}»? Оцени от 1 до 10."

Правила:
- Принимаешь число и идёшь дальше
- Если пользователь пишет текст — мягко попроси число
- Никогда не повторяй вопрос без причины

🅰️ ЭТАП 2: ТОЧКА A — ТЕКУЩАЯ СИТУАЦИЯ
После ВСЕХ 7 оценок переходишь к Точке A.
Для каждой сферы спрашиваешь:
"Опиши текущую ситуацию в сфере «{название}». Что происходит сейчас?"

Правила:
- Принимаешь свободный текст
- Не анализируешь глубоко
- Не даёшь советов на этом этапе
- Просто подтверждаешь и переходишь дальше

🅱️ ЭТАП 3: ТОЧКА B — ЖЕЛАЕМЫЙ РЕЗУЛЬТАТ  
После Точки A по сфере:
"А теперь представь идеальный результат в сфере «{название}». Как бы ты хотел, чтобы было?"

Правила:
- Формулировка пользователя — закон
- Не исправляй и не оптимизируй

🎯 ЭТАП 4: СИНТЕЗ
После сбора всех данных:
"Спасибо 🤍 Теперь я вижу твою картину целиком. Дальше я буду помогать тебе двигаться от Точки A к Точке B шаг за шагом."

📅 ЭТАП 5: ЕЖЕДНЕВНЫЕ РЕКОМЕНДАЦИИ
Каждый день даёшь 3-5 простых действий:
- Конкретные
- Выполнимые за день
- Связаны с Точкой B

Формат:
"🔹 Сегодняшний фокус: {сфера}
1. ...
2. ...
3. ..."

❗ Лучше маленький шаг, чем идеальный план

🔁 ПЕРЕОЦЕНКА БАЛАНСА
Если пользователь хочет переоценить — запускаешь опрос заново.

💬 ТОН И СТИЛЬ
- Говоришь просто, тепло, без давления
- Не поучаешь, а направляешь
- Задаёшь один вопрос за раз
- Никогда не торопишь
- Помогаешь видеть путь как игру и процесс роста
- Используй эмодзи умеренно для тепла 🌱

🚫 ЗАПРЕЩЕНО
- Переходить к следующей сфере, не завершив текущую
- Задавать два вопроса подряд
- Повторять одну сферу
- Давать советы до Точки B
- Критиковать выбор пользователя
- Использовать токсичную мотивацию
- Упоминать AI, GPT, технические детали

Ты — не гуру. Ты — проводник.`;

  // Add Jyotish context if enabled
  if (mode === "jyotish" && jyotishSummary) {
    const jyotishContext = `

🔮 РЕЖИМ ДЖЙОТИШ АКТИВИРОВАН
Астрологический анализ пользователя:
${JSON.stringify(jyotishSummary, null, 2)}

🧩 КАК ИНТЕГРИРОВАТЬ ДЖЙОТИШ В РЕКОМЕНДАЦИИ:
- НЕ говори «по звёздам тебе нельзя»
- ГОВОРИ: «у тебя сильная энергия в…», «важно двигаться мягко», «лучше начинать с…»
- Делай акценты по сферам, учитывая астрологические данные
- Рекомендации должны быть глубже и персональнее
- Никогда не предсказывай будущее и не пугай
- Используй астрологию для поддержки, а не ограничений`;

    return basePrompt + jyotishContext;
  }

  return basePrompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log("Authenticated user:", userId);

    // Rate limit check
    if (!checkRateLimit(userId)) {
      console.log("Rate limit exceeded for user:", userId);
      return new Response(
        JSON.stringify({ error: "Слишком много запросов. Подождите несколько секунд." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, language } = await req.json();

    // Validate messages array
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check message count limit
    if (messages.length > MAX_MESSAGES_PER_REQUEST) {
      console.log("Too many messages:", messages.length);
      return new Response(
        JSON.stringify({ error: "Слишком много сообщений в запросе" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate last message content
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !validateMessage(lastMessage.content)) {
      console.log("Invalid message content:", lastMessage?.content?.substring(0, 100));
      return new Response(
        JSON.stringify({ error: "Некорректное сообщение" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile to get mode and jyotish summary
    const { data: profile } = await supabase
      .from("profiles")
      .select("mode, jyotish_summary")
      .eq("id", userId)
      .maybeSingle();

    const userMode = profile?.mode || "fast";
    const jyotishSummary = profile?.jyotish_summary as Record<string, unknown> | undefined;

    // Add language context to system prompt
    const userLang = language || "ru";
    const languageContext = `\n\n🌐 ТЕКУЩИЙ ЯЗЫК ПОЛЬЗОВАТЕЛЯ: ${userLang === "ru" ? "Русский" : userLang === "hi" ? "Хинди" : "Английский"}. Отвечай ТОЛЬКО на этом языке.`;

    // Get system prompt with mode and jyotish context
    const systemPrompt = getSystemPrompt(userMode, jyotishSummary);

    const model = "gemini-2.5-flash";

    // Call AITunnel API (non-streaming for usage tracking)
    const completion = await callAITunnel([
      { role: "system", content: systemPrompt + languageContext },
      ...messages,
    ]);

    const answer = completion.choices?.[0]?.message?.content || "";
    const usage = completion.usage || {};

    console.log("AITunnel response received, tokens:", usage.total_tokens);

    // Track AI usage in database
    await trackAIUsage(supabaseAdmin, userId, model, usage);

    // Return response in the same format as before
    return new Response(
      JSON.stringify({ 
        content: answer,
        usage: {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
