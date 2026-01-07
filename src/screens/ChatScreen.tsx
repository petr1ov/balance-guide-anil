import { useState, useRef, useEffect } from "react";
import { MentorAvatar } from "@/components/MentorHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Привет! Я Anil, твой наставник по балансу жизни. 🌱\n\nЯ помогу тебе оценить текущее состояние четырёх ключевых сфер и вместе мы составим план развития.\n\nС чего начнём?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Понимаю тебя. Давай разберёмся вместе. Расскажи подробнее о том, что тебя сейчас беспокоит в этой сфере?",
        "Это важное наблюдение. Как ты оцениваешь эту область своей жизни по шкале от 1 до 10?",
        "Хороший вопрос. Представь идеальное состояние — как бы выглядела твоя жизнь, если бы здесь всё было на 10 из 10?",
        "Отлично, что ты осознаёшь это. Какой один маленький шаг ты мог бы сделать уже сегодня?",
      ];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-card/80 backdrop-blur-xl border-b border-border/50 safe-top animate-fade-in">
        <MentorAvatar size="sm" showInfo={false} />
        <div>
          <h2 className="font-semibold text-foreground">Anil</h2>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Печатает..." : "Онлайн"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pb-24">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatScreen;
