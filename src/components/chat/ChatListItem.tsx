import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Chat } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { AlertTriangle, Pin, Mail, MailOpen, UserPlus, Archive, Trash2, ShieldOff, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/context/ChatContext';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
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
import { useState } from 'react';

interface ChatListItemProps {
  chat: Chat;
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isPinned, 
    pinChat, 
    unpinChat, 
    markAsRead, 
    markAsUnread, 
    archiveChat, 
    deleteChat,
    blockContact,
    contacts 
  } = useChat();
  const displayName = chat.contactName || chat.contactPhone;
  const pinned = isPinned(chat.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  // Check if contact is already saved (has a proper name, not just phone number)
  const isPhoneNumberFormat = (str: string) => /^[+\d\s()-]+$/.test(str);
  const isContactSaved = chat.contactName && !isPhoneNumberFormat(chat.contactName);

  const handleClick = () => {
    navigate(`/chat/${chat.id}`);
  };

  const handleMarkReadToggle = () => {
    if (chat.unread) {
      markAsRead(chat.id);
      toast({ title: "Marked as read" });
    } else {
      markAsUnread(chat.id);
      toast({ title: "Marked as unread" });
    }
  };

  const handlePinToggle = () => {
    if (pinned) {
      unpinChat(chat.id);
      toast({ title: "Conversation unpinned" });
    } else {
      pinChat(chat.id);
      toast({ title: "Conversation pinned", description: "Pinned conversations appear at the top." });
    }
  };

  const handleArchive = () => {
    archiveChat(chat.id);
    toast({ title: "Conversation archived", description: "You can find it in your archived messages." });
  };

  const handleDelete = () => {
    deleteChat(chat.id);
    toast({ title: "Conversation deleted" });
    setDeleteDialogOpen(false);
  };

  const handleBlock = () => {
    blockContact(chat.id);
    toast({ title: "Contact blocked", description: "You will no longer receive messages from this contact." });
    setBlockDialogOpen(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            onClick={handleClick}
            className={cn(
              'flex items-center gap-3 p-4 bg-card hover:bg-accent/50',
              'cursor-pointer transition-colors duration-200 border-b border-border/50'
            )}
          >
            <Avatar name={displayName} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {pinned && (
                    <Pin className="w-3 h-3 text-primary shrink-0" />
                  )}
                  <span className="font-medium text-foreground truncate">
                    {displayName}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {chat.timestamp}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {chat.lastMessage}
                </p>
                
                {chat.unread && chat.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              
              {chat.isSpam && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                  <span className="text-xs text-destructive font-medium">
                    Potential Spam
                  </span>
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={handleMarkReadToggle} className="gap-3">
            {chat.unread ? (
              <>
                <MailOpen className="w-4 h-4" />
                Mark as read
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Mark as unread
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={handlePinToggle} className="gap-3">
            <Pin className={cn("w-4 h-4", pinned && "fill-current")} />
            {pinned ? "Unpin conversation" : "Pin conversation"}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => navigate(`/contact/${chat.id}`)} className="gap-3">
            <Info className="w-4 h-4" />
            Contact details
          </ContextMenuItem>
          <ContextMenuItem onClick={handleArchive} className="gap-3">
            <Archive className="w-4 h-4" />
            Archive conversation
          </ContextMenuItem>
          {!isContactSaved && (
            <ContextMenuItem 
              onClick={() => toast({ title: "Coming soon", description: "Add to contacts will be available soon." })} 
              className="gap-3"
            >
              <UserPlus className="w-4 h-4" />
              Add to contacts
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => setDeleteDialogOpen(true)} 
            className="gap-3 text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete conversation
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => setBlockDialogOpen(true)} 
            className="gap-3 text-destructive focus:text-destructive"
          >
            <ShieldOff className="w-4 h-4" />
            Block & report spam
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

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
    </>
  );
}