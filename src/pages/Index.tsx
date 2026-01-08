import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/screens/HomeScreen";
import BalanceScreen from "@/screens/BalanceScreen";
import ChatScreen from "@/screens/ChatScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ReminderSettingsScreen from "@/screens/ReminderSettingsScreen";

type TabType = "home" | "balance" | "chat" | "profile";
type SubScreen = "none" | "reminders";

interface BalanceScores {
  spirituality: number;
  relationships: number;
  health: number;
  finance: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [subScreen, setSubScreen] = useState<SubScreen>("none");
  const [scores, setScores] = useState<BalanceScores>({
    spirituality: 8,
    relationships: 7,
    health: 9,
    finance: 6,
  });

  const handleSectorClick = (sector: keyof BalanceScores) => {
    console.log("Sector clicked:", sector);
    // Navigate to chat or show details
    setActiveTab("chat");
  };

  const handleUpdateScores = () => {
    // Open assessment flow
    setActiveTab("chat");
  };

  const handleReassessBalance = () => {
    setActiveTab("chat");
  };

  const handleOpenReminders = () => {
    setSubScreen("reminders");
  };

  const handleBackFromSubScreen = () => {
    setSubScreen("none");
  };

  const renderScreen = () => {
    // Handle sub-screens first
    if (subScreen === "reminders") {
      return <ReminderSettingsScreen onBack={handleBackFromSubScreen} />;
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            scores={scores}
            onUpdateScores={handleUpdateScores}
            onSectorClick={handleSectorClick}
          />
        );
      case "balance":
        return (
          <BalanceScreen
            scores={scores}
            onSectorClick={handleSectorClick}
          />
        );
      case "chat":
        return <ChatScreen />;
      case "profile":
        return (
          <ProfileScreen
            userName="Пользователь"
            focusArea="Здоровье"
            onReassessBalance={handleReassessBalance}
            onOpenReminders={handleOpenReminders}
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
