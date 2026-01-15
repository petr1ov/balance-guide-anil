import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/screens/HomeScreen";
import BalanceScreen from "@/screens/BalanceScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ReminderSettingsScreen from "@/screens/ReminderSettingsScreen";
import SphereDetailsScreen from "@/screens/SphereDetailsScreen";
import LanguageScreen from "@/screens/LanguageScreen";
import ProgressHistoryScreen from "@/screens/ProgressHistoryScreen";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Language, setCurrentLanguage } from "@/lib/i18n";
import { openTelegramBot } from "@/lib/telegram";
import { BalanceScores, DEFAULT_SCORES, SphereKey } from "@/types/balance";

type TabType = "home" | "balance" | "profile";
type SubScreen = "none" | "reminders" | "sphereDetails" | "language" | "history";

interface SphereDetail {
  sphere: string;
  score: number;
  pointA?: string;
  pointB?: string;
  dailyPlan?: string[];
}

const Index = () => {
  const { user, language, setLanguage, telegramUser } = useTelegramAuth();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [subScreen, setSubScreen] = useState<SubScreen>("none");
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null);
  const [sphereDetails, setSphereDetails] = useState<Record<string, SphereDetail>>({});
  const [focusArea, setFocusArea] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(telegramUser?.first_name || "Пользователь");
  
  const [scores, setScores] = useState<BalanceScores>(DEFAULT_SCORES);

  // Set userName from telegramUser if available
  useEffect(() => {
    if (telegramUser?.first_name && userName === "Пользователь") {
      setUserName(telegramUser.first_name);
    }
  }, [telegramUser, userName]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, language")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.name) {
          setUserName(profile.name);
        }

        // Fetch balance scores
        const { data: balanceData } = await supabase
          .from("balance_scores")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (balanceData) {
          setScores({
            spirituality: balanceData.spirituality ?? 0,
            relationships: balanceData.relationships ?? 0,
            health: balanceData.health ?? 0,
            finance: balanceData.finance ?? 0,
          });
        }

        // Fetch current goal/focus
        const { data: goalData } = await supabase
          .from("goals")
          .select("focus_area, point_a, ideal")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (goalData?.focus_area) {
          setFocusArea(goalData.focus_area);
        }

        // Fetch sphere details
        const { data: sphereData } = await supabase
          .from("sphere_details")
          .select("*")
          .eq("user_id", user.id);

        if (sphereData && sphereData.length > 0) {
          const details: Record<string, SphereDetail> = {};
          sphereData.forEach((s: { sphere: string; score: number | null; point_a: string | null; point_b: string | null; daily_plan: string[] | null }) => {
            details[s.sphere] = {
              sphere: s.sphere,
              score: s.score ?? 0,
              pointA: s.point_a ?? undefined,
              pointB: s.point_b ?? undefined,
              dailyPlan: s.daily_plan ?? undefined,
            };
          });
          setSphereDetails(details);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, telegramUser]);

  const handleSectorClick = (sector: SphereKey) => {
    setSelectedSphere(sector);
    setSubScreen("sphereDetails");
  };

  const handleUpdateScores = () => {
    // Empty state CTA (+): open Telegram bot to start the assessment with Anil
    openTelegramBot("balance");
  };

  const handleReassessBalance = () => {
    openTelegramBot("balance");
  };

  const handleOpenReminders = () => {
    setSubScreen("reminders");
  };

  const handleOpenLanguage = () => {
    setSubScreen("language");
  };

  const handleOpenHistory = () => {
    setSubScreen("history");
  };

  const handleBackFromSubScreen = () => {
    setSubScreen("none");
    setSelectedSphere(null);
  };

  const handleSelectLanguage = async (lang: Language) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
    
    if (user) {
      await supabase
        .from("profiles")
        .update({ language: lang })
        .eq("id", user.id);
    }
    
    setSubScreen("none");
  };

  const renderScreen = () => {
    if (subScreen === "reminders") {
      return <ReminderSettingsScreen onBack={handleBackFromSubScreen} />;
    }

    if (subScreen === "sphereDetails" && selectedSphere) {
      const detail = sphereDetails[selectedSphere] || {
        sphere: selectedSphere,
        score: scores[selectedSphere as SphereKey] ?? 0,
      };
      return (
        <SphereDetailsScreen
          sphere={selectedSphere}
          detail={detail}
          language={language as Language}
          onBack={handleBackFromSubScreen}
        />
      );
    }

    if (subScreen === "language") {
      return (
        <LanguageScreen
          currentLanguage={language as Language}
          onSelectLanguage={handleSelectLanguage}
          onBack={handleBackFromSubScreen}
        />
      );
    }

    if (subScreen === "history") {
      return (
        <ProgressHistoryScreen
          language={language as Language}
          onBack={handleBackFromSubScreen}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            scores={scores}
            language={language as Language}
            onUpdateScores={handleUpdateScores}
            onSectorClick={handleSectorClick}
          />
        );
      case "balance":
        return (
          <BalanceScreen
            scores={scores}
            language={language as Language}
            onSectorClick={handleSectorClick}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            userName={userName}
            focusArea={focusArea ?? undefined}
            language={language as Language}
            avatarUrl={telegramUser?.photo_url}
            onReassessBalance={handleReassessBalance}
            onOpenReminders={handleOpenReminders}
            onOpenLanguage={handleOpenLanguage}
            onOpenHistory={handleOpenHistory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
