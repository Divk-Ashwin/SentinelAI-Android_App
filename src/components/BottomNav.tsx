import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, ShieldOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: MessageSquare, label: 'Messages' },
  { path: '/blocked', icon: ShieldOff, label: 'Blocked' },
  { path: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on main tabs
  const showOn = ['/', '/blocked', '/settings'];
  if (!showOn.includes(location.pathname)) return null;

  return (
    <nav className="sticky bottom-0 z-40 bg-card border-t border-border flex items-center justify-around h-14">
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
