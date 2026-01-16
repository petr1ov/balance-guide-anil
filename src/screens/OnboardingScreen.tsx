import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Sparkles, Zap, Calendar, Clock, MapPin, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { Language, t } from "@/lib/i18n";
import { BalanceScores, SphereKey, SPHERE_KEYS } from "@/types/balance";
import { trackEvent } from "@/lib/analytics";

interface OnboardingScreenProps {
  language: Language;
  onComplete: () => void;
}

type OnboardingStep = 
  | "mode" 
  | "scoring" 
  | "birth_date" 
  | "birth_time" 
  | "birth_country" 
  | "birth_city" 
  | "complete";

const SPHERES_INFO: Record<SphereKey, { icon: string; colors: string }> = {
  spirituality: { icon: "🧘", colors: "from-[#B9B7FF] to-[#8B8AF8]" },
  relationships: { icon: "💝", colors: "from-[#FFB3B3] to-[#FF8A8A]" },
  health: { icon: "💚", colors: "from-[#B4EBD0] to-[#7ED7A7]" },
  finance: { icon: "💰", colors: "from-[#FFE3A1] to-[#F4C76C]" },
};

const OnboardingScreen = ({ language, onComplete }: OnboardingScreenProps) => {
  const { user } = useTelegramAuth();
  const [step, setStep] = useState<OnboardingStep>("mode");
  const [mode, setMode] = useState<"fast" | "jyotish" | null>(null);
  const [currentSphereIndex, setCurrentSphereIndex] = useState(0);
  const [scores, setScores] = useState<BalanceScores>({
    spirituality: 5,
    relationships: 5,
    health: 5,
    finance: 5,
  });
  const [scoredSpheres, setScoredSpheres] = useState<Set<SphereKey>>(new Set());
  
  // Birth data for Jyotish
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [birthCity, setBirthCity] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  const translations: Record<Language, Record<string, string>> = {
    ru: {
      "onboarding.modeTitle": "Как мы пойдём дальше?",
      "onboarding.fastTitle": "🎯 Быстрый старт",
      "onboarding.fastDesc": "Без астрологии, сразу к делу",
      "onboarding.jyotishTitle": "🔮 С Джйотиш",
      "onboarding.jyotishDesc": "Глубокий анализ по натальной карте",
      "onboarding.scoringTitle": "Оценка сфер жизни",
      "onboarding.scoringSubtitle": "Насколько ты доволен этой сферой?",
      "onboarding.birthDateTitle": "Дата рождения",
      "onboarding.birthDatePlaceholder": "ДД.ММ.ГГГГ",
      "onboarding.birthTimeTitle": "Время рождения",
      "onboarding.birthTimePlaceholder": "ЧЧ:ММ или утро/день/вечер/ночь",
      "onboarding.birthCountryTitle": "Страна рождения",
      "onboarding.birthCountryPlaceholder": "Россия",
      "onboarding.birthCityTitle": "Город рождения",
      "onboarding.birthCityPlaceholder": "Москва",
      "onboarding.next": "Далее",
      "onboarding.back": "Назад",
      "onboarding.save": "Сохранить и продолжить",
      "onboarding.completeTitle": "Готово 🙌",
      "onboarding.completeDesc": "Теперь Anil поможет тебе сформировать точку B",
      "onboarding.returnToTelegram": "Вернуться в Telegram",
      "sphere.spirituality": "Духовность",
      "sphere.relationships": "Отношения",
      "sphere.health": "Здоровье и энергия",
      "sphere.finance": "Финансы",
      "onboarding.step": "Шаг",
      "onboarding.of": "из",
    },
    en: {
      "onboarding.modeTitle": "How shall we proceed?",
      "onboarding.fastTitle": "🎯 Quick Start",
      "onboarding.fastDesc": "No astrology, straight to the point",
      "onboarding.jyotishTitle": "🔮 With Jyotish",
      "onboarding.jyotishDesc": "Deep analysis based on your birth chart",
      "onboarding.scoringTitle": "Life Balance Assessment",
      "onboarding.scoringSubtitle": "How satisfied are you with this area?",
      "onboarding.birthDateTitle": "Birth Date",
      "onboarding.birthDatePlaceholder": "DD.MM.YYYY",
      "onboarding.birthTimeTitle": "Birth Time",
      "onboarding.birthTimePlaceholder": "HH:MM or morning/afternoon/evening/night",
      "onboarding.birthCountryTitle": "Birth Country",
      "onboarding.birthCountryPlaceholder": "USA",
      "onboarding.birthCityTitle": "Birth City",
      "onboarding.birthCityPlaceholder": "New York",
      "onboarding.next": "Next",
      "onboarding.back": "Back",
      "onboarding.save": "Save and Continue",
      "onboarding.completeTitle": "All Done 🙌",
      "onboarding.completeDesc": "Now Anil will help you define Point B",
      "onboarding.returnToTelegram": "Return to Telegram",
      "sphere.spirituality": "Spirituality",
      "sphere.relationships": "Relationships",
      "sphere.health": "Health & Energy",
      "sphere.finance": "Finance",
      "onboarding.step": "Step",
      "onboarding.of": "of",
    },
    hi: {
      "onboarding.modeTitle": "हम आगे कैसे बढ़ें?",
      "onboarding.fastTitle": "🎯 त्वरित शुरुआत",
      "onboarding.fastDesc": "ज्योतिष के बिना, सीधे बात पर",
      "onboarding.jyotishTitle": "🔮 ज्योतिष के साथ",
      "onboarding.jyotishDesc": "जन्म कुंडली पर गहन विश्लेषण",
      "onboarding.scoringTitle": "जीवन संतुलन मूल्यांकन",
      "onboarding.scoringSubtitle": "आप इस क्षेत्र से कितने संतुष्ट हैं?",
      "onboarding.birthDateTitle": "जन्म तिथि",
      "onboarding.birthDatePlaceholder": "DD.MM.YYYY",
      "onboarding.birthTimeTitle": "जन्म समय",
      "onboarding.birthTimePlaceholder": "HH:MM या सुबह/दोपहर/शाम/रात",
      "onboarding.birthCountryTitle": "जन्म देश",
      "onboarding.birthCountryPlaceholder": "भारत",
      "onboarding.birthCityTitle": "जन्म शहर",
      "onboarding.birthCityPlaceholder": "मुंबई",
      "onboarding.next": "आगे",
      "onboarding.back": "वापस",
      "onboarding.save": "सहेजें और जारी रखें",
      "onboarding.completeTitle": "हो गया 🙌",
      "onboarding.completeDesc": "अब अनिल आपको बिंदु B परिभाषित करने में मदद करेगा",
      "onboarding.returnToTelegram": "टेलीग्राम पर वापस जाएं",
      "sphere.spirituality": "आध्यात्मिकता",
      "sphere.relationships": "रिश्ते",
      "sphere.health": "स्वास्थ्य और ऊर्जा",
      "sphere.finance": "वित्त",
      "onboarding.step": "चरण",
      "onboarding.of": "का",
    },
  };

  const getText = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const currentSphere = SPHERE_KEYS[currentSphereIndex];
  const sphereInfo = SPHERES_INFO[currentSphere];

  const handleModeSelect = (selectedMode: "fast" | "jyotish") => {
    setMode(selectedMode);
    setStep("scoring");
    trackEvent("mode_selected", { mode: selectedMode });
  };

  const handleScoreChange = (value: number[]) => {
    setScores(prev => ({
      ...prev,
      [currentSphere]: value[0],
    }));
    setScoredSpheres(prev => new Set(prev).add(currentSphere));
  };

  const handleNextSphere = () => {
    // Track sphere scored event
    trackEvent("sphere_scored", { 
      sphere: currentSphere, 
      score: scores[currentSphere] 
    });
    
    if (currentSphereIndex < SPHERE_KEYS.length - 1) {
      setCurrentSphereIndex(prev => prev + 1);
    } else {
      // All spheres scored - track Point A completion
      trackEvent("point_a_completed", { ...scores });
      
      if (mode === "jyotish") {
        setStep("birth_date");
      } else {
        handleSaveAndComplete();
      }
    }
  };

  const handlePrevSphere = () => {
    if (currentSphereIndex > 0) {
      setCurrentSphereIndex(prev => prev - 1);
    } else {
      setStep("mode");
    }
  };

  const handleNextBirthStep = () => {
    if (step === "birth_date") setStep("birth_time");
    else if (step === "birth_time") setStep("birth_country");
    else if (step === "birth_country") setStep("birth_city");
    else if (step === "birth_city") handleSaveAndComplete();
  };

  const handlePrevBirthStep = () => {
    if (step === "birth_date") {
      setCurrentSphereIndex(SPHERE_KEYS.length - 1);
      setStep("scoring");
    }
    else if (step === "birth_time") setStep("birth_date");
    else if (step === "birth_country") setStep("birth_time");
    else if (step === "birth_city") setStep("birth_country");
  };

  const handleSaveAndComplete = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // 1. Update profile with mode and onboarding_completed
      const profileUpdate: Record<string, unknown> = {
        mode,
        onboarding_completed: true,
      };
      
      // Add birth data if Jyotish mode
      if (mode === "jyotish") {
        if (birthDate) {
          // Parse DD.MM.YYYY to YYYY-MM-DD
          const match = birthDate.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
          if (match) {
            profileUpdate.birth_date = `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
          }
        }
        if (birthTime) profileUpdate.birth_time = birthTime;
        if (birthCountry) profileUpdate.birth_country = birthCountry;
        if (birthCity) profileUpdate.birth_city = birthCity;
      }

      await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      // 2. Save balance scores
      await supabase
        .from("balance_scores")
        .insert({
          user_id: user.id,
          spirituality: scores.spirituality,
          relationships: scores.relationships,
          health: scores.health,
          finance: scores.finance,
        });

      // 3. Save sphere details (Point A will be filled later by Anil)
      for (const sphereKey of SPHERE_KEYS) {
        await supabase
          .from("sphere_details")
          .upsert({
            user_id: user.id,
            sphere: sphereKey,
            score: scores[sphereKey],
          }, { onConflict: "user_id,sphere" });
      }

      // 4. Update conversation state to Point B stage
      const conversationState = JSON.parse(JSON.stringify({
        stage: "point_b",
        current_sphere_index: 0,
        point_a_index: 0,
        point_b_index: 0,
        scores: {
          spirituality: scores.spirituality,
          relationships: scores.relationships,
          health: scores.health,
          finance: scores.finance,
        },
      }));
      
      await supabase
        .from("profiles")
        .update({
          conversation_state: conversationState,
        })
        .eq("id", user.id);

      // Track onboarding completed
      trackEvent("onboarding_completed", { 
        mode, 
        ...scores,
        has_birth_data: mode === "jyotish" 
      });

      setStep("complete");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReturnToTelegram = () => {
    // Try to close the Mini App
    const tg = (window as unknown as { Telegram?: { WebApp?: { close: () => void } } }).Telegram?.WebApp;
    if (tg?.close) {
      tg.close();
    } else {
      // Fallback: redirect to bot
      window.location.href = "https://t.me/balance_guide_anil_bot";
    }
  };

  // Mode selection screen
  if (step === "mode") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-8 text-center">
          {getText("onboarding.modeTitle")}
        </h1>
        
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => handleModeSelect("fast")}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {getText("onboarding.fastTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getText("onboarding.fastDesc")}
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleModeSelect("jyotish")}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-400/20 hover:border-purple-400/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {getText("onboarding.jyotishTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getText("onboarding.jyotishDesc")}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Scoring screen
  if (step === "scoring") {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevSphere}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <span className="text-sm text-muted-foreground">
            {getText("onboarding.step")} {currentSphereIndex + 1} {getText("onboarding.of")} {SPHERE_KEYS.length}
          </span>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Sphere card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div 
            className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${sphereInfo.colors} flex items-center justify-center text-4xl mb-6 shadow-lg`}
          >
            {sphereInfo.icon}
          </div>
          
          <h2 className="text-xl font-display font-bold text-foreground mb-2 text-center">
            {getText(`sphere.${currentSphere}`)}
          </h2>
          <p className="text-sm text-muted-foreground mb-8 text-center">
            {getText("onboarding.scoringSubtitle")}
          </p>

          {/* Score display */}
          <div className="text-6xl font-display font-bold text-foreground mb-8">
            {scores[currentSphere]}
          </div>

          {/* Slider */}
          <div className="w-full max-w-sm px-4 mb-8">
            <Slider
              value={[scores[currentSphere]]}
              onValueChange={handleScoreChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* Score buttons for quick selection */}
          <div className="flex flex-wrap gap-2 justify-center max-w-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setScores(prev => ({ ...prev, [currentSphere]: num }));
                  setScoredSpheres(prev => new Set(prev).add(currentSphere));
                }}
                className={`w-10 h-10 rounded-full font-semibold transition-all ${
                  scores[currentSphere] === num && scoredSpheres.has(currentSphere)
                    ? `bg-gradient-to-br ${sphereInfo.colors} text-white shadow-md scale-110`
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Next button - only active after score is selected */}
        <Button
          onClick={handleNextSphere}
          className="w-full mt-6"
          size="lg"
          disabled={!scoredSpheres.has(currentSphere)}
        >
          {currentSphereIndex === SPHERE_KEYS.length - 1 
            ? (mode === "jyotish" ? getText("onboarding.next") : getText("onboarding.save"))
            : getText("onboarding.next")
          }
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  // Birth data steps (Jyotish only)
  if (step === "birth_date" || step === "birth_time" || step === "birth_country" || step === "birth_city") {
    const birthSteps = ["birth_date", "birth_time", "birth_country", "birth_city"];
    const currentBirthStep = birthSteps.indexOf(step) + 1;
    
    const getIcon = () => {
      switch (step) {
        case "birth_date": return <Calendar className="w-8 h-8 text-purple-400" />;
        case "birth_time": return <Clock className="w-8 h-8 text-purple-400" />;
        case "birth_country": 
        case "birth_city": return <MapPin className="w-8 h-8 text-purple-400" />;
        default: return null;
      }
    };

    const getValue = () => {
      switch (step) {
        case "birth_date": return birthDate;
        case "birth_time": return birthTime;
        case "birth_country": return birthCountry;
        case "birth_city": return birthCity;
        default: return "";
      }
    };

    const setValue = (val: string) => {
      switch (step) {
        case "birth_date": setBirthDate(val); break;
        case "birth_time": setBirthTime(val); break;
        case "birth_country": setBirthCountry(val); break;
        case "birth_city": setBirthCity(val); break;
      }
    };

    const canProceed = getValue().trim().length > 0;

    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevBirthStep}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <span className="text-sm text-muted-foreground">
            {getText("onboarding.step")} {currentBirthStep} {getText("onboarding.of")} 4
          </span>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mb-6">
            {getIcon()}
          </div>

          <h2 className="text-xl font-display font-bold text-foreground mb-6 text-center">
            {getText(`onboarding.${step.replace("birth_", "birth")}Title`)}
          </h2>

          <Input
            type="text"
            value={getValue()}
            onChange={(e) => setValue(e.target.value)}
            placeholder={getText(`onboarding.${step.replace("birth_", "birth")}Placeholder`)}
            className="max-w-sm text-center text-lg"
          />
        </div>

        <Button
          onClick={handleNextBirthStep}
          disabled={!canProceed || isSaving}
          className="w-full mt-6"
          size="lg"
        >
          {step === "birth_city" ? getText("onboarding.save") : getText("onboarding.next")}
          {step === "birth_city" ? <Check className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5 ml-2" />}
        </Button>
      </div>
    );
  }

  // Complete screen
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <Check className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-2xl font-display font-bold text-foreground mb-3 text-center">
          {getText("onboarding.completeTitle")}
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          {getText("onboarding.completeDesc")}
        </p>

        <Button
          onClick={handleReturnToTelegram}
          size="lg"
          className="px-8"
        >
          {getText("onboarding.returnToTelegram")}
        </Button>
      </div>
    );
  }

  return null;
};

export default OnboardingScreen;
