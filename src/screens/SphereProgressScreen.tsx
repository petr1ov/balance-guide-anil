import { ArrowLeft, Target, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { t, Language } from "@/lib/i18n";
import { BalanceScores } from "@/types/balance";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SphereProgressScreenProps {
  sphere: keyof BalanceScores;
  language: Language;
  onBack: () => void;
}

interface SphereData {
  score: number | null;
  point_a: string | null;
  point_b: string | null;
  daily_plan: string[] | null;
}

const SPHERE_COLORS: Record<string, string> = {
  spirituality: "from-spirituality to-spirituality-dark",
  relationships: "from-relationships to-relationships-dark",
  health: "from-health to-health-dark",
  finance: "from-finance to-finance-dark",
  career: "from-career to-career-dark",
  rest: "from-rest to-rest-dark",
  environment: "from-environment to-environment-dark",
};

const SphereProgressScreen = ({ sphere, language, onBack }: SphereProgressScreenProps) => {
  const [sphereData, setSphereData] = useState<SphereData | null>(null);
  const [completedActions, setCompletedActions] = useState(0);
  const [totalActions, setTotalActions] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSphereProgress();
  }, [sphere]);

  const loadSphereProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get sphere details
      const { data: details } = await supabase
        .from("sphere_details")
        .select("score, point_a, point_b, daily_plan")
        .eq("user_id", user.id)
        .eq("sphere", sphere)
        .maybeSingle();

      if (details) {
        setSphereData(details);
        
        // Calculate total actions from daily_plan if exists
        if (details.daily_plan && details.daily_plan.length > 0) {
          setTotalActions(details.daily_plan.length);
        }
      }

      // Count completed actions from events
      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("event", "sphere_action_completed")
        .contains("metadata", { sphere });

      setCompletedActions(count || 0);
    } catch (error) {
      console.error("Error loading sphere progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = totalActions > 0 
    ? Math.min(Math.round((completedActions / totalActions) * 100), 100) 
    : 0;

  const sphereName = t(`spheres.${sphere}`, language);
  const colorClass = SPHERE_COLORS[sphere] || SPHERE_COLORS.spirituality;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-display font-semibold">
              {t("sphereProgress.title", language)}
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">
            {t("common.loading", language)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-display font-semibold">
            {t("sphereProgress.title", language)}
          </h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Sphere Header Card */}
        <Card className={`bg-gradient-to-br ${colorClass} text-white border-0`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{sphereName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">
                  {t("sphereProgress.currentScore", language)}
                </p>
                <p className="text-3xl font-bold">
                  {sphereData?.score || "—"}/10
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-10 h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal (Point B) */}
        {sphereData?.point_b && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {t("sphereProgress.goal", language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{sphereData.point_b}</p>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {t("sphereProgress.progressTitle", language)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {t("sphereProgress.completed", language)}
                </span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("sphereProgress.done", language)}
                  </p>
                  <p className="font-semibold">{completedActions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("sphereProgress.remaining", language)}
                  </p>
                  <p className="font-semibold">{Math.max(0, totalActions - completedActions)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Plan */}
        {sphereData?.daily_plan && sphereData.daily_plan.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("sphereProgress.dailyPlan", language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sphereData.daily_plan.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!sphereData?.point_b && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {t("sphereProgress.noGoalSet", language)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SphereProgressScreen;
