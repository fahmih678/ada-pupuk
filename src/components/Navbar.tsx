import React from 'react';
import { Wifi, WifiOff, RefreshCw, Sparkles } from 'lucide-react';
import type { KiosSettings } from '../types';

interface NavbarProps {
  settings?: KiosSettings;
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isOnline,
  pendingCount,
  isSyncing,
  onSync
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-700 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm text-xl shadow-inner">
            🌾
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight flex items-center gap-1.5">
              <span>Ada Pupuk</span>
              <span className="text-[10px] font-semibold bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded-full border border-emerald-600/40">
                KPL
              </span>
            </h1>
            <p className="text-xs text-emerald-100/80 truncate max-w-[170px]">
              {settings?.nama_kios || 'Kios Pengecer Resmi'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Online / Offline status */}
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${
              isOnline
                ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-600/50'
                : 'bg-amber-600/90 text-amber-50 border border-amber-500 animate-pulse'
            }`}
            title={isOnline ? 'Terhubung ke Internet' : 'Mode Offline'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-300" /> : <WifiOff className="w-3 h-3 text-amber-200" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Sync Pending Badge & Action */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className={`relative p-2 rounded-lg transition-all ${
              pendingCount > 0
                ? 'bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold shadow-md active:scale-95'
                : 'bg-emerald-800/60 text-emerald-100 hover:bg-emerald-800 active:scale-95'
            }`}
            title={pendingCount > 0 ? `${pendingCount} data menunggu sinkronisasi` : 'Sinkronkan data'}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-white' : ''}`} />
            {pendingCount > 0 && !isSyncing && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-700">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

