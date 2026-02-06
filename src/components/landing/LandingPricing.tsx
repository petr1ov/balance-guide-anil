import { Check, Sparkles, Crown } from "lucide-react";

const plans = [
  {
    name: "Бесплатный старт",
    price: "0₽",
    period: "5 дней",
    description: "Попробуй и оцени",
    features: [
      "Колесо баланса",
      "Оценка 4 сфер жизни",
      "Базовые рекомендации",
      "Диалог с ИИ-наставником"
    ],
    gradient: "from-slate-500 to-slate-600",
    highlighted: false
  },
  {
    name: "Pro",
    price: "300₽",
    period: "30 дней",
    description: "Полный доступ",
    features: [
      "Всё из бесплатного",
      "Расширенная аналитика",
      "Персональные уведомления",
      "Астрологические рекомендации",
      "Приоритетная поддержка"
    ],
    gradient: "from-violet-500 to-purple-500",
    highlighted: true,
    badge: "Популярный"
  }
];

const LandingPricing = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-amber-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Доступ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Начни бесплатно,
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              продолжи с Pro
            </span>
          </h2>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative group ${plan.highlighted ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {/* Glow effect for highlighted */}
              {plan.highlighted && (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-50" />
              )}
              
              {/* Card */}
              <div className={`relative h-full p-8 rounded-3xl border transition-all duration-300 ${
                plan.highlighted 
                  ? "bg-white/[0.05] border-violet-500/30 hover:border-violet-500/50" 
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              }`}>
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-xs font-medium text-white">
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} p-0.5 mb-4`}>
                    <div className="w-full h-full rounded-2xl bg-[#0a0a14] flex items-center justify-center">
                      {plan.highlighted ? (
                        <Crown className="w-6 h-6 text-violet-400" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-white/40 text-sm">/ {plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white/70 text-sm">{feature}</span>
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

export default LandingPricing;
