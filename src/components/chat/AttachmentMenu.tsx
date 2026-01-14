import { Image, Users, MapPin, Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Paperclip } from 'lucide-react';

export type AttachmentType = 'image' | 'gif' | 'contact' | 'location';

interface AttachmentMenuProps {
  onSelect: (type: AttachmentType) => void;
  children?: React.ReactNode;
}

export function AttachmentMenu({ onSelect, children }: AttachmentMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <Paperclip className="w-5 h-5" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => onSelect('image')} className="gap-3">
          <Image className="w-4 h-4" />
          Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('gif')} className="gap-3">
          <Smile className="w-4 h-4" />
          GIF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('contact')} className="gap-3">
          <Users className="w-4 h-4" />
          Contact
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('location')} className="gap-3">
          <MapPin className="w-4 h-4" />
          Location
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
