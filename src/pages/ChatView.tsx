import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { VirtualMessageList, VirtualMessageListHandle } from '@/components/chat/VirtualMessageList';
import { AnalyzeModal } from '@/components/chat/AnalyzeModal';
import { SearchMessagesModal } from '@/components/chat/SearchMessagesModal';
import { AttachmentMenu, AttachmentType } from '@/components/chat/AttachmentMenu';
import { ImagePickerModal } from '@/components/chat/ImagePickerModal';
import { GifPickerModal } from '@/components/chat/GifPickerModal';
import { ContactPickerModal } from '@/components/chat/ContactPickerModal';
import { LocationPickerModal } from '@/components/chat/LocationPickerModal';
import { PageTransition } from '@/components/PageTransition';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { Send, Paperclip, AlertTriangle, X, Star, Search, Archive, Trash2, ShieldOff, UserPlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageAttachment, Contact } from '@/lib/mockData';
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
  
  // Attachment modals
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  
  const virtualListRef = useRef<VirtualMessageListHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

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
      setTimeout(() => {
        virtualListRef.current?.scrollToMessage(highlightMessageId);
      }, 100);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  }, [highlightMessageId, chat?.messages]);

  // Find first unread message index
  const firstUnreadIndex = chat?.messages.findIndex(m => !m.isRead && m.sender === 'contact') ?? -1;

  // Auto-scroll when new message is sent
  useEffect(() => {
    if (chat?.messages) {
      if (chat.messages.length > previousMessageCount && previousMessageCount > 0) {
        virtualListRef.current?.scrollToBottom();
      }
      setPreviousMessageCount(chat.messages.length);
    }
  }, [chat?.messages?.length, previousMessageCount]);

  const handleConversationRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({
      title: "Messages refreshed",
      description: "Conversation is up to date.",
    });
  }, [toast]);

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

  // Attachment handlers
  const handleAttachmentSelect = (type: AttachmentType) => {
    switch (type) {
      case 'image':
        setImagePickerOpen(true);
        break;
      case 'gif':
        setGifPickerOpen(true);
        break;
      case 'contact':
        setContactPickerOpen(true);
        break;
      case 'location':
        setLocationPickerOpen(true);
        break;
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    sendMessage(chat.id, '', { type: 'image', url: imageUrl });
  };

  const handleGifSelect = (gifUrl: string) => {
    sendMessage(chat.id, '', { type: 'gif', url: gifUrl });
  };

  const handleContactSelect = (contact: Contact) => {
    sendMessage(chat.id, '', { type: 'contact', contact: { name: contact.name, phone: contact.phone } });
  };

  const handleLocationSelect = (location: { name: string; address: string; coordinates?: { lat: number; lng: number } }) => {
    sendMessage(chat.id, '', { type: 'location', location });
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
      virtualListRef.current?.scrollToMessage(messageId);
    }, 100);

    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2000);
  };



  return (
    <PageTransition>
    <div className="h-screen bg-background flex flex-col">
      <Header
        title={displayName}
        showBack
        onBack={() => navigate('/', { replace: true })}
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

      {/* Messages - Virtual scrolling for performance */}
      <VirtualMessageList
        ref={virtualListRef}
        messages={chat.messages}
        chatId={chat.id}
        firstUnreadIndex={firstUnreadIndex}
        highlightedMessageId={highlightedMessageId}
        onStar={(messageId) => starMessage(chat.id, messageId)}
        onDelete={(messageId) => deleteMessage(chat.id, messageId)}
        onAnalyze={(text) => { setSelectedMessageText(text); setAnalyzeModalOpen(true); }}
      />

      {/* Message Composer */}
      <div className="sticky bottom-0 bg-card border-t border-border p-3">
        <div className="flex items-center gap-2">
          <AttachmentMenu onSelect={handleAttachmentSelect}>
            <button className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
              <Paperclip className="w-5 h-5" />
            </button>
          </AttachmentMenu>
          
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

      {/* Attachment Modals */}
      <ImagePickerModal
        isOpen={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
      />
      <GifPickerModal
        isOpen={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={handleGifSelect}
      />
      <ContactPickerModal
        isOpen={contactPickerOpen}
        onClose={() => setContactPickerOpen(false)}
        onSelect={handleContactSelect}
      />
      <LocationPickerModal
        isOpen={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={handleLocationSelect}
      />

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
    </PageTransition>
  );
}