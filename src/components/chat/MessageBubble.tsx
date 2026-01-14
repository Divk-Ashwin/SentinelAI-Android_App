import { Message } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Star, Copy, Trash2, Brain, Check, CheckCheck, MapPin, User, ExternalLink } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
  onStar: () => void;
  onDelete: () => void;
  onAnalyze: () => void;
  isHighlighted?: boolean;
}

type DeliveryStatus = 'sent' | 'delivered' | 'read';

export function MessageBubble({ message, onStar, onDelete, onAnalyze, isHighlighted }: MessageBubbleProps) {
  const { toast } = useToast();
  const isUser = message.sender === 'user';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate delivery status based on message age
  const getDeliveryStatus = (timestamp: string): DeliveryStatus => {
    const messageTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diffMinutes = (now - messageTime) / 1000 / 60;

    if (diffMinutes < 1) return 'sent';
    if (diffMinutes < 5) return 'delivered';
    return 'read';
  };

  const deliveryStatus = isUser ? getDeliveryStatus(message.timestamp) : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    toast({
      title: "Copied to clipboard",
      duration: 1000,
    });
  };

  const handleDelete = () => {
    onDelete();
    toast({
      title: "Message deleted",
      duration: 1000,
    });
  };

  const handleStar = () => {
    onStar();
    toast({
      title: message.isStarred ? "Star removed" : "Message starred",
      duration: 1000,
    });
  };

  const renderDeliveryStatus = () => {
    if (!isUser || !deliveryStatus) return null;

    const iconClass = "w-3 h-3";
    
    switch (deliveryStatus) {
      case 'sent':
        return <Check className={cn(iconClass, "text-muted-foreground")} />;
      case 'delivered':
        return <CheckCheck className={cn(iconClass, "text-muted-foreground")} />;
      case 'read':
        return <CheckCheck className={cn(iconClass, "text-primary")} />;
      default:
        return null;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'flex flex-col max-w-[80%] mb-2 transition-all duration-300',
            isUser ? 'ml-auto items-end' : 'mr-auto items-start',
            isHighlighted && 'animate-pulse bg-primary/10 rounded-2xl p-1 -m-1'
          )}
        >
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl relative overflow-hidden',
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-card text-card-foreground rounded-bl-md border border-border'
            )}
          >
            {message.isStarred && (
              <div className={cn(
                "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-10",
                isUser ? "bg-background" : "bg-card border border-border"
              )}>
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              </div>
            )}
            
            {/* Attachment Rendering */}
            {message.attachment && (
              <div className="mb-2">
                {/* Image Attachment */}
                {message.attachment.type === 'image' && message.attachment.url && (
                  <div className="rounded-lg overflow-hidden -mx-2 -mt-1">
                    <img 
                      src={message.attachment.url} 
                      alt="Shared image" 
                      className="w-full max-w-[250px] h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.attachment?.url, '_blank')}
                    />
                  </div>
                )}
                
                {/* GIF Attachment */}
                {message.attachment.type === 'gif' && message.attachment.url && (
                  <div className="rounded-lg overflow-hidden -mx-2 -mt-1">
                    <img 
                      src={message.attachment.url} 
                      alt="GIF" 
                      className="w-full max-w-[200px] h-auto object-cover"
                    />
                  </div>
                )}
                
                {/* Contact Attachment */}
                {message.attachment.type === 'contact' && message.attachment.contact && (
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg -mx-1",
                    isUser ? "bg-primary-foreground/10" : "bg-muted"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isUser ? "bg-primary-foreground/20" : "bg-primary/10"
                    )}>
                      <User className={cn("w-5 h-5", isUser ? "text-primary-foreground" : "text-primary")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{message.attachment.contact.name}</p>
                      <p className={cn(
                        "text-xs truncate",
                        isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {message.attachment.contact.phone}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Location Attachment */}
                {message.attachment.type === 'location' && message.attachment.location && (
                  <div 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg -mx-1 cursor-pointer hover:opacity-90 transition-opacity",
                      isUser ? "bg-primary-foreground/10" : "bg-muted"
                    )}
                    onClick={() => {
                      const coords = message.attachment?.location?.coordinates;
                      if (coords) {
                        window.open(`https://maps.google.com/?q=${coords.lat},${coords.lng}`, '_blank');
                      } else {
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(message.attachment?.location?.address || '')}`, '_blank');
                      }
                    }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isUser ? "bg-primary-foreground/20" : "bg-primary/10"
                    )}>
                      <MapPin className={cn("w-5 h-5", isUser ? "text-primary-foreground" : "text-primary")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{message.attachment.location.name}</p>
                      <p className={cn(
                        "text-xs truncate",
                        isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {message.attachment.location.address}
                      </p>
                    </div>
                    <ExternalLink className={cn("w-4 h-4 shrink-0", isUser ? "text-primary-foreground/50" : "text-muted-foreground")} />
                  </div>
                )}
              </div>
            )}
            
            {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-[10px] text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            {renderDeliveryStatus()}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleCopy} className="gap-2">
          <Copy className="w-4 h-4" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onClick={handleStar} className="gap-2">
          <Star className={cn("w-4 h-4", message.isStarred && "fill-current")} />
          {message.isStarred ? "Remove star" : "Star"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onAnalyze} className="gap-2">
          <Brain className="w-4 h-4" />
          Analyze
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}