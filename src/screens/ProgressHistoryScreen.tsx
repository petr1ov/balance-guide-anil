import { ArrowLeft, TrendingUp } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";

interface ProgressHistoryScreenProps {
  language: Language;
  onBack: () => void;
}

const ProgressHistoryScreen = ({ language, onBack }: ProgressHistoryScreenProps) => {
  const { t } = useTranslation(language);

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
          {t("profile.progressHistory")}
        </h1>
      </div>

      <div className="px-6">
        {/* Placeholder for history */}
        <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-finance/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-finance-dark" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            {t("progress.comingSoon")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("progress.comingSoonDesc")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressHistoryScreen;
