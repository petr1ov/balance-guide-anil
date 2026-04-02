import { Settings, RefreshCw, Target, TrendingUp, Globe, Bell, Sparkles, Zap, CreditCard, UserCircle } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileScreenProps {
  userName: string;
  focusArea?: string;
  language: Language;
  avatarUrl?: string;
  mode?: "fast" | "astrology" | "jyotish";
  subscriptionType?: "free" | "pro";
  subscriptionExpiresAt?: string | null;
  onReassessBalance: () => void;
  onOpenReminders: () => void;
  onOpenLanguage: () => void;
  onOpenHistory: () => void;
  onChangeMode?: () => void;
  onOpenSubscription?: () => void;
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
  avatarUrl,
  mode = "fast",
  subscriptionType = "free",
  subscriptionExpiresAt,
  onReassessBalance, 
  onOpenReminders,
  onOpenLanguage,
  onOpenHistory,
  onChangeMode,
  onOpenSubscription,
}: ProfileScreenProps) => {
  const { t } = useTranslation(language);

  const modeLabels = {
    fast: { ru: "Быстрый старт", en: "Quick Start", hi: "त्वरित शुरुआत" },
    astrology: { ru: "С астрологией", en: "With Astrology", hi: "ज्योतिष के साथ" },
    jyotish: { ru: "С астрологией", en: "With Astrology", hi: "ज्योतिष के साथ" },
  };

  // Calculate days left for subscription
  const getDaysLeft = () => {
    if (!subscriptionExpiresAt) return 0;
    const expiresAt = new Date(subscriptionExpiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = getDaysLeft();
  const isExpired = daysLeft <= 0;

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
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-spirituality to-relationships text-2xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{userName}</h2>
              <p className="text-sm text-muted-foreground">{t("profile.member")}</p>
            </div>
          </div>
          
          {/* Mode Badge */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              mode === "astrology" || mode === "jyotish"
                ? "bg-spirituality/20 text-spirituality-dark" 
                : "bg-primary/10 text-primary"
            }`}>
              {mode === "astrology" || mode === "jyotish" ? <Sparkles className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              {modeLabels[mode]?.[language] || modeLabels.fast[language]}
            </div>
            {onChangeMode && (
              <button 
                onClick={onChangeMode}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === "ru" ? "Изменить" : language === "hi" ? "बदलें" : "Change"}
              </button>
            )}
          </div>
        </div>

        {/* Subscription Card */}
        <div 
          className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 animate-fade-in-up cursor-pointer hover:bg-secondary/30 transition-colors"
          style={{ animationDelay: "50ms" }}
          onClick={onOpenSubscription}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                subscriptionType === "pro" 
                  ? "bg-amber-500/20" 
                  : isExpired 
                    ? "bg-red-500/20" 
                    : "bg-blue-500/20"
              }`}>
                <CreditCard className={`w-5 h-5 ${
                  subscriptionType === "pro" 
                    ? "text-amber-500" 
                    : isExpired 
                      ? "text-red-500" 
                      : "text-blue-500"
                }`} />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {subscriptionType === "pro" ? t("profile.pro") : t("profile.freeTrial")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isExpired 
                    ? t("profile.expired")
                    : `${daysLeft} ${t("profile.daysLeft")}`
                  }
                </p>
              </div>
            </div>
            {(subscriptionType === "free" || isExpired) && (
              <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                {t("profile.upgrade")}
              </button>
            )}
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