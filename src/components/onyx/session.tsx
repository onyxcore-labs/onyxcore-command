import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { findFounder, type Founder } from "@/lib/founders";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  founder: Founder | null;
  login: (handle: string) => boolean;
  logout: () => void;
  ready: boolean;
  chatPrefill: string | null;
  openChat: (text: string) => void;
  clearPrefill: () => void;
};
const SessionCtx = createContext<Ctx | null>(null);
const KEY = "onyx-founder";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [founder, setFounder] = useState<Founder | null>(null);
  const [ready, setReady] = useState(false);
  const [chatPrefill, setPrefill] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setFounder(findFounder(saved) ?? null);
    setReady(true);
  }, []);

  // heartbeat
  useEffect(() => {
    if (!founder) return;
    const beat = () =>
      supabase.from("founder_status").update({ is_online: true, last_active: new Date().toISOString() }).eq("handle", founder.handle).then(() => {});
    beat();
    const id = setInterval(beat, 60_000);
    return () => clearInterval(id);
  }, [founder]);

  const login = (h: string) => {
    const f = findFounder(h);
    if (!f) return false;
    localStorage.setItem(KEY, f.handle);
    setFounder(f);
    return true;
  };
  const logout = async () => {
    if (founder) await supabase.from("founder_status").update({ is_online: false }).eq("handle", founder.handle).then(() => {});
    localStorage.removeItem(KEY);
    setFounder(null);
  };

  return (
    <SessionCtx.Provider
      value={{ founder, login, logout, ready, chatPrefill, openChat: setPrefill, clearPrefill: () => setPrefill(null) }}
    >
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const c = useContext(SessionCtx);
  if (!c) throw new Error("useSession outside provider");
  return c;
}
