import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChatProvider } from "@/context/ChatContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import { BottomNav } from "@/components/BottomNav";
import Home from "./pages/Home";
import ChatView from "./pages/ChatView";
import SenderDetails from "./pages/SenderDetails";
import NewChat from "./pages/NewChat";
import Archived from "./pages/Archived";
import Settings from "./pages/Settings";
import About from "./pages/About";
import BlockedContacts from "./pages/BlockedContacts";
import StarredMessages from "./pages/StarredMessages";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated, isLoading, hasCompletedSetup } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!hasCompletedSetup) {
    return <Welcome />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:chatId" element={<ChatView />} />
        <Route path="/contact/:chatId" element={<SenderDetails />} />
        <Route path="/new-chat" element={<NewChat />} />
        <Route path="/archived" element={<Archived />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/blocked" element={<BlockedContacts />} />
        <Route path="/starred" element={<StarredMessages />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="max-w-md mx-auto min-h-screen bg-background shadow-xl relative flex flex-col">
                <div className="flex-1 flex flex-col">
                  <ProtectedRoutes />
                </div>
              </div>
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
