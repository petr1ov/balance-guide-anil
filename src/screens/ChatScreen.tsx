import { useState, useRef, useEffect } from "react";
import { MentorAvatar } from "@/components/MentorHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { streamChat } from "@/lib/chat";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const INITIAL_MESSAGE = `Привет! Я Anil, твой наставник по балансу жизни 🌱

Я помогу тебе оценить текущее состояние четырёх ключевых сфер жизни и вместе мы составим план развития.

Давай начнём? Оцени свою **Духовность** по шкале от 1 до 10.

(1 — полное отсутствие гармонии, 10 — идеальный баланс)`;

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: INITIAL_MESSAGE,
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

    // Convert messages to API format
    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.isUser ? "user" as const : "assistant" as const,
      content: m.content,
    }));

    let assistantSoFar = "";
    const assistantId = (Date.now() + 1).toString();

    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && !last.isUser) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [
          ...prev,
          {
            id: assistantId,
            content: assistantSoFar,
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      await streamChat({
        messages: apiMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (error) => {
          setIsLoading(false);
          toast({
            title: "Ошибка",
            description: error,
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ. Попробуйте ещё раз.",
        variant: "destructive",
      });
    }
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
        {isLoading && messages[messages.length - 1]?.isUser && (
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
