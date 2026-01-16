import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, UserPlus, Diamond, DollarSign, Bot, TrendingDown,
  ArrowLeft, BarChart3, CreditCard, Activity
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  newUsers24h: number;
  newUsers7d: number;
  paidUsers: number;
  totalRevenue: number;
  tokensToday: number;
  tokensMonth: number;
  avgTokensPerUser: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsers24h: 0,
    newUsers7d: 0,
    paidUsers: 0,
    totalRevenue: 0,
    tokensToday: 0,
    tokensMonth: 0,
    avgTokensPerUser: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch new users in 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count: newUsers24h } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // Fetch new users in 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newUsers7d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Fetch paid users (subscriptions with status active and plan != free)
      const { count: paidUsers } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .neq('plan', 'free');

      // Fetch total revenue
      const { data: revenueData } = await supabase
        .from('subscriptions')
        .select('price_usd');
      const totalRevenue = revenueData?.reduce((sum, s) => sum + (Number(s.price_usd) || 0), 0) || 0;

      // Fetch tokens today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data: tokensToday } = await supabase
        .from('ai_usage')
        .select('total_tokens')
        .gte('created_at', todayStart.toISOString());
      const totalTokensToday = tokensToday?.reduce((sum, t) => sum + (t.total_tokens || 0), 0) || 0;

      // Fetch tokens this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { data: tokensMonth } = await supabase
        .from('ai_usage')
        .select('total_tokens')
        .gte('created_at', monthStart.toISOString());
      const totalTokensMonth = tokensMonth?.reduce((sum, t) => sum + (t.total_tokens || 0), 0) || 0;

      // Calculate avg tokens per user
      const avgTokensPerUser = totalUsers && totalUsers > 0 
        ? Math.round(totalTokensMonth / totalUsers) 
        : 0;

      setStats({
        totalUsers: totalUsers || 0,
        newUsers24h: newUsers24h || 0,
        newUsers7d: newUsers7d || 0,
        paidUsers: paidUsers || 0,
        totalRevenue,
        tokensToday: totalTokensToday,
        tokensMonth: totalTokensMonth,
        avgTokensPerUser,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/admin/users')}
          >
            <Users className="w-5 h-5" />
            <span>Пользователи</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/admin/ai')}
          >
            <Bot className="w-5 h-5" />
            <span>AI / Токены</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/admin/subscriptions')}
          >
            <CreditCard className="w-5 h-5" />
            <span>Подписки</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/admin/analytics')}
          >
            <Activity className="w-5 h-5" />
            <span>Аналитика</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Всего
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Новые 24ч
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">+{stats.newUsers24h}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Новые 7д
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">+{stats.newUsers7d}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Diamond className="w-4 h-4" />
                Платных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-500">{stats.paidUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Выручка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">${stats.totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Токены сегодня
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(stats.tokensToday)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Токены месяц
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(stats.tokensMonth)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Токен/юзер
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(stats.avgTokensPerUser)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
