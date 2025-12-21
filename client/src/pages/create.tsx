import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Instagram, Youtube, FileText, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Create() {
  const [step, setStep] = useState<"intro" | "upload" | "success">("intro");
  const [, setLocation] = useLocation();

  const handleNext = () => setStep("upload");
  const handleUpload = () => {
    // Simulate upload delay
    setTimeout(() => setStep("success"), 1500);
  };
  const handleFinish = () => setLocation("/");

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
                <Button onClick={handleNext} className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20">
                    Create My Duplika
                </Button>
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
                <Button variant="ghost" size="icon" onClick={() => setStep("intro")} className="-ml-2">
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
