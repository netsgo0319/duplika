import { MobileContainer } from "@/components/layout/mobile-container";
import { MessageBubble } from "@/components/chat/message-bubble";
import { SourceCard } from "@/components/chat/source-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MoreHorizontal, Phone, Video } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import thumbnailImage from "@assets/generated_images/youtube_thumbnail_makeup_tutorial.png";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Ask me anything about makeup or my recent videos.", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg = { id: Date.now(), text: inputValue, isUser: true };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
        setIsTyping(false);
        const aiResponse = { 
            id: Date.now() + 1, 
            text: "I really recommend the Hince Cover Master Pink Cushion! It has much better coverage than the Two Slash Four one, and the finish is super even.", 
            isUser: false,
            hasSource: true
        };
        setMessages((prev) => [...prev, aiResponse]);
    }, 2000);
  };

  return (
    <MobileContainer showNav={false} className="bg-background">
      {/* Chat Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
            <Link href="/dashboard/1">
                <Button variant="ghost" size="icon" className="-ml-2 h-9 w-9">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100" />
                        <AvatarFallback>IB</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                </div>
                <div>
                    <h2 className="font-semibold text-sm leading-none">Inbora</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Active now</p>
                </div>
            </div>
        </div>
        <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                <Phone className="w-5 h-5" />
            </Button>
             <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                <Video className="w-5 h-5" />
            </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="p-4 min-h-[calc(100vh-140px)]">
        <div className="text-center text-xs text-muted-foreground my-4 font-medium uppercase tracking-wider opacity-50">Today 10:23 AM</div>
        
        {messages.map((msg) => (
            <div key={msg.id}>
                <MessageBubble content={msg.text} isUser={msg.isUser} />
                {/* @ts-ignore */}
                {msg.hasSource && (
                    <SourceCard 
                        thumbnailUrl={thumbnailImage}
                        sourceName="YouTube"
                        sourceUrl="https://youtube.com"
                        timestamp="3:52"
                    />
                )}
            </div>
        ))}
        
        {isTyping && (
             <div className="flex w-full mb-4 justify-start animate-in fade-in slide-in-from-bottom-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mr-2 flex-shrink-0 flex items-center justify-center border border-border/50">
                    <span className="text-[10px] font-bold text-primary">AI</span>
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-[20px] rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-border p-3 flex items-center gap-2 pb-safe">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground rounded-full hover:bg-secondary">
            <MoreHorizontal className="w-5 h-5" />
        </Button>
        <div className="flex-1 relative">
            <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..." 
                className="rounded-full bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary h-10 pl-4 pr-10"
            />
        </div>
        <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim()}
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md disabled:opacity-50 transition-all"
        >
            <Send className="w-4 h-4 ml-0.5" />
        </Button>
      </div>
    </MobileContainer>
  );
}
