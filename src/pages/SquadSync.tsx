import React from 'react';
import { useAuth } from '../context/AuthContext';

export const SquadSync: React.FC = () => {
  const { founders } = useAuth();
  return (
    <div className="space-y-6">
      <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5">
        <h1 className="text-2xl font-black text-white">Squad Sync & Live Blocker Board</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {founders.map((f) => (
          <div key={f.handle} className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between">
              <h3 className="text-base font-bold text-white">{f.fullName}</h3>
              <span className="font-mono text-xs text-emerald-400">@{f.github}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{f.currentTask}</p>
            <div className="mt-3 text-xs font-mono text-amber-400">
              {f.blocker ? `BLOCKER: ${f.blocker}` : 'CLEAR // IN FLOW'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};