import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Chat } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatListItemProps {
  chat: Chat;
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const displayName = chat.contactName || chat.contactPhone;

  const handleClick = () => {
    navigate(`/chat/${chat.id}`);
  };

  const handleLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    toast({
      title: "Quick actions coming soon",
      description: "Long-press actions will be available in a future update.",
    });
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleLongPress}
      className={cn(
        'flex items-center gap-3 p-4 bg-card hover:bg-accent/50',
        'cursor-pointer transition-colors duration-200 border-b border-border/50'
      )}
    >
      <Avatar name={displayName} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground truncate">
            {displayName}
          </span>
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
  );
}
