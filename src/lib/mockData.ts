// Mock data for the SentinelAI messaging application

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: 'user' | 'contact';
  isStarred: boolean;
  isRead: boolean;
}

export interface Chat {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  unreadCount: number;
  isSpam: boolean;
  isArchived: boolean;
  messages: Message[];
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

const generateMessages = (chatId: string, isSpam: boolean = false): Message[] => {
  const baseMessages: Message[][] = [
    // Normal conversation 1
    [
      { id: `${chatId}_1`, text: "Hey! How's it going?", timestamp: "2026-01-04T10:30:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_2`, text: "Pretty good! Just finished that project we talked about", timestamp: "2026-01-04T10:32:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_3`, text: "That's awesome! How did it turn out?", timestamp: "2026-01-04T10:33:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_4`, text: "Really well actually. The client loved it 🎉", timestamp: "2026-01-04T10:35:00", sender: 'user', isStarred: true, isRead: true },
      { id: `${chatId}_5`, text: "Congrats! We should celebrate", timestamp: "2026-01-04T10:36:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_6`, text: "Definitely! Are you free this weekend?", timestamp: "2026-01-04T11:00:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_7`, text: "Saturday works for me. Let me know the time and place", timestamp: "2026-01-04T11:05:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_8`, text: "How about that new restaurant downtown? Around 7pm?", timestamp: "2026-01-05T09:00:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_9`, text: "Perfect! I've been wanting to try that place", timestamp: "2026-01-05T09:15:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_10`, text: "Great, I'll make a reservation", timestamp: "2026-01-05T09:20:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_11`, text: "Thanks! Looking forward to it", timestamp: "2026-01-05T09:22:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_12`, text: "Same here! See you Saturday 👋", timestamp: "2026-01-05T09:25:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_13`, text: "By the way, should I bring anything?", timestamp: "2026-01-06T08:00:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_14`, text: "Just yourself! My treat for celebrating", timestamp: "2026-01-06T08:05:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_15`, text: "You're too kind! See you tomorrow!", timestamp: "2026-01-06T08:10:00", sender: 'contact', isStarred: false, isRead: false },
    ],
    // Normal conversation 2
    [
      { id: `${chatId}_1`, text: "Don't forget about the meeting tomorrow", timestamp: "2026-01-04T14:00:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_2`, text: "Which one? I have three scheduled", timestamp: "2026-01-04T14:05:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_3`, text: "The product review at 2pm", timestamp: "2026-01-04T14:06:00", sender: 'contact', isStarred: true, isRead: true },
      { id: `${chatId}_4`, text: "Got it, thanks for the reminder!", timestamp: "2026-01-04T14:10:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_5`, text: "Also, can you bring the prototype?", timestamp: "2026-01-04T14:12:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_6`, text: "Already packed and ready. Been working on some last-minute improvements too", timestamp: "2026-01-04T14:15:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_7`, text: "That's what I like to hear! The team is excited to see it", timestamp: "2026-01-04T14:18:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_8`, text: "Hope they like the new features", timestamp: "2026-01-04T14:20:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_9`, text: "I'm sure they will. You always deliver quality work", timestamp: "2026-01-04T14:22:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_10`, text: "Thanks! That means a lot", timestamp: "2026-01-04T14:25:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_11`, text: "See you tomorrow at 2!", timestamp: "2026-01-04T14:30:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_12`, text: "I'll be there 10 minutes early", timestamp: "2026-01-05T09:00:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_13`, text: "Perfect. Conference room B", timestamp: "2026-01-05T09:05:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_14`, text: "Noted!", timestamp: "2026-01-05T09:10:00", sender: 'user', isStarred: false, isRead: true },
    ],
    // Normal conversation 3
    [
      { id: `${chatId}_1`, text: "Did you see the game last night?", timestamp: "2026-01-05T10:00:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_2`, text: "Yes! What an incredible finish!", timestamp: "2026-01-05T10:02:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_3`, text: "That last-minute goal was unreal", timestamp: "2026-01-05T10:03:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_4`, text: "I couldn't believe it. I was on the edge of my seat the whole time", timestamp: "2026-01-05T10:05:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_5`, text: "Same here! My neighbors probably thought I was crazy with all the yelling 😂", timestamp: "2026-01-05T10:08:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_6`, text: "Haha totally worth it though", timestamp: "2026-01-05T10:10:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_7`, text: "Want to watch the next game together?", timestamp: "2026-01-05T10:15:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_8`, text: "That would be great! When is it?", timestamp: "2026-01-05T10:20:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_9`, text: "Next Thursday at 8pm", timestamp: "2026-01-05T10:22:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_10`, text: "I'm in! Your place or mine?", timestamp: "2026-01-05T10:25:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_11`, text: "Come over to mine. I'll get some snacks", timestamp: "2026-01-05T10:30:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_12`, text: "Perfect, I'll bring drinks", timestamp: "2026-01-05T10:32:00", sender: 'user', isStarred: false, isRead: true },
      { id: `${chatId}_13`, text: "Sounds like a plan! 🏈", timestamp: "2026-01-05T10:35:00", sender: 'contact', isStarred: false, isRead: true },
    ],
    // Spam conversation
    [
      { id: `${chatId}_1`, text: "CONGRATULATIONS! You've been selected to receive a FREE iPhone 16!", timestamp: "2026-01-06T07:00:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_2`, text: "Click here to claim your prize: bit.ly/free-prize", timestamp: "2026-01-06T07:01:00", sender: 'contact', isStarred: false, isRead: true },
      { id: `${chatId}_3`, text: "This offer expires in 24 hours! Act now!", timestamp: "2026-01-06T07:02:00", sender: 'contact', isStarred: false, isRead: false },
    ],
  ];

  if (isSpam) {
    return baseMessages[3];
  }

  const randomIndex = Math.floor(Math.random() * 3);
  return baseMessages[randomIndex];
};

export const mockChats: Chat[] = [
  {
    id: "chat_1",
    contactName: "Alice Johnson",
    contactPhone: "+1 234 567 8901",
    lastMessage: "You're too kind! See you tomorrow!",
    timestamp: "2m ago",
    unread: true,
    unreadCount: 1,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_1"),
  },
  {
    id: "chat_2",
    contactName: "Marcus Chen",
    contactPhone: "+1 345 678 9012",
    lastMessage: "Perfect. Conference room B",
    timestamp: "15m ago",
    unread: true,
    unreadCount: 2,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_2"),
  },
  {
    id: "chat_3",
    contactName: "",
    contactPhone: "+1 456 789 0123",
    lastMessage: "This offer expires in 24 hours! Act now!",
    timestamp: "1h ago",
    unread: true,
    unreadCount: 3,
    isSpam: true,
    isArchived: false,
    messages: generateMessages("chat_3", true),
  },
  {
    id: "chat_4",
    contactName: "Emma Rodriguez",
    contactPhone: "+1 567 890 1234",
    lastMessage: "Sounds like a plan! 🏈",
    timestamp: "2h ago",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_4"),
  },
  {
    id: "chat_5",
    contactName: "David Kim",
    contactPhone: "+1 678 901 2345",
    lastMessage: "Thanks for the update!",
    timestamp: "3h ago",
    unread: true,
    unreadCount: 1,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_5"),
  },
  {
    id: "chat_6",
    contactName: "Sophie Turner",
    contactPhone: "+1 789 012 3456",
    lastMessage: "I'll send you the files later",
    timestamp: "5h ago",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_6"),
  },
  {
    id: "chat_7",
    contactName: "",
    contactPhone: "+1 890 123 4567",
    lastMessage: "Claim your reward now! Limited time only!",
    timestamp: "Yesterday",
    unread: false,
    unreadCount: 0,
    isSpam: true,
    isArchived: false,
    messages: generateMessages("chat_7", true),
  },
  {
    id: "chat_8",
    contactName: "James Wilson",
    contactPhone: "+1 901 234 5678",
    lastMessage: "Let me know when you're available",
    timestamp: "Yesterday",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_8"),
  },
  {
    id: "chat_9",
    contactName: "Olivia Brown",
    contactPhone: "+1 012 345 6789",
    lastMessage: "The project looks great!",
    timestamp: "2 days ago",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_9"),
  },
  {
    id: "chat_10",
    contactName: "Liam Martinez",
    contactPhone: "+1 123 456 7890",
    lastMessage: "See you at the meeting",
    timestamp: "3 days ago",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: false,
    messages: generateMessages("chat_10"),
  },
];

export const archivedChats: Chat[] = [
  {
    id: "archived_1",
    contactName: "Sarah Williams",
    contactPhone: "+1 234 567 8900",
    lastMessage: "It was great catching up!",
    timestamp: "1 week ago",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: true,
    messages: generateMessages("archived_1"),
  },
  {
    id: "archived_2",
    contactName: "Michael Thompson",
    contactPhone: "+1 345 678 9001",
    lastMessage: "Thanks for everything!",
    timestamp: "2 weeks ago",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: true,
    messages: generateMessages("archived_2"),
  },
  {
    id: "archived_3",
    contactName: "Jessica Davis",
    contactPhone: "+1 456 789 0102",
    lastMessage: "Let's reconnect soon",
    timestamp: "3 weeks ago",
    unread: false,
    unreadCount: 0,
    isSpam: false,
    isArchived: true,
    messages: generateMessages("archived_3"),
  },
];

export const mockContacts: Contact[] = [
  { id: "contact_1", name: "Alice Johnson", phone: "+1 234 567 8901" },
  { id: "contact_2", name: "Bob Smith", phone: "+1 345 678 9012" },
  { id: "contact_3", name: "Carol White", phone: "+1 456 789 0123" },
  { id: "contact_4", name: "David Kim", phone: "+1 567 890 1234" },
  { id: "contact_5", name: "Emma Rodriguez", phone: "+1 678 901 2345" },
  { id: "contact_6", name: "Frank Miller", phone: "+1 789 012 3456" },
  { id: "contact_7", name: "Grace Lee", phone: "+1 890 123 4567" },
  { id: "contact_8", name: "Henry Taylor", phone: "+1 901 234 5678" },
  { id: "contact_9", name: "Isabella Brown", phone: "+1 012 345 6789" },
  { id: "contact_10", name: "James Wilson", phone: "+1 123 456 7890" },
  { id: "contact_11", name: "Karen Anderson", phone: "+1 234 567 8902" },
  { id: "contact_12", name: "Liam Martinez", phone: "+1 345 678 9013" },
  { id: "contact_13", name: "Marcus Chen", phone: "+1 456 789 0124" },
  { id: "contact_14", name: "Nina Patel", phone: "+1 567 890 1235" },
  { id: "contact_15", name: "Olivia Brown", phone: "+1 678 901 2346" },
];
