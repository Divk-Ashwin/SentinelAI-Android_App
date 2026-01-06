import { ChevronLeft, MoreVertical, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
  onSearchChange?: (query: string) => void;
  onMenuClick?: () => void;
  onTitleClick?: () => void;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showSearch = false,
  showMenu = false,
  onSearchChange,
  onMenuClick,
  onTitleClick,
  leftContent,
  rightContent,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchToggle = () => {
    if (isSearching) {
      setSearchQuery('');
      onSearchChange?.('');
    }
    setIsSearching(!isSearching);
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center h-14 px-2">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}

        {leftContent}

        {isSearching ? (
          <div className="flex-1 flex items-center gap-2 px-2">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={handleSearchToggle}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "flex-1 px-3 min-w-0",
                onTitleClick && "cursor-pointer"
              )}
              onClick={onTitleClick}
            >
              {title && (
                <h1 className="font-semibold text-foreground truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center">
              {showSearch && (
                <button
                  onClick={handleSearchToggle}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <Search className="w-5 h-5 text-foreground" />
                </button>
              )}

              {rightContent}

              {showMenu && (
                <button
                  onClick={onMenuClick}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-foreground" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
