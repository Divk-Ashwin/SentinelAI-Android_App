import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/chat/Header';
import { ContactListItem } from '@/components/chat/ContactListItem';
import { EmptyState } from '@/components/chat/EmptyState';
import { useChat } from '@/context/ChatContext';
import { Contact } from '@/lib/mockData';
import { Search, X } from 'lucide-react';

export default function NewChat() {
  const navigate = useNavigate();
  const { contacts, createNewChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = contact.name.toLowerCase().includes(searchLower);
    const phoneMatch = contact.phone.toLowerCase().includes(searchLower);
    return nameMatch || phoneMatch;
  });

  // Get recent contacts (first 5)
  const recentContacts = contacts.slice(0, 5);

  const handleContactSelect = (contact: Contact) => {
    const chatId = createNewChat(contact);
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="New Chat" showBack />

      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter name or phone number"
            className="w-full bg-muted/50 text-foreground placeholder:text-muted-foreground rounded-xl pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <main>
        {searchQuery ? (
          filteredContacts.length === 0 ? (
            <EmptyState type="contacts" />
          ) : (
            <div>
              {filteredContacts.map(contact => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  onClick={handleContactSelect}
                />
              ))}
            </div>
          )
        ) : (
          <>
            {/* Recent Section */}
            <div className="py-2">
              <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
                Recent
              </h3>
              {recentContacts.map(contact => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  onClick={handleContactSelect}
                />
              ))}
            </div>

            {/* All Contacts */}
            <div className="py-2 border-t border-border">
              <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
                All Contacts
              </h3>
              {contacts.map(contact => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  onClick={handleContactSelect}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
