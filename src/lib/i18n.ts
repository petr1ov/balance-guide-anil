// Internationalization utilities

export type Language = "ru" | "en" | "hi";

export const translations: Record<Language, Record<string, string>> = {
  ru: {
    // Home screen
    "home.startAssessment": "Начнём оценку баланса?",
    "home.tapToStart": "Нажмите + чтобы начать",
    "home.tapSectorDetails": "Нажмите на сектор для подробностей",
    
    // Balance sectors
    "sector.spirituality": "Духовность",
    "sector.relationships": "Отношения",
    "sector.health": "Здоровье",
    "sector.finance": "Финансы",
    
    // Chat
    "chat.placeholder": "Напишите сообщение...",
    "chat.send": "Отправить",
    "chat.greeting": "Привет! Я Anil, твой наставник по балансу жизни. Чем могу помочь?",
    
    // Profile
    "profile.title": "Профиль",
    "profile.reassessBalance": "Переоценить баланс",
    "profile.reminders": "Напоминания",
    "profile.progressHistory": "История прогресса",
    "profile.language": "Язык",
    
    // Reminders
    "reminders.title": "Настройки напоминаний",
    "reminders.daily": "Ежедневное напоминание",
    "reminders.weekly": "Еженедельный обзор",
    
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
    
    // Balance sectors
    "sector.spirituality": "Spirituality",
    "sector.relationships": "Relationships",
    "sector.health": "Health",
    "sector.finance": "Finance",
    
    // Chat
    "chat.placeholder": "Type a message...",
    "chat.send": "Send",
    "chat.greeting": "Hello! I'm Anil, your life balance mentor. How can I help?",
    
    // Profile
    "profile.title": "Profile",
    "profile.reassessBalance": "Reassess Balance",
    "profile.reminders": "Reminders",
    "profile.progressHistory": "Progress History",
    "profile.language": "Language",
    
    // Reminders
    "reminders.title": "Reminder Settings",
    "reminders.daily": "Daily Reminder",
    "reminders.weekly": "Weekly Review",
    
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
    
    // Balance sectors
    "sector.spirituality": "आध्यात्मिकता",
    "sector.relationships": "रिश्ते",
    "sector.health": "स्वास्थ्य",
    "sector.finance": "वित्त",
    
    // Chat
    "chat.placeholder": "संदेश लिखें...",
    "chat.send": "भेजें",
    "chat.greeting": "नमस्ते! मैं अनिल हूं, आपका जीवन संतुलन मार्गदर्शक। मैं कैसे मदद कर सकता हूं?",
    
    // Profile
    "profile.title": "प्रोफ़ाइल",
    "profile.reassessBalance": "संतुलन का पुनर्मूल्यांकन",
    "profile.reminders": "अनुस्मारक",
    "profile.progressHistory": "प्रगति इतिहास",
    "profile.language": "भाषा",
    
    // Reminders
    "reminders.title": "अनुस्मारक सेटिंग्स",
    "reminders.daily": "दैनिक अनुस्मारक",
    "reminders.weekly": "साप्ताहिक समीक्षा",
    
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

export function t(key: string, language: Language = "en"): string {
  return translations[language]?.[key] || translations.en[key] || key;
}

export function useTranslation(language: Language) {
  return {
    t: (key: string) => t(key, language),
    language,
  };
}