import { Smartphone, PieChart, Target, History, Bell, Settings } from "lucide-react";

const features = [
  { icon: PieChart, label: "Колесо баланса" },
  { icon: Target, label: "Точки А и Б" },
  { icon: History, label: "История прогресса" },
  { icon: Bell, label: "Уведомления" },
  { icon: Settings, label: "Настройки" }
];

const LandingMiniApp = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Mini-App в Telegram
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Вся структура — в приложении.
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Вся глубина — в диалоге.
            </span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Phone mockup */}
          <div className="relative flex-shrink-0">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-cyan-500/30 rounded-[3rem] blur-3xl opacity-50" />
            
            {/* Phone frame */}
            <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-white/10 to-white/5 rounded-[3rem] p-2 border border-white/10">
              <div className="w-full h-full bg-[#12121f] rounded-[2.5rem] overflow-hidden">
                {/* Status bar */}
                <div className="h-12 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 flex items-center justify-center">
                  <span className="text-xs text-white/50">Balance Guide</span>
                </div>
                
                {/* Balance wheel preview */}
                <div className="p-6 flex flex-col items-center">
                  {/* Wheel */}
                  <div className="relative w-44 h-44 mb-6">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Spirituality */}
                      <path 
                        d="M100 100 L100 20 A80 80 0 0 1 180 100 Z" 
                        fill="url(#grad-spirituality)" 
                        opacity="0.8"
                      />
                      {/* Relationships */}
                      <path 
                        d="M100 100 L180 100 A80 80 0 0 1 100 180 Z" 
                        fill="url(#grad-relationships)" 
                        opacity="0.8"
                      />
                      {/* Health */}
                      <path 
                        d="M100 100 L100 180 A80 80 0 0 1 20 100 Z" 
                        fill="url(#grad-health)" 
                        opacity="0.8"
                      />
                      {/* Finance */}
                      <path 
                        d="M100 100 L20 100 A80 80 0 0 1 100 20 Z" 
                        fill="url(#grad-finance)" 
                        opacity="0.8"
                      />
                      {/* Center */}
                      <circle cx="100" cy="100" r="30" fill="#12121f" />
                      <circle cx="100" cy="100" r="28" fill="url(#grad-center)" opacity="0.3" />
                      
                      <defs>
                        <linearGradient id="grad-spirituality" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B8AF8" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                        <linearGradient id="grad-relationships" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF8A8A" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <linearGradient id="grad-health" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7ED7A7" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                        <linearGradient id="grad-finance" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#F4C76C" />
                          <stop offset="100%" stopColor="#eab308" />
                        </linearGradient>
                        <radialGradient id="grad-center">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </radialGradient>
                      </defs>
                    </svg>
                    
                    {/* Score labels */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-violet-400">8</div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-rose-400">6</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-emerald-400">7</div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-amber-400">5</div>
                  </div>

                  {/* Stats */}
                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-white/60">Духовность</span>
                      <span className="text-sm text-violet-400">8/10</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-white/60">Здоровье</span>
                      <span className="text-sm text-emerald-400">7/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features list */}
          <div className="flex-1 space-y-6">
            <p className="text-lg text-white/70 mb-8">
              Mini-app — это твой личный dashboard. Здесь ты видишь картину целиком: 
              где ты сейчас, куда идёшь, что уже сделал.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-sm text-white/70 text-center">{feature.label}</span>
                </div>
              ))}
            </div>

            <p className="text-white/50 text-sm italic mt-8">
              А глубокая работа — в чате с наставником. Там ты формулируешь цели, 
              получаешь персональные советы и рефлексируешь.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingMiniApp;
