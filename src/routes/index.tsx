import { createFileRoute } from "@tanstack/react-router";
import { BootScreen } from "@/components/onyx/BootScreen";
import { Logotype } from "@/components/onyx/Emblem";
import { LoginGate } from "@/components/onyx/LoginGate";
import { SessionProvider, useSession } from "@/components/onyx/session";
import { SquadSync } from "@/components/onyx/SquadSync";
import { ReposHub } from "@/components/onyx/ReposHub";
import { Inventory } from "@/components/onyx/Inventory";
import { Radar } from "@/components/onyx/Radar";
import { CommsDock } from "@/components/onyx/CommsDock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnyxCore Command Center — Founder Operations" },
      { name: "description", content: "Real-time founder operations platform and hardware testbed for OnyxCore Labs." },
      { property: "og:title", content: "OnyxCore Command Center" },
      { property: "og:description", content: "Squad sync, hardware inventory, project radar and AI advisor for the OnyxCore founders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SessionProvider>
      <BootScreen />
      <App />
    </SessionProvider>
  ),
});

function App() {
  const { founder, ready, logout } = useSession();
  if (!ready) return null;
  if (!founder) return <LoginGate />;
  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Logotype />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-chassis">{founder.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{founder.role.toUpperCase()}</div>
            </div>
            <button onClick={logout} className="rounded-lg border px-3 py-1.5 font-mono text-[10px] text-muted-foreground hover:bg-muted">LOG OUT</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-12 px-6 py-8">
        <SquadSync />
        <ReposHub />
        <Inventory />
        <Radar />
      </main>
      <CommsDock />
    </div>
  );
}
