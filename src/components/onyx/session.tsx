import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useServerFn } from '@tanstack/react-start';
import type { Founder } from '@/lib/founders';
import { loginFounder, restoreFounder, logoutFounder } from '@/lib/founder-auth.functions';
import { supabase } from '@/integrations/supabase/client';

type Ctx = {
  founder: Founder | null; token: string | null;
  login: (handle: string, passcode: string) => Promise<void>;
  logout: () => Promise<void>; ready: boolean;
  chatPrefill: string | null; openChat: (text: string) => void; clearPrefill: () => void;
};
const SessionCtx = createContext<Ctx | null>(null);
const KEY = 'onyx-founder-session';
export function SessionProvider({ children }: { children: ReactNode }) {
  const [founder, setFounder] = useState<Founder | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [chatPrefill, setPrefill] = useState<string | null>(null);
  const authenticate = useServerFn(loginFounder);
  const restore = useServerFn(restoreFounder);
  const signout = useServerFn(logoutFounder);
  const clearPrefill = useCallback(() => setPrefill(null), []);
  useEffect(() => {
    let alive = true;
    async function init() {
      try {
        localStorage.removeItem('onyx-founder');
        const saved = sessionStorage.getItem(KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { token: string };
          const f = await restore({ data: { token: parsed.token } });
          if (alive && f) { setFounder(f); setToken(parsed.token); }
          if (!f) sessionStorage.removeItem(KEY);
        }
      } catch { sessionStorage.removeItem(KEY); }
      finally { if (alive) setReady(true); }
    }
    void init();
    return () => { alive = false; };
  }, [restore]);
  useEffect(() => {
    if (!founder) return;
    const beat = () => { void supabase.from('founder_status').update({ is_online: true, last_active: new Date().toISOString() }).eq('handle', founder.handle).then(() => {}); };
    beat(); const id = setInterval(beat, 60_000);
    return () => clearInterval(id);
  }, [founder]);
  async function login(handle: string, passcode: string) {
    const result = await authenticate({ data: { handle, passcode } });
    sessionStorage.setItem(KEY, JSON.stringify(result));
    setFounder(result.founder); setToken(result.token);
  }
  async function logout() {
    try { if (token) await signout({ data: { token } }); }
    finally { sessionStorage.removeItem(KEY); setFounder(null); setToken(null); }
  }
  return <SessionCtx.Provider value={{ founder, token, login, logout, ready, chatPrefill, openChat: setPrefill, clearPrefill }}>{children}</SessionCtx.Provider>;
}
export function useSession() {
  const c = useContext(SessionCtx);
  if (!c) throw new Error('useSession outside provider');
  return c;
}
