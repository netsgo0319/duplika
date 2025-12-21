import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, AlertCircle, X } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TopicsToAvoid() {
  const [topics, setTopics] = useState([
    "Politics",
    "Religion",
    "Controversial public figures",
    "Medical advice (serious conditions)"
  ]);
  const [newTopic, setNewTopic] = useState("");

  const handleAdd = () => {
    if (newTopic.trim()) {
        setTopics([...topics, newTopic]);
        setNewTopic("");
    }
  };

  const handleRemove = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  return (
    <MobileContainer>
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href="/dashboard/1">
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
                />
                <Button onClick={handleAdd} size="icon" className="shrink-0">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                    <div key={index} className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-secondary text-secondary-foreground pl-3 pr-1 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 group border border-border">
                            {topic}
                            <button onClick={() => handleRemove(index)} className="p-1 rounded-full hover:bg-black/10 transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </MobileContainer>
  );
}
