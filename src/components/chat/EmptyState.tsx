import { MessageSquare, Archive, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'chats' | 'archived' | 'contacts' | 'search';
  className?: string;
}

export function EmptyState({ type, className }: EmptyStateProps) {
  const content = {
    chats: {
      icon: MessageSquare,
      title: 'No conversations yet',
      subtitle: 'Start a new chat to begin messaging',
    },
    archived: {
      icon: Archive,
      title: 'No archived conversations',
      subtitle: 'Archived chats will appear here',
    },
    contacts: {
      icon: Users,
      title: 'No contacts found',
      subtitle: 'Try a different search term',
    },
    search: {
      icon: MessageSquare,
      title: 'No results found',
      subtitle: 'Try a different search term',
    },
  };

  const { icon: Icon, title, subtitle } = content[type];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
