import { Bell, MessageCircle, Calendar, Sparkles } from "lucide-react";

const notifications = [
  {
    time: "09:00",
    title: "Утренняя рекомендация",
    message: "Сегодня благоприятный день для работы над финансовой сферой. Начни с пересмотра своего бюджета...",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-500"
  },
  {
    time: "14:00",
    title: "Напоминание о цели",
    message: "Ты хотел уделить 30 минут здоровью сегодня. Как насчёт короткой прогулки?",
    icon: Bell,
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    time: "21:00",
    title: "Вечерняя рефлексия",
    message: "Как прошёл день? Давай отметим, что удалось сделать для твоего баланса.",
    icon: MessageCircle,
    gradient: "from-violet-500 to-purple-500"
  }
];

const LandingNotifications = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Ежедневная работа
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Не шаблоны,
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              а живые сообщения
            </span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Telegram — там, где ты и так есть. Наставник напоминает о целях 
            и даёт рекомендации прямо в мессенджере.
          </p>
        </div>

        {/* Notification examples */}
        <div className="max-w-lg mx-auto space-y-4">
          {notifications.map((notif, index) => (
            <div 
              key={index}
              className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${notif.gradient} p-0.5`}>
                  <div className="w-full h-full rounded-xl bg-[#0a0a14] flex items-center justify-center">
                    <notif.icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-white/40">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-sm text-white/50 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/40 text-sm mt-8">
          Время и частота уведомлений настраиваются под твой ритм
        </p>
      </div>
    </section>
  );
};

export default LandingNotifications;
