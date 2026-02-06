import { Send, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import anilAvatar from "@/assets/anil-avatar.png";

interface LandingHeroProps {
  telegramUrl: string;
}

const LandingHero = ({ telegramUrl }: LandingHeroProps) => {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-cyan-600/30 rounded-full blur-[120px] opacity-60" />
        
        {/* Secondary orbs */}
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-[80px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-white/70">Персональный ИИ-наставник</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in-up">
          <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            ИИ-наставник, который помогает
          </span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            навести порядок в жизни
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Колесо баланса · персональные рекомендации · Telegram mini-app
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 text-lg px-8 py-6 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300"
          >
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
              <Send className="w-5 h-5 mr-2" />
              Начать в Telegram
            </a>
          </Button>
        </div>

        {/* Mentor avatar */}
        <div className="relative w-32 h-32 mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 blur-xl opacity-50" />
          <img 
            src={anilAvatar} 
            alt="ИИ-наставник Анил" 
            className="relative w-full h-full rounded-full object-cover border-2 border-white/20"
          />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors animate-bounce"
        >
          <span className="text-sm">Узнать больше</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default LandingHero;
