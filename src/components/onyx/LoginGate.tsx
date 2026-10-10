import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, ArrowRight, LockKeyhole } from 'lucide-react';
import { FOUNDERS } from '@/lib/founders';
import { Emblem } from './Emblem';
import { useSession } from './session';
import { Btn, Field, inputCls } from './ui';
export function LoginGate() {
  const { login } = useSession();
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [passcode, setPasscode] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className="flex min-h-screen items-center justify-center px-5 py-12">
    <form className="panel w-full max-w-md p-8" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(''); try { await login(handle, passcode); await navigate({ to: '/' }); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in'); } finally { setBusy(false); } }}>
      <div className="mb-8 flex items-center gap-3"><Emblem size={44} /><div><div className="text-2xl font-extrabold text-chassis">ONYX<span className="font-light text-primary">CORE</span></div><div className="font-mono text-[10px] text-muted-foreground">LABS / FOUNDER OPERATIONS</div></div></div>
      <div className="mb-2 flex items-center gap-2 text-primary"><LockKeyhole size={16} /><span className="font-mono text-xs">FOUNDER ACCESS</span></div>
      <h1 className="text-2xl font-bold text-chassis">Welcome to the command center.</h1>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">Your focus. Your squad. One workspace.</p>
      <Field label="Founder Username / Handle"><select autoFocus required className={inputCls} value={handle} onChange={(e) => setHandle(e.target.value)}><option value="">Select founder</option>{FOUNDERS.map((f) => <option key={f.handle} value={f.handle}>{f.name} · @{f.handle}</option>)}</select></Field>
      <Field label="Passcode"><div className="relative"><input required autoComplete="current-password" aria-label="Passcode" type={show ? 'text' : 'password'} value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`${inputCls} pr-12`} /><Btn type="button" variant="ghost" title={show ? 'Hide passcode' : 'Show passcode'} aria-label={show ? 'Hide passcode' : 'Show passcode'} className="absolute right-1 top-1 h-8 w-9 border-0 p-0" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Btn></div></Field>
      {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
      <Btn type="submit" disabled={busy} className="mt-2 w-full py-3">{busy ? 'Verifying…' : 'Enter Command Center'}<ArrowRight size={16} /></Btn>
      <div className="mt-6 border-t pt-4 font-mono text-[10px] text-muted-foreground">ONYXCORE LABS · FOUNDER TERMINAL</div>
    </form>
  </div>;
}
