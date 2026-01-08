import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-[#EEF1F6] flex items-center justify-center z-40 transition-all hover:scale-105 active:scale-95 animate-scale-in"
      style={{
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)"
      }}
    >
      <Plus className="w-6 h-6 text-[#5B6472]" strokeWidth={2} />
    </button>
  );
};

export default FloatingActionButton;