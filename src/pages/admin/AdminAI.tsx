import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bot, DollarSign, MessageSquare, Mic, Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface DailyStats {
  date: string;
  tokens: number;
  cost: number;
}

interface UsageByType {
  type: string;
  tokens: number;
  count: number;
}

const AdminAI = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [avgTokensPerMessage, setAvgTokensPerMessage] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [usageByType, setUsageByType] = useState<UsageByType[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all AI usage
      const { data: allUsage } = await supabase
        .from('ai_usage')
        .select('total_tokens, cost_usd, usage_type, created_at');

      if (allUsage) {
        // Total tokens
        const tokens = allUsage.reduce((sum, u) => sum + (u.total_tokens || 0), 0);
        setTotalTokens(tokens);

        // Total cost
        const cost = allUsage.reduce((sum, u) => sum + (Number(u.cost_usd) || 0), 0);
        setTotalCost(cost);

        // Average tokens per message
        setAvgTokensPerMessage(allUsage.length > 0 ? Math.round(tokens / allUsage.length) : 0);

        // Daily stats for last 7 days
        const last7Days: DailyStats[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayUsage = allUsage.filter(u => 
            format(new Date(u.created_at), 'yyyy-MM-dd') === dateStr
          );
          last7Days.push({
            date: format(date, 'dd.MM'),
            tokens: dayUsage.reduce((sum, u) => sum + (u.total_tokens || 0), 0),
            cost: dayUsage.reduce((sum, u) => sum + (Number(u.cost_usd) || 0), 0),
          });
        }
        setDailyStats(last7Days);

        // Usage by type
        const typeMap = new Map<string, { tokens: number; count: number }>();
        allUsage.forEach(u => {
          const type = u.usage_type || 'unknown';
          const current = typeMap.get(type) || { tokens: 0, count: 0 };
          typeMap.set(type, {
            tokens: current.tokens + (u.total_tokens || 0),
            count: current.count + 1,
          });
        });
        setUsageByType(
          Array.from(typeMap.entries()).map(([type, data]) => ({
            type,
            ...data,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'voice_stt': return <Mic className="w-4 h-4" />;
      case 'jyotish_mcp': return <Bot className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'chat': return 'Чат с Анилом';
      case 'voice_stt': return 'Голос → Текст';
      case 'jyotish_mcp': return 'Jyotish MCP';
      case 'system': return 'Системные';
      default: return type;
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
          <h1 className="text-xl font-display font-bold">AI / Токены</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего токенов</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(totalTokens)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Потрачено $</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">${totalCost.toFixed(4)}</p>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ср. токенов/сообщение</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{avgTokensPerMessage}</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Токены за 7 дней</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {dailyStats.map((day, i) => {
                const maxTokens = Math.max(...dailyStats.map(d => d.tokens), 1);
                const height = (day.tokens / maxTokens) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Usage by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Разбивка по типам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageByType.map((usage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getTypeIcon(usage.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{getTypeName(usage.type)}</p>
                    <p className="text-sm text-muted-foreground">{usage.count} запросов</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNumber(usage.tokens)}</p>
                    <p className="text-xs text-muted-foreground">токенов</p>
                  </div>
                </div>
              ))}
              {usageByType.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Нет данных</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAI;
