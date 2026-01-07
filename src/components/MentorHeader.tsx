import { Menu } from "lucide-react";

interface MentorHeaderProps {
  onMenuClick?: () => void;
}

const MentorHeader = ({ onMenuClick }: MentorHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 safe-top animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">
        Balance Mentor
      </h1>
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-secondary transition-colors"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>
    </header>
  );
};

interface MentorAvatarProps {
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
}

export const MentorAvatar = ({ size = "md", showInfo = true }: MentorAvatarProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center animate-scale-in">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-card border-4 border-card bg-gradient-to-br from-spirituality to-relationships flex items-center justify-center`}>
        <span className="text-2xl">🧘</span>
      </div>
      {showInfo && (
        <div className="mt-3 text-center animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground">Anil</h2>
          <p className="text-sm text-muted-foreground">Your balance guide</p>
        </div>
      )}
    </div>
  );
};

export default MentorHeader;
