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

// Jyotish MCP API endpoint
const JYOTISH_MCP_URL = "https://server.smithery.ai/@latiftplgu/astrology_mcp/mcp";

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
  modeSelection: string;
  fastModeSelected: string;
  jyotishModeSelected: string;
  askBirthDate: string;
  askBirthTime: string;
  askBirthCountry: string;
  askBirthCity: string;
  birthDataComplete: string;
  invalidDate: string;
}> = {
  ru: {
    welcome: "👋 Добро пожаловать в Balance Mentor",
    chooseLanguage: "Выберите язык:",
    languageSet: "🙏 Рад знакомству!\nЯ — Anil, твой ИИ-наставник по балансу жизни.\n\nПиши мне текстовые или голосовые сообщения прямо здесь, а для просмотра своего прогресса нажми кнопку ниже.",
    openApp: "🌈 Открыть Balance Mentor",
    modeSelection: "Как мы пойдём дальше?\n\n🎯 *Быстрый старт* — без астрологии, сразу к делу\n🔮 *С Джйотиш* — глубокий анализ по натальной карте\n\nНапиши *1* или *2*",
    fastModeSelected: "🎯 Отлично! Начнём с оценки сфер жизни.\n\nНасколько ты сейчас доволен сферой «Духовность»? Оцени от 1 до 10.",
    jyotishModeSelected: "🔮 Прекрасный выбор! Астрологический анализ добавит глубины рекомендациям.\n\nДля построения натальной карты мне нужны данные о рождении.",
    askBirthDate: "📅 *Шаг 1 из 4*\nНапиши дату рождения в формате:\n*ДД.ММ.ГГГГ*",
    askBirthTime: "⏰ *Шаг 2 из 4*\nЕсли знаешь точное время — напиши его (ЧЧ:ММ).\n\nЕсли нет — выбери вариант:\n*утро / день / вечер / ночь*",
    askBirthCountry: "🌍 *Шаг 3 из 4*\nВ какой стране ты родился(лась)?",
    askBirthCity: "🏙️ *Шаг 4 из 4*\nНапиши город рождения\n(или ближайший крупный город)",
    birthDataComplete: "Благодарю 🙏\nЯ сделаю разбор твоей натальной карты и использую его,\nчтобы рекомендации были *глубже и точнее*.\n\nА теперь начнём оценку сфер жизни.\n\nНасколько ты сейчас доволен сферой «Духовность»? Оцени от 1 до 10.",
    invalidDate: "Пожалуйста, введи дату в формате *ДД.ММ.ГГГГ*, например: 15.03.1990",
  },
  en: {
    welcome: "👋 Welcome to Balance Mentor",
    chooseLanguage: "Please choose your language:",
    languageSet: "🙏 Nice to meet you!\nI'm Anil, your AI guide to life balance.\n\nSend me text or voice messages here, and tap the button below to view your progress.",
    openApp: "🌈 Open Balance Mentor",
    modeSelection: "How shall we proceed?\n\n🎯 *Quick Start* — no astrology, straight to the point\n🔮 *With Jyotish* — deep analysis based on your birth chart\n\nType *1* or *2*",
    fastModeSelected: "🎯 Great! Let's start with assessing life areas.\n\nHow satisfied are you with «Spirituality» right now? Rate from 1 to 10.",
    jyotishModeSelected: "🔮 Wonderful choice! Astrological analysis will add depth to the recommendations.\n\nTo build your birth chart, I need some birth data.",
    askBirthDate: "📅 *Step 1 of 4*\nPlease enter your birth date in format:\n*DD.MM.YYYY*",
    askBirthTime: "⏰ *Step 2 of 4*\nIf you know the exact time — write it (HH:MM).\n\nIf not — choose an option:\n*morning / afternoon / evening / night*",
    askBirthCountry: "🌍 *Step 3 of 4*\nWhich country were you born in?",
    askBirthCity: "🏙️ *Step 4 of 4*\nWhat city were you born in?\n(or the nearest major city)",
    birthDataComplete: "Thank you 🙏\nI will analyze your birth chart and use it\nto make recommendations *deeper and more accurate*.\n\nNow let's assess your life areas.\n\nHow satisfied are you with «Spirituality» right now? Rate from 1 to 10.",
    invalidDate: "Please enter the date in *DD.MM.YYYY* format, for example: 15.03.1990",
  },
  hi: {
    welcome: "👋 Balance Mentor में आपका स्वागत है",
    chooseLanguage: "कृपया अपनी भाषा चुनें:",
    languageSet: "🙏 आपसे मिलकर खुशी हुई!\nमैं अनिल हूँ — आपका जीवन संतुलन मार्गदर्शक।\n\nमुझे यहाँ टेक्स्ट या वॉयस मैसेज भेजें, और अपनी प्रगति देखने के लिए नीचे बटन दबाएं।",
    openApp: "🌈 Balance Mentor खोलें",
    modeSelection: "हम आगे कैसे बढ़ें?\n\n🎯 *त्वरित शुरुआत* — ज्योतिष के बिना, सीधे बात पर\n🔮 *ज्योतिष के साथ* — जन्म कुंडली पर गहन विश्लेषण\n\n*1* या *2* लिखें",
    fastModeSelected: "🎯 बढ़िया! जीवन क्षेत्रों के मूल्यांकन से शुरू करते हैं।\n\nअभी आप «आध्यात्मिकता» से कितने संतुष्ट हैं? 1 से 10 तक रेट करें।",
    jyotishModeSelected: "🔮 शानदार विकल्प! ज्योतिषीय विश्लेषण सिफारिशों में गहराई जोड़ेगा।\n\nआपकी जन्म कुंडली बनाने के लिए, मुझे कुछ जन्म डेटा चाहिए।",
    askBirthDate: "📅 *चरण 1/4*\nकृपया जन्म तिथि इस प्रारूप में लिखें:\n*DD.MM.YYYY*",
    askBirthTime: "⏰ *चरण 2/4*\nयदि आप सटीक समय जानते हैं — लिखें (HH:MM)।\n\nयदि नहीं — विकल्प चुनें:\n*सुबह / दोपहर / शाम / रात*",
    askBirthCountry: "🌍 *चरण 3/4*\nआप किस देश में पैदा हुए थे?",
    askBirthCity: "🏙️ *चरण 4/4*\nआप किस शहर में पैदा हुए थे?\n(या निकटतम बड़ा शहर)",
    birthDataComplete: "धन्यवाद 🙏\nमैं आपकी जन्म कुंडली का विश्लेषण करूंगा और इसका उपयोग करूंगा\nताकि सिफारिशें *गहरी और अधिक सटीक* हों।\n\nअब जीवन क्षेत्रों का मूल्यांकन शुरू करते हैं।\n\nअभी आप «आध्यात्मिकता» से कितने संतुष्ट हैं? 1 से 10 तक रेट करें।",
    invalidDate: "कृपया तिथि *DD.MM.YYYY* प्रारूप में दर्ज करें, उदाहरण: 15.03.1990",
  },
};

// System prompt for Anil (updated with Jyotish mode awareness)
function getSystemPrompt(mode: string, birthData?: { date?: string; time?: string; country?: string; city?: string }, jyotishSummary?: Record<string, unknown>): string {
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
Данные рождения пользователя:
- Дата: ${birthData?.date || "не указана"}
- Время: ${birthData?.time || "не указано"}
- Страна: ${birthData?.country || "не указана"}
- Город: ${birthData?.city || "не указан"}

Астрологический анализ:
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
  const { error } = await supabase.from("chat_messages").insert({
    telegram_id: telegramId,
    role,
    content,
  });
  
  if (error) {
    console.error("Error saving chat message:", error);
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

// Call Jyotish MCP API to get astrological analysis
async function callJyotishMCP(birthData: {
  date: string;
  time: string;
  country: string;
  city: string;
}): Promise<Record<string, unknown> | null> {
  console.log("Calling Jyotish MCP API with birth data:", JSON.stringify(birthData));
  
  try {
    // Format date for API (convert DD.MM.YYYY to YYYY-MM-DD)
    const dateParts = birthData.date.split(/[.\-\/]/);
    let formattedDate = birthData.date;
    if (dateParts.length === 3) {
      // Assume DD.MM.YYYY format
      if (dateParts[0].length <= 2) {
        formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }
    
    // MCP SSE request - the smithery MCP uses Server-Sent Events format
    const requestBody = {
      method: "tools/call",
      params: {
        name: "get_natal_chart",
        arguments: {
          birth_date: formattedDate,
          birth_time: birthData.time,
          birth_place: `${birthData.city}, ${birthData.country}`,
          house_system: "placidus"
        }
      }
    };
    
    console.log("MCP request body:", JSON.stringify(requestBody));
    
    const response = await fetch(JYOTISH_MCP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jyotish MCP error:", response.status, errorText);
      // Don't fail completely - return basic summary
      return createFallbackJyotishSummary(birthData);
    }
    
    const contentType = response.headers.get("content-type") || "";
    let result;
    
    if (contentType.includes("text/event-stream")) {
      // Handle SSE response
      const text = await response.text();
      console.log("MCP SSE response:", text.substring(0, 500));
      // Parse SSE data
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            result = JSON.parse(line.substring(6));
            break;
          } catch {
            // Continue to next line
          }
        }
      }
    } else {
      result = await response.json();
    }
    
    console.log("Jyotish MCP response:", JSON.stringify(result)?.substring(0, 500));
    
    if (result && result.result) {
      return {
        raw_data: result.result,
        summary: extractJyotishSummary(result.result),
        calculated_at: new Date().toISOString()
      };
    }
    
    // Return parsed result or fallback
    return result || createFallbackJyotishSummary(birthData);
  } catch (error) {
    console.error("Error calling Jyotish MCP:", error);
    // Return fallback summary so coaching can continue
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
  messages: { role: string; content: string }[], 
  userLanguage: string, 
  mode: string = "fast", 
  birthData?: any, 
  jyotishSummary?: Record<string, unknown>,
  stateContext?: { stage: string; currentSphereIndex: number; pointAIndex?: number; pointBIndex?: number }
): Promise<string> {
  console.log("=== ASKING ANIL ===");
  console.log("Messages count:", messages.length);
  console.log("Language:", userLanguage);
  console.log("Mode:", mode);
  console.log("State context:", JSON.stringify(stateContext));
  
  const languageContext = `\n\n🌐 ТЕКУЩИЙ ЯЗЫК ПОЛЬЗОВАТЕЛЯ: ${userLanguage === "ru" ? "Русский" : userLanguage === "hi" ? "Хинди" : "Английский"}. Отвечай ТОЛЬКО на этом языке.`;
  
  // Build state context for AI
  let stateInstruction = "";
  if (stateContext) {
    const { stage, currentSphereIndex, pointAIndex, pointBIndex } = stateContext;
    
    if (stage === STAGES.SCORING && currentSphereIndex < SPHERES.length) {
      const nextSphere = SPHERES[currentSphereIndex];
      const sphereName = userLanguage === "ru" ? nextSphere.ru : userLanguage === "hi" ? nextSphere.hi : nextSphere.en;
      stateInstruction = `\n\n🎯 КРИТИЧЕСКИ ВАЖНО - ТЕКУЩАЯ ЗАДАЧА: 
Ты ОБЯЗАН спросить оценку (1-10) ТОЛЬКО для сферы «${sphereName}». 
Это сфера №${currentSphereIndex + 1} из 7. 
❗ ЗАПРЕЩЕНО спрашивать о предыдущих сферах!
❗ ЗАПРЕЩЕНО повторять вопрос о Духовности если это не сфера №1!
Задай ОДИН короткий вопрос: "Насколько ты доволен сферой «${sphereName}»? Оцени от 1 до 10."`;
      console.log("Generated state instruction for sphere:", sphereName, "index:", currentSphereIndex);
    } else if (stage === STAGES.POINT_A) {
      const idx = pointAIndex ?? 0;
      if (idx < SPHERES.length) {
        const sphere = SPHERES[idx];
        const sphereName = userLanguage === "ru" ? sphere.ru : userLanguage === "hi" ? sphere.hi : sphere.en;
        stateInstruction = `\n\n🎯 ТЕКУЩАЯ ЗАДАЧА: Спроси пользователя о Точке A (текущей ситуации) для сферы «${sphereName}».`;
      }
    } else if (stage === STAGES.POINT_B) {
      const idx = pointBIndex ?? 0;
      if (idx < SPHERES.length) {
        const sphere = SPHERES[idx];
        const sphereName = userLanguage === "ru" ? sphere.ru : userLanguage === "hi" ? sphere.hi : sphere.en;
        stateInstruction = `\n\n🎯 ТЕКУЩАЯ ЗАДАЧА: Спроси пользователя о Точке B (желаемом результате) для сферы «${sphereName}».`;
      }
    } else if (stage === STAGES.DAILY) {
      stateInstruction = `\n\n🎯 ТЕКУЩАЯ ЗАДАЧА: Дай ежедневные рекомендации или ответь на вопрос пользователя в режиме сопровождения.`;
    }
  }
  
  const systemPrompt = getSystemPrompt(mode, birthData, jyotishSummary);
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt + languageContext + stateInstruction },
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
          currentState.point_a_index = 0;
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

// Handle mode selection and jyotish flow
// deno-lint-ignore no-explicit-any
async function handleModeAndBirthFlow(
  supabase: any,
  chatId: number,
  telegramId: string,
  userText: string,
  currentState: ConversationState,
  userLanguage: string
): Promise<boolean> {
  const msgs = MESSAGES[userLanguage] || MESSAGES.en;
  
  // Handle mode selection
  if (currentState.stage === STAGES.SELECT_MODE) {
    const mode = parseModeSelection(userText);
    
    if (mode === "fast") {
      await updateProfileMode(supabase, telegramId, "fast");
      currentState.stage = STAGES.SCORING;
      currentState.current_sphere_index = 0;
      await updateConversationState(supabase, telegramId, currentState);
      await sendMessage(chatId, msgs.fastModeSelected);
      return true;
    } else if (mode === "jyotish") {
      await updateProfileMode(supabase, telegramId, "jyotish");
      currentState.stage = STAGES.BIRTH_DATE;
      await updateConversationState(supabase, telegramId, currentState);
      await sendMessage(chatId, msgs.jyotishModeSelected);
      await sendMessage(chatId, msgs.askBirthDate);
      return true;
    }
    // If invalid selection, re-ask
    await sendMessage(chatId, msgs.modeSelection);
    return true;
  }
  
  // Handle birth date
  if (currentState.stage === STAGES.BIRTH_DATE) {
    const birthDate = parseBirthDate(userText);
    if (birthDate) {
      currentState.birth_date = birthDate;
      await updateProfileBirthData(supabase, telegramId, { birth_date: birthDate });
      currentState.stage = STAGES.BIRTH_TIME;
      await updateConversationState(supabase, telegramId, currentState);
      await sendMessage(chatId, msgs.askBirthTime);
    } else {
      await sendMessage(chatId, msgs.invalidDate);
    }
    return true;
  }
  
  // Handle birth time
  if (currentState.stage === STAGES.BIRTH_TIME) {
    const birthTime = parseBirthTime(userText);
    currentState.birth_time = birthTime || userText;
    await updateProfileBirthData(supabase, telegramId, { birth_time: birthTime || userText });
    currentState.stage = STAGES.BIRTH_COUNTRY;
    await updateConversationState(supabase, telegramId, currentState);
    await sendMessage(chatId, msgs.askBirthCountry);
    return true;
  }
  
  // Handle birth country
  if (currentState.stage === STAGES.BIRTH_COUNTRY) {
    const country = userText.replace(/^🎙\s*/, "").trim();
    currentState.birth_country = country;
    await updateProfileBirthData(supabase, telegramId, { birth_country: country });
    currentState.stage = STAGES.BIRTH_CITY;
    await updateConversationState(supabase, telegramId, currentState);
    await sendMessage(chatId, msgs.askBirthCity);
    return true;
  }
  
  // Handle birth city
  if (currentState.stage === STAGES.BIRTH_CITY) {
    const city = userText.replace(/^🎙\s*/, "").trim();
    currentState.birth_city = city;
    await updateProfileBirthData(supabase, telegramId, { birth_city: city });
    
    // Send typing action while calling MCP
    await sendChatAction(chatId, "typing");
    
    // Call Jyotish MCP API to get astrological analysis
    const birthData = {
      date: currentState.birth_date || "",
      time: currentState.birth_time || "12:00",
      country: currentState.birth_country || "",
      city: city
    };
    
    console.log("Calling Jyotish MCP with birth data:", JSON.stringify(birthData));
    
    const jyotishSummary = await callJyotishMCP(birthData);
    
    if (jyotishSummary) {
      // Save jyotish summary to profile
      await updateProfileJyotishSummary(supabase, telegramId, jyotishSummary);
      console.log("Jyotish summary saved to profile");
      
      // Also save sphere accents if available
      const profile = await getUserProfile(supabase, telegramId);
      if (profile && jyotishSummary.summary) {
        const summary = jyotishSummary.summary as Record<string, unknown>;
        const sphereAccents = summary.sphere_accents as Record<string, string> | undefined;
        if (sphereAccents) {
          for (const [sphere, accent] of Object.entries(sphereAccents)) {
            await saveSphereDetails(supabase, profile.id, sphere, { jyotish_accent: accent });
          }
          console.log("Sphere accents saved from Jyotish data");
        }
      }
    }
    
    // Move to scoring
    currentState.stage = STAGES.SCORING;
    currentState.current_sphere_index = 0;
    await updateConversationState(supabase, telegramId, currentState);
    
    await sendMessage(chatId, msgs.birthDataComplete);
    return true;
  }
  
  return false; // Not handled by this function
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
    if (update.message?.text === "/start" || update.message?.text?.startsWith("/start ")) {
      const chatId = update.message.chat.id;
      const telegramId = update.message.from.id.toString();
      const firstName = update.message.from.first_name || "";
      const lastName = update.message.from.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "User";
      
      // Check for deep link payload
      const deepLinkPayload = update.message.text.replace("/start ", "").trim();

      console.log(`/start from user ${telegramId} (${fullName}), payload: ${deepLinkPayload}`);

      // Reset conversation state
      await updateConversationState(supabaseAdmin, telegramId, { 
        stage: STAGES.IDLE, 
        current_sphere_index: 0,
        scores: {},
        point_a_index: 0,
        point_b_index: 0,
      });

      // If deep link is "balance", skip to mode selection after language
      // For now, show language selection first
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

      // Send confirmation message with inline button
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
      
      // Now ask for mode selection
      await sendMessage(chatId, messages.modeSelection);

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
      const profile = await getUserProfile(supabaseAdmin, telegramId);

      // Handle mode selection and birth data collection
      const handled = await handleModeAndBirthFlow(supabaseAdmin, chatId, telegramId, userText, currentState, userLanguage);
      if (handled) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Process user message and save data based on stage
      await processUserMessage(supabaseAdmin, telegramId, userText, currentState, userLanguage);

      // Get chat history
      const history = await getChatHistory(supabaseAdmin, telegramId);
      const messagesForAI = [...history, { role: "user", content: userText }];

      // Save user message
      await saveChatMessage(supabaseAdmin, telegramId, "user", userText);

      // Get AI response with mode context and state context
      const birthData = profile ? {
        date: profile.birth_date,
        time: profile.birth_time,
        country: profile.birth_country,
        city: profile.birth_city,
      } : undefined;
      
      // Get the updated state after processing the message
      const stateForAI = await getConversationState(supabaseAdmin, telegramId);
      
      const aiResponse = await askAnil(
        messagesForAI, 
        userLanguage, 
        profile?.mode || "fast",
        birthData,
        profile?.jyotish_summary || undefined,
        {
          stage: stateForAI.stage,
          currentSphereIndex: stateForAI.current_sphere_index,
          pointAIndex: stateForAI.point_a_index,
          pointBIndex: stateForAI.point_b_index,
        }
      );

      // Update state based on AI response
      const updatedState = await getConversationState(supabaseAdmin, telegramId);
      const newState = detectStageFromAIResponse(aiResponse, updatedState);
      if (newState.stage !== updatedState.stage) {
        console.log(`Stage transition: ${updatedState.stage} -> ${newState.stage}`);
        await updateConversationState(supabaseAdmin, telegramId, newState);
      }

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
        const profile = await getUserProfile(supabaseAdmin, telegramId);

        // Handle mode selection and birth data collection
        const handled = await handleModeAndBirthFlow(supabaseAdmin, chatId, telegramId, transcribedText, currentState, userLanguage);
        if (handled) {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Process transcribed message and save data based on stage
        await processUserMessage(supabaseAdmin, telegramId, transcribedText, currentState, userLanguage);

        // Get chat history
        const history = await getChatHistory(supabaseAdmin, telegramId);
        const messagesForAI = [...history, { role: "user", content: transcribedText }];

        // Save user message (with voice indicator)
        await saveChatMessage(supabaseAdmin, telegramId, "user", `🎙 ${transcribedText}`);

        // Get AI response with mode context and state context
        const birthData = profile ? {
          date: profile.birth_date,
          time: profile.birth_time,
          country: profile.birth_country,
          city: profile.birth_city,
        } : undefined;
        
        // Get the updated state after processing the message
        const stateForAI = await getConversationState(supabaseAdmin, telegramId);
        
        const aiResponse = await askAnil(
          messagesForAI, 
          userLanguage, 
          profile?.mode || "fast",
          birthData,
          profile?.jyotish_summary || undefined,
          {
            stage: stateForAI.stage,
            currentSphereIndex: stateForAI.current_sphere_index,
            pointAIndex: stateForAI.point_a_index,
            pointBIndex: stateForAI.point_b_index,
          }
        );

        // Update state based on AI response
        const updatedState = await getConversationState(supabaseAdmin, telegramId);
        const newState = detectStageFromAIResponse(aiResponse, updatedState);
        if (newState.stage !== updatedState.stage) {
          console.log(`Stage transition: ${updatedState.stage} -> ${newState.stage}`);
          await updateConversationState(supabaseAdmin, telegramId, newState);
        }

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
