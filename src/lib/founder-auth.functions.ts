import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { findFounder } from './founders';

export const loginFounder = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ handle: z.string().trim().toLowerCase(), passcode: z.string().min(1).max(128) }))
  .handler(async ({ data }) => {
    const founder = findFounder(data.handle);
    if (!founder) throw new Error('Username or passcode is incorrect');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: token, error } = await supabaseAdmin.rpc('founder_login', { p_handle: founder.handle, p_passcode: data.passcode });
    if (error || !token) throw new Error('Username or passcode is incorrect');
    return { founder, token };
  });

export const restoreFounder = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: handle, error } = await supabaseAdmin.rpc('founder_session_handle', { p_token: data.token });
    if (error) throw new Error('Unable to restore session');
    return handle ? findFounder(handle) ?? null : null;
  });

export const changeFounderPasscode = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64), current: z.string().min(1).max(128), next: z.string().min(1).max(128), confirm: z.string() }).refine((d) => d.next === d.confirm, 'New passcodes do not match'))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.rpc('founder_change_passcode', { p_token: data.token, p_current: data.current, p_new: data.next });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const logoutFounder = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(64) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.rpc('founder_logout', { p_token: data.token });
    if (error) throw new Error('Unable to sign out');
    return { success: true };
  });