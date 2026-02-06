import { Briefcase, Users, Compass, Target, Lightbulb, Heart } from "lucide-react";

const audiences = [
  {
    icon: Briefcase,
    title: "Предпринимателям",
    description: "Кто хочет развивать бизнес, не забывая о других сферах жизни"
  },
  {
    icon: Users,
    title: "Специалистам",
    description: "Кто строит карьеру и ищет баланс между работой и личным"
  },
  {
    icon: Compass,
    title: "Тем, кто в поиске",
    description: "Кто хочет понять, куда двигаться дальше и что действительно важно"
  },
  {
    icon: Target,
    title: "Тем, кто ценит ясность",
    description: "Кому нужна система, а не мотивационные лозунги"
  },
  {
    icon: Lightbulb,
    title: "Практикам осознанности",
    description: "Кто уже работает над собой и хочет структурировать процесс"
  },
  {
    icon: Heart,
    title: "Тем, кто готов к честности",
    description: "С собой — чтобы увидеть реальную картину и начать меняться"
  }
];

const LandingAudience = () => {
  return (
    <section className="relative py-24 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Для кого
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Этот продукт —
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              для тех, кто готов к работе
            </span>
          </h2>
        </div>

        {/* Audience grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {audiences.map((item, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                <item.icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-white/50">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingAudience;
