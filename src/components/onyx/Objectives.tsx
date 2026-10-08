import { useEffect, useState } from 'react';
import { Check, ArrowUpRight, CircleAlert, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FOUNDERS, isOnline } from '@/lib/founders';
import { MILESTONES, clampProgress } from '@/lib/objectives';
import { useSession } from './session';
import { useLiveTable } from './useLiveTable';
import { Btn, Pill, inputCls } from './ui';

export function Objectives() {
  const { founder } = useSession();
  const { rows, reload } = useLiveTable('founder_status', 'handle');
  const me = rows.find((r) => r.handle === founder?.handle);
  const [focus, setFocus] = useState('');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((v) => v + 1), 30_000); return () => clearInterval(id); }, []);
  useEffect(() => { if (me) { setFocus(me.current_task); setNotes(me.blocker ?? ''); setProgress(me.progress_pct); setBlocked(Boolean(me.blocker)); } }, [me?.current_task, me?.blocker, me?.progress_pct]);
  if (!founder) return null;
  if (!me) return <p className="py-12 text-muted-foreground">Loading your objectives…</p>;
  const milestones = MILESTONES[founder.handle] ?? [];
  const done = Array.isArray(me.completed_milestones) ? me.completed_milestones.filter((v): v is string => typeof v === 'string') : [];
  async function update(patch: { current_task?: string; progress_pct?: number; blocker?: string | null; completed_milestones?: string[] }) {
    const { error } = await supabase.from('founder_status').update({ ...patch, last_active: new Date().toISOString(), is_online: true }).eq('handle', founder?.handle ?? '');
    if (error) toast.error('Unable to save objectives', { description: error.message });
    else await reload();
  }
  return <section>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><div className="mb-2 font-mono text-[10px] text-gold">PERSONAL WORKSPACE / @{founder.handle.toUpperCase()}</div><h1 className="text-3xl font-extrabold text-chassis">My Objectives</h1><p className="mt-2 text-sm text-muted-foreground">{founder.first}'s sprint · {founder.role}</p></div><Pill tone={blocked ? 'warn' : 'ok'}>{blocked ? 'Impediment / Stalled' : 'Clear // In Flow'}</Pill></div>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
      <div className="min-w-0">
        <div className="flex items-center gap-2 border-b pb-3 text-primary"><Target size={18} /><span className="font-mono text-xs font-semibold">ACTIVE FOCUS</span></div>
        <textarea aria-label="Active Focus" value={focus} onChange={(e) => setFocus(e.target.value)} onBlur={() => { if (focus !== me.current_task) void update({ current_task: focus }); }} rows={3} className="mt-5 w-full resize-none border-0 bg-transparent text-2xl font-semibold leading-relaxed text-chassis outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" placeholder="What are you moving forward?" />
        <div className="mt-6 flex items-end justify-between"><div><div className="font-mono text-xs text-muted-foreground">SPRINT PROGRESS VELOCITY</div><div className="mt-1 text-sm text-chassis-2">Execution progress</div></div><div className="text-3xl font-extrabold text-primary">{progress}<span className="text-lg">%</span></div></div>
        <input aria-label="Sprint Progress Velocity" type="range" min={0} max={100} value={progress} onChange={(e) => { const pct = clampProgress(Number(e.target.value)); setProgress(pct); void update({ progress_pct: pct }); }} className="mt-5 h-2 w-full accent-[var(--primary)]" />
        <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>0% / START</span><span>100% / COMPLETE</span></div>
        <div className="mt-9 border-t pt-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-chassis">Blocker Engine</h2><CircleAlert size={17} className={blocked ? 'text-gold' : 'text-primary'} /></div>
          <Btn variant={blocked ? 'gold' : 'ghost'} aria-pressed={blocked} className="w-full justify-between py-3" onClick={() => { const next = !blocked; setBlocked(next); if (!next) setNotes(''); void update({ blocker: next ? notes || 'Impediment / Stalled' : null }); }}>{blocked ? 'IMPEDIMENT / STALLED' : 'CLEAR // IN FLOW'}<span className={`h-2 w-2 rounded-full ${blocked ? 'bg-card' : 'bg-primary'}`} /></Btn>
          {blocked && <textarea aria-label="Impediment notes" rows={3} className={`${inputCls} mt-3`} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => void update({ blocker: notes.trim() || 'Impediment / Stalled' })} placeholder="What do you need from the squad?" />}
        </div>
      </div>
      <div className="border-t pt-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0"><div className="flex justify-between"><h2 className="font-bold text-chassis">Domain Milestones</h2><span className="font-mono text-xs text-primary">{done.length}/{milestones.length}</span></div><p className="mt-2 text-xs text-muted-foreground">{founder.role}</p><div className="mt-6 divide-y">{milestones.map((m) => <label key={m} className="flex cursor-pointer items-start gap-3 py-4"><input type="checkbox" checked={done.includes(m)} onChange={(e) => void update({ completed_milestones: e.target.checked ? [...done, m] : done.filter((x) => x !== m) })} className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]" /><span className={`text-sm leading-relaxed ${done.includes(m) ? 'text-muted-foreground line-through' : 'text-chassis-2'}`}>{m}</span>{done.includes(m) && <Check size={15} className="ml-auto mt-1 shrink-0 text-primary" />}</label>)}</div></div>
    </div>
    <div className="mt-10 border-t pt-6"><div className="mb-4 flex items-center gap-2"><h2 className="text-sm font-bold text-chassis">Squad Quick-Pulse</h2><ArrowUpRight size={14} className="text-muted-foreground" /></div><div className="grid gap-4 md:grid-cols-3">{FOUNDERS.filter((f) => f.handle !== founder.handle).map((f) => { const r = rows.find((row) => row.handle === f.handle); return <div key={f.handle} className="flex min-w-0 items-start gap-3 border-l-2 border-border pl-4"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${r && isOnline(r) ? 'bg-primary' : 'bg-muted-foreground/40'}`} /><div className="min-w-0"><div className="text-sm font-bold text-chassis">{f.first}<span className="ml-2 font-mono text-[10px] font-normal text-muted-foreground">{r?.progress_pct ?? 0}%</span></div><p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{r?.current_task || 'No active focus'}</p>{r?.blocker && <div className="mt-1 text-xs text-gold">{r.blocker}</div>}</div></div>; })}</div></div>
  </section>;
}