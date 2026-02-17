import { Check, Sparkles, Crown, Flame, Gift, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const TELEGRAM_BOT_URL = "https://t.me/Valueoflife_bot";

const plans = [
  {
    name: "Пробный период",
    subtitle: "Начни с малого — оцени свою жизнь уже сегодня за 5 минут",
    price: "Бесплатно",
    period: "5 дней",
    description:
      "Бесплатный доступ к Telegram-боту на 5 дней. Познакомьтесь с системой, протестируйте функционал и почувствуйте изменения.",
    features: [
      "Колесо баланса",
      "Все 8 сфер жизни",
      "Диалог с ИИ-наставником",
    ],
    gradient: "from-emerald-500 to-teal-500",
    iconColor: "text-emerald-400",
    highlighted: false,
    cta: "Попробовать бесплатно",
    icon: Gift,
  },
  {
    name: "PRO — 1 месяц",
    price: "299 ₽",
    period: "30 дней",
    description: "Полный доступ к Telegram-боту Balance Guide на 30 дней.",
    features: [
      "Колесо баланса",
      "Все 8 сфер жизни",
      "Расширенная аналитика",
      "Персональные уведомления",
      "Диалог с ИИ-наставником",
      "Приоритетная поддержка",
    ],
    gradient: "from-violet-500 to-purple-500",
    iconColor: "text-violet-400",
    highlighted: false,
    cta: "Оформить подписку",
    icon: Sparkles,
  },
  {
    name: "PRO — 12 месяцев",
    price: "2 388 ₽",
    period: "1 год",
    description: "Полный доступ к Telegram-боту Balance Guide на 1 год.",
    monthlyPrice: "199 ₽ / месяц",
    savings: "Экономия 1 200 ₽",
    features: [
      "Всё из месячного тарифа",
      "Расширенная аналитика",
      "Персональные уведомления",
      "Астрологические рекомендации",
      "Приоритетная поддержка",
    ],
    gradient: "from-amber-500 to-orange-500",
    iconColor: "text-amber-400",
    highlighted: true,
    badge: "Выгодно 🔥",
    cta: "Оформить годовую подписку",
    icon: Crown,
  },
];

const LandingPricing = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-amber-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Тарифы
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Выберите свой план
            </span>
          </h2>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative group ${plan.highlighted ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-3xl blur-xl opacity-50" />
                )}

                <div
                  className={`relative h-full p-8 rounded-3xl border transition-all duration-300 flex flex-col ${
                    plan.highlighted
                      ? "bg-white/[0.05] border-amber-500/30 hover:border-amber-500/50"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-medium text-white">
                      {plan.badge}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} p-0.5 mb-4`}
                    >
                      <div className="w-full h-full rounded-2xl bg-[#0a0a14] flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {plan.name}
                    </h3>
                    {plan.subtitle && (
                      <p className="text-white/60 text-sm mb-2 italic">
                        {plan.subtitle}
                      </p>
                    )}
                    <p className="text-white/40 text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span
                        className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}
                      >
                        {plan.price}
                      </span>
                    </div>
                    {plan.monthlyPrice && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-center gap-1 text-amber-400 text-sm font-medium">
                          <Flame className="w-4 h-4" />
                          {plan.monthlyPrice}
                        </div>
                        <div className="text-emerald-400 text-xs font-medium">
                          {plan.savings}
                        </div>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white/70 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white border-0`}
                  >
                    <a
                      href={TELEGRAM_BOT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {plan.cta}
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
