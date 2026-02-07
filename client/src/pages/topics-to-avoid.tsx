import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, AlertCircle, X, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useTopicsToAvoid, useCreateTopic, useDeleteTopic } from "@/hooks/use-duplikas";

export default function TopicsToAvoid() {
  const [, params] = useRoute("/topics-to-avoid/:id");
  const duplikaId = params?.id || "";

  const { data: topics = [], isLoading } = useTopicsToAvoid(duplikaId);
  const createTopic = useCreateTopic(duplikaId);
  const deleteTopic = useDeleteTopic(duplikaId);

  const [newTopic, setNewTopic] = useState("");

  const handleAdd = async () => {
    if (!newTopic.trim()) return;
    try {
      await createTopic.mutateAsync({ topic: newTopic.trim() });
      setNewTopic("");
      toast({ title: "Topic added", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to add topic.", variant: "destructive", duration: 2000 });
    }
  };

  const handleRemove = async (topicId: string) => {
    try {
      await deleteTopic.mutateAsync(topicId);
      toast({ title: "Topic removed", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to remove topic.", variant: "destructive", duration: 2000 });
    }
  };

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
        <h1 className="text-lg font-bold font-heading">Topics to Avoid</h1>
      </header>

      <div className="px-6 py-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Your AI will politely decline to answer questions related to these topics.</p>
        </div>

        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Add a sensitive topic..."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    disabled={createTopic.isPending}
                />
                <Button onClick={handleAdd} size="icon" className="shrink-0" disabled={createTopic.isPending}>
                    {createTopic.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                    <div key={topic.id} className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-secondary text-secondary-foreground pl-3 pr-1 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 group border border-border">
                            {topic.topic}
                            <button
                              onClick={() => handleRemove(topic.id)}
                              className="p-1 rounded-full hover:bg-black/10 transition-colors"
                              disabled={deleteTopic.isPending}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
                {topics.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">No topics added yet.</p>
                )}
            </div>
        </div>
      </div>
    </MobileContainer>
  );
}
