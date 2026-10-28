import React from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  Boxes, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  Sparkles 
} from 'lucide-react';
import type { Petani, StokPupuk, TransaksiPenebusan, KiosSettings } from '../types';
import type { TabType } from '../components/BottomNav';

interface DashboardViewProps {
  stokList: StokPupuk[];
  petaniList: Petani[];
  transactions: TransaksiPenebusan[];
  settings?: KiosSettings;
  onNavigate: (tab: TabType) => void;
  onViewReceipt: (trx: TransaksiPenebusan) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stokList,
  petaniList,
  transactions,
  settings,
  onNavigate,
  onViewReceipt
}) => {
  // Hitung transaksi hari ini
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrx = transactions.filter(t => t.timestamp.startsWith(todayStr));
  const todayTotalRp = todayTrx.reduce((acc, t) => acc + t.total_bayar, 0);
  const todayTotalKg = todayTrx.reduce((acc, t) => acc + t.jumlah_kg, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome Banner Kios */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative grain/glow */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sistem e-RDKK Siap
            </span>
            <span className="text-[11px] text-emerald-200">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight leading-snug">
            {settings?.nama_kios || 'Kios Tani Barokah'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            {settings?.kode_kios ? `ID: ${settings.kode_kios}` : 'Pengecer Resmi Bersubsidi'} • {settings?.wilayah || 'Kecamatan'}
          </p>

          {/* Today Summary Strip */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-600/50">
            <div>
              <p className="text-[11px] text-emerald-200 font-medium">Penebusan Hari Ini</p>
              <p className="text-lg font-black tracking-tight">
                Rp {todayTotalRp.toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-emerald-200 font-medium">Volume Pupuk Keluar</p>
              <p className="text-lg font-black tracking-tight">
                {todayTotalKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-emerald-200">Kg</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Call to Action: Tebus Sekarang */}
      <button
        onClick={() => onNavigate('penebusan')}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all group font-bold text-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg shadow-inner">
            ⚡
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span>Catat Penebusan Baru</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-md uppercase">
                HET
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-normal">Cek NIK, kuota petani, foto & tanda tangan</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Stock Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>Sisa Stok Fisik Kios</span>
          </h3>
          <button
            onClick={() => onNavigate('stok')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            Kelola Stok <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {stokList.map(stok => {
            const zakCount = Math.floor(stok.stok_kg / (stok.id_pupuk === 'ORGANIK' ? 40 : 50));
            const isLow = stok.stok_kg < 1000;
            return (
              <div
                key={stok.id_pupuk}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase">
                      {stok.id_pupuk}
                    </span>
                    {isLow && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Stok Menipis" />
                    )}
                  </div>
                  <p className="text-base font-black text-slate-900 leading-tight">
                    {stok.stok_kg.toLocaleString('id-ID')}
                    <span className="text-[10px] font-normal text-slate-500 ml-0.5">kg</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    ± {zakCount} Zak
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  HET: Rp {stok.het_per_kg.toLocaleString('id-ID')}/kg
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Directory & Master Data Status */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigate('petani')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all text-left flex items-center space-x-3 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500">Petani e-RDKK</p>
            <p className="text-sm font-bold text-slate-800">{petaniList.length} Jiwa</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('laporan')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all text-left flex items-center space-x-3 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500">Form F6 & Excel</p>
            <p className="text-sm font-bold text-slate-800">Export Laporan</p>
          </div>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Penebusan Terakhir</span>
          </h3>
          <button
            onClick={() => onNavigate('riwayat')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Lihat Semua ({transactions.length})
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs">Belum ada transaksi penebusan.</p>
            <p className="text-[11px] text-slate-400">Tekan tombol Tebus Sekarang untuk memulai.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map(trx => (
              <div
                key={trx.id_transaksi}
                onClick={() => onViewReceipt(trx)}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-xl px-1.5 transition-colors"
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {trx.jenis_pupuk.slice(0, 3)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-800 text-xs truncate max-w-[150px]">
                      {trx.nama_petani}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                      {trx.jumlah_zak} Zak ({trx.jumlah_kg} Kg) • {trx.poktan}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900">
                    Rp {trx.total_bayar.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(trx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

