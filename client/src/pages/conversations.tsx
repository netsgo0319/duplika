import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { useDuplika, useDuplikaConversations } from "@/hooks/use-duplikas";

export default function Conversations() {
  const [, params] = useRoute("/conversations/:id");
  const [, setLocation] = useLocation();
  const duplikaId = params?.id || "";

  const { data: duplika } = useDuplika(duplikaId);
  const { data: conversations, isLoading } = useDuplikaConversations(duplikaId);

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href={`/dashboard/${duplikaId}`}>
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold font-heading">Conversations</h1>
        <span className="ml-auto text-sm text-muted-foreground">
          {conversations?.length ?? 0}
        </span>
      </header>

      <div className="px-6 py-6 space-y-3">
        {(!conversations || conversations.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              No conversations yet.
            </p>
            <Link href={`/chat/${duplikaId}`}>
              <Button variant="outline" className="mt-4">
                Start a conversation
              </Button>
            </Link>
          </div>
        )}

        {conversations?.map((conv) => {
          const date = new Date(conv.createdAt);
          const timeStr = date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <Card
              key={conv.id}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={() => setLocation(`/chat/${duplikaId}?conversation=${conv.id}`)}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Chat with {duplika?.displayName ?? "Duplika"}
                </p>
                <p className="text-xs text-muted-foreground">{timeStr}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </MobileContainer>
  );
}
