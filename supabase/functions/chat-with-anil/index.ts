import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive system prompt for Anil (same as telegram-bot)
const SYSTEM_PROMPT = `Ты — Anil, мудрый, спокойный, поддерживающий ИИ-наставник.

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Add language context to system prompt
    const userLang = language || "ru";
    const languageContext = `\n\n🌐 ТЕКУЩИЙ ЯЗЫК ПОЛЬЗОВАТЕЛЯ: ${userLang === "ru" ? "Русский" : userLang === "hi" ? "Хинди" : "Английский"}. Отвечай ТОЛЬКО на этом языке.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + languageContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов. Подождите немного и попробуйте снова." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Превышен лимит использования. Обратитесь к администратору." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Не удалось получить ответ. Попробуйте ещё раз." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
