import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroSection } from "@/components/HeroSection";
import { Dashboard } from "@/components/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <div>
          <HeroSection />
          <div className="p-6">
            <Dashboard />
          </div>
        </div>
      )} />
      <Route path="/health" component={() => (
        <div className="p-6">
          <Dashboard />
        </div>
      )} />
      <Route path="/mood" component={() => (
        <div className="p-6">
          <Dashboard />
        </div>
      )} />
      <Route path="/music" component={() => (
        <div className="p-6">
          <Dashboard />
        </div>
      )} />
      <Route path="/devices" component={() => (
        <div className="p-6">
          <Dashboard />
        </div>
      )} />
      <Route path="/settings" component={() => (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <p className="text-muted-foreground">Configure your health devices, music preferences, and privacy settings.</p>
        </div>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Custom sidebar width for health application
  const style = {
    "--sidebar-width": "20rem",       // 320px for better navigation
    "--sidebar-width-icon": "4rem",   // default icon width
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light" storageKey="healthtune-theme">
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
