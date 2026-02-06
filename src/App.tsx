import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/contexts/TelegramAuthContext";
import AuthGuard from "@/components/AuthGuard";
import AdminGuard from "@/components/AdminGuard";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAI from "./pages/admin/AdminAI";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TelegramAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public landing page */}
            <Route path="/landing" element={<Landing />} />
            
            {/* Protected routes */}
            <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/admin" element={<AuthGuard><AdminGuard><AdminDashboard /></AdminGuard></AuthGuard>} />
            <Route path="/admin/users" element={<AuthGuard><AdminGuard><AdminUsers /></AdminGuard></AuthGuard>} />
            <Route path="/admin/ai" element={<AuthGuard><AdminGuard><AdminAI /></AdminGuard></AuthGuard>} />
            <Route path="/admin/subscriptions" element={<AuthGuard><AdminGuard><AdminSubscriptions /></AdminGuard></AuthGuard>} />
            <Route path="/admin/analytics" element={<AuthGuard><AdminGuard><AdminAnalytics /></AdminGuard></AuthGuard>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TelegramAuthProvider>
  </QueryClientProvider>
);

export default App;
