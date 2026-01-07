import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FloatingActionButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/new-chat')}
      className="absolute bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-30 group"
      aria-label="New chat"
    >
      <Plus className="w-6 h-6" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-card text-card-foreground text-sm font-medium rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        New chat
      </span>
    </button>
  );
}