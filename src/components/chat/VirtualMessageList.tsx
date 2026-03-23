import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageBubble } from './MessageBubble';
import { Message } from '@/lib/mockData';

interface FlatItem {
  type: 'date-separator' | 'unread-divider' | 'message';
  key: string;
  date?: string;
  message?: Message;
  chatId: string;
}

interface VirtualMessageListProps {
  messages: Message[];
  chatId: string;
  firstUnreadIndex: number;
  highlightedMessageId: string | null;
  onStar: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onAnalyze: (text: string) => void;
}

export interface VirtualMessageListHandle {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToMessage: (messageId: string) => void;
}

/** Threshold: only virtualize when message count exceeds this */
const VIRTUALIZATION_THRESHOLD = 80;

/**
 * Flattens messages into a list of renderable items including
 * date separators and the unread divider.
 */
function buildFlatList(messages: Message[], chatId: string, firstUnreadIndex: number): FlatItem[] {
  const items: FlatItem[] = [];
  let lastDate = '';

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const date = new Date(message.timestamp).toDateString();

    if (date !== lastDate) {
      items.push({ type: 'date-separator', key: `date-${date}`, date, chatId });
      lastDate = date;
    }

    if (i === firstUnreadIndex) {
      items.push({ type: 'unread-divider', key: 'unread-divider', chatId });
    }

    items.push({ type: 'message', key: message.id, message, chatId });
  }

  return items;
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const VirtualMessageList = forwardRef<VirtualMessageListHandle, VirtualMessageListProps>(
  ({ messages, chatId, firstUnreadIndex, highlightedMessageId, onStar, onDelete, onAnalyze }, ref) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const flatItems = buildFlatList(messages, chatId, firstUnreadIndex);
    const shouldVirtualize = messages.length > VIRTUALIZATION_THRESHOLD;

    const virtualizer = useVirtualizer({
      count: flatItems.length,
      getScrollElement: () => parentRef.current,
      estimateSize: useCallback((index: number) => {
        const item = flatItems[index];
        if (item.type === 'date-separator') return 48;
        if (item.type === 'unread-divider') return 40;
        return 72; // estimated message height
      }, [flatItems]),
      overscan: 15,
    });

    useImperativeHandle(ref, () => ({
      scrollToBottom(behavior: ScrollBehavior = 'smooth') {
        if (shouldVirtualize) {
          virtualizer.scrollToIndex(flatItems.length - 1, { align: 'end', behavior });
        } else {
          parentRef.current?.scrollTo({ top: parentRef.current.scrollHeight, behavior });
        }
      },
      scrollToMessage(messageId: string) {
        const index = flatItems.findIndex(item => item.key === messageId);
        if (index !== -1) {
          if (shouldVirtualize) {
            virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' });
          } else {
            const el = parentRef.current?.querySelector(`[data-message-id="${messageId}"]`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      },
    }));

    // Initial scroll to unread or bottom
    useEffect(() => {
      if (flatItems.length === 0) return;
      const unreadIndex = flatItems.findIndex(item => item.type === 'unread-divider');
      if (unreadIndex !== -1) {
        if (shouldVirtualize) {
          virtualizer.scrollToIndex(unreadIndex, { align: 'start' });
        } else {
          setTimeout(() => {
            const el = parentRef.current?.querySelector('[data-unread-divider]');
            el?.scrollIntoView({ behavior: 'instant', block: 'start' });
          }, 0);
        }
      } else {
        if (shouldVirtualize) {
          virtualizer.scrollToIndex(flatItems.length - 1, { align: 'end' });
        } else {
          parentRef.current?.scrollTo({ top: parentRef.current.scrollHeight });
        }
      }
      // Only run on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderItem = (item: FlatItem) => {
      if (item.type === 'date-separator') {
        return (
          <div className="flex justify-center my-4">
            <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full">
              {formatDateSeparator(item.date!)}
            </span>
          </div>
        );
      }
      if (item.type === 'unread-divider') {
        return (
          <div data-unread-divider className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-primary/50" />
            <span className="text-xs font-medium text-primary">Unread messages</span>
            <div className="flex-1 h-px bg-primary/50" />
          </div>
        );
      }
      const message = item.message!;
      return (
        <div data-message-id={message.id}>
          <MessageBubble
            message={message}
            onStar={() => onStar(message.id)}
            onDelete={() => onDelete(message.id)}
            onAnalyze={() => onAnalyze(message.text)}
            isHighlighted={highlightedMessageId === message.id}
          />
        </div>
      );
    };

    if (!shouldVirtualize) {
      // For smaller conversations, render normally (no virtualization overhead)
      return (
        <div ref={parentRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-4 py-4">
            {flatItems.map(item => (
              <div key={item.key}>{renderItem(item)}</div>
            ))}
          </div>
        </div>
      );
    }

    // Virtualized rendering for large conversations
    return (
      <div ref={parentRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div
          className="px-4 py-4 relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const item = flatItems[virtualRow.index];
            return (
              <div
                key={item.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="absolute left-0 right-0 px-4"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {renderItem(item)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

VirtualMessageList.displayName = 'VirtualMessageList';
