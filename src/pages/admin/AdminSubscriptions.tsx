import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, DollarSign, Users, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  user_id: string;
  telegram_id: string | null;
  plan: string;
  status: string;
  price_usd: number;
  started_at: string;
  expires_at: string | null;
}

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [mrr, setMrr] = useState(0);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setSubscriptions(data);
        
        // Calculate metrics
        const paidSubs = data.filter(s => s.plan !== 'free');
        setTotalPaid(paidSubs.length);
        
        const active = data.filter(s => s.status === 'active' && s.plan !== 'free');
        setActiveCount(active.length);
        
        const cancelled = data.filter(s => s.status === 'cancelled');
        setCancelledCount(cancelled.length);
        
        // MRR from active subscriptions
        const monthlyRevenue = active.reduce((sum, s) => sum + (Number(s.price_usd) || 0), 0);
        setMrr(monthlyRevenue);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      case 'expired': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-purple-500/10 text-purple-500';
      case 'premium': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-muted text-muted-foreground';
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
          <h1 className="text-xl font-display font-bold">Подписки</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Платных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalPaid}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Активных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">{activeCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">${mrr.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Отмены
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">{cancelledCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Все подписки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPlanBadge(sub.plan)}`}>
                        {sub.plan}
                      </span>
                      <span className={`text-sm ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {sub.telegram_id || sub.user_id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number(sub.price_usd).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(sub.started_at), 'dd.MM.yy')}
                    </p>
                  </div>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Нет подписок</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
