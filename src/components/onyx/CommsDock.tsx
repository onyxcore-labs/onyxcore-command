import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ADVISOR_MODELS, CHANNELS, DEFAULT_MODEL } from "@/lib/founders";
import { askAdvisor } from "@/lib/advisor.functions";
import { useSession } from "./session";
import { Markdown } from "./Markdown";
import type { Row } from "./useLiveTable";

type Msg = Row<"squad_messages">;

export function CommsDock() {
  const { chatPrefill, clearPrefill } = useSession();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"comms" | "ai">("comms");
  const [channel, setChannel] = useState<string>("all-hands");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (chatPrefill) {
      setOpen(true);
      setTab("comms");
      setChannel("all-hands");
      setDraft(chatPrefill);
      clearPrefill();
    }
  }, [chatPrefill, clearPrefill]);

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-chassis px-5 py-3 font-mono text-xs font-semibold text-primary-foreground shadow-xl hover:bg-chassis-2">
        <span className="h-2 w-2 rounded-full dot-online" /> SQUAD TERMINAL
      </button>
    );

  return (
    <div className="panel fixed right-5 bottom-5 z-40 flex h-[560px] max-h-[80vh] w-[400px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden shadow-2xl">
      <div className="flex items-center bg-chassis px-2 pt-2">
        {(["comms", "ai"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-t-lg px-4 py-2 font-mono text-[11px] font-semibold ${tab === t ? "bg-card text-chassis" : "text-muted-foreground hover:text-primary-foreground"}`}>
            {t === "comms" ? "SQUAD COMMS" : "AI ADVISOR"}
          </button>
        ))}
        <button onClick={() => setOpen(false)} className="ml-auto px-3 pb-2 text-muted-foreground hover:text-primary-foreground">✕</button>
      </div>
      {tab === "comms" ? <Comms channel={channel} setChannel={setChannel} draft={draft} setDraft={setDraft} /> : <Advisor />}
    </div>
  );
}

function Comms({ channel, setChannel, draft, setDraft }: { channel: string; setChannel: (c: string) => void; draft: string; setDraft: (s: string) => void }) {
  const { founder } = useSession();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    supabase.from("squad_messages").select("*").eq("channel", channel).order("created_at").limit(200).then(({ data }) => alive && data && setMsgs(data));
    const ch = supabase
      .channel(`msgs-${channel}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "squad_messages", filter: `channel=eq.${channel}` }, (p) => {
        const m = p.new as Msg;
        setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [channel]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const content = draft.trim();
    if (!content || !founder) return;
    const m: Msg = { id: crypto.randomUUID(), sender_handle: founder.handle, sender_name: founder.name, channel, content, created_at: new Date().toISOString() };
    setMsgs((p) => [...p, m]);
    setDraft("");
    await supabase.from("squad_messages").insert(m);
  }

  return (
    <>
      <div className="flex gap-1 overflow-x-auto border-b px-2 py-2">
        {CHANNELS.map((c) => (
          <button key={c} onClick={() => setChannel(c)} className={`shrink-0 rounded-md px-2 py-1 font-mono text-[10px] ${channel === c ? "bg-primary-soft text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>#{c}</button>
        ))}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {msgs.length === 0 && <p className="text-center font-mono text-[11px] text-muted-foreground">No messages in #{channel} yet.</p>}
        {msgs.map((m) => {
          const mine = m.sender_handle === founder?.handle;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-0.5 font-mono text-[10px] text-muted-foreground">{m.sender_name.split(" ")[0]} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 ${mine ? "bg-primary-soft" : "bg-muted"}`}><Markdown text={m.content} /></div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <Composer value={draft} onChange={setDraft} onSend={send} placeholder={`Message #${channel}`} />
    </>
  );
}

function Advisor() {
  const { founder } = useSession();
  const ask = useServerFn(askAdvisor);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send() {
    const content = draft.trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next);
    setDraft("");
    setBusy(true);
    try {
      const { reply } = await ask({ data: { model, founder: founder?.name ?? "a founder", messages: next.slice(-20) } });
      setMsgs((p) => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs((p) => [...p, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="border-b px-3 py-2">
        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-md border bg-card px-2 py-1.5 font-mono text-[11px]">
          {ADVISOR_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label} — {m.hint}</option>)}
        </select>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {msgs.length === 0 && <p className="text-center font-mono text-[11px] text-muted-foreground">Ask about firmware, power budgets, architecture…</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-xl px-3 py-2 ${m.role === "user" ? "bg-primary-soft" : "border bg-card"}`}><Markdown text={m.content} /></div>
          </div>
        ))}
        {busy && <p className="font-mono text-[11px] text-primary">advisor computing…</p>}
        <div ref={end} />
      </div>
      <Composer value={draft} onChange={setDraft} onSend={send} placeholder="Ask the advisor" disabled={busy} />
    </>
  );
}

function Composer({ value, onChange, onSend, placeholder, disabled }: { value: string; onChange: (s: string) => void; onSend: () => void; placeholder: string; disabled?: boolean }) {
  return (
    <form className="flex gap-2 border-t p-2" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
      <textarea
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        placeholder={placeholder}
        className="flex-1 resize-none rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <button disabled={disabled} className="rounded-lg bg-primary px-3 font-mono text-xs font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-50">SEND</button>
    </form>
  );
}
