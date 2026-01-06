import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { EmptyState } from '@/components/chat/EmptyState';
import { Avatar } from '@/components/chat/Avatar';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

export default function Archived() {
  const navigate = useNavigate();
  const { archived, unarchiveChat } = useChat();
  const { toast } = useToast();

  const handleUnarchive = (chatId: string) => {
    unarchiveChat(chatId);
    toast({
      title: "Conversation unarchived",
      description: "The conversation has been moved back to your inbox.",
    });
  };

  const handleUnarchiveAll = () => {
    archived.forEach(chat => unarchiveChat(chat.id));
    toast({
      title: "All conversations unarchived",
      description: "Your conversations have been moved back to your inbox.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Archived"
        subtitle={archived.length > 0 ? `${archived.length} conversation${archived.length !== 1 ? 's' : ''}` : undefined}
        showBack
      />

      <main className="pb-24">
        {archived.length === 0 ? (
          <EmptyState type="archived" />
        ) : (
          <>
            <div>
              {archived.map(chat => {
                const displayName = chat.contactName || chat.contactPhone;
                return (
                  <ContextMenu key={chat.id}>
                    <ContextMenuTrigger asChild>
                      <div
                        onClick={() => navigate(`/chat/${chat.id}`)}
                        className="flex items-center gap-3 p-4 bg-card hover:bg-accent/50 cursor-pointer transition-colors duration-200 border-b border-border/50"
                      >
                        <Avatar name={displayName} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground truncate opacity-80">
                              {displayName}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {chat.timestamp}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5">
                            <Archive className="w-3 h-3 text-muted-foreground shrink-0" />
                            <p className="text-sm text-muted-foreground truncate flex-1">
                              {chat.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem onClick={() => handleUnarchive(chat.id)} className="gap-2">
                        <Archive className="w-4 h-4" />
                        Unarchive
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>

            {archived.length > 1 && (
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleUnarchiveAll}
                >
                  Unarchive all
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
