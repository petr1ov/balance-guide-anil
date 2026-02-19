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

  // Check if running inside Telegram WebApp
  const inTelegram = isTelegramWebApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spirituality via-relationships to-health animate-pulse" />
        <p className="mt-6 text-lg font-display font-semibold text-foreground">{t("auth.loading")}</p>
      </div>
    );
  }

  // Allow access outside Telegram for preview/development
  // TelegramAuthContext already handles demo mode gracefully

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="mt-6 text-lg font-display font-semibold text-foreground">{t("auth.error")}</p>
        <p className="mt-2 text-sm text-muted-foreground text-center">{error}</p>
        <p className="mt-4 text-sm text-muted-foreground text-center">{t("auth.openInTelegram")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
