import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
 const ref = useRef<HTMLDialogElement>(null);
 useEffect(() => { ref.current?.showModal(); }, []);
 return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><header><h2>{title}</h2><Button variant="ghost" aria-label="Close dialog" title="Close" onClick={onClose}><X size={18}/></Button></header>{children}</dialog>;
}