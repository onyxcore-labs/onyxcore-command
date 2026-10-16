import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { changeFounderPasscode } from '@/lib/founder-auth.functions';
import { useSession } from './session';
import { Btn, Field, Modal, inputCls } from './ui';

export function SecuritySettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { token } = useSession();
  const change = useServerFn(changeFounderPasscode);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <Modal open={open} onClose={onClose} title="Security Settings">
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (!token) return;
      if (next !== confirm) { setError('New passcodes do not match'); return; }
      setBusy(true); setError('');
      try {
        await change({ data: { token, current, next, confirm } });
        setCurrent(''); setNext(''); setConfirm('');
        toast.success('Security updated', { description: 'Your founder passcode has been changed.' }); onClose();
      } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update passcode'); }
      finally { setBusy(false); }
    }}>
      <Field label="Current Passcode"><input required maxLength={128} autoComplete="current-password" type="password" className={inputCls} value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
      <Field label="New Passcode"><input required maxLength={128} autoComplete="new-password" type="password" className={inputCls} value={next} onChange={(e) => setNext(e.target.value)} /></Field>
      <Field label="Confirm Passcode"><input required maxLength={128} autoComplete="new-password" type="password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn><Btn disabled={busy} type="submit">{busy ? 'Updating…' : 'Update Passcode'}</Btn></div>
    </form>
  </Modal>;
}