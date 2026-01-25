import { ArrowLeft, TrendingUp, CheckCircle2, Target, Bell, Star, MessageSquare, Loader2 } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru, enUS, hi } from "date-fns/locale";

interface ProgressHistoryScreenProps {
  language: Language;
  onBack: () => void;
}

interface ProgressEvent {
  id: string;
  event: string;
  created_at: string;
  metadata: unknown;
}

// Events we want to display in progress history
const MEANINGFUL_EVENTS = [
  "onboarding_completed",
  "sphere_scored",
  "point_a_completed",
  "point_a_discussion",
  "point_b_started",
  "mode_selected",
  "notification_enabled",
];

// Event display configuration
const getEventConfig = (event: string, metadata: unknown, language: Language) => {
  const meta = (metadata && typeof metadata === "object" && !Array.isArray(metadata)) 
    ? metadata as Record<string, unknown> 
    : {};
  const sphereNames: Record<Language, Record<string, string>> = {
    ru: {
      spirituality: "Духовность",
      relationships: "Отношения", 
      health: "Здоровье",
      finance: "Финансы",
      career: "Реализация",
      rest: "Отдых",
      environment: "Окружение",
    },
    en: {
      spirituality: "Spirituality",
      relationships: "Relationships",
      health: "Health",
      finance: "Finance",
      career: "Career",
      rest: "Rest",
      environment: "Environment",
    },
    hi: {
      spirituality: "आध्यात्मिकता",
      relationships: "रिश्ते",
      health: "स्वास्थ्य",
      finance: "वित्त",
      career: "करियर",
      rest: "आराम",
      environment: "वातावरण",
    },
  };

  const sphere = meta.sphere as string | undefined;
  const sphereName = sphere ? sphereNames[language][sphere] || sphere : "";
  const score = meta.score as number | undefined;
  const mode = meta.mode as string | undefined;

  const configs: Record<Language, Record<string, { icon: typeof TrendingUp; color: string; title: string; description: string }>> = {
    ru: {
      onboarding_completed: {
        icon: CheckCircle2,
        color: "text-green-500 bg-green-500/20",
        title: "Онбординг завершён",
        description: "Вы начали путь к балансу",
      },
      sphere_scored: {
        icon: Star,
        color: "text-amber-500 bg-amber-500/20",
        title: `Оценка: ${sphereName}`,
        description: score !== undefined ? `Оценка: ${score}/10` : "Сфера оценена",
      },
      point_a_completed: {
        icon: Target,
        color: "text-blue-500 bg-blue-500/20",
        title: `Точка A: ${sphereName}`,
        description: "Описана текущая ситуация",
      },
      point_a_discussion: {
        icon: MessageSquare,
        color: "text-purple-500 bg-purple-500/20",
        title: `Обсуждение: ${sphereName}`,
        description: "Диалог о текущей ситуации",
      },
      point_b_started: {
        icon: Target,
        color: "text-emerald-500 bg-emerald-500/20",
        title: `Точка B: ${sphereName}`,
        description: "Определена цель",
      },
      mode_selected: {
        icon: CheckCircle2,
        color: "text-indigo-500 bg-indigo-500/20",
        title: "Выбран режим",
        description: mode === "jyotish" ? "Режим с Джйотиш" : "Быстрый старт",
      },
      notification_enabled: {
        icon: Bell,
        color: "text-orange-500 bg-orange-500/20",
        title: "Уведомления включены",
        description: "Настроены напоминания",
      },
    },
    en: {
      onboarding_completed: {
        icon: CheckCircle2,
        color: "text-green-500 bg-green-500/20",
        title: "Onboarding Completed",
        description: "You started your balance journey",
      },
      sphere_scored: {
        icon: Star,
        color: "text-amber-500 bg-amber-500/20",
        title: `Scored: ${sphereName}`,
        description: score !== undefined ? `Score: ${score}/10` : "Sphere scored",
      },
      point_a_completed: {
        icon: Target,
        color: "text-blue-500 bg-blue-500/20",
        title: `Point A: ${sphereName}`,
        description: "Current situation described",
      },
      point_a_discussion: {
        icon: MessageSquare,
        color: "text-purple-500 bg-purple-500/20",
        title: `Discussion: ${sphereName}`,
        description: "Dialogue about current state",
      },
      point_b_started: {
        icon: Target,
        color: "text-emerald-500 bg-emerald-500/20",
        title: `Point B: ${sphereName}`,
        description: "Goal defined",
      },
      mode_selected: {
        icon: CheckCircle2,
        color: "text-indigo-500 bg-indigo-500/20",
        title: "Mode Selected",
        description: mode === "jyotish" ? "Jyotish mode" : "Quick start",
      },
      notification_enabled: {
        icon: Bell,
        color: "text-orange-500 bg-orange-500/20",
        title: "Notifications Enabled",
        description: "Reminders configured",
      },
    },
    hi: {
      onboarding_completed: {
        icon: CheckCircle2,
        color: "text-green-500 bg-green-500/20",
        title: "ऑनबोर्डिंग पूर्ण",
        description: "आपने संतुलन की यात्रा शुरू की",
      },
      sphere_scored: {
        icon: Star,
        color: "text-amber-500 bg-amber-500/20",
        title: `स्कोर: ${sphereName}`,
        description: score !== undefined ? `स्कोर: ${score}/10` : "क्षेत्र स्कोर किया गया",
      },
      point_a_completed: {
        icon: Target,
        color: "text-blue-500 bg-blue-500/20",
        title: `बिंदु A: ${sphereName}`,
        description: "वर्तमान स्थिति वर्णित",
      },
      point_a_discussion: {
        icon: MessageSquare,
        color: "text-purple-500 bg-purple-500/20",
        title: `चर्चा: ${sphereName}`,
        description: "वर्तमान स्थिति पर संवाद",
      },
      point_b_started: {
        icon: Target,
        color: "text-emerald-500 bg-emerald-500/20",
        title: `बिंदु B: ${sphereName}`,
        description: "लक्ष्य परिभाषित",
      },
      mode_selected: {
        icon: CheckCircle2,
        color: "text-indigo-500 bg-indigo-500/20",
        title: "मोड चुना गया",
        description: mode === "jyotish" ? "ज्योतिष मोड" : "त्वरित शुरुआत",
      },
      notification_enabled: {
        icon: Bell,
        color: "text-orange-500 bg-orange-500/20",
        title: "सूचनाएं सक्षम",
        description: "अनुस्मारक कॉन्फ़िगर किए गए",
      },
    },
  };

  return configs[language][event] || {
    icon: TrendingUp,
    color: "text-muted-foreground bg-muted",
    title: event,
    description: "",
  };
};

const getDateLocale = (language: Language) => {
  switch (language) {
    case "ru": return ru;
    case "hi": return hi;
    default: return enUS;
  }
};

const ProgressHistoryScreen = ({ language, onBack }: ProgressHistoryScreenProps) => {
  const { t } = useTranslation(language);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("events")
          .select("id, event, created_at, metadata")
          .eq("user_id", user.id)
          .in("event", MEANINGFUL_EVENTS)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching progress events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = format(new Date(event.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, ProgressEvent[]>);

  const emptyMessages: Record<Language, { title: string; desc: string }> = {
    ru: {
      title: "Пока нет событий",
      desc: "Начните общение с Анилом, чтобы увидеть свой прогресс",
    },
    en: {
      title: "No events yet",
      desc: "Start chatting with Anil to see your progress",
    },
    hi: {
      title: "अभी तक कोई इवेंट नहीं",
      desc: "अपनी प्रगति देखने के लिए अनिल से बात करना शुरू करें",
    },
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
        <h1 className="text-xl font-display font-bold text-foreground">
          {t("profile.progressHistory")}
        </h1>
      </div>

      <div className="px-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-finance/20 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-finance-dark" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {emptyMessages[language].title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {emptyMessages[language].desc}
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
              <div key={date}>
                {/* Date header */}
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  {format(new Date(date), "d MMMM yyyy", { locale: getDateLocale(language) })}
                </div>

                {/* Timeline for the day */}
                <div className="relative pl-8">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

                  <div className="space-y-4">
                    {dayEvents.map((event, idx) => {
                      const config = getEventConfig(event.event, event.metadata, language);
                      const Icon = config.icon;
                      
                      return (
                        <div key={event.id} className="relative">
                          {/* Timeline dot */}
                          <div className={`absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center ${config.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          {/* Event card */}
                          <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground text-sm">
                                  {config.title}
                                </h4>
                                {config.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {config.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(event.created_at), "HH:mm")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressHistoryScreen;
