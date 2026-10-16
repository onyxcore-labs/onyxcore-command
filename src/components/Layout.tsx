import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Cpu, Users, Compass, LogOut, Shield, Lock } from 'lucide-react';
import { useAuth, INITIAL_FOUNDERS } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { currentFounder, login, logout } = useAuth();
  const [handle, setHandle] = useState('ghambuna');
  const [passcode, setPasscode] = useState('ghambuna');
  const [err, setErr] = useState<string | null>(null);

  if (!currentFounder) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0c1017] border border-emerald-500/30 rounded-2xl p-7 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <img src="/avatar.svg" alt="OnyxCore" className="w-10 h-10" />
            <div>
              <h1 className="font-black text-lg text-white tracking-wide">ONYXCORE COMMAND</h1>
              <p className="font-mono text-[10px] text-emerald-400 tracking-widest">FOUNDER ACCESS GATE</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 my-4">
            {INITIAL_FOUNDERS.map((f) => (
              <button
                key={f.handle}
                type="button"
                onClick={() => { setHandle(f.handle); setPasscode(f.handle); setErr(null); }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  handle === f.handle
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-white">{f.fullName}</div>
                <div className="font-mono text-[10px] text-emerald-400">@{f.handle}</div>
              </button>
            ))}
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await login(handle, passcode);
              if (!res.ok) setErr(res.error || 'Login failed');
            }}
            className="space-y-3"
          >
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Founder handle"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
            />
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode (default: surname)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
            />
            {err && (
              <div className="text-xs font-mono text-red-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> {err}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider"
            >
              Authenticate Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  const nav = [
    { to: '/', label: 'Operational Hub', icon: LayoutDashboard },
    { to: '/inventory', label: 'Hardware Inventory', icon: Cpu },
    { to: '/squad', label: 'Squad Sync', icon: Users },
    { to: '/radar', label: 'Project Radar', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex">
      <aside className="w-60 bg-[#0c1017] border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-slate-800">
            <img src="/avatar.svg" alt="OnyxCore" className="w-8 h-8" />
            <div>
              <div className="font-black text-sm text-white">ONYXCORE</div>
              <div className="font-mono text-[9px] text-emerald-400">COMMAND CENTER</div>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{n.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white">{currentFounder.fullName}</div>
            <div className="font-mono text-[10px] text-emerald-400">@{currentFounder.handle}</div>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};