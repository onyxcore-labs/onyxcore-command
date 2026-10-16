import React, { useState } from 'react';

const INITIAL_HW = [
  { id: '1', name: 'ESP32-WROOM-32 DevKit v1', cat: 'ESP32', qty: 4, bus: 'UART / SPI / I2C / 1-Wire' },
  { id: '2', name: 'DS18B20 Waterproof Temp Probe', cat: '1-Wire', qty: 8, bus: 'GPIO 4 (4.7kΩ Pull-Up)' },
  { id: '3', name: 'FreeRTOS v10.5 LTS Kernel', cat: 'RTOS', qty: 1, bus: 'Tickless Idle Deep-Sleep' },
  { id: '4', name: 'Sensirion SHT31-D Probe', cat: 'Sensors', qty: 5, bus: 'I2C (0x44, GPIO 21/22)' },
];

export const Inventory: React.FC = () => {
  const [items] = useState(INITIAL_HW);
  return (
    <div className="space-y-6">
      <div className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5">
        <h1 className="text-2xl font-black text-white">Hardware Component Inventory (ESP32, 1-Wire, RTOS, Sensors)</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.id} className="bg-[#0c1017] border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between font-mono text-xs text-emerald-400">
              <span>{i.cat}</span>
              <span>QTY: {i.qty}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-2">{i.name}</h3>
            <p className="text-xs font-mono text-slate-400 mt-1">Bus: {i.bus}</p>
          </div>
        ))}
      </div>
    </div>
  );
};