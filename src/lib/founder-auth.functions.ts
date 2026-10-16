import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { memberFromRow, type Founder } from './founders';

async function admin() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  return supabaseAdmin;
}

async function lookupMember(handle: string): Promise<Founder | null> {
  const db = await admin();
  const { data } = await db.from('founder_status').select('handle, full_name, role').eq('handle', handle).maybeSingle();
  return data ? memberFromRow(data) : null;
}

export const loginFounder = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ handle: z.string().trim().toLowerCase().max(24), passcode: z.string().min(1).max(128) }))
  .handler(async ({ data }) => {
    const founder = await lookupMember(data.handle);
    if (!founder) throw new Error('Username or passcode is incorrect');
    const db = await admin();
    const { data: token, error } = await db.rpc('founder_login', { p_handle: founder.handle, p_passcode: data.passcode });
    if (error || !token) throw new Error('Username or passcode is incorrect');
    return { founder, token };
  });

export const restoreFounder = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: handle, error } = await db.rpc('founder_session_handle', { p_token: data.token });
    if (error) throw new Error('Unable to restore session');
    return handle ? await lookupMember(handle) : null;
  });

export const changeFounderPasscode = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64), current: z.string().min(1).max(128), next: z.string().min(1).max(128), confirm: z.string() }).refine((d) => d.next === d.confirm, 'New passcodes do not match'))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.rpc('founder_change_passcode', { p_token: data.token, p_current: data.current, p_new: data.next });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const logoutFounder = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.rpc('founder_logout', { p_token: data.token });
    if (error) throw new Error('Unable to sign out');
    return { success: true };
  });

/** Records a join request after the browser created the email-verification account. */
export const requestJoin = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    userId: z.string().uuid(),
    email: z.string().trim().email().max(255),
    handle: z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{2,23}$/, 'Handle must be 3-24 lowercase letters, numbers or _'),
    name: z.string().trim().min(2).max(80),
    role: z.string().trim().min(2).max(80),
    passcode: z.string().min(6).max(128),
  }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: user } = await db.auth.admin.getUserById(data.userId);
    if (!user?.user || user.user.email?.toLowerCase() !== data.email.toLowerCase()) throw new Error('Could not confirm this email sign-up. Try again.');
    const { error } = await db.rpc('member_apply', { p_handle: data.handle, p_name: data.name, p_role: data.role, p_email: data.email, p_passcode: data.passcode, p_user_id: data.userId });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const listPendingMembers = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: rows, error } = await db.rpc('member_pending', { p_token: data.token });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const decideMember = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64), id: z.string().uuid(), approve: z.boolean() }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.rpc('member_decide', { p_token: data.token, p_id: data.id, p_approve: data.approve });
    if (error) throw new Error(error.message);
    return { success: true };
  });
