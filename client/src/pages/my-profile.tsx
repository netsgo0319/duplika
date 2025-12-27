import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, User, AtSign, Save } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function MyProfile() {
  const [displayName, setDisplayName] = useState("Inbora");
  const [handle, setHandle] = useState("inbora");
  const [bio, setBio] = useState("Beauty YouTuber & Skincare Expert");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
            duration: 2000,
        });
    }, 1000);
  };

  return (
    <MobileContainer>
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href="/dashboard/1">
            <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="w-6 h-6" />
            </Button>
        </Link>
        <h1 className="text-lg font-bold font-heading">My Profile</h1>
        <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto text-primary" 
            onClick={handleSave}
            disabled={loading}
        >
            <Save className="w-5 h-5" />
        </Button>
      </header>

      <div className="px-6 py-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
             <div className="relative group cursor-pointer">
                <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" />
                    <AvatarFallback>IB</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                    <Camera className="w-4 h-4" />
                </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-medium">Tap to change photo</p>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Display Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 h-12 bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary" 
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Handle</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium flex items-center gap-1">
                        <AtSign className="w-3.5 h-3.5" />
                        duplika.me/
                    </div>
                    <Input 
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="pl-28 h-12 bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary" 
                    />
                </div>
                <p className="text-[11px] text-muted-foreground ml-1">This is your unique public URL.</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>One-line Bio</Label>
                    <span className={`text-xs ${bio.length > 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {bio.length}/50
                    </span>
                </div>
                <Input 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={50}
                    className="h-12 bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary" 
                />
            </div>
        </div>
        
        <div className="pt-4">
             <Button onClick={handleSave} className="w-full h-12 text-base font-semibold rounded-xl" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
