import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// Mini App URL
const MINI_APP_URL = "https://balance-guide-anil.lovable.app";

// 7 spheres in order
const SPHERES = [
  { key: "spirituality", ru: "Духовность", en: "Spirituality", hi: "आध्यात्मिकता" },
  { key: "relationships", ru: "Отношения", en: "Relationships", hi: "रिश्ते" },
  { key: "health", ru: "Здоровье и энергия", en: "Health & Energy", hi: "स्वास्थ्य और ऊर्जा" },
  { key: "finance", ru: "Финансы", en: "Finance", hi: "वित्त" },
  { key: "career", ru: "Реализация и дело", en: "Career & Purpose", hi: "करियर और उद्देश्य" },
  { key: "rest", ru: "Отдых и радость", en: "Rest & Joy", hi: "आराम और खुशी" },
  { key: "environment", ru: "Окружение и среда", en: "Environment", hi: "वातावरण" },
];

// Localized messages
const MESSAGES: Record<string, { welcome: string; chooseLanguage: string; languageSet: string; openApp: string }> = {
  ru: {
    welcome: "👋 Добро пожаловать в Balance Mentor",
    chooseLanguage: "Выберите язык:",
    languageSet: "🙏 Рад знакомству!\nЯ — Anil, твой ИИ-наставник по балансу жизни.\n\nПиши мне текстовые или голосовые сообщения прямо здесь, а для просмотра своего прогресса нажми кнопку ниже.",
    openApp: "🌈 Открыть Balance Mentor",
  },
  en: {
    welcome: "👋 Welcome to Balance Mentor",
    chooseLanguage: "Please choose your language:",
    languageSet: "🙏 Nice to meet you!\nI'm Anil, your AI guide to life balance.\n\nSend me text or voice messages here, and tap the button below to view your progress.",
    openApp: "🌈 Open Balance Mentor",
  },
  hi: {
    welcome: "👋 Balance Mentor में आपका स्वागत है",
    chooseLanguage: "कृपया अपनी भाषा चुनें:",
    languageSet: "🙏 आपसे मिलकर खुशी हुई!\nमैं अनिल हूँ — आपका जीवन संतुलन मार्गदर्शक।\n\nमुझे यहाँ टेक्स्ट या वॉयस मैसेज भेजें, और अपनी प्रगति देखने के लिए नीचे बटन दबाएं।",
    openApp: "🌈 Balance Mentor खोलें",
  },
};

// New comprehensive system prompt for Anil
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

async function sendMessage(chatId: number, text: string, options: Record<string, unknown> = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      ...options,
    }),
  });
  
  const result = await response.json();
  console.log("sendMessage result:", JSON.stringify(result));
  return result;
}

async function sendChatAction(chatId: number, action: string = "typing") {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });
}

async function getFileLink(fileId: string): Promise<string> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = await response.json();
  if (!data.ok) throw new Error("Failed to get file link");
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
}

async function speechToText(audioUrl: string): Promise<string> {
  console.log("Downloading audio from:", audioUrl);
  
  // Download the audio file
  const audioResponse = await fetch(audioUrl);
  const audioBlob = await audioResponse.blob();
  
  console.log("Audio blob size:", audioBlob.size);
  
  // Prepare form data for Whisper API
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.ogg");
  formData.append("model", "whisper-1");
  
  // Send to OpenAI Whisper via aitunnel
  const response = await fetch("https://api.aitunnel.ru/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Whisper API error:", errorText);
    throw new Error(`Whisper API error: ${response.status}`);
  }
  
  const result = await response.json();
  console.log("Transcription result:", result.text);
  return result.text;
}

// deno-lint-ignore no-explicit-any
async function getChatHistory(supabase: any, telegramId: string, limit: number = 30): Promise<{ role: string; content: string }[]> {
  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("telegram_id", telegramId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
  
  return (messages || []).reverse().map((m: { role: string; content: string }) => ({
    role: m.role,
    content: m.content,
  }));
}

// deno-lint-ignore no-explicit-any
async function saveChatMessage(supabase: any, telegramId: string, role: string, content: string) {
  const { error } = await supabase.from("chat_messages").insert({
    telegram_id: telegramId,
    role,
    content,
  });
  
  if (error) {
    console.error("Error saving chat message:", error);
  }
}

// deno-lint-ignore no-explicit-any
async function getConversationState(supabase: any, telegramId: string): Promise<{ stage: string; current_sphere_index: number }> {
  const { data } = await supabase
    .from("profiles")
    .select("conversation_state")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  
  return data?.conversation_state || { stage: "idle", current_sphere_index: 0 };
}

// deno-lint-ignore no-explicit-any
async function updateConversationState(supabase: any, telegramId: string, state: { stage: string; current_sphere_index: number }) {
  await supabase
    .from("profiles")
    .update({ conversation_state: state })
    .eq("telegram_id", telegramId);
}

// deno-lint-ignore no-explicit-any
async function getUserLanguage(supabase: any, telegramId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("language")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  
  return data?.language || "ru";
}

async function askAnil(messages: { role: string; content: string }[], userLanguage: string): Promise<string> {
  console.log("Sending to Anil:", messages.length, "messages, language:", userLanguage);
  
  // Add language context to system prompt
  const languageContext = `\n\n🌐 ТЕКУЩИЙ ЯЗЫК ПОЛЬЗОВАТЕЛЯ: ${userLanguage === "ru" ? "Русский" : userLanguage === "hi" ? "Хинди" : "Английский"}. Отвечай ТОЛЬКО на этом языке.`;
  
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
      stream: false,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI Gateway error:", response.status, errorText);
    throw new Error(`AI Gateway error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || "Извини, не могу ответить сейчас.";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log("Telegram update:", JSON.stringify(update));

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle /start command
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;
      const telegramId = update.message.from.id.toString();
      const firstName = update.message.from.first_name || "";
      const lastName = update.message.from.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "User";

      console.log(`/start from user ${telegramId} (${fullName})`);

      // Reset conversation state
      await updateConversationState(supabaseAdmin, telegramId, { stage: "idle", current_sphere_index: 0 });

      // Send welcome message with language selection
      const welcomeText = `${MESSAGES.en.welcome}\n\n${MESSAGES.en.chooseLanguage}`;
      
      await sendMessage(chatId, welcomeText, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🇷🇺 Русский", callback_data: "lang_ru" }],
            [{ text: "🇬🇧 English", callback_data: "lang_en" }],
            [{ text: "🇮🇳 हिन्दी", callback_data: "lang_hi" }],
          ],
        },
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle language selection callback
    if (update.callback_query?.data?.startsWith("lang_")) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const telegramId = callbackQuery.from.id.toString();
      const firstName = callbackQuery.from.first_name || "";
      const lastName = callbackQuery.from.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "User";
      const lang = callbackQuery.data.replace("lang_", "");

      console.log(`Language selected: ${lang} by user ${telegramId}`);

      // Answer callback to remove loading state
      await answerCallbackQuery(callbackQuery.id, "✓");

      // Upsert profile with language using telegram_id as unique identifier
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, telegram_id")
        .eq("telegram_id", telegramId)
        .maybeSingle();

      if (existingProfile) {
        await supabaseAdmin
          .from("profiles")
          .update({ 
            language: lang, 
            name: fullName,
            conversation_state: { stage: "idle", current_sphere_index: 0 }
          })
          .eq("telegram_id", telegramId);
      } else {
        console.log(`Profile for ${telegramId} will be created during auth`);
      }

      // Get localized messages
      const messages = MESSAGES[lang] || MESSAGES.en;

      // Send confirmation with Mini App button
      await sendMessage(chatId, messages.languageSet, {
        reply_markup: {
          keyboard: [
            [
              {
                text: messages.openApp,
                web_app: { url: MINI_APP_URL },
              },
            ],
          ],
          resize_keyboard: true,
        },
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle text messages (chat with Anil)
    if (update.message?.text && update.message.text !== "/start") {
      const chatId = update.message.chat.id;
      const telegramId = update.message.from.id.toString();
      const userText = update.message.text;

      console.log(`Text message from ${telegramId}: ${userText}`);

      // Show typing indicator
      await sendChatAction(chatId, "typing");

      // Get user language
      const userLanguage = await getUserLanguage(supabaseAdmin, telegramId);

      // Get chat history
      const history = await getChatHistory(supabaseAdmin, telegramId);
      
      // Add new user message
      const messagesForAI = [...history, { role: "user", content: userText }];

      // Save user message
      await saveChatMessage(supabaseAdmin, telegramId, "user", userText);

      // Get AI response
      const aiResponse = await askAnil(messagesForAI, userLanguage);

      // Save assistant message
      await saveChatMessage(supabaseAdmin, telegramId, "assistant", aiResponse);

      // Send response
      await sendMessage(chatId, aiResponse);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle voice messages
    if (update.message?.voice) {
      const chatId = update.message.chat.id;
      const telegramId = update.message.from.id.toString();
      const fileId = update.message.voice.file_id;

      console.log(`Voice message from ${telegramId}, file_id: ${fileId}`);

      // Show typing indicator
      await sendChatAction(chatId, "typing");

      try {
        // Get file link and transcribe
        const fileLink = await getFileLink(fileId);
        const transcribedText = await speechToText(fileLink);

        if (!transcribedText || transcribedText.trim() === "") {
          await sendMessage(chatId, "Не удалось распознать голосовое сообщение. Попробуй ещё раз 🎙");
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Transcribed: ${transcribedText}`);

        // Get user language
        const userLanguage = await getUserLanguage(supabaseAdmin, telegramId);

        // Get chat history
        const history = await getChatHistory(supabaseAdmin, telegramId);
        
        // Add transcribed message
        const messagesForAI = [...history, { role: "user", content: transcribedText }];

        // Save user message (with voice indicator)
        await saveChatMessage(supabaseAdmin, telegramId, "user", `🎙 ${transcribedText}`);

        // Get AI response
        const aiResponse = await askAnil(messagesForAI, userLanguage);

        // Save assistant message
        await saveChatMessage(supabaseAdmin, telegramId, "assistant", aiResponse);

        // Send response
        await sendMessage(chatId, aiResponse);

      } catch (error) {
        console.error("Voice processing error:", error);
        await sendMessage(chatId, "Произошла ошибка при обработке голосового сообщения. Попробуй написать текстом 📝");
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default response for unhandled updates
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error processing telegram update:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
