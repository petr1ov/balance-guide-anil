import { Home, PieChart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "home" | "balance" | "chat" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "home" as const, icon: Home, label: "Главная" },
    { id: "balance" as const, icon: PieChart, label: "Баланс" },
    { id: "chat" as const, icon: MessageCircle, label: "Чат" },
    { id: "profile" as const, icon: User, label: "Профиль" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom animate-slide-in-bottom">
      <div className="mx-4 mb-4">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/50 px-2 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-transform",
                      isActive && "scale-110"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    "text-[10px] mt-1 font-medium",
                    isActive && "font-semibold"
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
