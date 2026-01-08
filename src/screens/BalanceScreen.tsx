import { Sparkles, Heart, Leaf, Coins, ChevronRight } from "lucide-react";
import BalanceWheel from "@/components/BalanceWheel";

interface BalanceScores {
  spirituality: number;
  relationships: number;
  health: number;
  finance: number;
}

interface BalanceScreenProps {
  scores: BalanceScores;
  onSectorClick: (sector: keyof BalanceScores) => void;
}

const BalanceScreen = ({ scores, onSectorClick }: BalanceScreenProps) => {
  const sectors = [
    {
      key: "spirituality" as const,
      label: "Духовность",
      icon: Sparkles,
      color: "bg-spirituality/20",
      iconColor: "text-spirituality-dark",
      description: "Внутренняя гармония и смысл",
    },
    {
      key: "relationships" as const,
      label: "Отношения",
      icon: Heart,
      color: "bg-relationships/20",
      iconColor: "text-relationships-dark",
      description: "Связи с близкими и окружением",
    },
    {
      key: "health" as const,
      label: "Здоровье",
      icon: Leaf,
      color: "bg-health/20",
      iconColor: "text-health-dark",
      description: "Физическое и ментальное состояние",
    },
    {
      key: "finance" as const,
      label: "Финансы",
      icon: Coins,
      color: "bg-finance/20",
      iconColor: "text-finance-dark",
      description: "Материальная стабильность",
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
        <h1 className="text-2xl font-display font-bold text-foreground">Колесо баланса</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Твоё текущее состояние жизни
        </p>
      </div>

      {/* Wheel */}
      <div className="flex justify-center py-4 animate-scale-in">
        <BalanceWheel scores={scores} onSectorClick={onSectorClick} />
      </div>

      {/* Sector Details */}
      <div className="px-6 mt-4 space-y-3">
        <h2 className="font-display font-semibold text-foreground">Детали по сферам</h2>
        
        {sectors.map((sector, index) => {
          const Icon = sector.icon;
          const score = scores[sector.key];
          
          return (
            <button
              key={sector.key}
              onClick={() => onSectorClick(sector.key)}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border border-border/50 hover:bg-secondary/30 transition-colors text-left animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${sector.color} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${sector.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="font-display font-medium text-foreground">{sector.label}</p>
                <p className="text-xs text-muted-foreground">{sector.description}</p>
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
