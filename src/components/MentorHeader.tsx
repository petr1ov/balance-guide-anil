import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { toast } from "@/hooks/use-toast";
import anilAvatar from "@/assets/anil-avatar.png";

interface MentorHeaderProps {
  onMenuClick?: () => void;
}

const MentorHeader = ({ onMenuClick }: MentorHeaderProps) => {
  const navigate = useNavigate();
  const { telegramUser } = useTelegramAuth();
  const telegramId = telegramUser ? String(telegramUser.id) : null;
  const { isAdmin } = useAdminCheck(telegramId);

  const handleOmClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      toast({
        title: "Недоступно",
        description: "У вас нет доступа к этому разделу",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 safe-top animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
        Balance Mentor
      </h1>
      <button
        onClick={handleOmClick}
        className="p-2 rounded-xl hover:bg-secondary transition-colors text-xl"
        title="ॐ"
      >
        ॐ
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
    md: "w-[88px] h-[88px]",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center animate-scale-in">
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-white flex items-center justify-center`}
        style={{
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
        }}
      >
        <img 
          src={anilAvatar} 
          alt="Anil - your balance mentor" 
          className="w-full h-full object-cover"
        />
      </div>
      {showInfo && (
        <div className="mt-3 text-center animate-fade-in">
          <h2 className="text-xl font-display font-semibold text-foreground">Anil</h2>
          <p className="text-sm text-muted-foreground">Твой наставник по балансу</p>
        </div>
      )}
    </div>
  );
};

export default MentorHeader;