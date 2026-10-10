import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FOUNDERS, isOnline } from "@/lib/founders";
import { useSession } from "./session";
import { useLiveTable } from "./useLiveTable";
import { Btn, Field, Modal, Pill, SectionHead, inputCls } from "./ui";

export function SquadSync() {
  const { founder } = useSession();
  const { rows } = useLiveTable("founder_status", "handle");
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const [open, setOpen] = useState(false);
  const ordered = FOUNDERS.map((f) => rows.find((r) => r.handle === f.handle)).filter(Boolean) as typeof rows;
  const online = ordered.filter((r) => isOnline(r));
  const me = rows.find((r) => r.handle === founder?.handle);

  return (
    <section>
      <SectionHead
        tag="MODULE A // SQUAD SYNC"
        title="Live Blocker Board"
        action={<Btn onClick={() => setOpen(true)}>Update My Status</Btn>}
      />
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b px-1 py-3">
        <span className="h-2 w-2 rounded-full dot-online" />
        <span className="font-mono text-xs font-semibold text-chassis">
          {online.length}/4 ONLINE
        </span>
        <span className="text-sm text-muted-foreground">
          ({online.map((r) => FOUNDERS.find((f) => f.handle === r.handle)?.first).join(", ") || "nobody"})
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {ordered.map((r) => {
          const on = isOnline(r);
          return (
            <div key={r.handle} className="panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-chassis">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
                <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${on ? "dot-online" : "bg-muted-foreground/40"}`} title={on ? "Online" : "Offline"} />
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Current task</div>
              <div className="mt-0.5 min-h-10 text-sm text-chassis-2">{r.current_task || "—"}</div>
              <div className="mt-3">
                {r.blocker ? <Pill tone="alert">STALLED: {r.blocker}</Pill> : <Pill tone="ok">CLEAR // IN FLOW</Pill>}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary-glow transition-all" style={{ width: `${r.progress_pct}%` }} />
                </div>
                <span className="font-mono text-xs font-semibold text-chassis">{r.progress_pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
      {me && <StatusModal open={open} onClose={() => setOpen(false)} row={me} />}
    </section>
  );
}

function StatusModal({ open, onClose, row }: { open: boolean; onClose: () => void; row: { handle: string; current_task: string; blocker: string | null; progress_pct: number } }) {
  const [task, setTask] = useState(row.current_task);
  const [blocked, setBlocked] = useState(!!row.blocker);
  const [blocker, setBlocker] = useState(row.blocker ?? "");
  const [pct, setPct] = useState(row.progress_pct);
  useEffect(() => {
    if (open) {
      setTask(row.current_task);
      setBlocked(!!row.blocker);
      setBlocker(row.blocker ?? "");
      setPct(row.progress_pct);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    await supabase
      .from("founder_status")
      .update({ current_task: task, blocker: blocked && blocker.trim() ? blocker.trim() : null, progress_pct: pct, is_online: true, last_active: new Date().toISOString() })
      .eq("handle", row.handle);
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title="Update My Status">
      <Field label="Current task"><input className={inputCls} value={task} onChange={(e) => setTask(e.target.value)} /></Field>
      <label className="mb-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={blocked} onChange={(e) => setBlocked(e.target.checked)} className="accent-[var(--gold)]" />
        I'm blocked
      </label>
      {blocked && <Field label="Blocker"><input className={inputCls} value={blocker} onChange={(e) => setBlocker(e.target.value)} placeholder="Waiting on API schema" /></Field>}
      <Field label={`Progress — ${pct}%`}>
        <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(+e.target.value)} className="w-full accent-[var(--primary)]" />
      </Field>
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save}>Save & Ping Heartbeat</Btn>
      </div>
    </Modal>
  );
}
