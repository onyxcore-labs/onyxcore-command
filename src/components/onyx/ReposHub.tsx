import { useState } from "react";
import { Pill, SectionHead } from "./ui";

type Repo = { name: string; branch: string; health: "passing" | "failing" | "pending"; prs: number; commits: { sha: string; msg: string; by: string; ago: string }[] };

// Sample data until a GitHub connection is added.
const SEED: Repo[] = [
  { name: "onyx-command-center", branch: "main", health: "passing", prs: 3, commits: [
    { sha: "a41c9e2", msg: "feat: squad sync realtime board", by: "shamba", ago: "12m" },
    { sha: "7be03d1", msg: "fix: boot screen skip on Esc", by: "shamba", ago: "2h" },
  ] },
  { name: "onyx-telemetry-firmware", branch: "dev/nbiot", health: "pending", prs: 1, commits: [
    { sha: "c9902fa", msg: "SIM7080G PSM power profile", by: "ghambuna", ago: "38m" },
    { sha: "11ad4e0", msg: "DS18B20 1-Wire retry logic", by: "ghambuna", ago: "5h" },
  ] },
  { name: "onyx-backend-core", branch: "main", health: "failing", prs: 2, commits: [
    { sha: "e0f7b33", msg: "ingest: batch telemetry writes", by: "mchele", ago: "1h" },
    { sha: "5d2a918", msg: "schema: device_readings v2", by: "mchele", ago: "1d" },
  ] },
];

export function ReposHub() {
  const [repos] = useState(SEED);

  return (
    <section>
      <SectionHead tag="MODULE B // ARCHITECTURE HUB" title="Projects & Repositories" action={<span className="font-mono text-[10px] text-muted-foreground">SAMPLE DATA</span>} />
      <div className="grid gap-4 lg:grid-cols-3">
        {repos.map((r) => (
          <div key={r.name} className="panel p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 break-words font-mono text-sm font-bold text-chassis">{r.name}</div>
              <Pill tone={r.health === "passing" ? "ok" : r.health === "failing" ? "alert" : "warn"}>{r.health}</Pill>
            </div>
            <div className="mt-2 flex gap-3 font-mono text-[11px] text-muted-foreground">
              <span>⎇ {r.branch}</span><span className="text-gold">{r.prs} open PRs</span>
            </div>
            <ul className="mt-4 space-y-2 border-t pt-3">
              {r.commits.map((c) => (
                <li key={c.sha} className="flex flex-wrap gap-2 text-xs">
                  <span className="font-mono text-primary">{c.sha}</span>
                  <span className="min-w-0 flex-1 break-words text-chassis-2">{c.msg}</span>
                  <span className="font-mono text-muted-foreground">{c.by} · {c.ago}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
