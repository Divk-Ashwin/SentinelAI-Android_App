import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { AnalyzeModal } from '@/components/chat/AnalyzeModal';
import { SearchMessagesModal } from '@/components/chat/SearchMessagesModal';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { Send, Paperclip, AlertTriangle, X, Star, Search, Archive, Trash2, ShieldOff, UserPlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical } from 'lucide-react';

export default function ChatView() {
  const { chatId } = useParams<{ chatId: string }>();
  const [searchParams] = useSearchParams();
  const highlightMessageId = searchParams.get('highlight');
  const navigate = useNavigate();
  const { getChatById, sendMessage, deleteChat, archiveChat, starMessage, deleteMessage, markAsRead, blockContact } = useChat();
  const { toast } = useToast();
  
  const [inputValue, setInputValue] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedMessageText, setSelectedMessageText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const chat = getChatById(chatId || '');

  useEffect(() => {
    if (chatId) {
      markAsRead(chatId);
    }
  }, [chatId, markAsRead]);

  // Handle highlight from URL param
  useEffect(() => {
    if (highlightMessageId && chat?.messages) {
      setHighlightedMessageId(highlightMessageId);
      // Scroll to the highlighted message
      setTimeout(() => {
        const messageElement = messageRefs.current[highlightMessageId];
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      // Clear highlight after 2 seconds
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  }, [highlightMessageId, chat?.messages]);

  // Find first unread message index
  const firstUnreadIndex = chat?.messages.findIndex(m => !m.isRead && m.sender === 'contact') ?? -1;
  const hasUnreadMessages = firstUnreadIndex !== -1;

  // Initial scroll to unread divider or bottom
  useEffect(() => {
    if (!initialScrollDone && chat?.messages) {
      if (hasUnreadMessages && unreadDividerRef.current) {
        unreadDividerRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }
      setInitialScrollDone(true);
      setPreviousMessageCount(chat.messages.length);
    }
  }, [chat?.messages, hasUnreadMessages, initialScrollDone]);

  // Auto-scroll only when new message is sent (message count increases)
  useEffect(() => {
    if (chat?.messages && initialScrollDone) {
      if (chat.messages.length > previousMessageCount) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      setPreviousMessageCount(chat.messages.length);
    }
  }, [chat?.messages?.length, initialScrollDone, previousMessageCount]);

  // Handle scroll for auto-hide scrollbar
  const handleScroll = useCallback(() => {
    const element = messagesContainerRef.current;
    if (!element) return;

    element.classList.add('scrolling');

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      element.classList.remove('scrolling');
    }, 1500);
  }, []);

  useEffect(() => {
    const element = messagesContainerRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  if (!chat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  const displayName = chat.contactName || chat.contactPhone;

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(chat.id, inputValue.trim());
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAnalyze = (messageText: string) => {
    setSelectedMessageText(messageText);
    setAnalyzeModalOpen(true);
  };

  const handleDelete = () => {
    deleteChat(chat.id);
    toast({
      title: "Conversation deleted",
      description: "The conversation has been permanently removed.",
    });
    navigate('/');
  };

  const handleArchive = () => {
    archiveChat(chat.id);
    toast({
      title: "Conversation archived",
      description: "You can find it in your archived messages.",
    });
    navigate('/');
  };

  const handleBlock = () => {
    blockContact(chat.id);
    toast({
      title: "Contact blocked",
      description: "You will no longer receive messages from this contact.",
    });
    navigate('/');
  };

  const handleNavigateToMessage = (messageId: string) => {
    setSearchModalOpen(false);
    setHighlightedMessageId(messageId);
    
    setTimeout(() => {
      const messageElement = messageRefs.current[messageId];
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2000);
  };

  // Group messages by date
  const groupedMessages = chat.messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof chat.messages>);

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header
        title={displayName}
        showBack
        onTitleClick={() => navigate(`/contact/${chat.id}`)}
        rightContent={
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <MoreVertical className="w-5 h-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto scrollbar-spotify">
              <DropdownMenuItem onClick={() => { toast({ title: "Coming soon", description: "Add to contacts will be available soon." }); setMenuOpen(false); }} className="gap-3">
                <UserPlus className="w-4 h-4" />
                Add to contacts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate(`/contact/${chat.id}`); setMenuOpen(false); }} className="gap-3">
                <Info className="w-4 h-4" />
                Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { toast({ title: "Conversation starred", description: "You can find starred conversations easily." }); setMenuOpen(false); }} className="gap-3">
                <Star className="w-4 h-4" />
                Star conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSearchModalOpen(true); setMenuOpen(false); }} className="gap-3">
                <Search className="w-4 h-4" />
                Search in chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { handleArchive(); setMenuOpen(false); }} className="gap-3">
                <Archive className="w-4 h-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setDeleteDialogOpen(true); setMenuOpen(false); }} className="gap-3 text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4" />
                Delete conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setBlockDialogOpen(true); setMenuOpen(false); }} className="gap-3 text-destructive focus:text-destructive">
                <ShieldOff className="w-4 h-4" />
                Block & report spam
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Warning Banner */}
      {chat.isSpam && showWarning && (
        <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border-b border-destructive/20">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="flex-1 text-sm text-destructive font-medium">
            This conversation may contain suspicious messages
          </p>
          <button
            onClick={() => setShowWarning(false)}
            className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-destructive" />
          </button>
        </div>
      )}

      {/* Messages */}
      <main ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 scrollbar-autohide">
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full">
                {formatDateSeparator(date)}
              </span>
            </div>
            {messages.map((message, index) => {
              const globalIndex = chat.messages.findIndex(m => m.id === message.id);
              const showUnreadDivider = globalIndex === firstUnreadIndex;
              
              return (
                <div 
                  key={message.id}
                  ref={(el) => { messageRefs.current[message.id] = el; }}
                >
                  {showUnreadDivider && (
                    <div ref={unreadDividerRef} className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-primary/50" />
                      <span className="text-xs font-medium text-primary">Unread messages</span>
                      <div className="flex-1 h-px bg-primary/50" />
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    onStar={() => starMessage(chat.id, message.id)}
                    onDelete={() => deleteMessage(chat.id, message.id)}
                    onAnalyze={() => handleAnalyze(message.text)}
                    isHighlighted={highlightedMessageId === message.id}
                  />
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Composer */}
      <div className="sticky bottom-0 bg-card border-t border-border p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast({ title: "Coming soon", description: "Attachments will be available in a future update." })}
            className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 text-foreground placeholder:text-muted-foreground rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              'p-2.5 rounded-full transition-all',
              inputValue.trim()
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Analyze Modal */}
      <AnalyzeModal
        isOpen={analyzeModalOpen}
        onClose={() => setAnalyzeModalOpen(false)}
        messageText={selectedMessageText}
      />

      {/* Search Messages Modal */}
      <SearchMessagesModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        messages={chat.messages}
        onNavigateToMessage={handleNavigateToMessage}
        contactName={displayName}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. All messages in this conversation will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block and report this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't receive messages from them anymore. This action will also report them for spam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block & Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}