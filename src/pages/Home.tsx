import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { FloatingActionButton } from '@/components/chat/FloatingActionButton';
import { EmptyState } from '@/components/chat/EmptyState';
import { Avatar } from '@/components/chat/Avatar';
import { PullToRefresh } from '@/components/chat/PullToRefresh';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, CheckCheck, Trash2, Settings, Archive, ShieldOff, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { chats, markAllAsRead, deleteAllChats } = useChat();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

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

  const handleRefresh = useCallback(async () => {
    // Simulate network refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Refreshed",
      description: "Your conversations are up to date.",
    });
  }, [toast]);

  return (
    <div className="h-full bg-background relative flex flex-col">
      <Header
        title="SentinelAI"
        showSearch
        onSearchChange={setSearchQuery}
        leftContent={
          <button className="p-2" aria-label="Settings" onClick={() => navigate('/settings')}>
            <Avatar name="You" size="sm" />
          </button>
        }
        rightContent={
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button aria-label="More options" className="p-2 rounded-full hover:bg-muted transition-colors">
                <MoreVertical className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto scrollbar-spotify">
              <DropdownMenuItem onClick={handleMarkAllAsRead} className="gap-3">
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/starred'); setMenuOpen(false); }} className="gap-3">
                <Star className="w-4 h-4" />
                Starred messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/archived'); setMenuOpen(false); }} className="gap-3">
                <Archive className="w-4 h-4" />
                Archived messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/blocked'); setMenuOpen(false); }} className="gap-3">
                <ShieldOff className="w-4 h-4" />
                Spam & blocked
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/settings'); setMenuOpen(false); }} className="gap-3">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem disabled={chats.length === 0} onClick={() => { setMenuOpen(false); setConfirmDeleteAll(true); }} className="gap-3 text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4" />
                Delete all conversations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <PullToRefresh 
        onRefresh={handleRefresh}
        className="flex-1 min-h-0 pb-24 scrollbar-thin"
      >
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
      </PullToRefresh>

      <FloatingActionButton />

      <AlertDialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all conversations?</AlertDialogTitle>
            <AlertDialogDescription>This removes every conversation in your inbox and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}