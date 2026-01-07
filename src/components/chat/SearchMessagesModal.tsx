import { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Message } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface SearchMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onNavigateToMessage: (messageId: string) => void;
  contactName: string;
}

interface SearchResult {
  message: Message;
  matchStart: number;
  matchEnd: number;
}

export function SearchMessagesModal({
  isOpen,
  onClose,
  messages,
  onNavigateToMessage,
  contactName,
}: SearchMessagesModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const searchMessages = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const found: SearchResult[] = [];

    messages.forEach(message => {
      const textLower = message.text.toLowerCase();
      const matchIndex = textLower.indexOf(queryLower);
      
      if (matchIndex !== -1) {
        found.push({
          message,
          matchStart: matchIndex,
          matchEnd: matchIndex + searchQuery.length,
        });
      }
    });

    setResults(found.reverse()); // Most recent first
    setCurrentIndex(0);
  }, [messages]);

  useEffect(() => {
    searchMessages(query);
  }, [query, searchMessages]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const handlePrevious = () => {
    if (results.length > 0) {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    }
  };

  const handleNext = () => {
    if (results.length > 0) {
      setCurrentIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onNavigateToMessage(result.message.id);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const highlightMatch = (text: string, start: number, end: number) => {
    return (
      <>
        {text.slice(0, start)}
        <span className="bg-primary/30 text-foreground font-medium">
          {text.slice(start, end)}
        </span>
        {text.slice(end)}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              autoFocus
              className="w-full bg-muted/50 text-foreground placeholder:text-muted-foreground rounded-full pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
        </div>

        {/* Navigation */}
        {results.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {results.length} results
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto scrollbar-spotify">
          {query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No results found</p>
              <p className="text-sm text-muted-foreground/70">Try a different search term</p>
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={result.message.id}
              onClick={() => handleResultClick(result)}
              className={cn(
                'px-4 py-3 border-b border-border/50 cursor-pointer transition-colors',
                index === currentIndex ? 'bg-primary/10' : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {result.message.sender === 'user' ? 'You' : contactName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(result.message.timestamp)}
                </span>
              </div>
              <p className="text-sm text-foreground line-clamp-2">
                {highlightMatch(result.message.text, result.matchStart, result.matchEnd)}
              </p>
            </div>
          ))}

          {!query && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Search in this conversation</p>
              <p className="text-sm text-muted-foreground/70">Enter a keyword to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}