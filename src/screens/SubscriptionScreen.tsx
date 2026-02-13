import { useState } from "react";
import { ArrowLeft, Check, Crown, Loader2, Sparkles } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionScreenProps {
  language: Language;
  subscriptionType: "free" | "pro";
  expiresAt?: string | null;
  onBack: () => void;
}

type Plan = "monthly" | "yearly";

const SubscriptionScreen = ({
  language,
  subscriptionType,
  expiresAt,
  onBack,
}: SubscriptionScreenProps) => {
  const { t } = useTranslation(language);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "ru" ? "ru-RU" : language === "hi" ? "hi-IN" : "en-US",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast.error(language === "ru" ? "Необходима авторизация" : "Authorization required");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-robokassa-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan: selectedPlan }),
        }
      );

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        const tg = (window as unknown as { Telegram?: { WebApp?: { openLink: (url: string) => void } } }).Telegram?.WebApp;
        if (tg?.openLink) {
          tg.openLink(result.paymentUrl);
        } else {
          window.open(result.paymentUrl, "_blank");
        }
      } else {
        throw new Error(result.error || "Failed to create payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        language === "ru"
          ? "Ошибка создания платежа"
          : "Payment creation error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    t("subscription.feature1"),
    t("subscription.feature2"),
    t("subscription.feature3"),
    t("subscription.feature4"),
  ];

  const plans = [
    {
      id: "monthly" as Plan,
      label: language === "ru" ? "1 месяц" : "1 month",
      price: 299,
      perMonth: 299,
      badge: null,
    },
    {
      id: "yearly" as Plan,
      label: language === "ru" ? "12 месяцев" : "12 months",
      price: 2388,
      perMonth: 199,
      badge: language === "ru" ? "Выгодно" : "Best value",
      saving: 1200,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8 safe-top">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 animate-fade-in">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          {t("subscription.title")}
        </h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Current Plan Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              subscriptionType === "pro" ? "bg-amber-500/20" : "bg-blue-500/20"
            }`}>
              <Crown className={`w-6 h-6 ${
                subscriptionType === "pro" ? "text-amber-500" : "text-blue-500"
              }`} />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">
                {t("subscription.currentPlan")}
              </p>
              <p className="text-muted-foreground">
                {subscriptionType === "pro" ? t("subscription.proPlan") : t("subscription.freePlan")}
              </p>
            </div>
          </div>
          {expiresAt && (
            <p className="text-sm text-muted-foreground">
              {t("subscription.expiresAt")}: {formatDate(expiresAt)}
            </p>
          )}
        </div>

        {/* Pro Plan Cards */}
        {subscriptionType !== "pro" && (
          <>
            {/* Plan selector */}
            <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${
                    selectedPlan === plan.id
                      ? "border-amber-500 bg-amber-500/10 shadow-lg"
                      : "border-border/50 bg-card hover:border-amber-500/30"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{plan.price} ₽</span>
                    <span className="text-muted-foreground">/ {plan.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.perMonth} ₽ / {language === "ru" ? "мес" : "mo"}
                  </p>
                  {plan.saving && (
                    <p className="text-sm font-medium text-green-500 mt-1">
                      {language === "ru" ? `Экономия ${plan.saving} ₽` : `Save ${plan.saving} ₽`}
                    </p>
                  )}
                  {/* radio indicator */}
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id ? "border-amber-500" : "border-muted-foreground/40"
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <div className="pl-8">
                    {/* content already rendered above — radio sits left */}
                  </div>
                </button>
              ))}
            </div>

            {/* Features */}
            <div
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/30 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="space-y-3 mb-6">
                <p className="font-medium text-foreground">
                  {t("subscription.features")}:
                </p>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-amber-500" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === "ru" ? "Создание платежа..." : "Creating payment..."}
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    {t("subscription.subscribe")} — {plans.find(p => p.id === selectedPlan)!.price} ₽
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Already Pro */}
        {subscriptionType === "pro" && (
          <div
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/30 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">
                  {language === "ru" ? "Pro активен" : "Pro is active"}
                </p>
                <p className="text-muted-foreground">
                  {language === "ru"
                    ? "Спасибо за поддержку!"
                    : "Thank you for your support!"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionScreen;
