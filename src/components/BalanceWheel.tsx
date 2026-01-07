import { Heart, Sparkles, Leaf, Coins } from "lucide-react";

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
  const size = 300;
  const center = size / 2;
  const outerRadius = size / 2 - 20;
  const innerRadius = 35;

  const createSectorPath = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  const getPosition = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const sectors = [
    { 
      key: "spirituality" as const, 
      label: "Духовность", 
      startAngle: -90, 
      endAngle: 0, 
      midAngle: -45, 
      color: "#8b5cf6", 
      lightColor: "#a78bfa",
      icon: "✨"
    },
    { 
      key: "relationships" as const, 
      label: "Отношения", 
      startAngle: 0, 
      endAngle: 90, 
      midAngle: 45, 
      color: "#ec4899", 
      lightColor: "#f472b6",
      icon: "❤️"
    },
    { 
      key: "health" as const, 
      label: "Здоровье", 
      startAngle: 180, 
      endAngle: 270, 
      midAngle: 225, 
      color: "#22c55e", 
      lightColor: "#4ade80",
      icon: "🌿"
    },
    { 
      key: "finance" as const, 
      label: "Финансы", 
      startAngle: 90, 
      endAngle: 180, 
      midAngle: 135, 
      color: "#eab308", 
      lightColor: "#facc15",
      icon: "💰"
    },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-xl"
      >
        <defs>
          {sectors.map((sector) => (
            <linearGradient 
              key={`grad-${sector.key}`} 
              id={`grad-${sector.key}`} 
              x1="0%" 
              y1="0%" 
              x2="100%" 
              y2="100%"
            >
              <stop offset="0%" stopColor={sector.lightColor} />
              <stop offset="100%" stopColor={sector.color} />
            </linearGradient>
          ))}
          <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2"/>
          </filter>
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15"/>
          </filter>
        </defs>

        {/* Background circle for shadow */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 2}
          fill="white"
          filter="url(#wheelShadow)"
          opacity="0.5"
        />

        {/* Sectors */}
        {sectors.map((sector) => {
          const path = createSectorPath(sector.startAngle, sector.endAngle);
          
          return (
            <g key={sector.key}>
              <path
                d={path}
                fill={`url(#grad-${sector.key})`}
                stroke="white"
                strokeWidth="3"
                onClick={() => onSectorClick?.(sector.key)}
                className="cursor-pointer hover:brightness-110 transition-all duration-200"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
              />
            </g>
          );
        })}

        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          filter="url(#innerShadow)"
        />

        {/* Score badges and labels */}
        {sectors.map((sector) => {
          const scorePos = getPosition(sector.midAngle, 75);
          const labelPos = getPosition(sector.midAngle, 115);
          const score = scores[sector.key];
          
          return (
            <g key={`info-${sector.key}`}>
              {/* Score pill */}
              <rect
                x={scorePos.x - 14}
                y={scorePos.y - 11}
                width="28"
                height="22"
                rx="11"
                fill="white"
                opacity="0.95"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
              />
              <text
                x={scorePos.x}
                y={scorePos.y + 5}
                textAnchor="middle"
                fill={sector.color}
                fontSize="13"
                fontWeight="700"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {score}
              </text>

              {/* Label */}
              <text
                x={labelPos.x}
                y={labelPos.y + 4}
                textAnchor="middle"
                fill="#374151"
                fontSize="11"
                fontWeight="600"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {sector.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BalanceWheel;
