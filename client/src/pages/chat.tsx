import { MobileContainer } from "@/components/layout/mobile-container";
import { MessageBubble } from "@/components/chat/message-bubble";
import { SourceCard } from "@/components/chat/source-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Send, MoreHorizontal, Phone, Video, Sparkles } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import thumbnailImage from "@assets/generated_images/youtube_thumbnail_makeup_tutorial.png";

const PERSONAS = {
  "1": {
    name: "Inbora",
    role: "Beauty YouTuber",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
    initialMessage: "Hey! Ask me anything about makeup or my recent videos.",
    color: "bg-green-500",
    responses: {
      simple: "I recommend Hince Cover Master Pink Cushion.",
      rich: "I really recommend the Hince Cover Master Pink Cushion! It has much better coverage than the Two Slash Four one, and the finish is super even. It's perfect for dry skin like ours!"
    },
    source: {
      name: "YouTube",
      url: "https://youtube.com",
      timestamp: "3:52",
      thumbnail: thumbnailImage
    }
  },
  "4": {
    name: "Chef Maria",
    role: "Culinary Expert",
    avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=100&h=100",
    initialMessage: "Ciao! Ready to cook something delicious today?",
    color: "bg-orange-500",
    responses: {
      simple: "Use San Marzano tomatoes for the best sauce.",
      rich: "For an authentic sauce, you absolutely must use San Marzano tomatoes! They have the perfect balance of sweetness and acidity. Crush them by hand for the best texture!"
    },
    source: {
      name: "Cooking Class",
      url: "https://youtube.com",
      timestamp: "12:15",
      thumbnail: "https://images.unsplash.com/photo-1574868384238-d3a8ce720e70?auto=format&fit=crop&q=80&w=400&h=225"
    }
  }
};

export default function Chat() {
  const [, params] = useRoute("/chat/:id");
  const id = params?.id || "1";
  const persona = PERSONAS[id as keyof typeof PERSONAS] || PERSONAS["1"];

  const [messages, setMessages] = useState([
    { id: 1, text: persona.initialMessage, isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fanMode, setFanMode] = useState(false); // Default Off (Simple)
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages([{ id: 1, text: persona.initialMessage, isUser: false }]);
  }, [id]);

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
        const responseText = fanMode ? persona.responses.rich : persona.responses.simple;
        
        const aiResponse = { 
            id: Date.now() + 1, 
            text: responseText, 
            isUser: false,
            hasSource: fanMode // Only show source card in Rich mode for extra detail (or always if desired, but sticking to 'rich' concept)
        };
        setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const toggleFanMode = (checked: boolean) => {
    setFanMode(checked);
    toast({
      title: checked ? "Fan Mode On ✨" : "Fan Mode Off",
      description: checked ? "Get detailed, enthusiastic answers!" : "Get quick, concise answers.",
      duration: 2000,
    });
  };

  return (
    <MobileContainer showNav={false} className="bg-background">
      {/* Chat Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
            <Link href={`/dashboard/${id}`}>
                <Button variant="ghost" size="icon" className="-ml-2 h-9 w-9">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={persona.avatar} />
                        <AvatarFallback>{persona.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${persona.color} border-2 border-background rounded-full`}></div>
                </div>
                <div>
                    <h2 className="font-semibold text-sm leading-none">{persona.name}</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{persona.role}</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-full border border-border/50">
                <Sparkles className={`w-3.5 h-3.5 ${fanMode ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mr-1">Fan Mode</span>
                <Switch 
                    checked={fanMode} 
                    onCheckedChange={toggleFanMode} 
                    className="h-4 w-7 data-[state=checked]:bg-primary [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
                />
             </div>
             <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hidden sm:flex">
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
                        thumbnailUrl={persona.source.thumbnail}
                        sourceName={persona.source.name}
                        sourceUrl={persona.source.url}
                        timestamp={persona.source.timestamp}
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
                placeholder={`Message ${persona.name}...`}
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
