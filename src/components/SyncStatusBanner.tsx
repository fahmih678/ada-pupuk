import React from 'react';
import { WifiOff, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SyncStatusBannerProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSync: () => void;
  syncMessage?: string | null;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  onSync,
  syncMessage
}) => {
  if (isOnline && pendingCount === 0 && !syncMessage) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-amber-900 text-xs">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Mode Offline Aktif</p>
              <p className="text-[11px] text-amber-700">
                Penebusan tetap bisa dicatat. Data akan tersimpan di HP dan otomatis disinkronkan saat ada sinyal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Sync Banner */}
      {pendingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-blue-900 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold">
                {pendingCount} Transaksi Menunggu Sinkronisasi
              </p>
              <p className="text-[11px] text-blue-700">Tersimpan di IndexedDB browser perangkat Anda.</p>
            </div>
          </div>
          <button
            onClick={onSync}
            disabled={isSyncing || !isOnline}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs active:scale-95 transition-all shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Kirim Sekarang'}</span>
          </button>
        </div>
      )}

      {/* Sync Notification Toast/Message */}
      {syncMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center space-x-2 text-emerald-800 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}
    </div>
  );
};

