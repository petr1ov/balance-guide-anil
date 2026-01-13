import { Home, PieChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "home" | "balance" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "home" as const, icon: Home },
    { id: "balance" as const, icon: PieChart },
    { id: "profile" as const, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom animate-slide-in-bottom">
      <div className="mx-4 mb-4">
        <div 
          className="bg-white rounded-2xl px-4 py-3"
          style={{
            boxShadow: "0 8px 32px -8px rgba(0, 0, 0, 0.12)"
          }}
        >
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex items-center justify-center p-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "text-[#4A5568]" 
                      : "text-[#A0AEC0] hover:text-[#718096]"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-transform",
                      isActive && "scale-105"
                    )} 
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
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
