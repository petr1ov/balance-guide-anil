import { Settings, RefreshCw, Target, TrendingUp, Globe, Bell } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";

interface ProfileScreenProps {
  userName: string;
  focusArea?: string;
  language: Language;
  onReassessBalance: () => void;
  onOpenReminders: () => void;
  onOpenLanguage: () => void;
  onOpenHistory: () => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  ru: "Русский",
  en: "English",
  hi: "हिन्दी",
};

const ProfileScreen = ({ 
  userName, 
  focusArea, 
  language,
  onReassessBalance, 
  onOpenReminders,
  onOpenLanguage,
  onOpenHistory,
}: ProfileScreenProps) => {
  const { t } = useTranslation(language);

  return (
    <div className="min-h-screen bg-background pb-28 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">{t("profile.title")}</h1>
        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <Settings className="w-6 h-6 text-foreground" />
        </button>
      </div>

      <div className="px-6 space-y-6">
        {/* User Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spirituality to-relationships flex items-center justify-center text-2xl font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{userName}</h2>
              <p className="text-sm text-muted-foreground">{t("profile.member")}</p>
            </div>
          </div>
        </div>

        {/* Focus Area */}
        {focusArea && (
          <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t("profile.currentFocus")}</h3>
            </div>
            <p className="text-foreground capitalize">{focusArea}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold text-foreground px-1">{t("profile.actions")}</h3>
          
          <button
            onClick={onReassessBalance}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-health/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-health-dark" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t("profile.reassessBalance")}</p>
              <p className="text-sm text-muted-foreground">{t("profile.reassessBalanceDesc")}</p>
            </div>
          </button>

          <button 
            onClick={onOpenReminders}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t("profile.reminders")}</p>
              <p className="text-sm text-muted-foreground">{t("profile.remindersDesc")}</p>
            </div>
          </button>

          <button 
            onClick={onOpenHistory}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-finance/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-finance-dark" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t("profile.progressHistory")}</p>
              <p className="text-sm text-muted-foreground">{t("profile.progressHistoryDesc")}</p>
            </div>
          </button>

          <button 
            onClick={onOpenLanguage}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-spirituality/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-spirituality-dark" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t("profile.language")}</p>
              <p className="text-sm text-muted-foreground">{LANGUAGE_LABELS[language]}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
