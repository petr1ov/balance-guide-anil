import { AlertCircle, CircleDot, Compass, Target, Zap } from "lucide-react";

const problems = [
  {
    icon: CircleDot,
    text: "Вроде всё нормально, но нет ощущения целостности"
  },
  {
    icon: Compass,
    text: "Непонятно, за что браться в первую очередь"
  },
  {
    icon: Target,
    text: "Цели есть, но нет системы их достижения"
  },
  {
    icon: Zap,
    text: "Сложно держать фокус и мотивацию изо дня в день"
  },
  {
    icon: AlertCircle,
    text: "Чувство, что живёшь «без карты» — много делаешь, но куда?"
  }
];

const LandingProblem = () => {
  return (
    <section className="relative py-24 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-violet-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Знакомо?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Ты не сломан.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Ты просто живёшь без карты.
            </span>
          </h2>
        </div>

        {/* Problems list */}
        <div className="space-y-4">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-cyan-500/30 transition-colors">
                <problem.icon className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-white/80 text-lg">
                {problem.text}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <p className="text-center text-white/50 mt-12 text-lg">
          Хорошая новость: карту можно создать.
        </p>
      </div>
    </section>
  );
};

export default LandingProblem;
