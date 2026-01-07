import { Header } from '@/components/chat/Header';
import { Avatar } from '@/components/chat/Avatar';
import { EmptyState } from '@/components/chat/EmptyState';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';
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

export default function BlockedContacts() {
  const { blockedContacts, unblockContact } = useChat();
  const { toast } = useToast();
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const formatBlockedDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Blocked today';
    if (diffDays === 1) return 'Blocked yesterday';
    if (diffDays < 7) return `Blocked ${diffDays} days ago`;
    return `Blocked on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const handleUnblock = () => {
    if (selectedContact) {
      const contact = blockedContacts.find(c => c.id === selectedContact);
      unblockContact(selectedContact);
      toast({ 
        title: "Contact unblocked", 
        description: `${contact?.name || contact?.phone} can now message you.` 
      });
      setUnblockDialogOpen(false);
      setSelectedContact(null);
    }
  };

  const openUnblockDialog = (contactId: string) => {
    setSelectedContact(contactId);
    setUnblockDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Blocked Contacts"
        subtitle={blockedContacts.length > 0 ? `${blockedContacts.length} blocked` : undefined}
        showBack
      />

      <main className="pb-24">
        {blockedContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <ShieldOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No blocked contacts</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Blocked contacts will appear here. You won't receive messages from blocked contacts.
            </p>
          </div>
        ) : (
          <div>
            {blockedContacts.map(contact => {
              const displayName = contact.name || contact.phone;
              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-4 bg-card border-b border-border/50"
                >
                  <Avatar name={displayName} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ShieldOff className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {displayName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatBlockedDate(contact.blockedAt)}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUnblockDialog(contact.id)}
                    className="shrink-0"
                  >
                    Unblock
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Unblock Dialog */}
      <AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be able to send you messages again. You may receive messages from them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock}>
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}