import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Instagram, Youtube, FileText, CheckCircle2, Camera, User, AtSign, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Create() {
  const [step, setStep] = useState<"intro" | "profile" | "first-message" | "upload" | "success">("intro");
  const [, setLocation] = useLocation();

  const handleStart = () => setStep("profile");
  const handleProfileNext = () => setStep("first-message");
  const handleMessageNext = () => setStep("upload");
  
  const handleUpload = () => {
    // Simulate upload delay
    setTimeout(() => setStep("success"), 1500);
  };
  const handleFinish = () => setLocation("/");

  const handleBack = () => {
    if (step === "profile") setStep("intro");
    else if (step === "first-message") setStep("profile");
    else if (step === "upload") setStep("first-message");
  };

  return (
    <MobileContainer showNav={false}>
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-8 py-12 text-center"
          >
            <div className="w-full flex justify-start mb-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="-ml-4">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center pt-10">
                <h1 className="text-3xl font-bold font-heading mb-4 text-foreground">
                    Engage more fans<br />with your Duplika
                </h1>
                <p className="text-muted-foreground mb-12 max-w-xs mx-auto leading-relaxed">
                    Create an AI clone that speaks like you, knows what you know, and interacts with your audience 24/7.
                </p>
                
                <div className="space-y-6 w-full max-w-xs text-left">
                    <FeatureItem icon={CheckCircle2} text="Clone your unique tone & style" />
                    <FeatureItem icon={CheckCircle2} text="Answer fan questions automatically" />
                    <FeatureItem icon={CheckCircle2} text="Share personalized product links" />
                </div>
            </div>
            
            <div className="mt-8">
                <Button onClick={handleStart} className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20">
                    Create My Duplika
                </Button>
            </div>
          </motion.div>
        )}

        {step === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-6"
          >
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-bold font-heading">Profile Setup</h2>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-3 relative cursor-pointer group hover:bg-secondary/80 transition-colors">
                        <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                            <PlusIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Upload Profile Photo</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="e.g. Inbora" className="pl-10 h-12 bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Handle</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium flex items-center gap-1">
                                <AtSign className="w-3.5 h-3.5" />
                                duplika.me/
                            </div>
                            <Input placeholder="username" className="pl-28 h-12 bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>One-line Bio</Label>
                            <span className="text-xs text-muted-foreground">0/50</span>
                        </div>
                        <Input maxLength={50} placeholder="Beauty YouTuber & Skincare Expert" className="h-12 bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary" />
                    </div>
                </div>

                <div className="pt-8">
                    <Button onClick={handleProfileNext} className="w-full h-12 text-base font-semibold rounded-xl">
                        Next
                    </Button>
                </div>
            </div>
          </motion.div>
        )}

        {step === "first-message" && (
          <motion.div
            key="first-message"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-6"
          >
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-bold font-heading">First Message</h2>
            </div>

            <div className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-2">
                    <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                        <p className="text-sm text-primary/80 leading-relaxed">
                            This is the first message your Duplika will send when a fan starts a conversation. Make it welcoming!
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Greeting Message</Label>
                    <Textarea 
                        placeholder="Hey there! Ask me anything about my latest video or skincare routine! ✨" 
                        className="min-h-[140px] bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary p-4 text-base resize-none"
                    />
                </div>

                <div className="pt-8">
                    <Button onClick={handleMessageNext} className="w-full h-12 text-base font-semibold rounded-xl">
                        Next
                    </Button>
                </div>
            </div>
          </motion.div>
        )}

        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-6"
          >
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-bold font-heading">Upload Data</h2>
            </div>

            <div className="space-y-8">
                <section>
                    <Label className="text-base font-semibold mb-3 block">Knowledge Base</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium">Click to upload PDF</p>
                        <p className="text-xs text-muted-foreground mt-1">Maximum size: 50MB</p>
                    </div>
                </section>

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                    <span className="relative bg-background px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Or connect social</span>
                </div>

                <section className="space-y-4">
                    <Label className="text-base font-semibold mb-3 block">Social Links</Label>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0 text-pink-600">
                                <Instagram className="w-5 h-5" />
                            </div>
                            <Input placeholder="Instagram Profile URL" className="flex-1 h-10" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                                <Youtube className="w-5 h-5" />
                            </div>
                            <Input placeholder="YouTube Channel URL" className="flex-1 h-10" />
                        </div>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <Input placeholder="Blog / Website URL" className="flex-1 h-10" />
                        </div>
                    </div>
                </section>

                <div className="pt-8">
                    <Button onClick={handleUpload} className="w-full h-12 text-base font-semibold rounded-xl">
                        Start Training
                    </Button>
                </div>
            </div>
          </motion.div>
        )}

        {step === "success" && (
           <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full px-8 py-12 items-center justify-center text-center"
           >
                <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold font-heading mb-2">Duplika Created!</h2>
                <p className="text-muted-foreground mb-8">
                    Your digital twin is ready to be customized. We've processed your data and set up the basics.
                </p>
                <Button onClick={handleFinish} className="w-full h-12 text-base font-semibold rounded-xl">
                    Go to Dashboard
                </Button>
           </motion.div>
        )}
      </AnimatePresence>
    </MobileContainer>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <Icon className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm font-medium">{text}</span>
        </div>
    )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
