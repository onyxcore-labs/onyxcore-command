import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VERDICTS } from "@/lib/founders";
import { useSession } from "./session";
import { useLiveTable } from "./useLiveTable";
import { Btn, Field, Modal, SectionHead, inputCls } from "./ui";

function sourceLabel(url: string) {
  if (/x\.com|twitter\.com/.test(url)) return "X / Twitter";
  if (/linkedin/.test(url)) return "LinkedIn";
  if (/youtu/.test(url)) return "YouTube";
  if (/github/.test(url)) return "GitHub";
  if (/arxiv|doi|ieee|pdf/.test(url)) return "Paper";
  return "Link";
}

export function Radar() {
  const { founder, openChat } = useSession();
  const { rows } = useLiveTable("project_ideas", "created_at", false);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", source_url: "" });

  async function submit() {
    if (!f.title.trim() || !founder) return;
    await supabase.from("project_ideas").insert({ ...f, submitted_by: founder.handle });
    setF({ title: "", description: "", source_url: "" });
    setOpen(false);
  }

  return (
    <section>
      <SectionHead tag="MODULE D // PROJECT RADAR" title="Ideation Feed" action={<Btn onClick={() => setOpen(true)}>+ Submit Idea</Btn>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((r) => (
          <div key={r.id} className="panel flex gap-4 p-5">
            <button
              onClick={() => supabase.from("project_ideas").update({ upvotes: r.upvotes + 1 }).eq("id", r.id)}
              className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg border bg-muted/50 hover:bg-primary-soft"
            >
              <span className="text-xs text-primary">▲</span>
              <span className="font-mono text-sm font-bold text-chassis">{r.upvotes}</span>
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-chassis">{r.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                {r.source_url && <a href={r.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">↗ {sourceLabel(r.source_url)}</a>}
                <span className="text-muted-foreground">by {r.submitted_by}</span>
                <button onClick={() => openChat(`Re: **${r.title}** — `)} className="text-gold hover:underline">💬 discuss in #all-hands</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {VERDICTS.map((v) => (
                  <button
                    key={v}
                    onClick={() => supabase.from("project_ideas").update({ verdict: v }).eq("id", r.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      r.verdict === v
                        ? v === "Approved for Sprint" ? "bg-primary text-primary-foreground" : v === "Passed / Archived" ? "bg-chassis-2 text-primary-foreground" : "bg-gold text-primary-foreground"
                        : "border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >{v}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Submit to Radar">
        <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Rationale"><textarea rows={3} className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Source link"><input className={inputCls} value={f.source_url} onChange={(e) => setF({ ...f, source_url: e.target.value })} placeholder="https://" /></Field>
        <div className="mt-4 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn onClick={submit}>Submit</Btn></div>
      </Modal>
    </section>
  );
}
