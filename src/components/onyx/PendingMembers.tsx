import { useCallback, useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { listPendingMembers, decideMember } from '@/lib/founder-auth.functions';
import { useSession } from './session';
import { Btn, Pill } from './ui';

type Pending = { id: string; handle: string; full_name: string; role: string; email: string; verified: boolean; created_at: string };

export function PendingMembers() {
  const { token } = useSession();
  const list = useServerFn(listPendingMembers);
  const decide = useServerFn(decideMember);
  const [rows, setRows] = useState<Pending[]>([]);
  const load = useCallback(async () => {
    if (!token) return;
    try { setRows(await list({ data: { token } }) as Pending[]); } catch { /* ignore */ }
  }, [token, list]);
  useEffect(() => { void load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, [load]);
  if (rows.length === 0) return null;
  return <div className="panel mb-6 p-5">
    <h2 className="mb-3 text-sm font-bold text-chassis">Pending members ({rows.length})</h2>
    <div className="space-y-3">{rows.map((r) => <div key={r.id} className="flex flex-wrap items-center gap-3 border-t pt-3">
      <div className="min-w-0 flex-1"><div className="font-bold text-chassis">{r.full_name} <span className="font-mono text-xs font-normal text-muted-foreground">@{r.handle}</span></div><div className="break-words text-xs text-muted-foreground">{r.role} · {r.email}</div></div>
      <Pill tone={r.verified ? 'ok' : 'warn'}>{r.verified ? 'Email verified' : 'Awaiting email'}</Pill>
      {(['approve', 'reject'] as const).map((a) => <Btn key={a} variant={a === 'approve' ? 'primary' : 'ghost'} disabled={a === 'approve' && !r.verified} title={a === 'approve' && !r.verified ? 'They must confirm their email first' : undefined} onClick={async () => {
        try { await decide({ data: { token: token ?? '', id: r.id, approve: a === 'approve' } }); toast.success(a === 'approve' ? `${r.full_name} joined the team` : 'Request rejected'); await load(); }
        catch (err) { toast.error(err instanceof Error ? err.message : 'Unable to update request'); }
      }}>{a === 'approve' ? 'Approve' : 'Reject'}</Btn>)}
    </div>)}</div>
  </div>;
}
