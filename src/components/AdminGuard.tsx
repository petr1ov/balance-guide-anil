import { ReactNode } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';
import { Loader2, ShieldX } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { telegramUser, loading: authLoading } = useTelegramAuth();
  const telegramId = telegramUser ? String(telegramUser.id) : null;
  const { isAdmin, isLoading: adminLoading } = useAdminCheck(telegramId);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <ShieldX className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-display font-semibold text-foreground">Доступ запрещён</h1>
        <p className="text-muted-foreground text-center mt-2">
          У вас нет прав для просмотра этой страницы
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
