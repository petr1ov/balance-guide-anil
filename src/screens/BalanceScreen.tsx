import { Sparkles, Heart, Leaf, Coins, ChevronRight } from "lucide-react";
import BalanceWheel from "@/components/BalanceWheel";
import { BalanceScores, SphereKey } from "@/types/balance";
import { t, Language } from "@/lib/i18n";

interface BalanceScreenProps {
  scores: BalanceScores;
  language: Language;
  onSectorClick: (sector: SphereKey) => void;
  highlightedSpheres?: SphereKey[];
  isJyotishMode?: boolean;
}

const BalanceScreen = ({ scores, language, onSectorClick, highlightedSpheres = [], isJyotishMode = false }: BalanceScreenProps) => {
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

      {/* Jyotish hint */}
      {isJyotishMode && highlightedSpheres.length > 0 && (
        <div className="mx-6 mb-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 animate-fade-in">
          <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <span>🔮</span>
            {language === "ru" 
              ? "Рекомендации учитывают твою натальную карту" 
              : language === "hi" 
                ? "सिफारिशें आपकी जन्म कुंडली पर आधारित हैं"
                : "Recommendations are based on your natal chart"}
          </p>
        </div>
      )}

      {/* Wheel */}
      <div className="flex justify-center py-4 animate-scale-in">
        <BalanceWheel 
          scores={scores} 
          onSectorClick={onSectorClick}
          highlightedSpheres={highlightedSpheres}
          isJyotishMode={isJyotishMode}
        />
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
          const isHighlighted = isJyotishMode && highlightedSpheres.includes(sector.key);
          
          return (
            <button
              key={sector.key}
              onClick={() => onSectorClick(sector.key)}
              className={`w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft border transition-colors text-left animate-fade-in-up ${
                isHighlighted 
                  ? "border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/30" 
                  : "border-border/50 hover:bg-secondary/30"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${sector.color} flex items-center justify-center relative`}>
                <Icon className={`w-6 h-6 ${sector.iconColor}`} />
                {isHighlighted && (
                  <span className="absolute -top-1 -right-1 text-xs">🔮</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-display font-medium text-foreground">{label}</p>
                {isHighlighted && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {language === "ru" ? "Ключевая сфера" : language === "hi" ? "मुख्य क्षेत्र" : "Key sphere"}
                  </p>
                )}
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
