import { Sparkles, Heart, Leaf, Coins, ChevronRight, Briefcase, Smile, Users } from "lucide-react";
import BalanceWheel from "@/components/BalanceWheel";
import { BalanceScores, SphereKey } from "@/types/balance";
import { t, Language } from "@/lib/i18n";

interface BalanceScreenProps {
  scores: BalanceScores;
  language: Language;
  onSectorClick: (sector: SphereKey) => void;
}

const BalanceScreen = ({ scores, language, onSectorClick }: BalanceScreenProps) => {
  const sectors = [
    {
      key: "spirituality" as const,
      icon: Sparkles,
      color: "bg-spirituality/20",
      iconColor: "text-spirituality-dark",
    },
    {
      key: "relationships" as const,
      icon: Heart,
      color: "bg-relationships/20",
      iconColor: "text-relationships-dark",
    },
    {
      key: "health" as const,
      icon: Leaf,
      color: "bg-health/20",
      iconColor: "text-health-dark",
    },
    {
      key: "finance" as const,
      icon: Coins,
      color: "bg-finance/20",
      iconColor: "text-finance-dark",
    },
    {
      key: "career" as const,
      icon: Briefcase,
      color: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      key: "rest" as const,
      icon: Smile,
      color: "bg-finance/20",
      iconColor: "text-finance-dark",
    },
    {
      key: "environment" as const,
      icon: Users,
      color: "bg-relationships/20",
      iconColor: "text-relationships-dark",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-health-dark";
    if (score >= 5) return "text-finance-dark";
    return "text-relationships-dark";
  };

  return (
    <div className="min-h-screen bg-background pb-28 safe-top">
      {/* Header */}
      <div className="px-6 py-4 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {language === "ru" ? "Колесо баланса" : language === "hi" ? "संतुलन चक्र" : "Balance Wheel"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === "ru" ? "Твоё текущее состояние жизни" : language === "hi" ? "आपकी वर्तमान जीवन स्थिति" : "Your current life state"}
        </p>
      </div>

      {/* Wheel */}
      <div className="flex justify-center py-4 animate-scale-in">
        <BalanceWheel scores={scores} onSectorClick={onSectorClick} />
      </div>

      {/* Sector Details */}
      <div className="px-6 mt-4 space-y-3">
        <h2 className="font-display font-semibold text-foreground">
          {language === "ru" ? "Детали по сферам" : language === "hi" ? "क्षेत्र विवरण" : "Sphere Details"}
        </h2>
        
        {sectors.map((sector, index) => {
          const Icon = sector.icon;
          const score = scores[sector.key];
          const label = t(`sector.${sector.key}`, language);
          
          return (
            <button
              key={sector.key}
              onClick={() => onSectorClick(sector.key)}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${sector.color} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${sector.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="font-display font-medium text-foreground">{label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
                <span className="text-sm text-muted-foreground">/10</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BalanceScreen;
