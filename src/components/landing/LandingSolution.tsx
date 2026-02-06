import { Search, Target, Bot, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Оцениваешь жизнь по сферам",
    description: "Заполняешь колесо баланса в mini-app — быстро и наглядно видишь, где ты сейчас",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    number: "02",
    icon: Target,
    title: "Формируешь точку Б",
    description: "В диалоге с ИИ-наставником определяешь, куда хочешь прийти в каждой сфере",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    number: "03",
    icon: Bot,
    title: "Получаешь рекомендации",
    description: "Персональные, не шаблонные — на основе твоей ситуации и целей",
    gradient: "from-pink-500 to-cyan-500"
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Двигаешься каждый день",
    description: "Видишь прогресс, получаешь напоминания, остаёшься в фокусе",
    gradient: "from-cyan-500 to-blue-500"
  }
];

const LandingSolution = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Как это работает
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              От хаоса к ясности
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              за 4 простых шага
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-pink-500/50 to-cyan-500/50 hidden md:block" />
          
          <div className="space-y-8 md:space-y-0">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className={`inline-block p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 ${
                    index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                  }`}>
                    <div className={`flex items-center gap-3 mb-3 ${
                      index % 2 === 0 ? "md:justify-end" : "md:justify-start"
                    }`}>
                      <span className={`text-sm font-mono bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                        {step.number}
                      </span>
                      <h3 className="text-xl font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-white/60 max-w-sm">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Icon (center on desktop) */}
                <div className="relative z-10 flex-shrink-0 order-first md:order-none">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} p-0.5`}>
                    <div className="w-full h-full rounded-2xl bg-[#0a0a14] flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Spacer for desktop layout */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingSolution;
