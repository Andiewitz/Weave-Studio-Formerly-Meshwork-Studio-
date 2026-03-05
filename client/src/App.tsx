import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { RedirectingScreen } from "@/components/ui/loading-screen";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Settings from "@/pages/Settings";
import Workspace from "@/pages/Workspace";
import Dev from "@/pages/Dev";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isRedirecting } = useAuth();

  if (isLoading || isRedirecting) {
    return <RedirectingScreen />;
  }

  if (!user) {
    return <Redirect to="/auth/login" />;
  }

  return <Component />;
}

const PageTransition = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    className={cn("flex-1", className)}
    style={{ willChange: "opacity, transform" }}
  >
    {children}
  </motion.div>
);

function Router() {
  const [location] = useLocation();
  const { user, isLoading, isRedirecting } = useAuth();

  // Auth routes
  if (location.startsWith("/auth/")) {
    if (isRedirecting) {
      return <RedirectingScreen />;
    }
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="min-h-screen"
          style={{ willChange: "opacity, transform" }}
        >
          <Switch location={location} key={location}>
            <Route path="/auth/login">
              <Login />
            </Route>
            <Route path="/auth/register">
              <Register />
            </Route>
            <Route>
              <Redirect to="/auth/login" />
            </Route>
          </Switch>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show redirecting screen during auth transitions for protected routes
  if (isLoading || isRedirecting) {
    return <RedirectingScreen />;
  }

  // Workspace routes - scale animation from card
  if (location.startsWith("/workspace/")) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="h-full"
          style={{ willChange: "opacity, transform" }}
        >
          <Switch location={location} key={location}>
            <Route path="/workspace/:id">
              <ProtectedRoute component={Workspace} />
            </Route>
          </Switch>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Dashboard routes with layout
  return (
    <DashboardLayout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1"
          style={{ willChange: "opacity, transform" }}
        >
          <Switch location={location} key={location}>
            <Route path="/">
              <ProtectedRoute component={Home} />
            </Route>
            <Route path="/workspaces">
              <ProtectedRoute component={Home} />
            </Route>
            <Route path="/settings">
              <ProtectedRoute component={Settings} />
            </Route>
            <Route path="/dev">
              <ProtectedRoute component={Dev} />
            </Route>
            <Route>
              <PageTransition>
                <NotFound />
              </PageTransition>
            </Route>
          </Switch>
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
