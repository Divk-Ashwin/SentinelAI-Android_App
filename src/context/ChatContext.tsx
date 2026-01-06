import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Chat, Message, Contact, mockChats, archivedChats, mockContacts } from '@/lib/mockData';

interface ChatContextType {
  chats: Chat[];
  archived: Chat[];
  contacts: Contact[];
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  getChatById: (id: string) => Chat | undefined;
  sendMessage: (chatId: string, text: string) => void;
  deleteChat: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  unarchiveChat: (chatId: string) => void;
  starMessage: (chatId: string, messageId: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  markAsRead: (chatId: string) => void;
  markAllAsRead: () => void;
  deleteAllChats: () => void;
  createNewChat: (contact: Contact) => string;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [archived, setArchived] = useState<Chat[]>(archivedChats);
  const [contacts] = useState<Contact[]>(mockContacts);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
  };

  const archiveChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setChats(prev => prev.filter(c => c.id !== chatId));
      setArchived(prev => [...prev, { ...chat, isArchived: true }]);
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
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg =>
            msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
          ),
        };
      }
      return chat;
    }));
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

  return (
    <ChatContext.Provider
      value={{
        chats,
        archived,
        contacts,
        currentChatId,
        setCurrentChatId,
        getChatById,
        sendMessage,
        deleteChat,
        archiveChat,
        unarchiveChat,
        starMessage,
        deleteMessage,
        markAsRead,
        markAllAsRead,
        deleteAllChats,
        createNewChat,
        notificationsEnabled,
        toggleNotifications,
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
