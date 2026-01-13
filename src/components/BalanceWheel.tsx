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
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate scores counting up
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3); // Ease out cubic

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

  const size = 320;
  const center = size / 2;
  const outerRadius = size / 2 - 24;
  const innerRadius = 40;

  // Calculate filled sector based on score (0-10 → 0-90 degrees fill)
  const createFilledSectorPath = (startAngle: number, score: number) => {
    const fillAngle = (score / 10) * 90; // Each sector is 90 degrees
    const endAngle = startAngle + fillAngle;
    
    if (score === 0) return "";

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + innerRadius * Math.cos(startRad);
    const y1 = center + innerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(startRad);
    const y2 = center + outerRadius * Math.sin(startRad);
    const x3 = center + outerRadius * Math.cos(endRad);
    const y3 = center + outerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(endRad);
    const y4 = center + innerRadius * Math.sin(endRad);

    const largeArc = fillAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  const getPosition = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  // Colors from the visual guide
  const sectors = [
    { 
      key: "spirituality" as const, 
      label: "Духовность", 
      startAngle: -90, 
      endAngle: 0, 
      midAngle: -45, 
      gradientStart: "#B9B7FF",
      gradientEnd: "#8B8AF8",
      icon: "🧘"
    },
    { 
      key: "relationships" as const, 
      label: "Отношения", 
      startAngle: 0, 
      endAngle: 90, 
      midAngle: 45, 
      gradientStart: "#FFB3B3",
      gradientEnd: "#FF8A8A",
      icon: "❤️"
    },
    { 
      key: "finance" as const, 
      label: "Финансы", 
      startAngle: 90, 
      endAngle: 180, 
      midAngle: 135, 
      gradientStart: "#FFE3A1",
      gradientEnd: "#F4C76C",
      icon: "💼"
    },
    { 
      key: "health" as const, 
      label: "Здоровье", 
      startAngle: 180, 
      endAngle: 270, 
      midAngle: 225, 
      gradientStart: "#B4EBD0",
      gradientEnd: "#7ED7A7",
      icon: "💪"
    },
  ];

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-700 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      {/* Background wheel scale image */}
      <img 
        src={wheelScale} 
        alt="" 
        className={`absolute w-[320px] h-[320px] transition-all duration-1000 ${
          isVisible ? "opacity-100 rotate-0" : "opacity-0 -rotate-45"
        }`}
        style={{ 
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.08))"
        }}
      />
      
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10"
        style={{ 
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12))"
        }}
      >
        <defs>
          {/* Radial gradients for each sector */}
          {sectors.map((sector) => (
            <radialGradient 
              key={`grad-${sector.key}`} 
              id={`grad-${sector.key}`} 
              cx="50%" 
              cy="50%" 
              r="70%"
              fx="30%"
              fy="30%"
            >
              <stop offset="0%" stopColor={sector.gradientStart} />
              <stop offset="100%" stopColor={sector.gradientEnd} />
            </radialGradient>
          ))}
          
          {/* Inner shadow filter for depth */}
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset dx="0" dy="2" result="offsetBlur" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
            <feFlood floodColor="#000000" floodOpacity="0.15" />
            <feComposite in2="shadowDiff" operator="in" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>

          {/* Center shadow */}
          <filter id="centerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12"/>
          </filter>
        </defs>

        {/* Filled sectors based on scores */}
        {sectors.map((sector, index) => {
          const score = animatedScores[sector.key];
          const path = createFilledSectorPath(sector.startAngle, score);
          
          if (!path) return null;
          
          return (
            <g 
              key={sector.key}
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity 0.5s ease-out ${index * 0.15}s`,
              }}
            >
              <path
                d={path}
                fill={`url(#grad-${sector.key})`}
                stroke="white"
                strokeWidth="2"
                onClick={() => onSectorClick?.(sector.key)}
                className="cursor-pointer transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
                style={{ 
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                  transformOrigin: "center",
                }}
              />
            </g>
          );
        })}

        {/* Center circle with depth effect */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          filter="url(#centerShadow)"
          className={`transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        />
        
        {/* Inner highlight for center */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 2}
          fill="white"
          className={`transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Score numbers inside sectors - positioned closer to center */}
        {sectors.map((sector, index) => {
          const scorePos = getPosition(sector.midAngle, 75);
          const score = animatedScores[sector.key];
          
          return (
            <g 
              key={`score-${sector.key}`}
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity 0.5s ease-out ${0.5 + index * 0.1}s`,
              }}
            >
              {/* Score number */}
              <text
                x={scorePos.x}
                y={scorePos.y + 6}
                textAnchor="middle"
                fill="white"
                fontSize="22"
                fontWeight="700"
                fontFamily="Nunito, system-ui, sans-serif"
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                {score}
              </text>
            </g>
          );
        })}

        {/* Icons - positioned on the outer edge */}
        {sectors.map((sector, index) => {
          const iconPos = getPosition(sector.midAngle, 115);
          
          return (
            <text
              key={`icon-${sector.key}`}
              x={iconPos.x}
              y={iconPos.y + 5}
              textAnchor="middle"
              fontSize="20"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity 0.5s ease-out ${0.7 + index * 0.1}s`,
              }}
            >
              {sector.icon}
            </text>
          );
        })}

        {/* Labels outside the wheel */}
        {sectors.map((sector, index) => {
          const labelPos = getPosition(sector.midAngle, 145);
          
          return (
            <text
              key={`label-${sector.key}`}
              x={labelPos.x}
              y={labelPos.y + 4}
              textAnchor="middle"
              fill="#5B6472"
              fontSize="11"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity 0.5s ease-out ${0.8 + index * 0.1}s`,
              }}
            >
              {sector.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default BalanceWheel;