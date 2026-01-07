import { Settings, RefreshCw, Target, TrendingUp, Globe } from "lucide-react";

interface ProfileScreenProps {
  userName: string;
  focusArea?: string;
  onReassessBalance: () => void;
}

const ProfileScreen = ({ userName, focusArea, onReassessBalance }: ProfileScreenProps) => {
  return (
    <div className="min-h-screen bg-background pb-28 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Профиль</h1>
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
              <p className="text-sm text-muted-foreground">Участник программы баланса</p>
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
              <h3 className="font-semibold text-foreground">Текущий фокус</h3>
            </div>
            <p className="text-foreground capitalize">{focusArea}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold text-foreground px-1">Действия</h3>
          
          <button
            onClick={onReassessBalance}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-health/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-health-dark" />
            </div>
            <div>
              <p className="font-medium text-foreground">Переоценить баланс</p>
              <p className="text-sm text-muted-foreground">Обновить оценки по всем сферам</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-finance/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-finance-dark" />
            </div>
            <div>
              <p className="font-medium text-foreground">История прогресса</p>
              <p className="text-sm text-muted-foreground">Посмотреть изменения во времени</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-spirituality/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-spirituality-dark" />
            </div>
            <div>
              <p className="font-medium text-foreground">Язык</p>
              <p className="text-sm text-muted-foreground">Русский</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
