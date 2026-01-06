import { Contact } from '@/lib/mockData';
import { Avatar } from './Avatar';

interface ContactListItemProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
}

export function ContactListItem({ contact, onClick }: ContactListItemProps) {
  return (
    <div
      onClick={() => onClick(contact)}
      className="flex items-center gap-3 p-4 bg-card hover:bg-accent/50 cursor-pointer transition-colors duration-200 border-b border-border/50"
    >
      <Avatar name={contact.name} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{contact.name}</p>
        <p className="text-sm text-muted-foreground">{contact.phone}</p>
      </div>
    </div>
  );
}
