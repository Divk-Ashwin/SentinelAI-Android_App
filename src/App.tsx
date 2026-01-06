import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "@/context/ChatContext";
import Home from "./pages/Home";
import ChatView from "./pages/ChatView";
import SenderDetails from "./pages/SenderDetails";
import NewChat from "./pages/NewChat";
import Archived from "./pages/Archived";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ChatProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="max-w-md mx-auto min-h-screen bg-background shadow-xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat/:chatId" element={<ChatView />} />
              <Route path="/contact/:chatId" element={<SenderDetails />} />
              <Route path="/new-chat" element={<NewChat />} />
              <Route path="/archived" element={<Archived />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ChatProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
