import { useState } from 'react';
import { ArrowUp, ExternalLink, MessageSquare, Plus, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VERDICTS } from '@/lib/founders';
import { useTeam } from './useTeam';
import { safeLink, youtubeId } from '@/lib/objectives';
import { useSession } from './session';
import { useLiveTable } from './useLiveTable';
import { Btn, Field, Modal, SectionHead, inputCls } from './ui';
const categories = ['Hardware / IoT', 'Firmware', 'UI / UX', 'Backend / Data', 'Client / Operations', 'Research', 'Opportunity'];
const empty = { title: '', description: '', source_url: '', category: categories[0] ?? 'Hardware / IoT' };
export function Radar() {
  const { founder, openChat } = useSession();
  const { rows, reload } = useLiveTable('project_ideas', 'created_at', false);
  const { team } = useTeam();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (!f.title.trim() || !founder) return;
    if (f.source_url && !safeLink(f.source_url)) { setError('Enter a valid http or https link.'); return; }
    setBusy(true); setError('');
    const { error: err } = await supabase.from('project_ideas').insert({ ...f, title: f.title.trim(), submitted_by: founder.handle });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setF(empty); setOpen(false); await reload(); toast.success('Opportunity shared');
  }
  async function vote(id: string, verdict: string) {
    const { error: err } = await supabase.from('project_ideas').update({ verdict }).eq('id', id);
    if (err) toast.error('Unable to update verdict'); else await reload();
  }
  async function upvote(id: string) {
    const { error: err } = await supabase.rpc('upvote_project_idea', { p_id: id });
    if (err) toast.error('Unable to upvote'); else await reload();
  }
  return <section>
    <SectionHead tag="MODULE 03 / DISCOVERY & CONSENSUS" title="Social Radar & Ideas" action={<Btn onClick={() => setOpen(true)}><Plus size={15} /> Share Opportunity / Idea</Btn>} />
    <div className="grid items-start gap-5 xl:grid-cols-2">{rows.map((r) => <article key={r.id} className="panel min-w-0 overflow-hidden">
      <div className="p-5"><div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="font-semibold text-chassis">{team.find((x) => x.handle === r.submitted_by)?.name ?? r.submitted_by}</span><span>·</span><time dateTime={r.created_at}>{new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</time><span className="ml-auto rounded-md bg-gold-soft px-2 py-1 font-mono text-[10px] text-gold">{r.category}</span></div><h2 className="break-words text-lg font-bold text-chassis">{r.title}</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{r.description}</p></div>
      {r.source_url && <SourcePreview url={r.source_url} title={r.title} />}
      <div className="p-5"><div className="flex flex-wrap gap-2">{VERDICTS.map((v) => <Btn key={v} variant="ghost" aria-pressed={r.verdict === v} onClick={() => void vote(r.id, v)} className={`px-2.5 py-1.5 text-[11px] ${r.verdict === v ? v === 'Approved for Sprint' ? 'border-primary bg-primary-soft text-accent-foreground' : v === 'Passed / Archived' ? 'border-chassis-2 bg-chassis-2 text-primary-foreground' : 'border-gold bg-gold-soft text-gold' : ''}`}>{v}</Btn>)}</div><div className="mt-5 flex items-center justify-between border-t pt-4"><Btn variant="ghost" aria-label={`Upvote ${r.title}`} onClick={() => void upvote(r.id)} className="gap-2 px-3 py-1.5 text-xs"><ArrowUp size={14} /><span>{r.upvotes}</span><span className="text-muted-foreground">+1</span></Btn><Btn variant="ghost" onClick={() => openChat(`Re: **${r.title}** — `)} className="border-0 px-2 text-xs text-gold"><MessageSquare size={14} />Discuss in Comms</Btn></div></div>
    </article>)}</div>
    {!rows.length && <p className="py-12 text-sm text-muted-foreground">No opportunities shared yet.</p>}
    <Modal open={open} onClose={() => setOpen(false)} title="Share Opportunity / Idea"><form onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Title"><input required className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Link"><input type="url" className={inputCls} value={f.source_url} onChange={(e) => setF({ ...f, source_url: e.target.value })} placeholder="https://" /></Field>
      <Field label="Rationale"><textarea rows={3} className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <Field label="Category"><select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex justify-end gap-2"><Btn type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn type="submit" disabled={busy}>{busy ? 'Sharing…' : 'Share Opportunity'}</Btn></div>
    </form></Modal>
  </section>;
}
function SourcePreview({ url, title }: { url: string; title: string }) {
  const parsed = safeLink(url);
  if (!parsed) return null;
  const id = youtubeId(url);
  const domain = parsed.hostname.replace(/^www\./, '');
  const source = ['x.com', 'twitter.com'].includes(domain) ? 'X / Twitter' : domain === 'github.com' ? 'GitHub' : domain;
  if (id) return <iframe title={`YouTube: ${title}`} src={`https://www.youtube-nocookie.com/embed/${id}`} className="aspect-video w-full border-0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
  return <a href={parsed.href} target="_blank" rel="noopener noreferrer" className="mx-5 flex min-w-0 items-start gap-3 border-y bg-muted/40 px-3 py-4 text-chassis hover:bg-muted"><Link2 size={22} className="mt-1 shrink-0 text-primary" /><div className="min-w-0 flex-1"><div className="font-mono text-[10px] uppercase text-gold">{source}</div><div className="mt-1 break-words text-sm font-semibold">{title}</div><div className="mt-1 truncate text-xs text-muted-foreground">{parsed.href}</div></div><ExternalLink size={15} className="shrink-0 text-muted-foreground" /></a>;
}
