import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import MyInfo from "@/pages/my-info";
import TopicsToAvoid from "@/pages/topics-to-avoid";
import ShareableLinks from "@/pages/shareable-links";
import KeywordResponses from "@/pages/keyword-responses";
import ProfileView from "@/pages/profile-view";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={Create} />
      <Route path="/dashboard/:id" component={Dashboard} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/profile/:id" component={ProfileView} />
      <Route path="/test-chat" component={() => <Chat />} /> {/* Backward compatibility */}
      <Route path="/my-info" component={MyInfo} />
      <Route path="/topics-to-avoid" component={TopicsToAvoid} />
      <Route path="/shareable-links" component={ShareableLinks} />
      <Route path="/keyword-responses" component={KeywordResponses} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
