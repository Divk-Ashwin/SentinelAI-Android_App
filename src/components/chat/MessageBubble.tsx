import { Message } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Star, Copy, Trash2, Brain } from 'lucide-react';
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
}

export function MessageBubble({ message, onStar, onDelete, onAnalyze }: MessageBubbleProps) {
  const { toast } = useToast();
  const isUser = message.sender === 'user';
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    toast({
      title: "Copied to clipboard",
      description: "Message text has been copied.",
    });
  };

  const handleDelete = () => {
    onDelete();
    toast({
      title: "Message deleted",
      description: "The message has been removed.",
    });
  };

  const handleStar = () => {
    onStar();
    toast({
      title: message.isStarred ? "Star removed" : "Message starred",
      description: message.isStarred 
        ? "The star has been removed from this message." 
        : "You can find starred messages easily.",
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'flex flex-col max-w-[80%] mb-2',
            isUser ? 'ml-auto items-end' : 'mr-auto items-start'
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
          <span className="text-[10px] text-muted-foreground mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>
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
