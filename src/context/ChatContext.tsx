import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Chat, Message, Contact, mockChats, archivedChats, mockContacts } from '@/lib/mockData';

export interface BlockedContact {
  id: string;
  name: string;
  phone: string;
  blockedAt: string;
}

interface ChatContextType {
  chats: Chat[];
  archived: Chat[];
  contacts: Contact[];
  blockedContacts: BlockedContact[];
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  getChatById: (id: string) => Chat | undefined;
  sendMessage: (chatId: string, text: string) => void;
  deleteChat: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  unarchiveChat: (chatId: string) => void;
  starMessage: (chatId: string, messageId: string) => void;
  starConversation: (chatId: string) => void;
  isConversationStarred: (chatId: string) => boolean;
  deleteMessage: (chatId: string, messageId: string) => void;
  markAsRead: (chatId: string) => void;
  markAsUnread: (chatId: string) => void;
  markAllAsRead: () => void;
  deleteAllChats: () => void;
  createNewChat: (contact: Contact) => string;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  pinChat: (chatId: string) => void;
  unpinChat: (chatId: string) => void;
  isPinned: (chatId: string) => boolean;
  blockContact: (chatId: string) => void;
  unblockContact: (contactId: string) => void;
  getStarredMessages: () => Array<{ chat: Chat; message: Message }>;
  getStarredConversations: () => Chat[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial blocked contacts for demo
const initialBlockedContacts: BlockedContact[] = [
  { id: 'blocked_1', name: '', phone: '+1 555 123 4567', blockedAt: '2026-01-05T10:00:00' },
  { id: 'blocked_2', name: 'Spam Caller', phone: '+1 555 987 6543', blockedAt: '2026-01-03T14:30:00' },
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [archived, setArchived] = useState<Chat[]>(archivedChats);
  const [contacts] = useState<Contact[]>(mockContacts);
  const [blockedContacts, setBlockedContacts] = useState<BlockedContact[]>(initialBlockedContacts);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pinnedChatIds, setPinnedChatIds] = useState<Set<string>>(new Set());
  const [starredChatIds, setStarredChatIds] = useState<Set<string>>(new Set());

  const getChatById = (id: string): Chat | undefined => {
    return chats.find(c => c.id === id) || archived.find(c => c.id === id);
  };

  const sendMessage = (chatId: string, text: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      sender: 'user',
      isStarred: false,
      isRead: true,
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: text,
          timestamp: 'Just now',
        };
      }
      return chat;
    }));
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setArchived(prev => prev.filter(c => c.id !== chatId));
    setPinnedChatIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(chatId);
      return newSet;
    });
  };

  const archiveChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setChats(prev => prev.filter(c => c.id !== chatId));
      setArchived(prev => [...prev, { ...chat, isArchived: true }]);
      setPinnedChatIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    }
  };

  const unarchiveChat = (chatId: string) => {
    const chat = archived.find(c => c.id === chatId);
    if (chat) {
      setArchived(prev => prev.filter(c => c.id !== chatId));
      setChats(prev => [{ ...chat, isArchived: false }, ...prev]);
    }
  };

  const starMessage = (chatId: string, messageId: string) => {
    const updateMessages = (chatList: Chat[]) =>
      chatList.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map(msg =>
              msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
            ),
          };
        }
        return chat;
      });

    setChats(prev => updateMessages(prev));
    setArchived(prev => updateMessages(prev));
  };

  const deleteMessage = (chatId: string, messageId: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.filter(msg => msg.id !== messageId),
        };
      }
      return chat;
    }));
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unread: false,
          unreadCount: 0,
          messages: chat.messages.map(msg => ({ ...msg, isRead: true })),
        };
      }
      return chat;
    }));
  };

  const markAsUnread = (chatId: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unread: true,
          unreadCount: 1,
        };
      }
      return chat;
    }));
  };

  const markAllAsRead = () => {
    setChats(prev => prev.map(chat => ({
      ...chat,
      unread: false,
      unreadCount: 0,
      messages: chat.messages.map(msg => ({ ...msg, isRead: true })),
    })));
  };

  const deleteAllChats = () => {
    setChats([]);
    setPinnedChatIds(new Set());
  };

  const createNewChat = (contact: Contact): string => {
    const existingChat = chats.find(
      c => c.contactPhone === contact.phone || c.contactName === contact.name
    );
    if (existingChat) return existingChat.id;

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      contactName: contact.name,
      contactPhone: contact.phone,
      lastMessage: '',
      timestamp: 'Just now',
      unread: false,
      unreadCount: 0,
      isSpam: false,
      isArchived: false,
      messages: [],
    };

    setChats(prev => [newChat, ...prev]);
    return newChat.id;
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
  };

  const pinChat = (chatId: string) => {
    setPinnedChatIds(prev => new Set([...prev, chatId]));
  };

  const unpinChat = (chatId: string) => {
    setPinnedChatIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(chatId);
      return newSet;
    });
  };

  const isPinned = (chatId: string): boolean => {
    return pinnedChatIds.has(chatId);
  };

  const blockContact = (chatId: string) => {
    const chat = getChatById(chatId);
    if (chat) {
      const blockedContact: BlockedContact = {
        id: `blocked_${Date.now()}`,
        name: chat.contactName,
        phone: chat.contactPhone,
        blockedAt: new Date().toISOString(),
      };
      setBlockedContacts(prev => [...prev, blockedContact]);
      deleteChat(chatId);
    }
  };

  const unblockContact = (contactId: string) => {
    setBlockedContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const getStarredMessages = (): Array<{ chat: Chat; message: Message }> => {
    const starred: Array<{ chat: Chat; message: Message }> = [];
    
    [...chats, ...archived].forEach(chat => {
      chat.messages.forEach(message => {
        if (message.isStarred) {
          starred.push({ chat, message });
        }
      });
    });
    
    return starred.sort((a, b) => 
      new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime()
    );
  };

  const starConversation = (chatId: string) => {
    setStarredChatIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const isConversationStarred = (chatId: string): boolean => {
    return starredChatIds.has(chatId);
  };

  const getStarredConversations = (): Chat[] => {
    return [...chats, ...archived].filter(chat => starredChatIds.has(chat.id));
  };

  // Sort chats with pinned at top
  const sortedChats = [...chats].sort((a, b) => {
    const aPinned = pinnedChatIds.has(a.id);
    const bPinned = pinnedChatIds.has(b.id);
    
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <ChatContext.Provider
      value={{
        chats: sortedChats,
        archived,
        contacts,
        blockedContacts,
        currentChatId,
        setCurrentChatId,
        getChatById,
        sendMessage,
        deleteChat,
        archiveChat,
        unarchiveChat,
        starMessage,
        starConversation,
        isConversationStarred,
        deleteMessage,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteAllChats,
        createNewChat,
        notificationsEnabled,
        toggleNotifications,
        pinChat,
        unpinChat,
        isPinned,
        blockContact,
        unblockContact,
        getStarredMessages,
        getStarredConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}