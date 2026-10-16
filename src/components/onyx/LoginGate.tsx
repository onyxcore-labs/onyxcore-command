import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Eye, EyeOff, ArrowRight, LockKeyhole, UserPlus, MailCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { requestJoin } from '@/lib/founder-auth.functions';
import { Emblem } from './Emblem';
import { useSession } from './session';
import { useTeam } from './useTeam';
import { Btn, Field, inputCls } from './ui';

export function LoginGate() {
  const [mode, setMode] = useState<'login' | 'join' | 'sent'>('login');
  return <div className="flex min-h-screen items-center justify-center px-5 py-12">
    <div className="panel w-full max-w-md p-8">
      <div className="mb-8 flex items-center gap-3"><Emblem size={44} /><div><div className="text-2xl font-extrabold text-chassis">ONYX<span className="font-light text-primary">CORE</span></div><div className="font-mono text-[10px] text-muted-foreground">LABS / TEAM OPERATIONS</div></div></div>
      {mode === 'login' && <LoginForm onJoin={() => setMode('join')} />}
      {mode === 'join' && <JoinForm onBack={() => setMode('login')} onSent={() => setMode('sent')} />}
      {mode === 'sent' && <div>
        <div className="mb-2 flex items-center gap-2 text-primary"><MailCheck size={16} /><span className="font-mono text-xs">REQUEST SENT</span></div>
        <h1 className="text-2xl font-bold text-chassis">Check your email.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Click the confirmation link we sent you. Once a founder approves your request, sign in with your handle and passcode.</p>
        <Btn className="mt-6 w-full py-3" onClick={() => setMode('login')}>Back to sign in</Btn>
      </div>}
      <div className="mt-6 border-t pt-4 font-mono text-[10px] text-muted-foreground">ONYXCORE LABS · TEAM TERMINAL</div>
    </div>
  </div>;
}

function LoginForm({ onJoin }: { onJoin: () => void }) {
  const { login } = useSession();
  const { team } = useTeam();
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [passcode, setPasscode] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(''); try { await login(handle, passcode); await navigate({ to: '/' }); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in'); } finally { setBusy(false); } }}>
    <div className="mb-2 flex items-center gap-2 text-primary"><LockKeyhole size={16} /><span className="font-mono text-xs">TEAM ACCESS</span></div>
    <h1 className="text-2xl font-bold text-chassis">Welcome to the command center.</h1>
    <p className="mb-6 mt-2 text-sm text-muted-foreground">Your focus. Your squad. One workspace.</p>
    <Field label="Username / Handle"><select autoFocus required className={inputCls} value={handle} onChange={(e) => setHandle(e.target.value)}><option value="">Select team member</option>{team.map((f) => <option key={f.handle} value={f.handle}>{f.name} · @{f.handle}</option>)}</select></Field>
    <Field label="Passcode"><div className="relative"><input required autoComplete="current-password" aria-label="Passcode" type={show ? 'text' : 'password'} value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`${inputCls} pr-12`} /><Btn type="button" variant="ghost" title={show ? 'Hide passcode' : 'Show passcode'} aria-label={show ? 'Hide passcode' : 'Show passcode'} className="absolute right-1 top-1 h-8 w-9 border-0 p-0" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Btn></div></Field>
    {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
    <Btn type="submit" disabled={busy} className="mt-2 w-full py-3">{busy ? 'Verifying…' : 'Enter Command Center'}<ArrowRight size={16} /></Btn>
    <Btn type="button" variant="ghost" className="mt-3 w-full py-2 text-xs" onClick={onJoin}><UserPlus size={14} />New here? Request to join</Btn>
  </form>;
}

function JoinForm({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const submit = useServerFn(requestJoin);
  const [f, setF] = useState({ name: '', handle: '', role: '', email: '', passcode: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return <form onSubmit={async (e) => {
    e.preventDefault(); setError('');
    if (f.passcode !== f.confirm) { setError('Passcodes do not match'); return; }
    if (f.passcode.length < 6) { setError('Passcode must be at least 6 characters'); return; }
    setBusy(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email: f.email.trim(), password: f.passcode, options: { emailRedirectTo: window.location.origin } });
      if (authError) throw authError;
      if (!data.user || (data.user.identities && data.user.identities.length === 0)) throw new Error('That email is already registered');
      await submit({ data: { userId: data.user.id, email: f.email.trim(), handle: f.handle, name: f.name, role: f.role, passcode: f.passcode } });
      onSent();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send request'); }
    finally { setBusy(false); }
  }}>
    <div className="mb-2 flex items-center gap-2 text-primary"><UserPlus size={16} /><span className="font-mono text-xs">REQUEST TO JOIN</span></div>
    <h1 className="mb-5 text-2xl font-bold text-chassis">Join the squad.</h1>
    <Field label="Full name"><input required maxLength={80} className={inputCls} value={f.name} onChange={set('name')} /></Field>
    <Field label="Handle (used to sign in)"><input required maxLength={24} pattern="[a-z][a-z0-9_]{2,23}" title="Starts with a lowercase letter, then lowercase letters, numbers or underscores. 3 to 24 characters. No spaces." placeholder="e.g. blessingm" className={inputCls} value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value.toLowerCase().replace(/\s+/g, "") })} /></Field>
    <Field label="Role"><input required maxLength={80} placeholder="e.g. Embedded Engineer" className={inputCls} value={f.role} onChange={set('role')} /></Field>
    <Field label="Email"><input required type="email" maxLength={255} className={inputCls} value={f.email} onChange={set('email')} /></Field>
    <Field label="Passcode"><input required type="password" autoComplete="new-password" minLength={6} maxLength={128} className={inputCls} value={f.passcode} onChange={set('passcode')} /></Field>
    <Field label="Confirm passcode"><input required type="password" autoComplete="new-password" maxLength={128} className={inputCls} value={f.confirm} onChange={set('confirm')} /></Field>
    {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
    <Btn type="submit" disabled={busy} className="mt-2 w-full py-3">{busy ? 'Sending…' : 'Send request'}</Btn>
    <Btn type="button" variant="ghost" className="mt-3 w-full py-2 text-xs" onClick={onBack}>Back to sign in</Btn>
  </form>;
}
