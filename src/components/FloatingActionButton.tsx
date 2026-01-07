import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-28 right-6 w-14 h-14 rounded-2xl bg-secondary shadow-elevated flex items-center justify-center z-40 hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95 animate-scale-in"
    >
      <Plus className="w-6 h-6 text-secondary-foreground" />
    </button>
  );
};

export default FloatingActionButton;
