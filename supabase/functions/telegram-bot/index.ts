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

const SYSTEM_PROMPT = `You are Anil, a warm and wise life mentor.

You help users find balance across 4 areas:
- Духовность (Spirituality)
- Отношения (Relationships)  
- Здоровье (Health)
- Финансы (Finance)

You speak calmly, clearly, and supportively.
You never mention technology, AI, GPT, or any technical terms.

Your role:
- Help users assess their current balance (1–10 scale)
- Identify the weakest area
- Choose one focus area
- Guide them through:
  • Точка А (current state) - where they are now
  • Идеал (ideal vision) - what 10/10 looks like
  • Годовая цель (year goal) - where they want to be in a year
  • Краткосрочная цель (2-3 month goal)
  • План на месяц (monthly action plan)

Keep answers concise (2-4 sentences max), human, warm, and inspiring.
Use emoji sparingly for warmth 🌱

Always reply in the user's language. If they write in Russian, reply in Russian.
If they write in English, reply in English.
If they write in Hindi, reply in Hindi.

When a user gives you a number (1-10), acknowledge it warmly and ask about the next area or proceed to analysis.
When all 4 scores are given, identify the weakest area and suggest focusing on it.`;

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

async function getChatHistory(supabase: any, telegramId: string, limit: number = 20): Promise<{ role: string; content: string }[]> {
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
  
  // Reverse to get chronological order
  return (messages || []).reverse().map((m: any) => ({
    role: m.role,
    content: m.content,
  }));
}

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

async function askAnil(messages: { role: string; content: string }[]): Promise<string> {
  console.log("Sending to Anil:", messages.length, "messages");
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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
          .update({ language: lang, name: fullName })
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

      // Get chat history
      const history = await getChatHistory(supabaseAdmin, telegramId);
      
      // Add new user message
      const messagesForAI = [...history, { role: "user", content: userText }];

      // Save user message
      await saveChatMessage(supabaseAdmin, telegramId, "user", userText);

      // Get AI response
      const aiResponse = await askAnil(messagesForAI);

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

        // Get chat history
        const history = await getChatHistory(supabaseAdmin, telegramId);
        
        // Add transcribed message
        const messagesForAI = [...history, { role: "user", content: transcribedText }];

        // Save user message (with voice indicator)
        await saveChatMessage(supabaseAdmin, telegramId, "user", `🎙 ${transcribedText}`);

        // Get AI response
        const aiResponse = await askAnil(messagesForAI);

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
