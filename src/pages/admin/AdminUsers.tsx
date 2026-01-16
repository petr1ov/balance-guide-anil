import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, User, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  telegram_id: string;
  name: string | null;
  language: string | null;
  mode: string | null;
  created_at: string;
  onboarding_completed: boolean | null;
}

interface UserDetails extends UserProfile {
  messageCount: number;
  totalTokens: number;
  subscription: string | null;
  lastActive: string | null;
  events: Array<{ event: string; created_at: string }>;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.telegram_id.includes(query) ||
            u.name?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, telegram_id, name, language, mode, created_at, onboarding_completed')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (user: UserProfile) => {
    setIsLoadingDetails(true);
    setIsModalOpen(true);

    try {
      // Fetch message count
      const { count: messageCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch total tokens
      const { data: tokenData } = await supabase
        .from('ai_usage')
        .select('total_tokens')
        .eq('user_id', user.id);
      const totalTokens = tokenData?.reduce((sum, t) => sum + (t.total_tokens || 0), 0) || 0;

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      // Fetch last message time
      const { data: lastMessage } = await supabase
        .from('chat_messages')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch recent events
      const { data: events } = await supabase
        .from('events')
        .select('event, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSelectedUser({
        ...user,
        messageCount: messageCount || 0,
        totalTokens,
        subscription: subData ? `${subData.plan} (${subData.status})` : 'free',
        lastActive: lastMessage?.created_at || null,
        events: events || [],
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Пользователи</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или Telegram ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card 
                key={user.id} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => fetchUserDetails(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name || 'Без имени'}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.telegram_id} • {user.language || 'ru'} • {user.mode || 'fast'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'dd.MM.yy')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedUser?.name || 'Пользователь'}</DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Telegram ID:</span> {selectedUser.telegram_id}</p>
                  <p><span className="text-muted-foreground">Язык:</span> {selectedUser.language || 'ru'}</p>
                  <p><span className="text-muted-foreground">Режим:</span> {selectedUser.mode || 'fast'}</p>
                  <p><span className="text-muted-foreground">Регистрация:</span> {format(new Date(selectedUser.created_at), 'dd.MM.yyyy HH:mm')}</p>
                  <p><span className="text-muted-foreground">Онбординг:</span> {selectedUser.onboarding_completed ? '✅' : '❌'}</p>
                </CardContent>
              </Card>

              {/* Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Активность</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Сообщений:</span> {selectedUser.messageCount}</p>
                  <p><span className="text-muted-foreground">Токенов:</span> {selectedUser.totalTokens.toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Подписка:</span> {selectedUser.subscription}</p>
                  <p>
                    <span className="text-muted-foreground">Последняя активность:</span>{' '}
                    {selectedUser.lastActive 
                      ? format(new Date(selectedUser.lastActive), 'dd.MM.yyyy HH:mm')
                      : 'Нет данных'}
                  </p>
                </CardContent>
              </Card>

              {/* Events */}
              {selectedUser.events.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Последние события</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedUser.events.map((event, i) => (
                        <div key={i} className="text-sm flex justify-between">
                          <span className="font-mono">{event.event}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(event.created_at), 'dd.MM HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
