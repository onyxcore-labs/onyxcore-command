import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { currentFounder, founders, updateFounderStatus } = useAuth();
  const [task, setTask] = useState(currentFounder?.currentTask || '');
  const [blocker, setBlocker] = useState(currentFounder?.blocker || '');
  const [progress, setProgress] = useState(currentFounder?.progressPct || 75);

  return (
    <div className="space-y-6">
      <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs text-emerald-400 uppercase">ACTIVE WORKSPACE // @{currentFounder?.handle}</span>
          <h1 className="text-2xl font-black text-white mt-1">OnyxCore Command Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">{currentFounder?.role} · {currentFounder?.vertical}</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300">
          SUPABASE // eu-west-1 LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-4">
          <div className="font-mono text-[11px] text-slate-400">1-WIRE DS18B20 BUS</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">3.72°C</div>
          <div className="font-mono text-[10px] text-slate-500 mt-1">GPIO 4 (4.7kΩ Pull-Up)</div>
        </div>
        <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-4">
          <div className="font-mono text-[11px] text-slate-400">FREERTOS SCHEDULER</div>
          <div className="text-lg font-bold text-white font-mono mt-1">vTaskSensorPoll</div>
          <div className="font-mono text-[10px] text-emerald-400 mt-1">Deep-Sleep: 14.2 µA</div>
        </div>
        <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-4">
          <div className="font-mono text-[11px] text-slate-400">POWER RAIL (LM2596)</div>
          <div className="text-2xl font-black text-white font-mono mt-1">4.12V</div>
          <div className="font-mono text-[10px] text-amber-400 mt-1">ADC1_CH6 GPIO 34</div>
        </div>
        <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-4">
          <div className="font-mono text-[11px] text-slate-400">SQUAD ONLINE</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {founders.filter((f) => f.isOnline).length}/4 ACTIVE
          </div>
          <div className="font-mono text-[10px] text-slate-500 mt-1">Realtime WebSocket Sync</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!currentFounder) return;
            updateFounderStatus(currentFounder.handle, {
              currentTask: task,
              blocker: blocker.trim() || null,
              progressPct: progress,
            });
          }}
          className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5 space-y-4"
        >
          <h2 className="text-base font-bold text-white">Update My Sprint Objective & Blocker</h2>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Active Sprint Task</label>
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Blocker (Leave blank if CLEAR // IN FLOW)</label>
            <input
              value={blocker}
              onChange={(e) => setBlocker(e.target.value)}
              placeholder="None"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>
          <div>
            <div className="flex justify-between font-mono text-xs text-slate-400 mb-1">
              <span>Sprint Velocity</span>
              <span className="text-emerald-400">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase"
          >
            Broadcast Sync Update
          </button>
        </form>

        <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-base font-bold text-white">Live 4-Founder Sync Matrix</h2>
          {founders.map((f) => (
            <div key={f.handle} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{f.fullName} <span className="text-emerald-400 font-mono">@{f.handle}</span></div>
                <div className="text-[11px] text-slate-400 mt-0.5">{f.currentTask}</div>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold">{f.progressPct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};