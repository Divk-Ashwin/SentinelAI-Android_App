import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

// Sample images for demo
const sampleImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
];

export function ImagePickerModal({ isOpen, onClose, onSelect }: ImagePickerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      setSelectedImage(null);
      setUploadedImage(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setUploadedImage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Send Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload Button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload an image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setSelectedImage(null);
                }}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sample Images */}
          {!uploadedImage && (
            <>
              <p className="text-sm text-muted-foreground">Or choose from gallery:</p>
              <div className="grid grid-cols-3 gap-2">
                {sampleImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`Sample ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!selectedImage}>
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
