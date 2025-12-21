import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export function MessageBubble({ content, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full mb-4 animate-in slide-in-from-bottom-2 duration-300", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mr-2 flex-shrink-0 flex items-center justify-center border border-border/50">
            <span className="text-xs font-bold text-primary">AI</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] px-4 py-3 text-[15px] leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-[20px] rounded-tr-sm"
            : "bg-secondary text-secondary-foreground rounded-[20px] rounded-tl-sm"
        )}
      >
        {content}
      </div>
    </div>
  );
}
