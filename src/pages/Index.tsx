import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/screens/HomeScreen";
import BalanceScreen from "@/screens/BalanceScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ReminderSettingsScreen from "@/screens/ReminderSettingsScreen";
import SphereDetailsScreen from "@/screens/SphereDetailsScreen";
import SphereProgressScreen from "@/screens/SphereProgressScreen";
import LanguageScreen from "@/screens/LanguageScreen";
import AboutMeScreen from "@/screens/AboutMeScreen";
import ProgressHistoryScreen from "@/screens/ProgressHistoryScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import SubscriptionScreen from "@/screens/SubscriptionScreen";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Language, setCurrentLanguage } from "@/lib/i18n";
import { openTelegramBot } from "@/lib/telegram";
import { BalanceScores, DEFAULT_SCORES, SphereKey } from "@/types/balance";
import { trackEvent } from "@/lib/analytics";

type TabType = "home" | "balance" | "profile";
type SubScreen = "none" | "reminders" | "sphereDetails" | "sphereProgress" | "language" | "history" | "onboarding" | "subscription" | "aboutMe";

interface SphereDetail {
  sphere: string;
  score: number;
  pointA?: string;
  pointB?: string;
  dailyPlan?: string[];
  jyotishAccent?: string;
}

const Index = () => {
  const { user, language, setLanguage, telegramUser } = useTelegramAuth();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [subScreen, setSubScreen] = useState<SubScreen>("none");
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null);
  const [sphereDetails, setSphereDetails] = useState<Record<string, SphereDetail>>({});
  const [highlightedSpheres, setHighlightedSpheres] = useState<SphereKey[]>([]);
  const [focusArea, setFocusArea] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(telegramUser?.first_name || "Пользователь");
  const [userMode, setUserMode] = useState<"fast" | "jyotish" | "astrology">("fast");
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<"free" | "pro">("free");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  
  const [scores, setScores] = useState<BalanceScores>(DEFAULT_SCORES);

  // Set userName from telegramUser if available
  useEffect(() => {
    if (telegramUser?.first_name && userName === "Пользователь") {
      setUserName(telegramUser.first_name);
    }
  }, [telegramUser, userName]);

  // Handle startapp deep link for notifications
  useEffect(() => {
    const webApp = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { start_param?: string } } } }).Telegram?.WebApp;
    const startParam = webApp?.initDataUnsafe?.start_param;
    
    if (startParam === "notifications" || startParam === "settings_notifications") {
      // Open notifications screen directly
      setSubScreen("reminders");
    }
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch profile including onboarding_completed
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, language, mode, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (profile.name) {
            setUserName(profile.name);
          }
          if (profile.mode) {
            setUserMode(profile.mode as "fast" | "jyotish");
          }
          // Check if onboarding is completed
          setOnboardingCompleted(profile.onboarding_completed ?? false);
        } else {
          // No profile yet, need onboarding
          setOnboardingCompleted(false);
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
          const highlighted: SphereKey[] = [];
          
          sphereData.forEach((s: { sphere: string; score: number | null; point_a: string | null; point_b: string | null; daily_plan: string[] | null; jyotish_accent: string | null }) => {
            details[s.sphere] = {
              sphere: s.sphere,
              score: s.score ?? 0,
              pointA: s.point_a ?? undefined,
              pointB: s.point_b ?? undefined,
              dailyPlan: s.daily_plan ?? undefined,
              jyotishAccent: s.jyotish_accent ?? undefined,
            };
            
            // If there's a jyotish accent, this sphere is highlighted
            if (s.jyotish_accent && ["spirituality", "relationships", "health", "finance"].includes(s.sphere)) {
              highlighted.push(s.sphere as SphereKey);
            }
          });
          
          setSphereDetails(details);
          setHighlightedSpheres(highlighted);
        }

        // Fetch subscription
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subData) {
          setSubscriptionType((subData.plan as "free" | "pro") || "free");
          setSubscriptionExpiresAt(subData.expires_at || subData.trial_ends_at);
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
    trackEvent("sphere_details_viewed", { sphere: sector });
  };

  const handleUpdateScores = () => {
    // If onboarding not done, show onboarding screen in Mini App
    if (!onboardingCompleted) {
      setSubScreen("onboarding");
    } else {
      // Already onboarded, open Telegram bot for reassessment
      openTelegramBot("balance");
    }
  };

  const handleReassessBalance = () => {
    // For reassessment, start onboarding flow again in Mini App
    trackEvent("balance_reassess_started");
    setSubScreen("onboarding");
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    setSubScreen("none");
    // Refresh data
    window.location.reload();
  };

  const handleOpenReminders = () => {
    setSubScreen("reminders");
  };

  const handleOpenLanguage = () => {
    setSubScreen("language");
  };

  const handleOpenHistory = () => {
    trackEvent("history_viewed");
    setSubScreen("history");
  };

  const handleOpenSubscription = () => {
    trackEvent("subscription_viewed");
    setSubScreen("subscription");
  };

  const handleBackFromSubScreen = () => {
    setSubScreen("none");
    setSelectedSphere(null);
  };

  const handleSelectLanguage = async (lang: Language) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
    
    trackEvent("language_changed", { language: lang });
    
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

    if (subScreen === "sphereProgress" && selectedSphere) {
      return (
        <SphereProgressScreen
          sphere={selectedSphere as keyof BalanceScores}
          language={language as Language}
          onBack={() => setSubScreen("sphereDetails")}
        />
      );
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
          onOpenProgress={() => setSubScreen("sphereProgress")}
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

    if (subScreen === "onboarding") {
      return (
        <OnboardingScreen
          language={language as Language}
          onComplete={handleOnboardingComplete}
        />
      );
    }

    if (subScreen === "subscription") {
      return (
        <SubscriptionScreen
          language={language as Language}
          subscriptionType={subscriptionType}
          expiresAt={subscriptionExpiresAt}
          onBack={handleBackFromSubScreen}
        />
      );
    }

    // If onboarding not completed, show onboarding screen automatically
    if (onboardingCompleted === false) {
      return (
        <OnboardingScreen
          language={language as Language}
          onComplete={handleOnboardingComplete}
        />
      );
    }

    // Still loading onboarding status
    if (onboardingCompleted === null) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            scores={scores}
            language={language as Language}
            onSectorClick={handleSectorClick}
          />
        );
      case "balance":
        return (
          <BalanceScreen
            scores={scores}
            language={language as Language}
            onSectorClick={handleSectorClick}
            highlightedSpheres={highlightedSpheres}
            isAstrologyMode={userMode === "jyotish" || userMode === "astrology"}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            userName={userName}
            focusArea={focusArea ?? undefined}
            language={language as Language}
            avatarUrl={telegramUser?.photo_url}
            mode={userMode}
            subscriptionType={subscriptionType}
            subscriptionExpiresAt={subscriptionExpiresAt}
            onReassessBalance={handleReassessBalance}
            onOpenReminders={handleOpenReminders}
            onOpenLanguage={handleOpenLanguage}
            onOpenHistory={handleOpenHistory}
            onOpenSubscription={handleOpenSubscription}
          />
        );
      default:
        return null;
    }
  };

  // Hide TabBar during onboarding or when showing onboarding screen
  const showTabBar = onboardingCompleted === true && subScreen !== "onboarding";

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      {showTabBar && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
};

export default Index;
