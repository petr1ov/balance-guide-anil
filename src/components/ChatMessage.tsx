interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

const ChatMessage = ({ content, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden shadow-soft bg-gradient-to-br from-spirituality to-relationships flex items-center justify-center">
          <span className="text-sm">🧘</span>
        </div>
      )}
      
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card shadow-soft border border-border/50 text-card-foreground rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p className={`text-[10px] mt-1 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
