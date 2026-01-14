import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Search } from 'lucide-react';

interface GifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

// Sample GIF placeholders (using placeholder images to simulate GIFs)
const sampleGifs = [
  { id: 1, url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif', category: 'thumbs up' },
  { id: 2, url: 'https://media.giphy.com/media/3oEdv6sy3ulljPMGdy/giphy.gif', category: 'celebration' },
  { id: 3, url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', category: 'laugh' },
  { id: 4, url: 'https://media.giphy.com/media/l4FGHjh3gjqyM3qF2/giphy.gif', category: 'hello' },
  { id: 5, url: 'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif', category: 'bye' },
  { id: 6, url: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif', category: 'love' },
  { id: 7, url: 'https://media.giphy.com/media/l0MYAs5E2oIDCq9So/giphy.gif', category: 'party' },
  { id: 8, url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', category: 'cool' },
  { id: 9, url: 'https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif', category: 'excited' },
];

const categories = ['Trending', 'Reactions', 'Celebrations', 'Love', 'Fun'];

export function GifPickerModal({ isOpen, onClose, onSelect }: GifPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Trending');

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl);
    onClose();
  };

  const filteredGifs = searchTerm
    ? sampleGifs.filter(gif => gif.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : sampleGifs;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5" />
            Send GIF
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search GIFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* GIF Grid */}
          <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1">
            {filteredGifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleSelect(gif.url)}
                className="aspect-square rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all"
              >
                <img 
                  src={gif.url} 
                  alt={gif.category} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {filteredGifs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Smile className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No GIFs found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
