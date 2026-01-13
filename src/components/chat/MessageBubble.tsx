import { Message } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Star, Copy, Trash2, Brain, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';
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
              'px-4 py-2.5 rounded-2xl relative',
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-card text-card-foreground rounded-bl-md border border-border'
            )}
          >
            {message.isStarred && (
              <Star className="absolute -top-1 -right-1 w-3 h-3 fill-chart-1 text-chart-1" />
            )}
            <p className="text-sm leading-relaxed">{message.text}</p>
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