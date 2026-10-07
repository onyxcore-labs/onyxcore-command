export function Emblem({ size = 36 }: { size?: number }) {
  return <img src="/favicon.svg" width={size} height={size} alt="OnyxCore emblem" />;
}

export function Logotype() {
  return (
    <div className="flex items-center gap-3">
      <Emblem />
      <div className="leading-none">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-chassis">ONYX</span>
          <span className="-ml-1.5 text-lg font-light tracking-tight text-primary">CORE</span>
          <span className="rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] font-bold text-primary">LABS</span>
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">OPERATIONS PLATFORM</div>
      </div>
    </div>
  );
}
