import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { FloatingActionButton } from '@/components/chat/FloatingActionButton';
import { EmptyState } from '@/components/chat/EmptyState';
import { Avatar } from '@/components/chat/Avatar';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, CheckCheck, Trash2, Settings, Archive, ShieldOff } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { chats, markAllAsRead, deleteAllChats } = useChat();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredChats = chats.filter(chat => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = chat.contactName.toLowerCase().includes(searchLower);
    const phoneMatch = chat.contactPhone.toLowerCase().includes(searchLower);
    const messageMatch = chat.lastMessage.toLowerCase().includes(searchLower);
    return nameMatch || phoneMatch || messageMatch;
  });

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All conversations marked as read",
      description: "You're all caught up!",
    });
    setMenuOpen(false);
  };

  const handleDeleteAll = () => {
    deleteAllChats();
    toast({
      title: "All conversations deleted",
      description: "Your inbox is now empty.",
    });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="SecureChat"
        showSearch
        onSearchChange={setSearchQuery}
        leftContent={
          <button className="p-2">
            <Avatar name="You" size="sm" />
          </button>
        }
        rightContent={
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <MoreVertical className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleMarkAllAsRead} className="gap-3">
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteAll} className="gap-3 text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4" />
                Delete all conversations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/settings'); setMenuOpen(false); }} className="gap-3">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/archived'); setMenuOpen(false); }} className="gap-3">
                <Archive className="w-4 h-4" />
                Archived messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { toast({ title: "Coming soon", description: "Spam & blocked settings will be available in a future update." }); setMenuOpen(false); }} className="gap-3">
                <ShieldOff className="w-4 h-4" />
                Spam & blocked
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <main className="pb-24 overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 64px)' }}>
        {searchQuery && filteredChats.length === 0 ? (
          <EmptyState type="search" />
        ) : filteredChats.length === 0 ? (
          <EmptyState type="chats" />
        ) : (
          <div>
            {filteredChats.map(chat => (
              <ChatListItem key={chat.id} chat={chat} />
            ))}
          </div>
        )}
      </main>

      <FloatingActionButton />
    </div>
  );
}
