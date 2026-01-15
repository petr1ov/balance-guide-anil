import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { useTranslation, Language } from "@/lib/i18n";
import { MessageCircle } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Check if running inside Telegram WebApp
function isTelegramWebApp(): boolean {
  const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
  return !!tg?.initData;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { loading, error, language } = useTelegramAuth();
  const { t } = useTranslation(language as Language);

  // Check if opened outside Telegram
  const inTelegram = isTelegramWebApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spirituality via-relationships to-health animate-pulse" />
        <p className="mt-6 text-lg font-display font-semibold text-foreground">
          {t("auth.loading")}
        </p>
      </div>
    );
  }

  // If not in Telegram, show message to open via bot
  if (!inTelegram) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground mb-3">
          {t("auth.openInTelegramTitle")}
        </h1>
        <p className="text-muted-foreground max-w-sm">
          {t("auth.openInTelegramDescription")}
        </p>
        <a
          href="https://t.me/balance_mentor_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity"
        >
          {t("auth.openBot")}
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="mt-6 text-lg font-display font-semibold text-foreground">
          {t("auth.error")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          {error}
        </p>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          {t("auth.openInTelegram")}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}