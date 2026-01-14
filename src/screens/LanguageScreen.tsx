import { ArrowLeft, Check } from "lucide-react";
import { Language } from "@/lib/i18n";

interface LanguageScreenProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onBack: () => void;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

const LanguageScreen = ({ currentLanguage, onSelectLanguage, onBack }: LanguageScreenProps) => {
  return (
    <div className="min-h-screen bg-background pb-28 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 animate-fade-in">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">
          {currentLanguage === "ru" ? "Язык" : currentLanguage === "hi" ? "भाषा" : "Language"}
        </h1>
      </div>

      <div className="px-6 space-y-3">
        {LANGUAGES.map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang.code)}
            className="w-full flex items-center justify-between p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-foreground">{lang.label}</span>
            </div>
            {currentLanguage === lang.code && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageScreen;
