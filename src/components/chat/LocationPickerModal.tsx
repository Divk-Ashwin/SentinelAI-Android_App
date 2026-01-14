import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Navigation, Building, Home, Coffee } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { name: string; address: string; coordinates?: { lat: number; lng: number } }) => void;
}

// Sample locations for demo
const sampleLocations = [
  { id: 1, name: 'Current Location', address: 'Use your current GPS location', icon: Navigation, isCurrentLocation: true },
  { id: 2, name: 'Home', address: '123 Main Street, New York, NY 10001', icon: Home },
  { id: 3, name: 'Work', address: '456 Business Ave, New York, NY 10002', icon: Building },
  { id: 4, name: 'Central Park', address: 'Central Park, New York, NY', icon: MapPin },
  { id: 5, name: 'Times Square', address: 'Times Square, New York, NY 10036', icon: MapPin },
  { id: 6, name: 'Favorite Coffee Shop', address: '789 Coffee Lane, New York, NY 10003', icon: Coffee },
];

export function LocationPickerModal({ isOpen, onClose, onSelect }: LocationPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<typeof sampleLocations[0] | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const filteredLocations = sampleLocations.filter(
    loc =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = () => {
    if (selectedLocation) {
      if (selectedLocation.isCurrentLocation) {
        setIsGettingLocation(true);
        // Simulate getting current location
        setTimeout(() => {
          onSelect({
            name: 'Current Location',
            address: 'New York, NY (40.7128, -74.0060)',
            coordinates: { lat: 40.7128, lng: -74.0060 },
          });
          setIsGettingLocation(false);
          setSelectedLocation(null);
          onClose();
        }, 1000);
      } else {
        onSelect({
          name: selectedLocation.name,
          address: selectedLocation.address,
        });
        setSelectedLocation(null);
        onClose();
      }
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Share Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Location List */}
          <div className="overflow-y-auto flex-1 space-y-1">
            {filteredLocations.map((location) => {
              const IconComponent = location.icon;
              return (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedLocation?.id === location.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    location.isCurrentLocation ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm text-foreground">{location.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{location.address}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No locations found</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!selectedLocation || isGettingLocation}>
              {isGettingLocation ? 'Getting location...' : 'Share'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
