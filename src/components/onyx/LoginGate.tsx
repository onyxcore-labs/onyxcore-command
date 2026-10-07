import { useState } from "react";
import { Emblem } from "./Emblem";
import { useSession } from "./session";
import { Btn, inputCls } from "./ui";

export function LoginGate() {
  const { login } = useSession();
  const [v, setV] = useState("");
  const [err, setErr] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        className="panel w-full max-w-sm p-8 text-center"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(!login(v));
        }}
      >
        <div className="flex justify-center"><Emblem size={56} /></div>
        <h1 className="mt-4 text-xl font-bold text-chassis">Founder Terminal</h1>
        <p className="mt-1 font-mono text-[11px] tracking-wider text-muted-foreground">ENTER YOUR SURNAME PASSCODE</p>
        <input
          autoFocus
          type="password"
          value={v}
          onChange={(e) => setV(e.target.value)}
          className={`${inputCls} mt-6 text-center font-mono tracking-widest`}
          placeholder="••••••••"
        />
        {err && <p className="mt-2 font-mono text-xs text-destructive">ACCESS DENIED // UNKNOWN FOUNDER</p>}
        <Btn type="submit" className="mt-4 w-full">Authenticate</Btn>
      </form>
    </div>
  );
}
