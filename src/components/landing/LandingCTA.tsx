import { Send, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingCTAProps {
  telegramUrl: string;
}

const LandingCTA = ({ telegramUrl }: LandingCTAProps) => {
  return (
    <section className="relative py-24 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-cyan-600/30 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 p-0.5 mb-8">
          <div className="w-full h-full rounded-2xl bg-[#0a0a14] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            Начни с малого —
          </span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            оцени свою жизнь сегодня
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
          5 минут на заполнение колеса баланса — и ты уже увидишь картину. 
          А дальше — работа с наставником.
        </p>

        {/* CTA Button */}
        <Button 
          asChild
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 text-lg px-10 py-7 rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 group"
        >
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
            <Send className="w-5 h-5 mr-3" />
            Перейти в Telegram и начать
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </Button>

        {/* Trust note */}
        <p className="text-white/30 text-sm mt-6">
          Бесплатный старт · Без регистрации · Занимает 5 минут
        </p>
      </div>
    </section>
  );
};

export default LandingCTA;
