import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Target, Users, Radar as RadarIcon, GitBranch, Cpu, PanelLeftClose, PanelLeftOpen, KeyRound, LogOut, Radio } from 'lucide-react';
import { Toaster } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SessionProvider, useSession } from './session';
import { Emblem, Logotype } from './Emblem';
import { LoginGate } from './LoginGate';
import { BootScreen } from './BootScreen';
import { CommsDock } from './CommsDock';
import { SecuritySettings } from './SecuritySettings';
import { Btn } from './ui';

const modules = [
  { to: '/' as const, title: 'My Objectives', icon: Target, subtitle: 'Personalized sprint execution' },
  { to: '/squad' as const, title: 'Squad Sync & Blockers', icon: Users, subtitle: 'Founder presence & blocker board' },
  { to: '/radar' as const, title: 'Social Radar & Ideas', icon: RadarIcon, subtitle: 'Opportunities & sprint consensus' },
  { to: '/projects' as const, title: 'Projects & Architecture', icon: GitBranch, subtitle: 'Repositories & pipeline activity' },
  { to: '/hardware' as const, title: 'Hardware Inventory', icon: Cpu, subtitle: 'Testbed & component registry' },
];

export function CommandShell({ children }: { children: ReactNode }) {
  return <SessionProvider><BootScreen /><Workspace>{children}</Workspace><Toaster richColors position="top-right" /></SessionProvider>;
}

function Workspace({ children }: { children: ReactNode }) {
  const { founder, ready, logout } = useSession();
  const [expanded, setExpanded] = useState(true);
  const [security, setSecurity] = useState(false);
  const [connection, setConnection] = useState('Connecting');
  const location = useLocation();
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    setExpanded(!media.matches);
    const update = () => setExpanded(!media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!founder) return;
    const channel = supabase.channel('cluster-presence').on('postgres_changes', { event: '*', schema: 'public', table: 'founder_status' }, () => {}).subscribe((status) => {
      setConnection(status === 'SUBSCRIBED' ? 'Live' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED' ? 'Reconnecting' : 'Connecting');
    });
    return () => { void supabase.removeChannel(channel); };
  }, [founder]);
  if (!ready) return <div className="flex min-h-screen items-center justify-center font-mono text-xs text-muted-foreground">INITIALIZING WORKSPACE…</div>;
  if (!founder) return <LoginGate />;
  const current = modules.find((m) => m.to === location.pathname);
  return <div className={`workspace min-h-screen ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
    <aside className="command-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card">
      <div className={`flex h-24 shrink-0 items-center ${expanded ? 'px-5' : 'justify-center'}`}>{expanded ? <Logotype /> : <Emblem size={34} />}</div>
      {expanded && <div className="px-5 pb-4 pt-3 font-mono text-[10px] text-muted-foreground">COMMAND CENTER</div>}
      <nav aria-label="Command modules" className="flex-1 space-y-2 px-2 py-3">{modules.map((m) => {
        const active = location.pathname === m.to;
        return <Link key={m.to} to={m.to} title={m.title} aria-current={active ? 'page' : undefined} onClick={() => { if (window.innerWidth < 760) setExpanded(false); }} className={`group flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 transition-colors ${active ? 'bg-primary-soft text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-chassis'}`}><m.icon size={20} className="shrink-0" />{expanded && <div className="min-w-0"><div className="text-[12px] font-bold leading-5">{m.title}</div><div className="mt-0.5 text-[10px] leading-4 opacity-75">{m.subtitle}</div></div>}</Link>;
      })}</nav>
      <div className="space-y-3 border-t p-3"><div title={`eu-west-1 ${connection}`} className={`flex items-center gap-2 rounded-lg bg-muted px-2 py-2 font-mono text-[10px] ${connection === 'Live' ? 'text-primary' : 'text-gold'} ${expanded ? '' : 'justify-center'}`}><Radio size={14} className="shrink-0" />{expanded && <span>eu-west-1 {connection}</span>}</div><Btn variant="ghost" onClick={() => setExpanded(!expanded)} title={expanded ? 'Collapse sidebar' : 'Expand sidebar'} aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'} className="w-full border-0 p-2">{expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}{expanded && <span className="text-xs">Collapse navigation</span>}</Btn></div>
    </aside>
    <div className="command-content pb-24">
      <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b bg-card/95 px-5 backdrop-blur lg:px-9"><div className="min-w-0"><div className="font-mono text-[10px] text-muted-foreground">WORKSPACE / ONYXCORE LABS</div><div className="mt-1 text-sm font-bold text-chassis">{current?.title ?? 'Command Center'}</div></div><div className="flex shrink-0 items-center gap-2"><Btn variant="ghost" onClick={() => setSecurity(true)} title="Security Settings" aria-label="Security Settings" className="gap-3 border-0 px-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs text-accent-foreground">{founder.first[0]}</span><span className="hidden text-left sm:block"><span className="block text-xs text-chassis">{founder.name}</span><span className="block font-mono text-[9px] text-muted-foreground">FOUNDER / @{founder.handle}</span></span><KeyRound size={15} className="text-muted-foreground" /></Btn><Btn variant="ghost" onClick={() => void logout()} aria-label="Log out" title="Log out" className="h-9 w-9 border-0 p-0"><LogOut size={16} /></Btn></div></header>
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-9 lg:py-10">{children}</main>
      <SecuritySettings open={security} onClose={() => setSecurity(false)} />
      <CommsDock />
    </div>
  </div>;
}