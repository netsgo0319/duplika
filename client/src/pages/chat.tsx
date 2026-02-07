import { MobileContainer } from "@/components/layout/mobile-container";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { Link, useRoute, useSearch } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect, useCallback } from "react";
import { useDuplika } from "@/hooks/use-duplikas";
import { useCreateConversation, useChatMessages, useSendMessage } from "@/hooks/use-chat";
import type { Message } from "@/lib/api";

export default function Chat() {
  const [, params] = useRoute("/chat/:id");
  const duplikaId = params?.id || "";
  const search = useSearch();
  const queryConvId = new URLSearchParams(search).get("conversation");

  const { data: duplika, isLoading: duplikaLoading } = useDuplika(duplikaId);

  const [conversationId, setConversationId] = useState<string | null>(queryConvId);
  const [optimisticMessages, setOptimisticMessages] = useState<
    Array<{ id: string; text: string; isUser: boolean }>
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversation = useCreateConversation(duplikaId);
  const { data: serverMessages } = useChatMessages(conversationId ?? undefined);
  const sendMessage = useSendMessage(conversationId ?? "");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Merge server messages with optimistic messages
  const displayMessages: Array<{ id: string; text: string; isUser: boolean }> = [];

  // Add initial message from duplika
  if (duplika?.initialMessage) {
    displayMessages.push({
      id: "initial",
      text: duplika.initialMessage,
      isUser: false,
    });
  }

  // Add server messages
  if (serverMessages) {
    serverMessages.forEach((msg: Message) => {
      displayMessages.push({
        id: msg.id,
        text: msg.text,
        isUser: msg.isUser,
      });
    });
  }

  // Add optimistic messages not yet in server data
  const serverIds = new Set(serverMessages?.map((m: Message) => m.id) ?? []);
  optimisticMessages.forEach((msg) => {
    if (!serverIds.has(msg.id)) {
      displayMessages.push(msg);
    }
  });

  useEffect(scrollToBottom, [displayMessages.length, isTyping, scrollToBottom]);

  // Clean up optimistic messages once they appear in server data
  useEffect(() => {
    if (serverMessages && optimisticMessages.length > 0) {
      setOptimisticMessages((prev) =>
        prev.filter((m) => !serverIds.has(m.id)),
      );
    }
  }, [serverMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const text = inputValue.trim();
    setInputValue("");

    try {
      // Create conversation if none exists
      let convId = conversationId;
      if (!convId) {
        const conv = await createConversation.mutateAsync();
        convId = conv.id;
        setConversationId(convId);
      }

      // Add optimistic user message
      const optimisticId = `opt-${Date.now()}`;
      setOptimisticMessages((prev) => [
        ...prev,
        { id: optimisticId, text, isUser: true },
      ]);

      setIsTyping(true);

      // Send to API
      const response = await sendMessage.mutateAsync(text);

      // Remove optimistic message, server data will replace via query invalidation
      setOptimisticMessages((prev) =>
        prev.filter((m) => m.id !== optimisticId),
      );

      setIsTyping(false);
    } catch {
      setIsTyping(false);
    }
  };

  if (duplikaLoading) {
    return (
      <MobileContainer showNav={false} className="bg-background">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MobileContainer>
    );
  }

  if (!duplika) {
    return (
      <MobileContainer showNav={false} className="bg-background">
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Duplika not found</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer showNav={false} className="bg-background">
      {/* Chat Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${duplikaId}`}>
            <Button variant="ghost" size="icon" className="-ml-2 h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={duplika.avatar ?? undefined} />
                <AvatarFallback>{duplika.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-none">{duplika.displayName}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">@{duplika.handle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-full border border-border/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">AI</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="p-4 min-h-[calc(100vh-140px)]">
        {displayMessages.map((msg) => (
          <MessageBubble key={msg.id} content={msg.text} isUser={msg.isUser} />
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
        <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Message ${duplika.displayName}...`}
            className="rounded-full bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary h-10 pl-4 pr-10"
            disabled={isTyping}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          size="icon"
          className="h-10 w-10 rounded-full shadow-md disabled:opacity-50 transition-all"
        >
          {isTyping ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 ml-0.5" />
          )}
        </Button>
      </div>
    </MobileContainer>
  );
}
