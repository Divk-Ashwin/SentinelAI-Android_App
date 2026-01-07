import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { Avatar } from '@/components/chat/Avatar';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarredMessages() {
  const navigate = useNavigate();
  const { getStarredMessages, starMessage } = useChat();
  const { toast } = useToast();

  const starredMessages = getStarredMessages();

  // Group by chat
  const groupedMessages = starredMessages.reduce((groups, item) => {
    const chatId = item.chat.id;
    if (!groups[chatId]) {
      groups[chatId] = {
        chat: item.chat,
        messages: [],
      };
    }
    groups[chatId].messages.push(item.message);
    return groups;
  }, {} as Record<string, { chat: typeof starredMessages[0]['chat']; messages: typeof starredMessages[0]['message'][] }>);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMessageClick = (chatId: string, messageId: string) => {
    navigate(`/chat/${chatId}?highlight=${messageId}`);
  };

  const handleRemoveStar = (chatId: string, messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    starMessage(chatId, messageId);
    toast({ title: "Star removed" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Starred Messages"
        subtitle={starredMessages.length > 0 ? `${starredMessages.length} starred` : undefined}
        showBack
      />

      <main className="pb-24 scrollbar-spotify overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
        {starredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No starred messages yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Star important messages to find them here easily.
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedMessages).map(([chatId, group]) => {
              const displayName = group.chat.contactName || group.chat.contactPhone;
              return (
                <div key={chatId} className="mb-2">
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border/50">
                    <Avatar name={displayName} size="sm" />
                    <span className="font-medium text-foreground text-sm">{displayName}</span>
                  </div>

                  {/* Messages */}
                  {group.messages.map(message => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(chatId, message.id)}
                      className="flex items-start gap-3 px-4 py-3 bg-card border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {message.sender === 'user' ? 'You' : displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {message.text}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleRemoveStar(chatId, message.id, e)}
                        className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
                      >
                        <Star className="w-4 h-4 fill-chart-1 text-chart-1" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}