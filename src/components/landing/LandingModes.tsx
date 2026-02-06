import { Zap, Sparkles, Check } from "lucide-react";

const modes = [
  {
    id: "fast",
    icon: Zap,
    title: "Быстрый старт",
    subtitle: "Сразу к практике",
    gradient: "from-cyan-500 to-blue-500",
    glowColor: "cyan",
    features: [
      "Без астрологии",
      "4 ключевые сферы жизни",
      "Персональные рекомендации",
      "Подходит всем"
    ]
  },
  {
    id: "astrology",
    icon: Sparkles,
    title: "Астрология",
    subtitle: "Глубже и индивидуальнее",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "violet",
    badge: "Популярный",
    features: [
      "Персональный разбор по дате рождения",
      "Рекомендации на день / неделю / месяц",
      "Акценты по натальной карте",
      "Максимальная точность"
    ]
  }
];

const LandingModes = () => {
  return (
    <section className="relative py-24 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-violet-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Два режима работы
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Выбирай глубину,
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              с которой готов идти
            </span>
          </h2>
        </div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {modes.map((mode, index) => (
            <div 
              key={mode.id}
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative h-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300">
                {/* Badge */}
                {mode.badge && (
                  <div className="absolute -top-3 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-xs font-medium text-white">
                    {mode.badge}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.gradient} p-0.5`}>
                    <div className="w-full h-full rounded-2xl bg-[#0a0a14] flex items-center justify-center">
                      <mode.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {mode.title}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {mode.subtitle}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {mode.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${mode.gradient} flex items-center justify-center mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingModes;
