import { useState } from "react";
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/founders";
import { useTeam } from "./useTeam";
import { useLiveTable } from "./useLiveTable";
import { Btn, Field, Modal, Pill, SectionHead, inputCls } from "./ui";

export function Inventory() {
  const { rows, reload } = useLiveTable("hardware_inventory", "created_at");
  const { team } = useTeam();
  const [cat, setCat] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const visible = rows.filter((r) => !removed.has(r.id));
  const list = cat === "All" ? visible : visible.filter((r) => r.category === cat);

  return (
    <section>
      <SectionHead tag="MODULE C // COMPONENT REGISTRY" title="Hardware Inventory" action={<Btn variant="gold" onClick={() => setOpen(true)}>+ Register Component</Btn>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <Btn variant="ghost" key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`px-3 py-1 text-xs ${cat === c ? "bg-chassis text-primary-foreground" : "text-chassis-2"}`}>{c}</Btn>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <div key={r.id} className="panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-gold">{r.category}</div>
              <button
                type="button"
                aria-label={`Delete ${r.part_name}`}
                title={`Delete ${r.part_name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                onClick={async () => {
                  setRemoved((s) => new Set(s).add(r.id));
                  const { error } = await supabase.from('hardware_inventory').delete().eq('id', r.id);
                  if (error) {
                    setRemoved((s) => { const n = new Set(s); n.delete(r.id); return n; });
                    toast.error('Unable to delete component');
                  } else { toast.success(`${r.part_name} removed`); await reload(); }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 font-bold leading-tight text-chassis">{r.part_name}</div>
            <div className="mt-2 text-xs text-muted-foreground">{r.specs}</div>
            <div className="mt-3 flex items-center justify-between">
              <Pill tone={r.status === "In Stock" ? "ok" : r.status === "Assigned" ? "warn" : "alert"}>{r.status}</Pill>
              <span className="font-mono text-lg font-bold text-chassis">×{r.quantity_available}</span>
            </div>
            <Field label={`Assign ${r.part_name}`}><select className={`${inputCls} mt-3`} value={r.assigned_to ?? ''} onChange={async (e) => {
              const assigned_to = e.target.value || null;
              const { error } = await supabase.from('hardware_inventory').update({ assigned_to, status: r.quantity_available === 0 ? 'Depleted' : assigned_to ? 'Assigned' : 'In Stock' }).eq('id', r.id);
              if (error) toast.error('Unable to update assignment'); else await reload();
            }}><option value="">Unassigned</option>{team.map((f) => <option key={f.handle} value={f.handle}>{f.name}</option>)}</select></Field>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No parts in this category.</p>}
      </div>
      <RegisterModal open={open} onClose={() => { setOpen(false); void reload(); }} />
    </section>
  );
}

function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { team } = useTeam();
  const [f, setF] = useState({ part_name: "", category: CATEGORIES[0] as string, quantity_available: 1, specs: "", assigned_to: "" });
  async function save() {
    if (!f.part_name.trim()) return;
    const qty = Math.max(0, f.quantity_available);
    const { error } = await supabase.from("hardware_inventory").insert({
      ...f,
      quantity_available: qty,
      assigned_to: f.assigned_to || null,
      status: qty === 0 ? "Depleted" : f.assigned_to ? "Assigned" : "In Stock",
    });
    if (error) { toast.error('Unable to register component'); return; }
    setF({ part_name: "", category: CATEGORIES[0], quantity_available: 1, specs: "", assigned_to: "" });
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title="Register Component">
      <Field label="Part name"><input className={inputCls} value={f.part_name} onChange={(e) => setF({ ...f, part_name: e.target.value })} /></Field>
      <Field label="Category">
        <select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </Field>
      <Field label="Quantity"><input type="number" min={0} className={inputCls} value={f.quantity_available} onChange={(e) => setF({ ...f, quantity_available: +e.target.value })} /></Field>
      <Field label="Specs"><input className={inputCls} value={f.specs} onChange={(e) => setF({ ...f, specs: e.target.value })} /></Field>
      <Field label="Assign to">
        <select className={inputCls} value={f.assigned_to} onChange={(e) => setF({ ...f, assigned_to: e.target.value })}>
          <option value="">Unassigned</option>{team.map((x) => <option key={x.handle} value={x.handle}>{x.name}</option>)}
        </select>
      </Field>
      <div className="mt-4 flex justify-end gap-2"><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save}>Register</Btn></div>
    </Modal>
  );
}
