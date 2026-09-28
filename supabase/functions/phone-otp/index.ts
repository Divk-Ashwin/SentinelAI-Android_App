import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('send'), phone: z.string().regex(/^\+91\d{10}$/) }),
  z.object({ action: z.literal('verify'), phone: z.string().regex(/^\+91\d{10}$/), code: z.string().regex(/^\d{6}$/) }),
]);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

function twilioHeaders() {
  const lovable = Deno.env.get('LOVABLE_API_KEY');
  const twilio = Deno.env.get('TWILIO_API_KEY');
  if (!lovable || !twilio) throw new Error('SMS service is not configured');
  return {
    Authorization: `Bearer ${lovable}`,
    'X-Connection-Api-Key': twilio,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

let cachedServiceSid: string | null = null;
async function getVerifyServiceSid(): Promise<string> {
  if (cachedServiceSid) return cachedServiceSid;
  const env = Deno.env.get('TWILIO_VERIFY_SERVICE_SID');
  if (env) return (cachedServiceSid = env);
  const list = await fetch(`${GATEWAY_URL}/verify/v2/Services?PageSize=50`, { headers: twilioHeaders() });
  if (!list.ok) throw new Error(`[${list.status}]: ${await list.text()}`);
  const data = await list.json();
  const found = (data.services ?? []).find((s: { friendly_name: string }) => s.friendly_name === 'SentinelAI');
  if (found) return (cachedServiceSid = found.sid);
  const created = await fetch(`${GATEWAY_URL}/verify/v2/Services`, {
    method: 'POST',
    headers: twilioHeaders(),
    body: new URLSearchParams({ FriendlyName: 'SentinelAI', CodeLength: '6' }),
  });
  if (!created.ok) throw new Error(`[${created.status}]: ${await created.text()}`);
  return (cachedServiceSid = (await created.json()).sid);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Invalid phone number or code' }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { phone } = parsed.data;
    const sid = await getVerifyServiceSid();

    if (parsed.data.action === 'send') {
      // Basic abuse limit: max 5 codes per number per hour.
      const since = new Date(Date.now() - 3600_000).toISOString();
      const { count } = await admin.from('otp_attempts').select('id', { count: 'exact', head: true }).eq('phone', phone).gte('created_at', since);
      if ((count ?? 0) >= 5) return json({ error: 'Too many attempts. Try again in an hour.' }, 429);
      await admin.from('otp_attempts').insert({ phone });

      const r = await fetch(`${GATEWAY_URL}/verify/v2/Services/${sid}/Verifications`, {
        method: 'POST', headers: twilioHeaders(), body: new URLSearchParams({ To: phone, Channel: 'sms' }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error(`Twilio send failed [${r.status}]: ${t}`);
        return json({ error: 'Could not send the code. Please check the number and try again.', details: t }, 502);
      }
      return json({ success: true });
    }

    // verify
    const r = await fetch(`${GATEWAY_URL}/verify/v2/Services/${sid}/VerificationCheck`, {
      method: 'POST', headers: twilioHeaders(), body: new URLSearchParams({ To: phone, Code: parsed.data.code }),
    });
    const result = await r.json().catch(() => ({}));
    if (!r.ok || result.status !== 'approved') return json({ error: 'Invalid or expired code' }, 400);

    // Phone is verified: find or create the user, then issue a one-time sign-in token.
    const email = `${phone.replace('+', '')}@phone.sentinelai.app`;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, email_confirm: true, user_metadata: { phone },
    });
    if (createErr && !/already|registered|exists/i.test(createErr.message)) throw createErr;
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    if (linkErr) throw linkErr;
    const userId = created?.user?.id ?? link.user.id;
    await admin.from('profiles').upsert({ id: userId, phone }, { onConflict: 'id', ignoreDuplicates: false });

    return json({ success: true, token_hash: link.properties.hashed_token });
  } catch (e) {
    console.error('phone-otp error', e);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
