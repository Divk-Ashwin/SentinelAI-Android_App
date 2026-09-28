import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, ReactNode } from 'react';
import { Chat, Message, Contact, MessageAttachment, mockChats, archivedChats, mockContacts } from '@/lib/mockData';

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
  sendMessage: (chatId: string, text: string, attachment?: MessageAttachment) => void;
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
  /** Replace blocked/starred state (used by cloud sync). */
  hydrate: (data: { blocked?: BlockedContact[]; starredChatIds?: string[]; pinnedChatIds?: string[] }) => void;
  starredChatIds: Set<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialBlockedContacts: BlockedContact[] = [
  { id: 'blocked_1', name: '', phone: '+1 555 123 4567', blockedAt: '2026-01-05T10:00:00' },
  { id: 'blocked_2', name: 'Spam Caller', phone: '+1 555 987 6543', blockedAt: '2026-01-03T14:30:00' },
];

const LS = {
  pinned: 'sentinel_pinned',
  starred: 'sentinel_starred_chats',
  blocked: 'sentinel_blocked',
  notif: 'sentinel_notifications',
};

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function previewFor(text: string, attachment?: MessageAttachment) {
  if (!attachment) return text;
  switch (attachment.type) {
    case 'image': return '📷 Image';
    case 'gif': return 'GIF';
    case 'contact': return `👤 Contact: ${attachment.contact?.name}`;
    case 'location': return `📍 Location: ${attachment.location?.name}`;
    default: return text;
  }
}

/*
 * All actions are wrapped in useCallback and read the latest state through
 * functional updates. Previously they were re-created on every render, which
 * made effects like `useEffect(() => markAsRead(id), [id, markAsRead])` fire on
 * every render and caused a render loop in the chat screen.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [archived, setArchived] = useState<Chat[]>(archivedChats);
  const [contacts] = useState<Contact[]>(mockContacts);
  const [blockedContacts, setBlockedContacts] = useState<BlockedContact[]>(() => readLS(LS.blocked, initialBlockedContacts));
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => readLS(LS.notif, true));
  const [pinnedChatIds, setPinnedChatIds] = useState<Set<string>>(() => new Set(readLS<string[]>(LS.pinned, [])));
  const [starredChatIds, setStarredChatIds] = useState<Set<string>>(() => new Set(readLS<string[]>(LS.starred, [])));

  // Persist lightweight preferences so they survive a reload.
  useEffect(() => { localStorage.setItem(LS.pinned, JSON.stringify([...pinnedChatIds])); }, [pinnedChatIds]);
  useEffect(() => { localStorage.setItem(LS.starred, JSON.stringify([...starredChatIds])); }, [starredChatIds]);
  useEffect(() => { localStorage.setItem(LS.blocked, JSON.stringify(blockedContacts)); }, [blockedContacts]);
  useEffect(() => { localStorage.setItem(LS.notif, JSON.stringify(notificationsEnabled)); }, [notificationsEnabled]);

  // Refs let stable callbacks read current lists without re-creating.
  const chatsRef = useRef(chats);
  const archivedRef = useRef(archived);
  chatsRef.current = chats;
  archivedRef.current = archived;

  const updateBoth = useCallback((fn: (list: Chat[]) => Chat[]) => {
    setChats(fn);
    setArchived(fn);
  }, []);

  const getChatById = useCallback((id: string) => chats.find(c => c.id === id) || archived.find(c => c.id === id), [chats, archived]);

  const sendMessage = useCallback((chatId: string, text: string, attachment?: MessageAttachment) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      timestamp: new Date().toISOString(),
      sender: 'user',
      isStarred: false,
      isRead: true,
      attachment,
    };
    const apply = (chat: Chat): Chat => ({
      ...chat,
      messages: [...chat.messages, newMessage],
      lastMessage: previewFor(text, attachment),
      timestamp: 'Just now',
    });
    // Move the active conversation to the top of the inbox.
    setChats(prev => {
      const target = prev.find(c => c.id === chatId);
      if (!target) return prev;
      return [apply(target), ...prev.filter(c => c.id !== chatId)];
    });
    // Archived chats can be replied to as well.
    setArchived(prev => prev.map(c => (c.id === chatId ? apply(c) : c)));
  }, []);

  const removeId = (set: Set<string>, id: string) => {
    if (!set.has(id)) return set;
    const n = new Set(set);
    n.delete(id);
    return n;
  };

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setArchived(prev => prev.filter(c => c.id !== chatId));
    setPinnedChatIds(prev => removeId(prev, chatId));
    setStarredChatIds(prev => removeId(prev, chatId));
  }, []);

  const archiveChat = useCallback((chatId: string) => {
    const chat = chatsRef.current.find(c => c.id === chatId);
    if (!chat) return;
    setChats(prev => prev.filter(c => c.id !== chatId));
    setArchived(prev => (prev.some(c => c.id === chatId) ? prev : [...prev, { ...chat, isArchived: true }]));
    setPinnedChatIds(prev => removeId(prev, chatId));
  }, []);

  const unarchiveChat = useCallback((chatId: string) => {
    const chat = archivedRef.current.find(c => c.id === chatId);
    if (!chat) return;
    setArchived(prev => prev.filter(c => c.id !== chatId));
    setChats(prev => (prev.some(c => c.id === chatId) ? prev : [{ ...chat, isArchived: false }, ...prev]));
  }, []);

  const starMessage = useCallback((chatId: string, messageId: string) => {
    updateBoth(list => list.map(chat => chat.id !== chatId ? chat : {
      ...chat,
      messages: chat.messages.map(m => (m.id === messageId ? { ...m, isStarred: !m.isStarred } : m)),
    }));
  }, [updateBoth]);

  const deleteMessage = useCallback((chatId: string, messageId: string) => {
    updateBoth(list => list.map(chat => {
      if (chat.id !== chatId) return chat;
      const messages = chat.messages.filter(m => m.id !== messageId);
      const last = messages[messages.length - 1];
      return { ...chat, messages, lastMessage: last ? previewFor(last.text, last.attachment) : '' };
    }));
  }, [updateBoth]);

  const markAsRead = useCallback((chatId: string) => {
    updateBoth(list => {
      const chat = list.find(c => c.id === chatId);
      // No-op if nothing to change — avoids needless re-renders.
      if (!chat || (!chat.unread && chat.unreadCount === 0 && chat.messages.every(m => m.isRead))) return list;
      return list.map(c => c.id !== chatId ? c : {
        ...c, unread: false, unreadCount: 0, messages: c.messages.map(m => (m.isRead ? m : { ...m, isRead: true })),
      });
    });
  }, [updateBoth]);

  const markAsUnread = useCallback((chatId: string) => {
    updateBoth(list => list.map(c => (c.id === chatId ? { ...c, unread: true, unreadCount: Math.max(1, c.unreadCount) } : c)));
  }, [updateBoth]);

  const markAllAsRead = useCallback(() => {
    setChats(prev => prev.map(c => ({ ...c, unread: false, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) })));
  }, []);

  const deleteAllChats = useCallback(() => {
    const ids = chatsRef.current.map(c => c.id);
    setChats([]);
    setPinnedChatIds(new Set());
    setStarredChatIds(prev => new Set([...prev].filter(id => !ids.includes(id))));
  }, []);

  const createNewChat = useCallback((contact: Contact): string => {
    const digits = (s: string) => s.replace(/\D/g, '');
    // Match by phone only — two contacts can share a name.
    const existing = [...chatsRef.current, ...archivedRef.current].find(c => digits(c.contactPhone) === digits(contact.phone));
    if (existing) {
      if (existing.isArchived) unarchiveChat(existing.id);
      return existing.id;
    }
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
    chatsRef.current = [newChat, ...chatsRef.current];
    setChats(prev => [newChat, ...prev]);
    return newChat.id;
  }, [unarchiveChat]);

  const toggleNotifications = useCallback(() => setNotificationsEnabled(p => !p), []);
  const pinChat = useCallback((id: string) => setPinnedChatIds(p => new Set([...p, id])), []);
  const unpinChat = useCallback((id: string) => setPinnedChatIds(p => removeId(p, id)), []);
  const isPinned = useCallback((id: string) => pinnedChatIds.has(id), [pinnedChatIds]);

  const blockContact = useCallback((chatId: string) => {
    const chat = chatsRef.current.find(c => c.id === chatId) || archivedRef.current.find(c => c.id === chatId);
    if (!chat) return;
    setBlockedContacts(prev => prev.some(b => b.phone === chat.contactPhone) ? prev : [...prev, {
      id: `blocked_${Date.now()}`,
      name: chat.contactName,
      phone: chat.contactPhone,
      blockedAt: new Date().toISOString(),
    }]);
    deleteChat(chatId);
  }, [deleteChat]);

  const unblockContact = useCallback((id: string) => setBlockedContacts(p => p.filter(c => c.id !== id)), []);

  const getStarredMessages = useCallback(() => {
    const out: Array<{ chat: Chat; message: Message }> = [];
    [...chats, ...archived].forEach(chat => chat.messages.forEach(m => { if (m.isStarred) out.push({ chat, message: m }); }));
    return out.sort((a, b) => new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime());
  }, [chats, archived]);

  const starConversation = useCallback((id: string) => {
    setStarredChatIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const isConversationStarred = useCallback((id: string) => starredChatIds.has(id), [starredChatIds]);
  const getStarredConversations = useCallback(() => [...chats, ...archived].filter(c => starredChatIds.has(c.id)), [chats, archived, starredChatIds]);

  const hydrate = useCallback((data: { blocked?: BlockedContact[]; starredChatIds?: string[]; pinnedChatIds?: string[] }) => {
    if (data.blocked) setBlockedContacts(data.blocked);
    if (data.starredChatIds) setStarredChatIds(new Set(data.starredChatIds));
    if (data.pinnedChatIds) setPinnedChatIds(new Set(data.pinnedChatIds));
  }, []);

  // Pinned first; stable order otherwise.
  const sortedChats = useMemo(() => {
    const pinned = chats.filter(c => pinnedChatIds.has(c.id));
    const rest = chats.filter(c => !pinnedChatIds.has(c.id));
    return [...pinned, ...rest];
  }, [chats, pinnedChatIds]);

  const value = useMemo<ChatContextType>(() => ({
    chats: sortedChats, archived, contacts, blockedContacts, currentChatId, setCurrentChatId, getChatById,
    sendMessage, deleteChat, archiveChat, unarchiveChat, starMessage, starConversation, isConversationStarred,
    deleteMessage, markAsRead, markAsUnread, markAllAsRead, deleteAllChats, createNewChat, notificationsEnabled,
    toggleNotifications, pinChat, unpinChat, isPinned, blockContact, unblockContact, getStarredMessages,
    getStarredConversations, hydrate, starredChatIds,
  }), [sortedChats, archived, contacts, blockedContacts, currentChatId, getChatById, sendMessage, deleteChat, archiveChat,
    unarchiveChat, starMessage, starConversation, isConversationStarred, deleteMessage, markAsRead, markAsUnread,
    markAllAsRead, deleteAllChats, createNewChat, notificationsEnabled, toggleNotifications, pinChat, unpinChat, isPinned,
    blockContact, unblockContact, getStarredMessages, getStarredConversations, hydrate, starredChatIds]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) throw new Error('useChat must be used within a ChatProvider');
  return context;
}
