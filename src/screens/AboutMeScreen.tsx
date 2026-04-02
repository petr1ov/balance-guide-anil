import { useState, useEffect } from "react";
import { ArrowLeft, Save, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Language } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { toast } from "@/hooks/use-toast";

interface AboutMeScreenProps {
  language: Language;
  onBack: () => void;
}

const LABELS = {
  ru: {
    title: "О себе",
    name: "Имя",
    namePlaceholder: "Как тебя зовут?",
    gender: "Пол",
    male: "Мужской",
    female: "Женский",
    birthDate: "Дата рождения",
    birthTime: "Время рождения",
    birthTimePlaceholder: "Например, 14:30",
    birthCity: "Город рождения",
    birthCityPlaceholder: "Например, Москва",
    birthCountry: "Страна рождения",
    birthCountryPlaceholder: "Например, Россия",
    save: "Сохранить",
    saved: "Сохранено!",
    savedDesc: "Данные обновлены",
    error: "Ошибка сохранения",
  },
  en: {
    title: "About Me",
    name: "Name",
    namePlaceholder: "What's your name?",
    gender: "Gender",
    male: "Male",
    female: "Female",
    birthDate: "Date of birth",
    birthTime: "Time of birth",
    birthTimePlaceholder: "E.g., 14:30",
    birthCity: "City of birth",
    birthCityPlaceholder: "E.g., London",
    birthCountry: "Country of birth",
    birthCountryPlaceholder: "E.g., UK",
    save: "Save",
    saved: "Saved!",
    savedDesc: "Profile updated",
    error: "Save error",
  },
  hi: {
    title: "मेरे बारे में",
    name: "नाम",
    namePlaceholder: "आपका नाम क्या है?",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    birthDate: "जन्म तिथि",
    birthTime: "जन्म का समय",
    birthTimePlaceholder: "उदा., 14:30",
    birthCity: "जन्म का शहर",
    birthCityPlaceholder: "उदा., दिल्ली",
    birthCountry: "जन्म का देश",
    birthCountryPlaceholder: "उदा., भारत",
    save: "सहेजें",
    saved: "सहेजा गया!",
    savedDesc: "प्रोफ़ाइल अपडेट हुआ",
    error: "सहेजने में त्रुटि",
  },
};

const AboutMeScreen = ({ language, onBack }: AboutMeScreenProps) => {
  const { user } = useTelegramAuth();
  const t = LABELS[language];
  
  const [name, setName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, gender, birth_date, birth_time, birth_city, birth_country")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data) {
        setName(data.name || "");
        setGender(data.gender || null);
        setBirthDate(data.birth_date || "");
        setBirthTime(data.birth_time || "");
        setBirthCity(data.birth_city || "");
        setBirthCountry(data.birth_country || "");
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim() || null,
        gender,
        birth_date: birthDate || null,
        birth_time: birthTime.trim() || null,
        birth_city: birthCity.trim() || null,
        birth_country: birthCountry.trim() || null,
      })
      .eq("id", user.id);
    
    setSaving(false);
    
    if (error) {
      toast({ title: t.error, variant: "destructive" });
    } else {
      toast({ title: t.saved, description: t.savedDesc });
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 animate-fade-in">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      </div>

      <div className="px-6 space-y-5 animate-fade-in-up">
        {/* Avatar placeholder */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">{t.name}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="rounded-xl"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">{t.gender}</Label>
          <div className="flex gap-3">
            <button
              onClick={() => setGender("male")}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                gender === "male"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:bg-secondary"
              }`}
            >
              {t.male}
            </button>
            <button
              onClick={() => setGender("female")}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                gender === "female"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:bg-secondary"
              }`}
            >
              {t.female}
            </button>
          </div>
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">{t.birthDate}</Label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {/* Birth Time */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">{t.birthTime}</Label>
          <Input
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            placeholder={t.birthTimePlaceholder}
            className="rounded-xl"
          />
        </div>

        {/* Birth City */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">{t.birthCity}</Label>
          <Input
            value={birthCity}
            onChange={(e) => setBirthCity(e.target.value)}
            placeholder={t.birthCityPlaceholder}
            className="rounded-xl"
          />
        </div>

        {/* Birth Country */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">{t.birthCountry}</Label>
          <Input
            value={birthCountry}
            onChange={(e) => setBirthCountry(e.target.value)}
            placeholder={t.birthCountryPlaceholder}
            className="rounded-xl"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? "..." : t.save}
        </button>
      </div>
    </div>
  );
};

export default AboutMeScreen;
