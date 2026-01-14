// Internationalization utilities

export type Language = "ru" | "en" | "hi";

// Get saved language from localStorage, default to Russian
const getSavedLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("app_language");
    if (saved && ["ru", "en", "hi"].includes(saved)) {
      return saved as Language;
    }
  }
  return "ru";
};

export let currentLanguage: Language = getSavedLanguage();

export const setCurrentLanguage = (lang: Language) => {
  currentLanguage = lang;
  if (typeof window !== "undefined") {
    localStorage.setItem("app_language", lang);
  }
};

// Initialize language from Telegram on app start
export const initLanguageFromTelegram = (): Language => {
  if (typeof window !== "undefined") {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { language_code?: string } } } } }).Telegram?.WebApp;
    const langCode = tg?.initDataUnsafe?.user?.language_code;
    
    if (langCode) {
      const lang: Language = langCode.startsWith("ru") ? "ru" 
        : langCode.startsWith("hi") ? "hi" 
        : "en";
      
      setCurrentLanguage(lang);
      return lang;
    }
  }
  return getSavedLanguage();
};

export const translations: Record<Language, Record<string, string>> = {
  ru: {
    // Home screen
    "home.startAssessment": "Начнём оценку баланса?",
    "home.tapToStart": "Нажмите + чтобы начать",
    "home.tapSectorDetails": "Нажмите на сектор для подробностей",
    
    // Balance sectors (7 spheres)
    "sector.spirituality": "Духовность",
    "sector.relationships": "Отношения",
    "sector.health": "Здоровье",
    "sector.finance": "Финансы",
    "sector.career": "Реализация",
    "sector.rest": "Отдых",
    "sector.environment": "Окружение",
    
    // Sphere details
    "sphere.currentScore": "Текущая оценка",
    "sphere.pointA": "Точка A",
    "sphere.pointADesc": "Текущая ситуация",
    "sphere.pointB": "Точка B",
    "sphere.pointBDesc": "Желаемый результат",
    "sphere.dailyPlan": "План на сегодня",
    "sphere.dailyPlanDesc": "Шаги к цели",
    "sphere.noPointA": "Расскажи Анилу о текущей ситуации в этой сфере",
    "sphere.noPointB": "Опиши желаемый результат в диалоге с Анилом",
    "sphere.noPlan": "План появится после общения с Анилом",
    
    // Chat
    "chat.placeholder": "Напишите сообщение...",
    "chat.send": "Отправить",
    "chat.greeting": "Привет! Я Anil, твой наставник по балансу жизни. Чем могу помочь?",
    
    // Profile
    "profile.title": "Профиль",
    "profile.currentFocus": "Текущий фокус",
    "profile.reassessBalance": "Переоценить баланс",
    "profile.reassessBalanceDesc": "Обновить оценки по всем сферам",
    "profile.reminders": "Уведомления",
    "profile.remindersDesc": "Настроить напоминания от Anil",
    "profile.progressHistory": "История прогресса",
    "profile.progressHistoryDesc": "Посмотреть изменения во времени",
    "profile.language": "Язык",
    "profile.member": "Участник программы баланса",
    "profile.actions": "Действия",
    
    // Progress
    "progress.comingSoon": "Скоро здесь появится история",
    "progress.comingSoonDesc": "Мы отслеживаем твой прогресс. Продолжай общаться с Анилом!",
    
    // Reminders
    "reminders.title": "Настройки напоминаний",
    "reminders.daily": "Ежедневное напоминание",
    "reminders.weekly": "Еженедельный обзор",
    "reminders.saved": "Уведомления сохранены 🌟",
    
    // Common
    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.back": "Назад",
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    
    // Auth
    "auth.loading": "Авторизация...",
    "auth.error": "Ошибка авторизации",
    "auth.openInTelegram": "Откройте в Telegram",
  },
  en: {
    // Home screen
    "home.startAssessment": "Ready to assess your balance?",
    "home.tapToStart": "Tap + to begin",
    "home.tapSectorDetails": "Tap a sector for details",
    
    // Balance sectors (7 spheres)
    "sector.spirituality": "Spirituality",
    "sector.relationships": "Relationships",
    "sector.health": "Health",
    "sector.finance": "Finance",
    "sector.career": "Career",
    "sector.rest": "Rest",
    "sector.environment": "Environment",
    
    // Sphere details
    "sphere.currentScore": "Current score",
    "sphere.pointA": "Point A",
    "sphere.pointADesc": "Current situation",
    "sphere.pointB": "Point B",
    "sphere.pointBDesc": "Desired result",
    "sphere.dailyPlan": "Today's plan",
    "sphere.dailyPlanDesc": "Steps to your goal",
    "sphere.noPointA": "Tell Anil about your current situation",
    "sphere.noPointB": "Describe your desired result to Anil",
    "sphere.noPlan": "A plan will appear after chatting with Anil",
    
    // Chat
    "chat.placeholder": "Type a message...",
    "chat.send": "Send",
    "chat.greeting": "Hello! I'm Anil, your life balance mentor. How can I help?",
    
    // Profile
    "profile.title": "Profile",
    "profile.currentFocus": "Current focus",
    "profile.reassessBalance": "Reassess Balance",
    "profile.reassessBalanceDesc": "Update scores for all spheres",
    "profile.reminders": "Reminders",
    "profile.remindersDesc": "Set up reminders from Anil",
    "profile.progressHistory": "Progress History",
    "profile.progressHistoryDesc": "View changes over time",
    "profile.language": "Language",
    "profile.member": "Balance program member",
    "profile.actions": "Actions",
    
    // Progress
    "progress.comingSoon": "History coming soon",
    "progress.comingSoonDesc": "We're tracking your progress. Keep chatting with Anil!",
    
    // Reminders
    "reminders.title": "Reminder Settings",
    "reminders.daily": "Daily Reminder",
    "reminders.weekly": "Weekly Review",
    "reminders.saved": "Notifications saved 🌟",
    
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.loading": "Loading...",
    "common.error": "Error",
    
    // Auth
    "auth.loading": "Authenticating...",
    "auth.error": "Authentication error",
    "auth.openInTelegram": "Open in Telegram",
  },
  hi: {
    // Home screen
    "home.startAssessment": "क्या आप अपना संतुलन जांचना चाहते हैं?",
    "home.tapToStart": "शुरू करने के लिए + दबाएं",
    "home.tapSectorDetails": "विवरण के लिए सेक्टर पर टैप करें",
    
    // Balance sectors (7 spheres)
    "sector.spirituality": "आध्यात्मिकता",
    "sector.relationships": "रिश्ते",
    "sector.health": "स्वास्थ्य",
    "sector.finance": "वित्त",
    "sector.career": "करियर",
    "sector.rest": "आराम",
    "sector.environment": "वातावरण",
    
    // Sphere details
    "sphere.currentScore": "वर्तमान स्कोर",
    "sphere.pointA": "बिंदु A",
    "sphere.pointADesc": "वर्तमान स्थिति",
    "sphere.pointB": "बिंदु B",
    "sphere.pointBDesc": "वांछित परिणाम",
    "sphere.dailyPlan": "आज की योजना",
    "sphere.dailyPlanDesc": "लक्ष्य की ओर कदम",
    "sphere.noPointA": "अनिल को अपनी वर्तमान स्थिति बताएं",
    "sphere.noPointB": "अनिल को अपना वांछित परिणाम बताएं",
    "sphere.noPlan": "अनिल से बात करने के बाद योजना दिखाई देगी",
    
    // Chat
    "chat.placeholder": "संदेश लिखें...",
    "chat.send": "भेजें",
    "chat.greeting": "नमस्ते! मैं अनिल हूं, आपका जीवन संतुलन मार्गदर्शक। मैं कैसे मदद कर सकता हूं?",
    
    // Profile
    "profile.title": "प्रोफ़ाइल",
    "profile.currentFocus": "वर्तमान फोकस",
    "profile.reassessBalance": "संतुलन का पुनर्मूल्यांकन",
    "profile.reassessBalanceDesc": "सभी क्षेत्रों के स्कोर अपडेट करें",
    "profile.reminders": "अनुस्मारक",
    "profile.remindersDesc": "अनिल से अनुस्मारक सेट करें",
    "profile.progressHistory": "प्रगति इतिहास",
    "profile.progressHistoryDesc": "समय के साथ बदलाव देखें",
    "profile.language": "भाषा",
    "profile.member": "संतुलन कार्यक्रम सदस्य",
    "profile.actions": "कार्रवाई",
    
    // Progress
    "progress.comingSoon": "इतिहास जल्द आ रहा है",
    "progress.comingSoonDesc": "हम आपकी प्रगति ट्रैक कर रहे हैं। अनिल से बात करते रहें!",
    
    // Reminders
    "reminders.title": "अनुस्मारक सेटिंग्स",
    "reminders.daily": "दैनिक अनुस्मारक",
    "reminders.weekly": "साप्ताहिक समीक्षा",
    "reminders.saved": "सूचनाएं सहेजी गईं 🌟",
    
    // Common
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.back": "वापस",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    
    // Auth
    "auth.loading": "प्रमाणीकरण...",
    "auth.error": "प्रमाणीकरण त्रुटि",
    "auth.openInTelegram": "टेलीग्राम में खोलें",
  },
};

export function t(key: string, language?: Language): string {
  const lang = language || currentLanguage;
  return translations[lang]?.[key] || translations.en[key] || key;
}

export function useTranslation(language?: Language) {
  const lang = language || currentLanguage;
  return {
    t: (key: string) => t(key, lang),
    language: lang,
  };
}
