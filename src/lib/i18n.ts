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
    "home.openAppToStart": "Пройдите онбординг для начала",
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
    "sphere.discussPointA": "💬 Обсудить текущую ситуацию с Анилом",
    "sphere.formPointB": "✨ Готов пообщаться и прояснить цель",
    "sphere.progress": "📈 Прогресс по сфере",
    
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
    "profile.subscription": "Подписка",
    "profile.subscriptionDesc": "Управление тарифом",
    "profile.freeTrial": "Пробный период",
    "profile.pro": "Pro",
    "profile.daysLeft": "дней осталось",
    "profile.expired": "Истёк",
    "profile.upgrade": "Улучшить до Pro",
    
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
    "auth.openInTelegramTitle": "Откройте через Telegram",
    "auth.openInTelegramDescription": "Это приложение работает только внутри Telegram. Пожалуйста, откройте его через бота.",
    "auth.openBot": "Открыть бота",
    
    // Onboarding
    "onboarding.modeTitle": "Как мы пойдём дальше?",
    "onboarding.fastTitle": "🎯 Быстрый старт",
    "onboarding.fastDesc": "Без астрологии, сразу к делу",
    "onboarding.astrologyTitle": "🔮 С астрологией",
    "onboarding.astrologyDesc": "Глубокий анализ по натальной карте",
    "onboarding.scoringTitle": "Оценка сфер жизни",
    "onboarding.scoringSubtitle": "Насколько ты доволен этой сферой?",
    "onboarding.birth_dateTitle": "Дата рождения",
    "onboarding.birth_datePlaceholder": "ДД.ММ.ГГГГ",
    "onboarding.birth_timeTitle": "Время рождения",
    "onboarding.birth_timePlaceholder": "ЧЧ:ММ или утро/день/вечер/ночь",
    "onboarding.birth_countryTitle": "Страна рождения",
    "onboarding.birth_countryPlaceholder": "Россия",
    "onboarding.birth_cityTitle": "Город рождения",
    "onboarding.birth_cityPlaceholder": "Москва",
    "onboarding.next": "Далее",
    "onboarding.back": "Назад",
    "onboarding.save": "Сохранить и продолжить",
    "onboarding.completeTitle": "Готово 🙌",
    "onboarding.completeDesc": "Теперь Anil поможет тебе сформировать точку B",
    "onboarding.returnToTelegram": "Вернуться в Telegram",
    "onboarding.step": "Шаг",
    "onboarding.of": "из",
    "onboarding.frequencyTitle": "Как часто получать астрологические рекомендации?",
    "onboarding.frequencyDaily": "🌞 Каждый день",
    "onboarding.frequencyWeekly": "📆 Раз в неделю",
    "onboarding.frequencyMonthly": "🌙 Раз в месяц",
    "sphere.spirituality": "Духовность",
    "sphere.relationships": "Отношения",
    "sphere.health": "Здоровье и энергия",
    "sphere.finance": "Финансы",
    
    // Sphere names for progress screen
    "spheres.spirituality": "Духовность",
    "spheres.relationships": "Отношения",
    "spheres.health": "Здоровье",
    "spheres.finance": "Финансы",
    "spheres.career": "Реализация",
    "spheres.rest": "Отдых",
    "spheres.environment": "Окружение",
    
    // Sphere Progress
    "sphereProgress.title": "Прогресс по сфере",
    "sphereProgress.goal": "Цель (Точка B)",
    "sphereProgress.noGoal": "Цель ещё не определена",
    "sphereProgress.noGoalSet": "Цель не определена. Сформируй её в диалоге с Анилом.",
    "sphereProgress.completed": "Выполнено",
    "sphereProgress.remaining": "Осталось",
    "sphereProgress.progress": "📊 Прогресс",
    "sphereProgress.progressTitle": "Прогресс",
    "sphereProgress.actions": "Действия",
    "sphereProgress.done": "Выполнено",
    "sphereProgress.currentScore": "Текущая оценка",
    "sphereProgress.dailyPlan": "План на сегодня",
    
    // Subscription
    "subscription.title": "Подписка",
    "subscription.freePlan": "Бесплатный план",
    "subscription.freePlanDesc": "5 дней доступа",
    "subscription.proPlan": "Pro план",
    "subscription.proPlanDesc": "30 дней за 300₽",
    "subscription.currentPlan": "Текущий план",
    "subscription.expiresAt": "Действует до",
    "subscription.subscribe": "Оформить подписку",
    "subscription.features": "Возможности Pro",
    "subscription.feature1": "Персональные AI-рекомендации",
    "subscription.feature2": "Астрологический анализ",
    "subscription.feature3": "Неограниченные напоминания",
    "subscription.feature4": "Приоритетная поддержка",
  },
  en: {
    // Home screen
    "home.startAssessment": "Ready to assess your balance?",
    "home.openAppToStart": "Complete onboarding to start",
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
    "sphere.discussPointA": "💬 Discuss current situation with Anil",
    "sphere.formPointB": "✨ Ready to chat and clarify your goal",
    "sphere.progress": "📈 Sphere progress",
    
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
    "profile.subscription": "Subscription",
    "profile.subscriptionDesc": "Manage your plan",
    "profile.freeTrial": "Free Trial",
    "profile.pro": "Pro",
    "profile.daysLeft": "days left",
    "profile.expired": "Expired",
    "profile.upgrade": "Upgrade to Pro",
    
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
    "auth.openInTelegramTitle": "Open via Telegram",
    "auth.openInTelegramDescription": "This app only works inside Telegram. Please open it through the bot.",
    "auth.openBot": "Open Bot",
    
    // Onboarding
    "onboarding.modeTitle": "How shall we proceed?",
    "onboarding.fastTitle": "🎯 Quick Start",
    "onboarding.fastDesc": "No astrology, straight to the point",
    "onboarding.astrologyTitle": "🔮 With Astrology",
    "onboarding.astrologyDesc": "Deep analysis based on your birth chart",
    "onboarding.scoringTitle": "Life Balance Assessment",
    "onboarding.scoringSubtitle": "How satisfied are you with this area?",
    "onboarding.birth_dateTitle": "Birth Date",
    "onboarding.birth_datePlaceholder": "DD.MM.YYYY",
    "onboarding.birth_timeTitle": "Birth Time",
    "onboarding.birth_timePlaceholder": "HH:MM or morning/afternoon/evening/night",
    "onboarding.birth_countryTitle": "Birth Country",
    "onboarding.birth_countryPlaceholder": "USA",
    "onboarding.birth_cityTitle": "Birth City",
    "onboarding.birth_cityPlaceholder": "New York",
    "onboarding.next": "Next",
    "onboarding.back": "Back",
    "onboarding.save": "Save and Continue",
    "onboarding.completeTitle": "All Done 🙌",
    "onboarding.completeDesc": "Now Anil will help you define Point B",
    "onboarding.returnToTelegram": "Return to Telegram",
    "onboarding.step": "Step",
    "onboarding.of": "of",
    "onboarding.frequencyTitle": "How often would you like astrology recommendations?",
    "onboarding.frequencyDaily": "🌞 Every day",
    "onboarding.frequencyWeekly": "📆 Once a week",
    "onboarding.frequencyMonthly": "🌙 Once a month",
    "sphere.spirituality": "Spirituality",
    "sphere.relationships": "Relationships",
    "sphere.health": "Health & Energy",
    "sphere.finance": "Finance",
    
    // Sphere names for progress screen
    "spheres.spirituality": "Spirituality",
    "spheres.relationships": "Relationships",
    "spheres.health": "Health",
    "spheres.finance": "Finance",
    "spheres.career": "Career",
    "spheres.rest": "Rest",
    "spheres.environment": "Environment",
    
    // Sphere Progress
    "sphereProgress.title": "Sphere Progress",
    "sphereProgress.goal": "Goal (Point B)",
    "sphereProgress.noGoal": "Goal not yet defined",
    "sphereProgress.noGoalSet": "Goal not set. Define it by chatting with Anil.",
    "sphereProgress.completed": "Completed",
    "sphereProgress.remaining": "Remaining",
    "sphereProgress.progress": "📊 Progress",
    "sphereProgress.progressTitle": "Progress",
    "sphereProgress.actions": "Actions",
    "sphereProgress.done": "Done",
    "sphereProgress.currentScore": "Current score",
    "sphereProgress.dailyPlan": "Today's plan",
    
    // Subscription
    "subscription.title": "Subscription",
    "subscription.freePlan": "Free Plan",
    "subscription.freePlanDesc": "5 days access",
    "subscription.proPlan": "Pro Plan",
    "subscription.proPlanDesc": "30 days for 300₽",
    "subscription.currentPlan": "Current Plan",
    "subscription.expiresAt": "Valid until",
    "subscription.subscribe": "Subscribe",
    "subscription.features": "Pro Features",
    "subscription.feature1": "Personal AI recommendations",
    "subscription.feature2": "Astrological analysis",
    "subscription.feature3": "Unlimited reminders",
    "subscription.feature4": "Priority support",
  },
  hi: {
    // Home screen
    "home.startAssessment": "क्या आप अपना संतुलन जांचना चाहते हैं?",
    "home.openAppToStart": "शुरू करने के लिए ऑनबोर्डिंग पूरा करें",
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
    "sphere.discussPointA": "💬 अनिल के साथ वर्तमान स्थिति पर चर्चा करें",
    "sphere.formPointB": "✨ बातचीत करें और लक्ष्य स्पष्ट करें",
    "sphere.progress": "📈 क्षेत्र प्रगति",
    
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
    "profile.subscription": "सदस्यता",
    "profile.subscriptionDesc": "अपनी योजना प्रबंधित करें",
    "profile.freeTrial": "मुफ्त परीक्षण",
    "profile.pro": "Pro",
    "profile.daysLeft": "दिन शेष",
    "profile.expired": "समाप्त",
    "profile.upgrade": "Pro में अपग्रेड करें",
    
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
    "auth.openInTelegramTitle": "टेलीग्राम से खोलें",
    "auth.openInTelegramDescription": "यह ऐप केवल टेलीग्राम के अंदर काम करता है। कृपया इसे बॉट के माध्यम से खोलें।",
    "auth.openBot": "बॉट खोलें",
    
    // Onboarding
    "onboarding.modeTitle": "हम आगे कैसे बढ़ें?",
    "onboarding.fastTitle": "🎯 त्वरित शुरुआत",
    "onboarding.fastDesc": "ज्योतिष के बिना, सीधे बात पर",
    "onboarding.astrologyTitle": "🔮 ज्योतिष के साथ",
    "onboarding.astrologyDesc": "जन्म कुंडली पर गहन विश्लेषण",
    "onboarding.scoringTitle": "जीवन संतुलन मूल्यांकन",
    "onboarding.scoringSubtitle": "आप इस क्षेत्र से कितने संतुष्ट हैं?",
    "onboarding.birth_dateTitle": "जन्म तिथि",
    "onboarding.birth_datePlaceholder": "DD.MM.YYYY",
    "onboarding.birth_timeTitle": "जन्म समय",
    "onboarding.birth_timePlaceholder": "HH:MM या सुबह/दोपहर/शाम/रात",
    "onboarding.birth_countryTitle": "जन्म देश",
    "onboarding.birth_countryPlaceholder": "भारत",
    "onboarding.birth_cityTitle": "जन्म शहर",
    "onboarding.birth_cityPlaceholder": "मुंबई",
    "onboarding.next": "आगे",
    "onboarding.back": "वापस",
    "onboarding.save": "सहेजें और जारी रखें",
    "onboarding.completeTitle": "हो गया 🙌",
    "onboarding.completeDesc": "अब अनिल आपको बिंदु B परिभाषित करने में मदद करेगा",
    "onboarding.returnToTelegram": "टेलीग्राम पर वापस जाएं",
    "onboarding.step": "चरण",
    "onboarding.of": "का",
    "onboarding.frequencyTitle": "ज्योतिष सिफारिशें कितनी बार चाहिए?",
    "onboarding.frequencyDaily": "🌞 हर दिन",
    "onboarding.frequencyWeekly": "📆 सप्ताह में एक बार",
    "onboarding.frequencyMonthly": "🌙 महीने में एक बार",
    "sphere.spirituality": "आध्यात्मिकता",
    "sphere.relationships": "रिश्ते",
    "sphere.health": "स्वास्थ्य और ऊर्जा",
    "sphere.finance": "वित्त",
    
    // Sphere names for progress screen
    "spheres.spirituality": "आध्यात्मिकता",
    "spheres.relationships": "रिश्ते",
    "spheres.health": "स्वास्थ्य",
    "spheres.finance": "वित्त",
    "spheres.career": "करियर",
    "spheres.rest": "आराम",
    "spheres.environment": "वातावरण",
    
    // Sphere Progress
    "sphereProgress.title": "क्षेत्र प्रगति",
    "sphereProgress.goal": "लक्ष्य (बिंदु B)",
    "sphereProgress.noGoal": "लक्ष्य अभी तक परिभाषित नहीं",
    "sphereProgress.noGoalSet": "लक्ष्य सेट नहीं है। अनिल से बात करके इसे परिभाषित करें।",
    "sphereProgress.completed": "पूर्ण",
    "sphereProgress.remaining": "शेष",
    "sphereProgress.progress": "📊 प्रगति",
    "sphereProgress.progressTitle": "प्रगति",
    "sphereProgress.actions": "कार्रवाई",
    "sphereProgress.done": "पूर्ण",
    "sphereProgress.currentScore": "वर्तमान स्कोर",
    "sphereProgress.dailyPlan": "आज की योजना",
    
    // Subscription
    "subscription.title": "सदस्यता",
    "subscription.freePlan": "मुफ्त योजना",
    "subscription.freePlanDesc": "5 दिन का एक्सेस",
    "subscription.proPlan": "Pro योजना",
    "subscription.proPlanDesc": "300₽ में 30 दिन",
    "subscription.currentPlan": "वर्तमान योजना",
    "subscription.expiresAt": "तक मान्य",
    "subscription.subscribe": "सदस्यता लें",
    "subscription.features": "Pro सुविधाएं",
    "subscription.feature1": "व्यक्तिगत AI सिफारिशें",
    "subscription.feature2": "ज्योतिषीय विश्लेषण",
    "subscription.feature3": "असीमित अनुस्मारक",
    "subscription.feature4": "प्राथमिकता समर्थन",
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