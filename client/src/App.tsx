import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteGuard } from "@/components/route-guard";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import MyInfo from "@/pages/my-info";
import TopicsToAvoid from "@/pages/topics-to-avoid";
import ShareableLinks from "@/pages/shareable-links";
import KeywordResponses from "@/pages/keyword-responses";
import ProfileView from "@/pages/profile-view";
import MyProfile from "@/pages/my-profile";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={AuthPage} />
      <Route path="/profile/:handle" component={ProfileView} />
      <Route path="/chat/:id" component={Chat} />

      {/* Protected routes */}
      <Route path="/">
        {() => <RouteGuard><Home /></RouteGuard>}
      </Route>
      <Route path="/create">
        {() => <RouteGuard><Create /></RouteGuard>}
      </Route>
      <Route path="/dashboard/:id">
        {() => <RouteGuard><Dashboard /></RouteGuard>}
      </Route>
      <Route path="/my-info/:id">
        {() => <RouteGuard><MyInfo /></RouteGuard>}
      </Route>
      <Route path="/my-profile/:id">
        {() => <RouteGuard><MyProfile /></RouteGuard>}
      </Route>
      <Route path="/topics-to-avoid/:id">
        {() => <RouteGuard><TopicsToAvoid /></RouteGuard>}
      </Route>
      <Route path="/shareable-links/:id">
        {() => <RouteGuard><ShareableLinks /></RouteGuard>}
      </Route>
      <Route path="/keyword-responses/:id">
        {() => <RouteGuard><KeywordResponses /></RouteGuard>}
      </Route>
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
