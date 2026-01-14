import { useState, useEffect } from "react";
import { Bell, Clock, ChevronLeft, Sun, Sunrise, Moon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { t } from "@/lib/i18n";

interface ReminderSettingsScreenProps {
  onBack: () => void;
  telegramId?: string;
}

interface ReminderSettings {
  user_id: string;
  telegram_id: string;
  timezone: string;
  morning_time: string | null;
  day_time: string | null;
  evening_time: string | null;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

const TIME_PRESETS = {
  morning: ["07:00", "08:00", "09:00", "10:00", "11:00"],
  day: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  evening: ["18:00", "19:00", "20:00", "21:00", "22:00"],
};

const ReminderSettingsScreen = ({ onBack, telegramId }: ReminderSettingsScreenProps) => {
  const { toast } = useToast();
  const { language } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [timezone, setTimezone] = useState("");
  const [morningTime, setMorningTime] = useState<string | null>("09:00");
  const [dayTime, setDayTime] = useState<string | null>("14:00");
  const [eveningTime, setEveningTime] = useState<string | null>("20:00");

  // Detect timezone on mount
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detectedTimezone);
  }, []);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Get telegram_id from localStorage as fallback
        const tgId = telegramId || localStorage.getItem("telegram_id");
        
        if (!tgId) {
          setLoading(false);
          return;
        }

        // Try to load from DB via edge function or direct query
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // If authenticated, use direct query
          const { data, error } = await supabase
            .from("reminders" as any)
            .select("*")
            .eq("user_id", session.user.id)
            .single() as unknown as { data: ReminderSettings | null; error: any };

          if (data && !error) {
            setEnabled(data.enabled ?? true);
            setTimezone(data.timezone || timezone);
            setMorningTime(data.morning_time);
            setDayTime(data.day_time);
            setEveningTime(data.evening_time);
          }
        }
        // If not authenticated, we'll use default values
      } catch (err) {
        console.error("Error loading reminder settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [timezone, telegramId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // SECURITY: Use Telegram initData for signature verification (not telegram_id from body)
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      
      if (!initData) {
        toast({
          title: t("common.error", language as any),
          description: "Telegram данные не найдены. Откройте приложение через Telegram.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Save via edge function with signed initData
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            initData, // Pass signed Telegram data instead of raw telegram_id
            timezone,
            enabled,
            morningTime,
            dayTime,
            eveningTime,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      toast({
        title: t("common.save", language as any),
        description: t("reminders.saved", language as any) || "Уведомления сохранены 🌟",
      });
      
      onBack();
    } catch (error) {
      console.error("Error saving reminder settings:", error);
      toast({
        title: t("common.error", language as any),
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const TimeSlotSection = ({
    title,
    icon: Icon,
    iconColor,
    bgColor,
    times,
    selectedTime,
    onTimeChange,
  }: {
    title: string;
    icon: typeof Sun;
    iconColor: string;
    bgColor: string;
    times: string[];
    selectedTime: string | null;
    onTimeChange: (time: string | null) => void;
  }) => (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
        </div>
        <button
          onClick={() => onTimeChange(selectedTime ? null : times[Math.floor(times.length / 2)])}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedTime
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {selectedTime ? "Вкл" : "Выкл"}
        </button>
      </div>
      
      {selectedTime && (
        <div className="flex flex-wrap gap-2">
          {times.map((time) => (
            <button
              key={time}
              onClick={() => onTimeChange(time)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedTime === time
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 animate-fade-in">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Master Toggle */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Напоминания от Anil</h2>
                <p className="text-sm text-muted-foreground">
                  Получать сообщения в Telegram
                </p>
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  enabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {enabled && (
          <>
            {/* Timezone */}
            <div
              className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 animate-fade-in-up"
              style={{ animationDelay: "50ms" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Часовой пояс</span>
              </div>
              <p className="text-sm text-primary font-medium">{timezone}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Определён автоматически
              </p>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <TimeSlotSection
                  title="Утро"
                  icon={Sunrise}
                  iconColor="text-amber-500"
                  bgColor="bg-amber-500/10"
                  times={TIME_PRESETS.morning}
                  selectedTime={morningTime}
                  onTimeChange={setMorningTime}
                />
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <TimeSlotSection
                  title="День"
                  icon={Sun}
                  iconColor="text-yellow-500"
                  bgColor="bg-yellow-500/10"
                  times={TIME_PRESETS.day}
                  selectedTime={dayTime}
                  onTimeChange={setDayTime}
                />
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <TimeSlotSection
                  title="Вечер"
                  icon={Moon}
                  iconColor="text-indigo-400"
                  bgColor="bg-indigo-400/10"
                  times={TIME_PRESETS.evening}
                  selectedTime={eveningTime}
                  onTimeChange={setEveningTime}
                />
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 animate-fade-in-up"
          style={{ animationDelay: "250ms" }}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              Сохранить
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReminderSettingsScreen;
