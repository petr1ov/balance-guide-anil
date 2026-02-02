import { ArrowLeft, MapPin, Target, Calendar, Sparkles, Heart, Leaf, Coins, Briefcase, Smile, Users, MessageCircle, Mic, TrendingUp } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";
import { openTelegramBot } from "@/lib/telegram";

interface SphereDetail {
  sphere: string;
  score: number;
  pointA?: string;
  pointB?: string;
  dailyPlan?: string[];
}

interface SphereDetailsScreenProps {
  sphere: string;
  detail: SphereDetail | null;
  language: Language;
  onBack: () => void;
  onOpenProgress?: () => void;
}

const SPHERE_CONFIG: Record<string, { icon: typeof Sparkles; color: string; iconColor: string }> = {
  spirituality: { icon: Sparkles, color: "bg-spirituality/20", iconColor: "text-spirituality-dark" },
  relationships: { icon: Heart, color: "bg-relationships/20", iconColor: "text-relationships-dark" },
  health: { icon: Leaf, color: "bg-health/20", iconColor: "text-health-dark" },
  finance: { icon: Coins, color: "bg-finance/20", iconColor: "text-finance-dark" },
  career: { icon: Briefcase, color: "bg-primary/20", iconColor: "text-primary" },
  rest: { icon: Smile, color: "bg-finance/20", iconColor: "text-finance-dark" },
  environment: { icon: Users, color: "bg-relationships/20", iconColor: "text-relationships-dark" },
};

const SphereDetailsScreen = ({ sphere, detail, language, onBack, onOpenProgress }: SphereDetailsScreenProps) => {
  const { t } = useTranslation(language);
  
  const config = SPHERE_CONFIG[sphere] || SPHERE_CONFIG.spirituality;
  const Icon = config.icon;
  
  const sphereLabel = t(`sector.${sphere}`);
  const score = detail?.score ?? 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-health-dark";
    if (score >= 5) return "text-finance-dark";
    return "text-relationships-dark";
  };

  const handleDiscussPointA = () => {
    openTelegramBot(`point_a_${sphere}`);
  };

  const handleFormPointB = () => {
    openTelegramBot(`point_b_${sphere}`);
  };

  return (
    <div className="min-h-screen bg-background pb-28 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 animate-fade-in">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">{sphereLabel}</h1>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Score Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("sphere.currentScore")}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
              <span className="text-lg text-muted-foreground">/10</span>
            </div>
          </div>
        </div>

        {/* Progress Button */}
        {onOpenProgress && (
          <button
            onClick={onOpenProgress}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 rounded-2xl transition-all animate-fade-in-up"
            style={{ animationDelay: "50ms" }}
          >
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{t("sphere.progress")}</span>
          </button>
        )}

        {/* Point A - Current State */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-relationships/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-relationships-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("sphere.pointA")}</h3>
              <p className="text-xs text-muted-foreground">{t("sphere.pointADesc")}</p>
            </div>
          </div>
          <p className="text-foreground mb-4">
            {detail?.pointA || t("sphere.noPointA")}
          </p>
          
          {/* Discuss with Anil Button */}
          <button
            onClick={handleDiscussPointA}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-foreground" />
            <span className="font-medium text-foreground">{t("sphere.discussPointA")}</span>
          </button>
        </div>

        {/* Point B - Goal */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-health/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-health-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("sphere.pointB")}</h3>
              <p className="text-xs text-muted-foreground">{t("sphere.pointBDesc")}</p>
            </div>
          </div>
          <p className="text-foreground mb-4">
            {detail?.pointB || t("sphere.noPointB")}
          </p>
          
          {/* Form Point B Button */}
          <button
            onClick={handleFormPointB}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 rounded-xl transition-colors"
          >
            <Mic className="w-5 h-5 text-primary-foreground" />
            <span className="font-medium text-primary-foreground">{t("sphere.formPointB")}</span>
          </button>
        </div>

        {/* Daily Plan */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-finance/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-finance-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("sphere.dailyPlan")}</h3>
              <p className="text-xs text-muted-foreground">{t("sphere.dailyPlanDesc")}</p>
            </div>
          </div>
          
          {detail?.dailyPlan && detail.dailyPlan.length > 0 ? (
            <ul className="space-y-2">
              {detail.dailyPlan.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t("sphere.noPlan")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SphereDetailsScreen;