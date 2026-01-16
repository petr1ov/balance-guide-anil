import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Loader2 } from 'lucide-react';

interface FunnelStep {
  name: string;
  event: string;
  count: number;
  percentage: number;
}

const FUNNEL_STEPS = [
  { name: 'Открытие Mini App', event: 'miniapp_opened' },
  { name: 'Выбор режима', event: 'mode_selected' },
  { name: 'Оценка сфер', event: 'sphere_scored' },
  { name: 'Точка A завершена', event: 'point_a_completed' },
  { name: 'Онбординг завершён', event: 'onboarding_completed' },
  { name: 'Точка B записана', event: 'point_b_recorded' },
  { name: 'Уведомления вкл', event: 'notification_enabled' },
  { name: 'Оплата', event: 'subscription_started' },
];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [recentEvents, setRecentEvents] = useState<Array<{
    event: string;
    count: number;
    last: string;
  }>>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch event counts for funnel
      const steps: FunnelStep[] = [];
      let baseCount = 0;

      for (const step of FUNNEL_STEPS) {
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('event', step.event);

        const eventCount = count || 0;
        if (step.event === 'miniapp_opened') {
          baseCount = eventCount || 1; // Avoid division by zero
        }

        steps.push({
          name: step.name,
          event: step.event,
          count: eventCount,
          percentage: baseCount > 0 ? Math.round((eventCount / baseCount) * 100) : 0,
        });
      }
      setFunnelSteps(steps);

      // Fetch recent events summary
      const { data: allEvents } = await supabase
        .from('events')
        .select('event, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (allEvents) {
        // Group by event type
        const eventMap = new Map<string, { count: number; last: string }>();
        allEvents.forEach(e => {
          const current = eventMap.get(e.event);
          if (!current) {
            eventMap.set(e.event, { count: 1, last: e.created_at });
          } else {
            eventMap.set(e.event, { ...current, count: current.count + 1 });
          }
        });

        setRecentEvents(
          Array.from(eventMap.entries())
            .map(([event, data]) => ({ event, ...data }))
            .sort((a, b) => b.count - a.count)
        );
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Аналитика</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Воронка конверсии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelSteps.map((step, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{step.name}</span>
                    <span className="font-medium">
                      {step.count} ({step.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${step.percentage}%` }}
                    />
                  </div>
                  {i < funnelSteps.length - 1 && funnelSteps[i + 1].count > 0 && step.count > 0 && (
                    <p className="text-xs text-muted-foreground text-right">
                      ↓ {Math.round((funnelSteps[i + 1].count / step.count) * 100)}% переход
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Events Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Все события (топ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEvents.slice(0, 15).map((e, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="font-mono text-xs">{e.event}</span>
                  <span className="font-medium">{e.count}</span>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Нет событий. Добавьте трекинг в код приложения.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              💡 Для полноценной аналитики добавьте вызовы <code className="bg-background px-1 rounded">trackEvent()</code> в ключевых точках приложения.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
