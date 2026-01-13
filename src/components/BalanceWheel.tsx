import { useState, useEffect } from "react";
import wheelScale from "@/assets/wheel-scale.svg";

interface BalanceScores {
  spirituality: number;
  relationships: number;
  health: number;
  finance: number;
}

interface BalanceWheelProps {
  scores: BalanceScores;
  onSectorClick?: (sector: keyof BalanceScores) => void;
}

const BalanceWheel = ({ scores, onSectorClick }: BalanceWheelProps) => {
  const [animatedScores, setAnimatedScores] = useState<BalanceScores>({
    spirituality: 0,
    relationships: 0,
    health: 0,
    finance: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedScores({
        spirituality: Math.round(scores.spirituality * easeOut),
        relationships: Math.round(scores.relationships * easeOut),
        health: Math.round(scores.health * easeOut),
        finance: Math.round(scores.finance * easeOut),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [scores]);

  // Sector positions for scores and click areas (based on wheel image layout)
  const sectors = [
    { 
      key: "spirituality" as const, 
      label: "Духовность",
      // Top sector (12 o'clock position)
      scoreX: 50,
      scoreY: 22,
      icon: "🧘"
    },
    { 
      key: "relationships" as const, 
      label: "Отношения",
      // Right sector (3 o'clock position)
      scoreX: 78,
      scoreY: 50,
      icon: "❤️"
    },
    { 
      key: "finance" as const, 
      label: "Финансы",
      // Bottom sector (6 o'clock position)
      scoreX: 50,
      scoreY: 78,
      icon: "💼"
    },
    { 
      key: "health" as const, 
      label: "Здоровье",
      // Left sector (9 o'clock position)
      scoreX: 22,
      scoreY: 50,
      icon: "💪"
    },
  ];

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-700 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      {/* Wheel image */}
      <div 
        className={`relative w-[320px] h-[320px] transition-all duration-1000 ${
          isVisible ? "opacity-100 rotate-0" : "opacity-0 -rotate-12"
        }`}
      >
        <img 
          src={wheelScale} 
          alt="Balance Wheel" 
          className="w-full h-full"
          style={{ 
            filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.15))"
          }}
        />
        
        {/* Clickable areas and scores overlay */}
        {sectors.map((sector, index) => (
          <button
            key={sector.key}
            onClick={() => onSectorClick?.(sector.key)}
            className="absolute flex flex-col items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              left: `${sector.scoreX}%`,
              top: `${sector.scoreY}%`,
              transform: "translate(-50%, -50%)",
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${0.5 + index * 0.15}s`,
            }}
          >
            <span 
              className="text-2xl font-bold text-white drop-shadow-lg"
              style={{
                fontFamily: "Nunito, system-ui, sans-serif",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
            >
              {animatedScores[sector.key]}
            </span>
          </button>
        ))}

        {/* Labels */}
        {sectors.map((sector, index) => {
          let labelStyle: React.CSSProperties = {
            position: "absolute",
            opacity: isVisible ? 1 : 0,
            transition: `opacity 0.5s ease-out ${0.8 + index * 0.1}s`,
          };

          // Position labels outside the wheel
          if (sector.key === "spirituality") {
            labelStyle = { ...labelStyle, top: "-8px", left: "50%", transform: "translateX(-50%)" };
          } else if (sector.key === "relationships") {
            labelStyle = { ...labelStyle, right: "-16px", top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "center" };
          } else if (sector.key === "finance") {
            labelStyle = { ...labelStyle, bottom: "-8px", left: "50%", transform: "translateX(-50%)" };
          } else if (sector.key === "health") {
            labelStyle = { ...labelStyle, left: "-16px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "center" };
          }

          return (
            <span
              key={`label-${sector.key}`}
              className="text-xs font-semibold text-muted-foreground whitespace-nowrap"
              style={labelStyle}
            >
              {sector.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default BalanceWheel;