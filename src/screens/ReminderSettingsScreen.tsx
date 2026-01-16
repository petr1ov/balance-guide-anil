import { useState, useEffect } from "react";
import { Bell, Clock, ChevronLeft, Sun, Sunrise, Moon, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { t } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

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
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  // Check Telegram availability and detect timezone on mount
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detectedTimezone);
    
    const tg = (window as any).Telegram?.WebApp;
    setIsTelegramAvailable(!!tg?.initData);
  }, []);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const tgId = telegramId || localStorage.getItem("telegram_id");
        
        if (!tgId) {
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
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
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      
      if (!initData) {
        toast({
          title: t("common.error", language as any),
          description: language === "ru" 
            ? "Откройте приложение через Telegram для сохранения настроек"
            : language === "hi"
            ? "सेटिंग्स सहेजने के लिए टेलीग्राम के माध्यम से ऐप खोलें"
            : "Open the app through Telegram to save settings",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("save-reminder", {
        body: {
          initData,
          timezone,
          enabled,
          morningTime,
          dayTime,
          eveningTime,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.ok) {
        throw new Error((data as any)?.error || "Failed to save");
      }

      toast({
        title: t("common.save", language as any),
        description: t("reminders.saved", language as any) || "Уведомления сохранены 🌟",
      });
      
      // Track notification enabled/disabled
      trackEvent(enabled ? "notification_enabled" : "notification_disabled", {
        timezone,
        has_morning: !!morningTime,
        has_day: !!dayTime,
        has_evening: !!eveningTime,
      });
      
      onBack();
    } catch (error) {
      console.error("Error saving reminder settings:", error);
      toast({
        title: t("common.error", language as any),
        description: language === "ru" 
          ? "Не удалось сохранить настройки"
          : language === "hi"
          ? "सेटिंग्स सहेजने में विफल"
          : "Failed to save settings",
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
          {selectedTime 
            ? (language === "ru" ? "Вкл" : language === "hi" ? "चालू" : "On")
            : (language === "ru" ? "Выкл" : language === "hi" ? "बंद" : "Off")
          }
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

  const getLabels = () => {
    if (language === "ru") {
      return {
        title: "Уведомления",
        masterTitle: "Напоминания от Anil",
        masterDesc: "Получать сообщения в Telegram",
        timezone: "Часовой пояс",
        timezoneAuto: "Определён автоматически",
        morning: "Утро",
        day: "День",
        evening: "Вечер",
        save: "Сохранить",
        telegramRequired: "Откройте в Telegram",
        telegramRequiredDesc: "Для настройки уведомлений откройте приложение через бота в Telegram",
      };
    }
    if (language === "hi") {
      return {
        title: "सूचनाएं",
        masterTitle: "अनिल से अनुस्मारक",
        masterDesc: "टेलीग्राम में संदेश प्राप्त करें",
        timezone: "समय क्षेत्र",
        timezoneAuto: "स्वचालित रूप से पता चला",
        morning: "सुबह",
        day: "दिन",
        evening: "शाम",
        save: "सहेजें",
        telegramRequired: "टेलीग्राम में खोलें",
        telegramRequiredDesc: "सूचनाएं सेट करने के लिए, टेलीग्राम में बॉट के माध्यम से ऐप खोलें",
      };
    }
    return {
      title: "Notifications",
      masterTitle: "Reminders from Anil",
      masterDesc: "Receive messages in Telegram",
      timezone: "Timezone",
      timezoneAuto: "Detected automatically",
      morning: "Morning",
      day: "Day",
      evening: "Evening",
      save: "Save",
      telegramRequired: "Open in Telegram",
      telegramRequiredDesc: "To set up notifications, open the app through the bot in Telegram",
    };
  };

  const labels = getLabels();

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
        <h1 className="text-2xl font-bold text-foreground">{labels.title}</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Telegram Warning if not in Telegram */}
        {!isTelegramAvailable && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{labels.telegramRequired}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {labels.telegramRequiredDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Master Toggle */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{labels.masterTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  {labels.masterDesc}
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
                <span className="font-medium text-foreground">{labels.timezone}</span>
              </div>
              <p className="text-sm text-primary font-medium">{timezone}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {labels.timezoneAuto}
              </p>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <TimeSlotSection
                  title={labels.morning}
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
                  title={labels.day}
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
                  title={labels.evening}
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
          disabled={saving || !isTelegramAvailable}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 animate-fade-in-up"
          style={{ animationDelay: "250ms" }}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              {labels.save}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReminderSettingsScreen;
