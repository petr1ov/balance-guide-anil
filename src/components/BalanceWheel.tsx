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
  const size = 320;
  const center = size / 2;
  const outerRadius = size / 2 - 24;
  const innerRadius = 40;

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
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="filter"
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

          {/* Outer glow for depth */}
          <filter id="outerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="out" />
          </filter>

          {/* Center shadow */}
          <filter id="centerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12"/>
          </filter>
        </defs>

        {/* Background circle with soft glow */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 4}
          fill="white"
          opacity="0.4"
        />

        {/* Sectors with radial gradients */}
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
                className="cursor-pointer transition-all duration-200 hover:brightness-105"
                style={{ 
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
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
        />
        
        {/* Inner highlight for center */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 2}
          fill="white"
          style={{
            filter: "drop-shadow(inset 0 2px 4px rgba(0,0,0,0.05))"
          }}
        />

        {/* Score numbers inside sectors - positioned closer to center */}
        {sectors.map((sector) => {
          const scorePos = getPosition(sector.midAngle, 70);
          const score = scores[sector.key];
          
          return (
            <g key={`score-${sector.key}`}>
              {/* Score number */}
              <text
                x={scorePos.x}
                y={scorePos.y + 6}
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="600"
                fontFamily="Nunito, system-ui, sans-serif"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)"
                }}
              >
                {score}
              </text>
            </g>
          );
        })}

        {/* Icons - white, semi-transparent */}
        {sectors.map((sector) => {
          const iconPos = getPosition(sector.midAngle, 110);
          
          return (
            <text
              key={`icon-${sector.key}`}
              x={iconPos.x}
              y={iconPos.y + 5}
              textAnchor="middle"
              fontSize="18"
              opacity="0.85"
            >
              {sector.icon}
            </text>
          );
        })}

        {/* Labels outside the wheel */}
        {sectors.map((sector) => {
          const labelPos = getPosition(sector.midAngle, 138);
          
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