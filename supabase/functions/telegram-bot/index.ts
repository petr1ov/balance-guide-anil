import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://esm.sh/@modelcontextprotocol/sdk@1.12.1/client/index.js";
import { StreamableHTTPClientTransport } from "https://esm.sh/@modelcontextprotocol/sdk@1.12.1/client/streamableHttp.js";
import { SSEClientTransport } from "https://esm.sh/@modelcontextprotocol/sdk@1.12.1/client/sse.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const AITUNNEL_API_KEY = Deno.env.get("AITUNNEL_API_KEY")!;
const AITUNNEL_BASE_URL = Deno.env.get("AITUNNEL_BASE_URL") || "https://api.aitunnel.ru/v1";

// Jyotish MCP API endpoint
const JYOTISH_MCP_URL = Deno.env.get("JYOTISH_MCP_URL")!;
const JYOTISH_MCP_API_KEY = Deno.env.get("JYOTISH_MCP_API_KEY") || "";

// Mini App URL
const MINI_APP_URL = "https://balance-guide-anil.lovable.app";

// 4 spheres in order (Mini App survey)
const SPHERES = [
  { key: "spirituality", ru: "Духовность", en: "Spirituality", hi: "आध्यात्मिकता" },
  { key: "relationships", ru: "Отношения", en: "Relationships", hi: "रिश्ते" },
  { key: "health", ru: "Здоровье и энергия", en: "Health & Energy", hi: "स्वास्थ्य और ऊर्जा" },
  { key: "finance", ru: "Финансы", en: "Finance", hi: "वित्त" },
];

// Conversation stages (FSM)
const STAGES = {
  IDLE: "idle",
  SELECT_MODE: "select_mode",       // Choosing fast or jyotish mode
  BIRTH_DATE: "birth_date",         // Jyotish: collecting date
  BIRTH_TIME: "birth_time",         // Jyotish: collecting time
  BIRTH_COUNTRY: "birth_country",   // Jyotish: collecting country
  BIRTH_CITY: "birth_city",         // Jyotish: collecting city
  SCORING: "scoring",               // Collecting scores for all spheres
  POINT_A: "point_a",               // Collecting Point A for current sphere
  POINT_B: "point_b",               // Collecting Point B for current sphere
  DAILY: "daily",                   // Daily recommendations mode
};

// Localized messages
const MESSAGES: Record<string, { 
  welcome: string; 
  chooseLanguage: string; 
  languageSet: string; 
  openApp: string;
  pointAWelcome: string;
  pointBWelcome: string;
  onboardingNotComplete: string;
  consentRequired?: string;
  consentButton?: string;
}> = {
  ru: {
    welcome: "👋 Добро пожаловать в Balance Mentor",
    chooseLanguage: "Выберите язык:",
    languageSet: `Привет 🙏
Я Анил — твой личный ИИ-наставник по балансу жизни.

Чтобы начать, нужно сделать один простой шаг 👇
— открыть мини-приложение
— оценить текущую ситуацию по сферам жизни
— выбрать формат: быстрый старт или астрология

После этого мы сможем глубже поработать с целями и направлением.`,
    openApp: "🚀 Начать в мини-приложении",
    pointAWelcome: `Привет 🙏
Я Анил.

Давай спокойно посмотрим на твою текущую ситуацию в сфере «{sphere}».

🎤 Можешь рассказать голосом:
— что сейчас происходит в этой сфере?
— что тебя радует, а что напрягает?
— что хочется изменить в первую очередь?

Я внимательно слушаю.`,
    pointBWelcome: `Отлично 🌟
Теперь давай сформируем твою Точку B для сферы «{sphere}».

🎤 Запиши голосом:
— каким ты хочешь видеть идеальный результат?
— как ты хочешь чувствовать себя в этой сфере?
— если представить, что всё сложилось — как это выглядит?

Не спеши. Говори так, как чувствуешь.`,
    onboardingNotComplete: "Для начала работы с балансом, пожалуйста, открой приложение и пройди оценку сфер жизни.",
    consentRequired: `Перед началом важно ваше согласие 🙏

Нажимая кнопку «Согласен», вы подтверждаете, что:
• даёте согласие на обработку персональных данных
• ознакомлены с политикой конфиденциальности
• соглашаетесь на получение информационных и сервисных уведомлений

🔗 Документы:
• [Политика обработки персональных данных](https://cloud.mail.ru/public/Mny1/xqg7SXe26)
• [Согласие на обработку персональных данных](https://cloud.mail.ru/public/n9PR/h4eADBQoi)
• [Согласие на получение информационной и рекламной рассылки](https://cloud.mail.ru/public/an1n/w3Xewwu9s)

Вы можете отозвать согласие в любой момент в настройках профиля.`,
    consentButton: "Согласен ✅",
  },
  en: {
    welcome: "👋 Welcome to Balance Mentor",
    chooseLanguage: "Please choose your language:",
    languageSet: "🙏 Nice to meet you!\nI'm Anil, your AI guide to life balance.\n\nTap the button below to start assessing your life areas in the app.",
    openApp: "🌈 Open Balance Mentor",
    pointAWelcome: `Hello 🙏
I'm Anil.

Let's calmly look at your current situation in «{sphere}».

🎤 You can tell me by voice:
— what's happening in this area right now?
— what makes you happy and what bothers you?
— what would you like to change first?

I'm listening carefully.`,
    pointBWelcome: `Great 🌟
Now let's form your Point B for «{sphere}».

🎤 Record by voice:
— what do you want the ideal result to look like?
— how do you want to feel in this area?
— if you imagine everything worked out — what does it look like?

Take your time. Speak as you feel.`,
    onboardingNotComplete: "To start working on your balance, please open the app and complete the life areas assessment.",
  },
  hi: {
    welcome: "👋 Balance Mentor में आपका स्वागत है",
    chooseLanguage: "कृपया अपनी भाषा चुनें:",
    languageSet: "🙏 आपसे मिलकर खुशी हुई!\nमैं अनिल हूँ — आपका जीवन संतुलन मार्गदर्शक।\n\nऐप में जीवन क्षेत्रों का मूल्यांकन शुरू करने के लिए नीचे बटन दबाएं।",
    openApp: "🌈 Balance Mentor खोलें",
    pointAWelcome: `नमस्ते 🙏
मैं अनिल हूं।

आइए शांति से «{sphere}» में आपकी वर्तमान स्थिति देखें।

🎤 आप वॉयस से बता सकते हैं:
— इस क्षेत्र में अभी क्या हो रहा है?
— क्या आपको खुश करता है और क्या परेशान करता है?
— सबसे पहले क्या बदलना चाहते हैं?

मैं ध्यान से सुन रहा हूं।`,
    pointBWelcome: `बढ़िया 🌟
अब «{sphere}» के लिए आपका बिंदु B तय करें।

🎤 वॉयस से रिकॉर्ड करें:
— आदर्श परिणाम कैसा दिखना चाहिए?
— इस क्षेत्र में आप कैसा महसूस करना चाहते हैं?
— अगर सब कुछ ठीक हो जाए — तो कैसा दिखेगा?

जल्दबाजी न करें। जैसा महसूस करें वैसा बोलें।`,
    onboardingNotComplete: "अपने संतुलन पर काम शुरू करने के लिए, कृपया ऐप खोलें और जीवन क्षेत्रों का मूल्यांकन पूरा करें।",
  },
};

// NEW Anil System Prompt - Conversational mentor only, no surveys/scoring
function getSystemPrompt(userLanguage: string, jyotishSummary?: Record<string, unknown>): string {
  const basePrompt = `Ты — Анил, личный ИИ-наставник пользователя.

🧘 ТВОЯ РОЛЬ:
— вести живой, тёплый диалог
— помогать человеку осмыслить свою жизнь
— задавать глубокие, но простые вопросы
— работать голосом и текстом
— помогать формировать Точку B (желаемое будущее)
— поддерживать, рекомендовать, сопровождать

❌ ВАЖНО — ТЫ НЕ ДЕЛАЕШЬ:
— ты НЕ проводишь опросы
— ты НЕ спрашиваешь оценки по шкале (1-10)
— ты НЕ собираешь данные для астрологии
— ты НЕ предлагаешь выбрать режим старта
— ты НЕ спрашиваешь дату/время/место рождения

Все цифры, шкалы и ввод данных происходят в mini-приложении.
Ты работаешь только с осознанностью и словами человека.

🌍 ЯЗЫК:
Текущий язык пользователя: ${userLanguage === "ru" ? "Русский" : userLanguage === "hi" ? "Хинди" : "Английский"}
Отвечай ТОЛЬКО на этом языке. Никогда не переключай язык сам.

🧩 4 СФЕРЫ ЖИЗНИ:
1. Духовность / Внутренняя гармония / Смысл
2. Отношения
3. Здоровье и энергия
4. Финансы

💬 КОГДА ПОЛЬЗОВАТЕЛЬ ОПИСЫВАЕТ ТОЧКУ A (текущую ситуацию):
— слушай внимательно
— задавай уточняющие вопросы мягко
— не давай советов сразу
— помоги ему осознать, что происходит
— подтверди: "Я понял, спасибо что поделился"

🎯 КОГДА ПОЛЬЗОВАТЕЛЬ ОПИСЫВАЕТ ТОЧКУ B (желаемый результат):
— помоги ему визуализировать идеал
— задавай вопросы: "А как ты будешь себя чувствовать?", "Что изменится?"
— не исправляй его формулировки
— поддерживай его видение

📅 ЕЖЕДНЕВНЫЕ РЕКОМЕНДАЦИИ:
Когда пользователь готов действовать, давай 3-5 простых шагов:
— конкретные
— выполнимые за день
— связаны с его Точкой B

Формат:
"🔹 Сегодняшний фокус: {сфера}
1. ...
2. ...
3. ..."

❗ Лучше маленький шаг, чем идеальный план

🧘 СТИЛЬ ОБЩЕНИЯ:
— спокойно
— без давления
— без «коучинга»
— без умничанья
— больше вопросов, чем советов
— поддержка > инструкции
— используй эмодзи умеренно для тепла 🌱

🚫 ЗАПРЕЩЕНО:
— Задавать два вопроса подряд
— Давать непрошенные советы
— Критиковать выбор пользователя
— Использовать токсичную мотивацию
— Упоминать AI, GPT, технические детали
— Спрашивать оценки по шкале
— Проводить опросы
— Спрашивать время уведомлений
— Собирать настройки напоминаний

🔔 ПРО УВЕДОМЛЕНИЯ:
Ты НЕ спрашиваешь у пользователя время уведомлений и НЕ собираешь эти данные в чате.

Если тема уведомлений возникает:
— мягко объясни, зачем они нужны (регулярная поддержка, фокус)
— предложи открыть mini-приложение для настройки
— скажи: "Время ты выбираешь сам в настройках мини-приложения. Там удобно всё настроить."
— не настаивай, не дави и не повторяйся

Пример фразы:
"Кстати, чтобы я мог поддерживать тебя регулярно, очень советую включить уведомления 🌿
Это можно сделать в мини-приложении — там удобно выбрать время."

Ты — не гуру. Ты — проводник.
Ты слушаешь. Ты поддерживаешь. Ты помогаешь увидеть путь.`;

  // Add Jyotish context if available
  if (jyotishSummary) {
    const jyotishContext = `

🔮 АСТРОЛОГИЧЕСКИЕ ДАННЫЕ ДОСТУПНЫ:
${JSON.stringify(jyotishSummary, null, 2)}

КАК ИСПОЛЬЗОВАТЬ:
— НЕ говори «по звёздам тебе нельзя»
— ГОВОРИ: «у тебя сильная энергия в…», «важно двигаться мягко»
— Делай акценты мягко, не навязчиво
— Никогда не предсказывай будущее и не пугай
— Используй астрологию для поддержки, а не ограничений`;

    return basePrompt + jyotishContext;
  }

  return basePrompt;
}

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
  
  const audioResponse = await fetch(audioUrl);
  const audioBlob = await audioResponse.blob();
  
  console.log("Audio blob size:", audioBlob.size);
  
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.ogg");
  formData.append("model", "whisper-1");
  
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
  // chat_messages.user_id is NOT NULL; resolve it from profiles by telegram_id
  const profile = await getUserProfile(supabase, telegramId);
  const userId = profile?.id;

  if (!userId) {
    console.warn("Skipping chat message save: no profile for telegram_id", telegramId);
    return;
  }

  const { error } = await supabase.from("chat_messages").insert({
    user_id: userId,
    telegram_id: telegramId,
    role,
    content,
  });

  if (error) {
    console.error("Error saving chat message:", error);
  }
}

// Track analytics event
// deno-lint-ignore no-explicit-any
async function trackEvent(supabase: any, telegramId: string, event: string, metadata?: Record<string, unknown>) {
  try {
    const profile = await getUserProfile(supabase, telegramId);
    const userId = profile?.id || null;

    await supabase.from("events").insert({
      event,
      user_id: userId,
      telegram_id: telegramId,
      metadata: metadata || null,
    });
    console.log(`[Analytics] Tracked event: ${event}`, metadata || "");
  } catch (err) {
    console.error(`[Analytics] Error tracking event "${event}":`, err);
  }
}

// Calculate cost based on model and tokens
function calculateCost(totalTokens: number, model: string): number {
  // Pricing per 1K tokens (approximate for AITunnel)
  const pricePerThousand: Record<string, number> = {
    "gemini-2.5-flash": 0.00035,
    "gemini-2.5-pro": 0.0015,
    "whisper-1": 0.006, // per minute, roughly 150 tokens/min
    "gpt-4o-mini": 0.0003,
    "gpt-4o": 0.005,
  };

  const price = pricePerThousand[model] ?? 0.0005;
  return (totalTokens / 1000) * price;
}

// Track AI usage for cost monitoring
// deno-lint-ignore no-explicit-any
async function trackAIUsage(
  supabase: any,
  telegramId: string,
  usageType: string,
  model: string,
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number },
  metadata?: Record<string, unknown>
) {
  try {
    const profile = await getUserProfile(supabase, telegramId);
    const userId = profile?.id || null;
    const totalTokens = usage?.total_tokens || 0;

    await supabase.from("ai_usage").insert({
      user_id: userId,
      telegram_id: telegramId,
      usage_type: usageType,
      model,
      input_tokens: usage?.prompt_tokens || 0,
      output_tokens: usage?.completion_tokens || 0,
      total_tokens: totalTokens,
      cost_usd: calculateCost(totalTokens, model),
      metadata: metadata || null,
    });
  } catch (err) {
    console.error(`[Analytics] Error tracking AI usage:`, err);
  }
}

interface ConversationState {
  stage: string;
  current_sphere_index: number;
  scores?: Record<string, number>;
  point_a_index?: number;
  point_b_index?: number;
  birth_date?: string;
  birth_time?: string;
  birth_country?: string;
  birth_city?: string;
}

// deno-lint-ignore no-explicit-any
async function getConversationState(supabase: any, telegramId: string): Promise<ConversationState> {
  const { data } = await supabase
    .from("profiles")
    .select("conversation_state")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  
  return data?.conversation_state || { stage: STAGES.IDLE, current_sphere_index: 0, scores: {} };
}

// deno-lint-ignore no-explicit-any
async function updateConversationState(supabase: any, telegramId: string, state: ConversationState) {
  await supabase
    .from("profiles")
    .update({ conversation_state: state })
    .eq("telegram_id", telegramId);
}

// deno-lint-ignore no-explicit-any
async function getUserProfile(supabase: any, telegramId: string): Promise<{ id: string; language: string; mode: string; birth_date: string | null; birth_time: string | null; birth_country: string | null; birth_city: string | null; jyotish_summary: Record<string, unknown> | null } | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, language, mode, birth_date, birth_time, birth_country, birth_city, jyotish_summary")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  
  return data;
}

// deno-lint-ignore no-explicit-any
async function getUserLanguage(supabase: any, telegramId: string): Promise<string> {
  const profile = await getUserProfile(supabase, telegramId);
  return profile?.language || "ru";
}

// deno-lint-ignore no-explicit-any
async function updateProfileMode(supabase: any, telegramId: string, mode: string) {
  await supabase
    .from("profiles")
    .update({ mode })
    .eq("telegram_id", telegramId);
}

// deno-lint-ignore no-explicit-any
async function updateProfileBirthData(supabase: any, telegramId: string, data: { birth_date?: string; birth_time?: string; birth_country?: string; birth_city?: string }) {
  await supabase
    .from("profiles")
    .update(data)
    .eq("telegram_id", telegramId);
}

// deno-lint-ignore no-explicit-any
async function updateProfileJyotishSummary(supabase: any, telegramId: string, jyotishSummary: Record<string, unknown>) {
  await supabase
    .from("profiles")
    .update({ jyotish_summary: jyotishSummary })
    .eq("telegram_id", telegramId);
}

// Call Jyotish MCP via MCP protocol (Smithery transport)
async function callJyotishMCP(birthData: {
  date: string;
  time: string;
  country: string;
  city: string;
}): Promise<Record<string, unknown> | null> {
  console.log("Calling Jyotish MCP via SDK with birth data:", JSON.stringify(birthData));
  
  try {
    // Format date for API (convert DD.MM.YYYY to YYYY-MM-DD)
    const dateParts = birthData.date.split(/[.\-\/]/);
    let formattedDate = birthData.date;
    if (dateParts.length === 3) {
      if (dateParts[0].length <= 2) {
        formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }

    if (!JYOTISH_MCP_URL) {
      console.error("JYOTISH_MCP_URL is not configured!");
      return createFallbackJyotishSummary(birthData);
    }

    console.log("JYOTISH_MCP_URL:", JYOTISH_MCP_URL);
    console.log("JYOTISH_MCP_API_KEY:", JYOTISH_MCP_API_KEY ? "SET" : "NOT SET");

    // Create headers for auth
    const headers: Record<string, string> = {};
    if (JYOTISH_MCP_API_KEY) {
      headers["Authorization"] = `Bearer ${JYOTISH_MCP_API_KEY}`;
    }

    // Create MCP client
    const mcpClient = new Client(
      { name: "balance-bot", version: "1.0.0" },
      { capabilities: {} }
    );

    // Try Streamable HTTP first, then fall back to SSE
    let connected = false;
    
    // Attempt 1: Streamable HTTP at /mcp
    try {
      const mcpUrl = JYOTISH_MCP_URL.endsWith("/mcp") ? JYOTISH_MCP_URL : `${JYOTISH_MCP_URL}/mcp`;
      console.log("Attempting Streamable HTTP connection to:", mcpUrl);
      const transport = new StreamableHTTPClientTransport(
        new URL(mcpUrl),
        { requestInit: { headers } }
      );
      await mcpClient.connect(transport);
      connected = true;
      console.log("Connected via Streamable HTTP");
    } catch (e) {
      console.log("Streamable HTTP failed:", e.message);
    }

    // Attempt 2: SSE transport at /sse
    if (!connected) {
      try {
        const sseUrl = JYOTISH_MCP_URL.endsWith("/sse") ? JYOTISH_MCP_URL : `${JYOTISH_MCP_URL}/sse`;
        console.log("Attempting SSE connection to:", sseUrl);
        const sseTransport = new SSEClientTransport(
          new URL(sseUrl),
          { requestInit: { headers } }
        );
        await mcpClient.connect(sseTransport);
        connected = true;
        console.log("Connected via SSE");
      } catch (e2) {
        console.log("SSE also failed:", e2.message);
      }
    }

    // Attempt 3: Streamable HTTP at root URL
    if (!connected) {
      try {
        console.log("Attempting Streamable HTTP at root:", JYOTISH_MCP_URL);
        const transport3 = new StreamableHTTPClientTransport(
          new URL(JYOTISH_MCP_URL),
          { requestInit: { headers } }
        );
        await mcpClient.connect(transport3);
        connected = true;
        console.log("Connected via Streamable HTTP at root");
      } catch (e3) {
        console.error("All MCP connection attempts failed:", e3.message);
        return createFallbackJyotishSummary(birthData);
      }
    }

    // Call the get_natal_chart tool
    const toolArgs = {
      birth_date: formattedDate,
      birth_time: birthData.time,
      birth_place: `${birthData.city}, ${birthData.country}`,
      house_system: "placidus"
    };
    console.log("Calling get_natal_chart with args:", JSON.stringify(toolArgs));

    const result = await mcpClient.callTool({
      name: "get_natal_chart",
      arguments: toolArgs,
    });

    console.log("MCP callTool result:", JSON.stringify(result)?.substring(0, 1000));

    // Close connection
    try { await mcpClient.close(); } catch { /* ignore close errors */ }

    // Extract content from MCP result
    if (result && result.content) {
      // MCP SDK returns content as array of { type, text } objects
      const contentArray = result.content as Array<{ type: string; text?: string }>;
      let rawData: unknown = result.content;
      
      // Try to parse text content as JSON
      for (const item of contentArray) {
        if (item.type === "text" && item.text) {
          try {
            rawData = JSON.parse(item.text);
          } catch {
            rawData = { text: item.text };
          }
          break;
        }
      }

      return {
        raw_data: rawData,
        summary: extractJyotishSummary(rawData),
        calculated_at: new Date().toISOString()
      };
    }

    console.warn("MCP result has no content, using fallback");
    return createFallbackJyotishSummary(birthData);
  } catch (error) {
    console.error("Error calling Jyotish MCP via SDK:", error);
    return createFallbackJyotishSummary(birthData);
  }
}

// Extract summary from raw jyotish data
function extractJyotishSummary(rawData: unknown): Record<string, unknown> {
  // Parse the raw data and extract key insights
  const summary: Record<string, unknown> = {
    available: true,
    source: "jyotish_mcp"
  };
  
  if (typeof rawData === "object" && rawData !== null) {
    const data = rawData as Record<string, unknown>;
    
    // Extract planets if available
    if (data.planets) {
      summary.planets = data.planets;
    }
    
    // Extract houses if available
    if (data.houses) {
      summary.houses = data.houses;
    }
    
    // Extract ascendant/lagna
    if (data.ascendant || data.lagna) {
      summary.ascendant = data.ascendant || data.lagna;
    }
    
    // Extract moon sign
    if (data.moon_sign || data.rashi) {
      summary.moon_sign = data.moon_sign || data.rashi;
    }
    
    // Extract nakshatra
    if (data.nakshatra) {
      summary.nakshatra = data.nakshatra;
    }
    
    // Generate sphere accents based on planetary positions
    summary.sphere_accents = generateSphereAccents(data);
  }
  
  return summary;
}

// Generate accents for each sphere based on jyotish data
function generateSphereAccents(data: Record<string, unknown>): Record<string, string> {
  const accents: Record<string, string> = {};
  
  // Map planets/houses to spheres (simplified vedic astrology mapping)
  // These are generic insights - the AI will use them to personalize advice
  
  if (data.sun || data.surya) {
    accents.career = "Солнце влияет на реализацию и самовыражение";
    accents.spirituality = "Солнце указывает на путь самопознания";
  }
  
  if (data.moon || data.chandra) {
    accents.relationships = "Луна определяет эмоциональную природу в отношениях";
    accents.rest = "Луна влияет на внутреннее спокойствие и отдых";
  }
  
  if (data.jupiter || data.guru) {
    accents.finance = "Юпитер - показатель богатства и процветания";
    accents.spirituality = "Юпитер указывает на духовный рост";
  }
  
  if (data.venus || data.shukra) {
    accents.relationships = "Венера управляет любовью и гармонией";
    accents.environment = "Венера влияет на красоту и комфорт окружения";
  }
  
  if (data.mars || data.mangal) {
    accents.health = "Марс даёт энергию и жизненную силу";
    accents.career = "Марс определяет целеустремлённость";
  }
  
  if (data.saturn || data.shani) {
    accents.career = "Сатурн учит терпению и упорству в работе";
    accents.health = "Сатурн напоминает о дисциплине для здоровья";
  }
  
  if (data.mercury || data.budh) {
    accents.finance = "Меркурий влияет на деловую хватку";
    accents.environment = "Меркурий связан с коммуникацией в окружении";
  }
  
  return accents;
}

// Create fallback summary when MCP is unavailable
function createFallbackJyotishSummary(birthData: { date: string; time: string; country: string; city: string }): Record<string, unknown> {
  console.log("Creating fallback Jyotish summary for:", birthData);
  return {
    available: false,
    note: "Астрологический анализ временно недоступен. Рекомендации будут основаны на общих принципах Джйотиш.",
    birth_data: {
      date: birthData.date,
      time: birthData.time,
      place: `${birthData.city}, ${birthData.country}`
    },
    fallback_guidance: {
      spirituality: "Следуй внутреннему голосу",
      relationships: "Развивай терпение и понимание",
      health: "Слушай своё тело",
      finance: "Действуй обдуманно",
      career: "Будь последователен в целях",
      rest: "Находи время для восстановления",
      environment: "Создавай гармонию вокруг себя"
    },
    calculated_at: new Date().toISOString()
  };
}

// Save or update sphere details in database
// deno-lint-ignore no-explicit-any
async function saveSphereDetails(
  supabase: any,
  userId: string,
  sphere: string,
  data: { score?: number; point_a?: string; point_b?: string; jyotish_accent?: string }
) {
  console.log(`Saving sphere details for user ${userId}, sphere: ${sphere}`, data);
  
  // Check if record exists
  const { data: existing } = await supabase
    .from("sphere_details")
    .select("id")
    .eq("user_id", userId)
    .eq("sphere", sphere)
    .maybeSingle();
  
  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from("sphere_details")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    
    if (error) {
      console.error("Error updating sphere details:", error);
    } else {
      console.log(`Updated sphere_details for ${sphere}`);
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from("sphere_details")
      .insert({
        user_id: userId,
        sphere,
        ...data,
      });
    
    if (error) {
      console.error("Error inserting sphere details:", error);
    } else {
      console.log(`Inserted sphere_details for ${sphere}`);
    }
  }
}

// Parse score from user message (1-10)
function parseScore(text: string): number | null {
  // Remove voice message emoji if present
  const cleanText = text.replace(/^🎙\s*/, "").trim();
  
  // Try to find a number 1-10 in the text
  const match = cleanText.match(/\b(10|[1-9])\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

// Parse mode selection (1 or 2)
function parseModeSelection(text: string): "fast" | "jyotish" | null {
  const cleanText = text.replace(/^🎙\s*/, "").trim().toLowerCase();
  
  if (cleanText === "1" || cleanText.includes("быстр") || cleanText.includes("quick") || cleanText.includes("fast") || cleanText.includes("त्वरित")) {
    return "fast";
  }
  if (cleanText === "2" || cleanText.includes("джйотиш") || cleanText.includes("jyotish") || cleanText.includes("ज्योतिष") || cleanText.includes("астролог")) {
    return "jyotish";
  }
  return null;
}

// Parse birth date (DD.MM.YYYY)
function parseBirthDate(text: string): string | null {
  const cleanText = text.replace(/^🎙\s*/, "").trim();
  const match = cleanText.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  return null;
}

// Parse birth time
function parseBirthTime(text: string): string | null {
  const cleanText = text.replace(/^🎙\s*/, "").trim().toLowerCase();
  
  // Check for exact time
  const timeMatch = cleanText.match(/(\d{1,2})[:\.]?(\d{2})?/);
  if (timeMatch) {
    const hour = timeMatch[1].padStart(2, "0");
    const minute = timeMatch[2]?.padStart(2, "0") || "00";
    return `${hour}:${minute}`;
  }
  
  // Check for approximate times
  if (cleanText.includes("утр") || cleanText.includes("morning") || cleanText.includes("सुबह")) return "08:00";
  if (cleanText.includes("день") || cleanText.includes("afternoon") || cleanText.includes("दोपहर")) return "13:00";
  if (cleanText.includes("вечер") || cleanText.includes("evening") || cleanText.includes("शाम")) return "19:00";
  if (cleanText.includes("ночь") || cleanText.includes("night") || cleanText.includes("रात")) return "02:00";
  
  return cleanText; // Return as-is if can't parse
}

// Determine what stage we should be in based on AI response
function detectStageFromAIResponse(response: string, currentState: ConversationState): ConversationState {
  const newState = { ...currentState };
  
  // Check for scoring questions (asking for 1-10 rating)
  const scoringPatterns = [
    /оцени.*от\s*1\s*до\s*10/i,
    /по шкале.*1.*10/i,
    /rate.*1.*10/i,
    /scale.*1.*10/i,
    /насколько.*доволен.*сфер/i,
  ];
  
  for (const pattern of scoringPatterns) {
    if (pattern.test(response)) {
      newState.stage = STAGES.SCORING;
      return newState;
    }
  }
  
  // Check for Point A questions
  const pointAPatterns = [
    /опиши.*текущ.*ситуаци/i,
    /что происходит сейчас/i,
    /describe.*current.*situation/i,
    /what.*happening.*now/i,
    /точк.*a/i,
    /point\s*a/i,
  ];
  
  for (const pattern of pointAPatterns) {
    if (pattern.test(response)) {
      newState.stage = STAGES.POINT_A;
      return newState;
    }
  }
  
  // Check for Point B questions
  const pointBPatterns = [
    /идеальн.*результат/i,
    /как.*хотел.*было/i,
    /ideal.*result/i,
    /how.*would.*like/i,
    /точк.*b/i,
    /point\s*b/i,
    /представь.*идеальн/i,
  ];
  
  for (const pattern of pointBPatterns) {
    if (pattern.test(response)) {
      newState.stage = STAGES.POINT_B;
      return newState;
    }
  }
  
  // Check for daily recommendations
  const dailyPatterns = [
    /сегодняшний фокус/i,
    /today.*focus/i,
    /ежедневн.*рекомендац/i,
    /daily.*recommend/i,
  ];
  
  for (const pattern of dailyPatterns) {
    if (pattern.test(response)) {
      newState.stage = STAGES.DAILY;
      return newState;
    }
  }
  
  // Check for completion message
  const completionPatterns = [
    /теперь я вижу твою картину целиком/i,
    /now i see your complete picture/i,
    /спасибо.*картин.*целиком/i,
  ];
  
  for (const pattern of completionPatterns) {
    if (pattern.test(response)) {
      newState.stage = STAGES.DAILY;
      return newState;
    }
  }
  
  return newState;
}

// deno-lint-ignore no-explicit-any
async function askAnil(
  supabase: any,
  telegramId: string,
  messages: { role: string; content: string }[], 
  userLanguage: string, 
  jyotishSummary?: Record<string, unknown>
): Promise<string> {
  console.log("=== ASKING ANIL via AITunnel ===");
  console.log("Messages count:", messages.length);
  console.log("Language:", userLanguage);
  
  const systemPrompt = getSystemPrompt(userLanguage, jyotishSummary);
  const model = "gemini-2.5-flash";
  
  const response = await fetch(`${AITUNNEL_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AITUNNEL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("AITunnel error:", response.status, errorText);
    throw new Error(`AITunnel error: ${response.status}`);
  }
  
  const data = await response.json();
  const usage = data.usage || {};
  
  console.log("AITunnel response, tokens:", usage.total_tokens);
  
  // Track AI usage
  await trackAIUsage(supabase, telegramId, "chat", model, usage, { source: "telegram-bot" });
  
  return data.choices[0]?.message?.content || "Извини, не могу ответить сейчас.";
}

// Process user message and save data based on conversation state
// deno-lint-ignore no-explicit-any
async function processUserMessage(
  supabase: any,
  telegramId: string,
  userText: string,
  currentState: ConversationState,
  userLanguage: string
): Promise<void> {
  const profile = await getUserProfile(supabase, telegramId);
  if (!profile) {
    console.log("No profile found for telegram_id:", telegramId);
    return;
  }
  
  const userId = profile.id;
  console.log(`Processing message in stage: ${currentState.stage}, sphere index: ${currentState.current_sphere_index}`);

  // If sphere count changed (we now ask only 4 spheres), normalize indices to avoid loops/corrupted mapping
  if (currentState.stage === STAGES.SCORING && currentState.current_sphere_index >= SPHERES.length) {
    console.log("Out-of-range scoring index detected; switching to POINT_A");
    currentState.stage = STAGES.POINT_A;
    currentState.current_sphere_index = 0;
    currentState.point_a_index = 0;
    currentState.point_b_index = 0;
    await updateConversationState(supabase, telegramId, currentState);

    // If user sent a number here, it would be incorrectly saved as Point A (we were already past scoring)
    if (parseScore(userText) !== null) {
      return;
    }
  }

  if (currentState.stage === STAGES.POINT_A && (currentState.point_a_index || 0) >= SPHERES.length) {
    currentState.stage = STAGES.DAILY;
    await updateConversationState(supabase, telegramId, currentState);
    return;
  }

  if (currentState.stage === STAGES.POINT_B && (currentState.point_b_index || 0) >= SPHERES.length) {
    currentState.stage = STAGES.DAILY;
    await updateConversationState(supabase, telegramId, currentState);
    return;
  }

  // Handle scoring stage
  if (currentState.stage === STAGES.SCORING) {
    const score = parseScore(userText);
    if (score !== null) {
      const sphereIndex = currentState.current_sphere_index;
      if (sphereIndex < SPHERES.length) {
        const sphere = SPHERES[sphereIndex];
        console.log(`Saving score ${score} for sphere ${sphere.key}`);
        
        // Save score to sphere_details
        await saveSphereDetails(supabase, userId, sphere.key, { score });
        
        // Update scores in state
        const scores = currentState.scores || {};
        scores[sphere.key] = score;
        
        // Move to next sphere
        currentState.scores = scores;
        currentState.current_sphere_index = sphereIndex + 1;
        
        // If all spheres scored, prepare for Point A
        if (currentState.current_sphere_index >= SPHERES.length) {
          currentState.stage = STAGES.POINT_A;
          currentState.current_sphere_index = 0;
          currentState.point_a_index = 0;
          currentState.point_b_index = 0;
        }
        
        await updateConversationState(supabase, telegramId, currentState);
      }
    }
  }
  
  // Handle Point A stage
  else if (currentState.stage === STAGES.POINT_A) {
    const pointAIndex = currentState.point_a_index || 0;
    if (pointAIndex < SPHERES.length) {
      const sphere = SPHERES[pointAIndex];
      console.log(`Saving Point A for sphere ${sphere.key}: ${userText.substring(0, 50)}...`);
      
      // Save Point A
      const cleanText = userText.replace(/^🎙\s*/, "").trim();
      await saveSphereDetails(supabase, userId, sphere.key, { point_a: cleanText });
      
      // Move to Point B for same sphere
      currentState.stage = STAGES.POINT_B;
      currentState.point_b_index = pointAIndex;
      
      await updateConversationState(supabase, telegramId, currentState);
    }
  }
  
  // Handle Point B stage
  else if (currentState.stage === STAGES.POINT_B) {
    const pointBIndex = currentState.point_b_index || 0;
    if (pointBIndex < SPHERES.length) {
      const sphere = SPHERES[pointBIndex];
      console.log(`Saving Point B for sphere ${sphere.key}: ${userText.substring(0, 50)}...`);
      
      // Save Point B
      const cleanText = userText.replace(/^🎙\s*/, "").trim();
      await saveSphereDetails(supabase, userId, sphere.key, { point_b: cleanText });
      
      // Track Point B recorded event
      await trackEvent(supabase, telegramId, "point_b_recorded", { sphere: sphere.key });
      
      // Move to next sphere's Point A, or to daily if done
      const nextIndex = pointBIndex + 1;
      if (nextIndex < SPHERES.length) {
        currentState.stage = STAGES.POINT_A;
        currentState.point_a_index = nextIndex;
      } else {
        currentState.stage = STAGES.DAILY;
      }
      
      await updateConversationState(supabase, telegramId, currentState);
    }
  }
}

// Mode selection and birth data now handled in Mini App

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
    if (update.message?.text === "/start" || update.message?.text?.startsWith("/start ")) {
      const chatId = update.message.chat.id;
      const telegramId = update.message.from.id.toString();
      const firstName = update.message.from.first_name || "";
      const lastName = update.message.from.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "User";
      
      // Check for deep link payload
      const deepLinkPayload = update.message.text.replace("/start", "").trim();

      console.log(`/start from user ${telegramId} (${fullName}), payload: "${deepLinkPayload}"`);

      // Handle point_a or point_b deep links with optional sphere
      const isPointA = deepLinkPayload.startsWith("point_a");
      const isPointB = deepLinkPayload.startsWith("point_b");
      
      if (isPointA || isPointB) {
        // Extract sphere from payload like "point_a_spirituality"
        const sphereKey = deepLinkPayload.replace("point_a_", "").replace("point_b_", "").replace("point_a", "").replace("point_b", "");
        
        // Get user profile
        const profile = await getUserProfile(supabaseAdmin, telegramId);
        
        if (!profile) {
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

        const userLang = profile.language || "ru";
        const msgs = MESSAGES[userLang] || MESSAGES.en;
        
        // Find sphere name
        const sphere = SPHERES.find(s => s.key === sphereKey) || SPHERES[0];
        const sphereName = sphere[userLang as keyof typeof sphere] || sphere.en;
        
        // Choose appropriate message
        const welcomeMessage = isPointA 
          ? msgs.pointAWelcome.replace("{sphere}", sphereName)
          : msgs.pointBWelcome.replace("{sphere}", sphereName);
        
        // Track the event
        await trackEvent(supabaseAdmin, telegramId, isPointA ? "point_a_discussion" : "point_b_started", { sphere: sphereKey, source: "deep_link" });
        
        await sendMessage(chatId, welcomeMessage);
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Regular /start - reset conversation state
      await updateConversationState(supabaseAdmin, telegramId, { 
        stage: STAGES.IDLE, 
        current_sphere_index: 0,
        scores: {},
        point_a_index: 0,
        point_b_index: 0,
      });

      // Show language selection
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

      await answerCallbackQuery(callbackQuery.id, "✓");

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
            conversation_state: { 
              stage: STAGES.SELECT_MODE, 
              current_sphere_index: 0,
              scores: {},
              point_a_index: 0,
              point_b_index: 0,
            }
          })
          .eq("telegram_id", telegramId);
      } else {
        console.log(`Profile for ${telegramId} will be created during auth`);
      }

      const messages = MESSAGES[lang] || MESSAGES.en;

      // For Russian language - show consent message first
      if (lang === "ru" && messages.consentRequired) {
        await sendMessage(chatId, messages.consentRequired, {
          reply_markup: {
            inline_keyboard: [
              [{ text: messages.consentButton || "Согласен ✅", callback_data: "consent_accept" }],
            ],
          },
        });

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // For other languages - show app directly
      await sendMessage(chatId, messages.languageSet, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: messages.openApp,
                web_app: { url: MINI_APP_URL },
              },
            ],
          ],
        },
      });

      // Remove any persistent keyboard
      await sendMessage(chatId, "✨", {
        reply_markup: { remove_keyboard: true },
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle consent acceptance callback (Russian only)
    if (update.callback_query?.data === "consent_accept") {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const telegramId = callbackQuery.from.id.toString();

      console.log(`Consent accepted by user ${telegramId}`);

      await answerCallbackQuery(callbackQuery.id, "✓ Спасибо!");

      // Save consent to database
      const consentData = {
        consent_personal_data: true,
        consent_at: new Date().toISOString(),
        consent_version: "v1",
      };

      await supabaseAdmin
        .from("profiles")
        .update(consentData)
        .eq("telegram_id", telegramId);

      // Track consent event
      await trackEvent(supabaseAdmin, telegramId, "consent_accepted", { version: "v1" });

      const messages = MESSAGES.ru;

      // Now show the app button
      await sendMessage(chatId, messages.languageSet, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: messages.openApp,
                web_app: { url: MINI_APP_URL },
              },
            ],
          ],
        },
      });

      // Remove any persistent keyboard
      await sendMessage(chatId, "✨", {
        reply_markup: { remove_keyboard: true },
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle text messages (chat with Anil)
    if (update.message?.text && update.message.text !== "/start" && !update.message.text.startsWith("/start ")) {
      const chatId = update.message.chat.id;
      const telegramId = update.message.from.id.toString();
      const userText = update.message.text;

      console.log(`Text message from ${telegramId}: ${userText}`);

      await sendChatAction(chatId, "typing");

      // Get current state and language
      const userLanguage = await getUserLanguage(supabaseAdmin, telegramId);
      const currentState = await getConversationState(supabaseAdmin, telegramId);
      let profile = await getUserProfile(supabaseAdmin, telegramId);

      // Auto-trigger Jyotish MCP if mode=jyotish, birth data exists, but no summary yet
      const needsJyotish = profile && (profile.mode === "jyotish" || profile.mode === "astrology") && profile.birth_date && profile.birth_time && profile.birth_city && profile.birth_country && (!profile.jyotish_summary || (profile.jyotish_summary as Record<string, unknown>).available === false);
      if (needsJyotish) {
        console.log("=== AUTO-TRIGGERING Jyotish MCP ===");
        const jyotishResult = await callJyotishMCP({
          date: profile.birth_date,
          time: profile.birth_time,
          country: profile.birth_country,
          city: profile.birth_city,
        });
        if (jyotishResult) {
          await updateProfileJyotishSummary(supabaseAdmin, telegramId, jyotishResult);
          profile = await getUserProfile(supabaseAdmin, telegramId); // refresh
          console.log("Jyotish summary saved successfully");
        }
      }

      // Process user message and save data based on stage
      await processUserMessage(supabaseAdmin, telegramId, userText, currentState, userLanguage);

      // Get chat history
      const history = await getChatHistory(supabaseAdmin, telegramId);
      const messagesForAI = [...history, { role: "user", content: userText }];

      // Save user message
      await saveChatMessage(supabaseAdmin, telegramId, "user", userText);

      // Get the updated state after processing the message
      const stateForAI = await getConversationState(supabaseAdmin, telegramId);
      
      const aiResponse = await askAnil(
        supabaseAdmin,
        telegramId,
        messagesForAI, 
        userLanguage, 
        profile?.jyotish_summary || undefined
      );

      // IMPORTANT: Do NOT infer/override stage from AI text.
      // The stage is managed deterministically by processUserMessage() to avoid regressions like POINT_B -> SCORING.
      // (AI can phrase things in a way that matches regexes, which previously caused loops.)

      // Save assistant message
      await saveChatMessage(supabaseAdmin, telegramId, "assistant", aiResponse);

      // Track AI message sent
      await trackEvent(supabaseAdmin, telegramId, "ai_message_sent", { source: "text" });

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

      await sendChatAction(chatId, "typing");

      try {
        const fileLink = await getFileLink(fileId);
        const transcribedText = await speechToText(fileLink);

        if (!transcribedText || transcribedText.trim() === "") {
          await sendMessage(chatId, "Не удалось распознать голосовое сообщение. Попробуй ещё раз 🎙");
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Transcribed: ${transcribedText}`);

        // Get current state and language
        const userLanguage = await getUserLanguage(supabaseAdmin, telegramId);
        const currentState = await getConversationState(supabaseAdmin, telegramId);
        let profile = await getUserProfile(supabaseAdmin, telegramId);

        // Auto-trigger Jyotish MCP if mode=jyotish, birth data exists, but no summary yet
        const needsJyotishVoice = profile && (profile.mode === "jyotish" || profile.mode === "astrology") && profile.birth_date && profile.birth_time && profile.birth_city && profile.birth_country && (!profile.jyotish_summary || (profile.jyotish_summary as Record<string, unknown>).available === false);
        if (needsJyotishVoice) {
          console.log("=== AUTO-TRIGGERING Jyotish MCP (voice) ===");
          const jyotishResult = await callJyotishMCP({
            date: profile.birth_date,
            time: profile.birth_time,
            country: profile.birth_country,
            city: profile.birth_city,
          });
          if (jyotishResult) {
            await updateProfileJyotishSummary(supabaseAdmin, telegramId, jyotishResult);
            profile = await getUserProfile(supabaseAdmin, telegramId);
            console.log("Jyotish summary saved successfully (voice)");
          }
        }

        // Process transcribed message and save data based on stage
        await processUserMessage(supabaseAdmin, telegramId, transcribedText, currentState, userLanguage);

        // Get chat history
        const history = await getChatHistory(supabaseAdmin, telegramId);
        const messagesForAI = [...history, { role: "user", content: transcribedText }];

        // Save user message (with voice indicator)
        await saveChatMessage(supabaseAdmin, telegramId, "user", `🎙 ${transcribedText}`);

        const aiResponse = await askAnil(
          supabaseAdmin,
          telegramId,
          messagesForAI, 
          userLanguage, 
          profile?.jyotish_summary || undefined
        );

        // IMPORTANT: Do NOT infer/override stage from AI text.
        // The stage is managed deterministically by processUserMessage() to avoid regressions like POINT_B -> SCORING.
        // (AI can phrase things in a way that matches regexes, which previously caused loops.)

        // Save assistant message
        await saveChatMessage(supabaseAdmin, telegramId, "assistant", aiResponse);

        // Track AI message sent (from voice) and STT usage
        await trackEvent(supabaseAdmin, telegramId, "ai_message_sent", { source: "voice" });
        await trackAIUsage(supabaseAdmin, telegramId, "voice_stt", "whisper-1", { total_tokens: 150 });

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
