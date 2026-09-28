import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';

/**
 * Loads blocked numbers and starred conversations from the cloud on sign-in,
 * then mirrors local changes back up.
 */
export function useCloudSync() {
  const { user } = useAuth();
  const { blockedContacts, starredChatIds, hydrate } = useChat();
  const ready = useRef(false);

  useEffect(() => {
    ready.current = false;
    if (!user) return;
    (async () => {
      const [b, s] = await Promise.all([
        supabase.from('blocked_numbers').select('*'),
        supabase.from('starred_items').select('*').eq('kind', 'conversation'),
      ]);
      hydrate({
        blocked: b.data?.map(r => ({ id: r.id, name: r.name, phone: r.phone, blockedAt: r.blocked_at })),
        starredChatIds: s.data?.map(r => r.chat_id),
      });
      ready.current = true;
    })();
  }, [user, hydrate]);

  useEffect(() => {
    if (!user || !ready.current) return;
    const phones = blockedContacts.map(b => b.phone);
    (async () => {
      if (blockedContacts.length) {
        await supabase.from('blocked_numbers').upsert(
          blockedContacts.map(b => ({ user_id: user.id, phone: b.phone, name: b.name ?? '', blocked_at: b.blockedAt })),
          { onConflict: 'user_id,phone' },
        );
      }
      const { data } = await supabase.from('blocked_numbers').select('phone');
      const stale = (data ?? []).map(r => r.phone).filter(p => !phones.includes(p));
      if (stale.length) await supabase.from('blocked_numbers').delete().in('phone', stale);
    })();
  }, [blockedContacts, user]);

  useEffect(() => {
    if (!user || !ready.current) return;
    const ids = [...starredChatIds];
    (async () => {
      if (ids.length) {
        await supabase.from('starred_items').upsert(
          ids.map(chat_id => ({ user_id: user.id, kind: 'conversation', chat_id, message_id: '' })),
          { onConflict: 'user_id,kind,chat_id,message_id' },
        );
      }
      const { data } = await supabase.from('starred_items').select('chat_id').eq('kind', 'conversation');
      const stale = (data ?? []).map(r => r.chat_id).filter(id => !ids.includes(id));
      if (stale.length) await supabase.from('starred_items').delete().eq('kind', 'conversation').in('chat_id', stale);
    })();
  }, [starredChatIds, user]);
}

export async function reportScam(sender: string, messageText: string, riskLevel = 'high') {
  return supabase.from('scam_reports').insert({ sender, message_text: messageText.slice(0, 2000), risk_level: riskLevel });
}
