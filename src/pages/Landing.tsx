import { useState, useEffect } from "react";
import { 
  Send, 
  Target, 
  MessageCircle, 
  BarChart3, 
  Zap, 
  Star,
  Bell,
  Users,
  Briefcase,
  Compass,
  Check,
  ArrowRight,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingHero from "@/components/landing/LandingHero";
import LandingProblem from "@/components/landing/LandingProblem";
import LandingSolution from "@/components/landing/LandingSolution";
import LandingMiniApp from "@/components/landing/LandingMiniApp";
import LandingModes from "@/components/landing/LandingModes";
import LandingNotifications from "@/components/landing/LandingNotifications";
import LandingAudience from "@/components/landing/LandingAudience";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const TELEGRAM_BOT_URL = "https://t.me/balance_guide_bot";

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white overflow-x-hidden">
      {/* Floating header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 
            ? "bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/5" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Balance Guide</span>
          </div>
          <Button 
            asChild
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0"
          >
            <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
              <Send className="w-4 h-4 mr-2" />
              Начать
            </a>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main>
        <LandingHero telegramUrl={TELEGRAM_BOT_URL} />
        <LandingProblem />
        <LandingSolution />
        <LandingMiniApp />
        <LandingModes />
        <LandingNotifications />
        <LandingAudience />
        <LandingPricing />
        <LandingCTA telegramUrl={TELEGRAM_BOT_URL} />
      </main>

      <LandingFooter />
    </div>
  );
};

export default Landing;
