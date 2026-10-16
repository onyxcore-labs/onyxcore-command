import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Founder {
  id: string;
  handle: string;
  fullName: string;
  role: string;
  vertical: string;
  github: string;
  passcode: string;
  isOnline: boolean;
  currentTask: string;
  blocker: string | null;
  progressPct: number;
}

export const INITIAL_FOUNDERS: Founder[] = [
  {
    id: 'lead',
    handle: 'ghambuna',
    fullName: 'Maximilian Ghambuna',
    role: 'Lead & Firmware Systems',
    vertical: 'ESP32, 1-Wire, RTOS, Sensors',
    github: 'MaximilianSilvesta',
    passcode: 'ghambuna',
    isOnline: true,
    currentTask: 'ESP32 Deep-Sleep & DS18B20 1-Wire Calibration',
    blocker: null,
    progressPct: 78,
  },
  {
    id: 'ui',
    handle: 'shamba',
    fullName: 'Brian Shamba',
    role: 'UI & Systems Architecture',
    vertical: 'Executive Design Tokens, Routing',
    github: 'bc_metrynx',
    passcode: 'shamba',
    isOnline: true,
    currentTask: 'Realtime Telemetry Canvas & Executive Dark UI',
    blocker: null,
    progressPct: 85,
  },
  {
    id: 'qa',
    handle: 'maganga',
    fullName: 'Aidan Maganga',
    role: 'Client Operations & QA',
    vertical: 'Field Pilots, SLA Verification',
    github: 'AidanJohanes',
    passcode: 'maganga',
    isOnline: false,
    currentTask: 'Cold-Chain Pilot SLA & Field Enclosure Drop-Test',
    blocker: 'Awaiting final IP67 seal sample',
    progressPct: 52,
  },
  {
    id: 'backend',
    handle: 'mchele',
    fullName: 'Blessing Mchele',
    role: 'Backend & Data Pipelines',
    vertical: 'PostgreSQL, Realtime Telemetry, Supabase',
    github: 'McKnight07',
    passcode: 'mchele',
    isOnline: true,
    currentTask: 'Supabase Realtime Publication & Telemetry Endpoint',
    blocker: null,
    progressPct: 70,
  },
];

interface AuthContextType {
  currentFounder: Founder | null;
  founders: Founder[];
  login: (handle: string, passcode: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateFounderStatus: (handle: string, updates: Partial<Founder>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [founders, setFounders] = useState<Founder[]>(INITIAL_FOUNDERS);
  const [currentHandle, setCurrentHandle] = useState<string | null>(() =>
    sessionStorage.getItem('onyx_handle')
  );

  useEffect(() => {
    const ch = supabase
      .channel('public:founder_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'founder_status' }, (p) => {
        const row = p.new as any;
        if (row?.handle) {
          setFounders((prev) =>
            prev.map((f) =>
              f.handle === row.handle
                ? {
                    ...f,
                    isOnline: row.is_online ?? f.isOnline,
                    currentTask: row.current_task ?? f.currentTask,
                    blocker: row.blocker !== undefined ? row.blocker : f.blocker,
                    progressPct: row.progress_pct ?? f.progressPct,
                  }
                : f
            )
          );
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const currentFounder = founders.find((f) => f.handle === currentHandle) || null;

  const login = async (h: string, p: string) => {
    const f = founders.find((x) => x.handle === h.trim().toLowerCase());
    if (!f) return { ok: false, error: 'Invalid founder handle' };
    if (f.passcode !== p) return { ok: false, error: 'Invalid founder passcode' };
    sessionStorage.setItem('onyx_handle', f.handle);
    setCurrentHandle(f.handle);
    return { ok: true };
  };

  const logout = () => {
    sessionStorage.removeItem('onyx_handle');
    setCurrentHandle(null);
  };

  const updateFounderStatus = async (handle: string, updates: Partial<Founder>) => {
    setFounders((prev) => prev.map((f) => (f.handle === handle ? { ...f, ...updates } : f)));
    try {
      await supabase.from('founder_status').upsert({
        handle,
        is_online: updates.isOnline ?? true,
        current_task: updates.currentTask,
        blocker: updates.blocker,
        progress_pct: updates.progressPct,
        last_active: new Date().toISOString(),
      });
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ currentFounder, founders, login, logout, updateFounderStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};