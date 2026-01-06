import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { Avatar } from '@/components/chat/Avatar';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, ShieldOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export default function SenderDetails() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { getChatById, deleteChat } = useChat();
  const { toast } = useToast();
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const chat = getChatById(chatId || '');

  if (!chat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Contact not found</p>
      </div>
    );
  }

  const displayName = chat.contactName || chat.contactPhone;
  const secondaryInfo = chat.contactName ? chat.contactPhone : 'Not in contacts';

  const handleBlock = () => {
    deleteChat(chat.id);
    toast({
      title: "Contact blocked",
      description: "You will no longer receive messages from this contact.",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Contact Details" showBack />

      <main className="px-4 py-8">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar name={displayName} size="xl" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">{displayName}</h2>
          <p className="text-muted-foreground mt-1">{secondaryInfo}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => toast({ title: "Coming soon", description: "Add to contacts will be available soon." })}
          >
            <UserPlus className="w-5 h-5" />
            Add to contacts
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => toast({ title: "Coming soon", description: "Search in conversation will be available soon." })}
          >
            <Search className="w-5 h-5" />
            Search in conversation
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={() => setBlockDialogOpen(true)}
          >
            <ShieldOff className="w-5 h-5" />
            Block & report spam
          </Button>
        </div>

        {/* Conversation Stats */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Conversation Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total messages</span>
              <span className="text-foreground font-medium">{chat.messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">First message</span>
              <span className="text-foreground font-medium">
                {chat.messages.length > 0
                  ? new Date(chat.messages[0].timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Block Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block and report this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't receive messages from them anymore. This action will also report them for spam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block & Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
