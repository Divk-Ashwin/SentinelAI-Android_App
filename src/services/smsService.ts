/**
 * SMS Service - Bridge for Capacitor native SMS plugin
 *
 * In web/preview mode, all methods return mock data.
 * When running inside Capacitor on Android, these will
 * delegate to the native SMS plugin (@anthropic/capacitor-sms
 * or equivalent community plugin).
 */

export interface SMSMessage {
  id: string;
  threadId: string;
  address: string;
  body: string;
  date: number;
  type: 'inbox' | 'sent';
  read: boolean;
  contactName?: string;
}

export interface Conversation {
  threadId: string;
  address: string;
  contactName?: string;
  messages: SMSMessage[];
  lastMessage: SMSMessage;
  unreadCount: number;
  isScam?: boolean;
}

const isNative = (): boolean => {
  try {
    return !!(window as any).Capacitor?.isNativePlatform();
  } catch {
    return false;
  }
};

/**
 * Read all SMS messages from the device.
 * Falls back to empty array on web.
 */
export async function getAllMessages(): Promise<SMSMessage[]> {
  if (!isNative()) {
    console.log('[SMSService] Running in web mode — using mock data from ChatContext');
    return [];
  }

  // TODO: Replace with actual Capacitor SMS plugin call
  // const { messages } = await CapacitorSMS.getAll();
  return [];
}

/**
 * Send an SMS via the native API.
 */
export async function sendSMS(address: string, body: string): Promise<boolean> {
  if (!isNative()) {
    console.log(`[SMSService] Mock send to ${address}: ${body}`);
    return true;
  }

  // TODO: Replace with actual Capacitor SMS plugin call
  // await CapacitorSMS.send({ address, body });
  return true;
}

/**
 * Register a listener for incoming SMS.
 * Returns an unsubscribe function.
 */
export function onSMSReceived(
  callback: (message: SMSMessage) => void
): () => void {
  if (!isNative()) {
    console.log('[SMSService] Web mode — SMS listener is a no-op');
    return () => {};
  }

  // TODO: Replace with actual Capacitor SMS plugin listener
  // const handle = CapacitorSMS.addListener('sms-received', callback);
  // return () => handle.remove();
  return () => {};
}

/**
 * Group flat SMS messages into conversations by thread/address.
 */
export function groupByConversation(messages: SMSMessage[]): Conversation[] {
  const map = new Map<string, SMSMessage[]>();

  for (const msg of messages) {
    const key = msg.threadId || msg.address;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(msg);
  }

  return Array.from(map.entries()).map(([threadId, msgs]) => {
    msgs.sort((a, b) => a.date - b.date);
    const last = msgs[msgs.length - 1];
    return {
      threadId,
      address: last.address,
      contactName: last.contactName,
      messages: msgs,
      lastMessage: last,
      unreadCount: msgs.filter(m => !m.read && m.type === 'inbox').length,
    };
  });
}
