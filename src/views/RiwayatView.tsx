import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ChevronRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import type { TransaksiPenebusan } from '../types';

interface RiwayatViewProps {
  transactions: TransaksiPenebusan[];
  onViewReceipt: (trx: TransaksiPenebusan) => void;
  onNavigateToExport?: () => void;
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({
  transactions,
  onViewReceipt,
  onNavigateToExport
}) => {
  const [search, setSearch] = useState('');
  const [filterPupuk, setFilterPupuk] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch =
        !search ||
        t.nama_petani.toLowerCase().includes(search.toLowerCase()) ||
        t.nik.includes(search) ||
        t.poktan.toLowerCase().includes(search.toLowerCase()) ||
        t.id_transaksi.toLowerCase().includes(search.toLowerCase());

      const matchPupuk =
        filterPupuk === 'ALL' || t.jenis_pupuk.toUpperCase().includes(filterPupuk);

      const matchDate = !filterDate || t.timestamp.startsWith(filterDate);

      return matchSearch && matchPupuk && matchDate;
    });
  }, [transactions, search, filterPupuk, filterDate]);

  const totalRpFiltered = filteredTransactions.reduce((acc, t) => acc + t.total_bayar, 0);
  const totalKgFiltered = filteredTransactions.reduce((acc, t) => acc + t.jumlah_kg, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Riwayat Transaksi</h2>
          <p className="text-xs text-slate-500">Daftar seluruh catatan penebusan kios</p>
        </div>
        {onNavigateToExport && (
          <button
            onClick={onNavigateToExport}
            className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIK, Nama Petani, No Trx..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Pupuk Filter */}
          <select
            value={filterPupuk}
            onChange={e => setFilterPupuk(e.target.value)}
            className="flex-1 py-1.5 px-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 outline-none font-medium"
          >
            <option value="ALL">Semua Pupuk</option>
            <option value="UREA">Urea</option>
            <option value="NPK">NPK Phonska</option>
            <option value="ORGANIK">Organik</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="flex-1 py-1 px-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 outline-none font-medium"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-[10px] text-slate-400 hover:text-slate-600 px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary Box */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
        <span className="text-emerald-800 font-medium">
          Ditemukan: <strong>{filteredTransactions.length} Transaksi</strong>
        </span>
        <span className="text-emerald-900 font-bold">
          Rp {totalRpFiltered.toLocaleString('id-ID')} ({totalKgFiltered.toLocaleString('id-ID')} kg)
        </span>
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-xs font-semibold">Tidak ada transaksi ditemukan.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci atau tanggal filter.</p>
          </div>
        ) : (
          filteredTransactions.map(trx => (
            <div
              key={trx.id_transaksi}
              onClick={() => onViewReceipt(trx)}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between active:scale-[0.99]"
            >
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[160px]">
                    {trx.nama_petani}
                  </span>
                  {trx.synced ? (
                    <span className="flex items-center space-x-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Sync</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-0.5 text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Lokal</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-mono">
                  {trx.id_transaksi} • {new Date(trx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </p>

                <p className="text-xs text-slate-700 font-semibold">
                  {trx.jenis_pupuk} — {trx.jumlah_zak} Zak ({trx.jumlah_kg} Kg)
                </p>
              </div>

              <div className="text-right shrink-0 flex items-center space-x-2">
                <div>
                  <p className="text-xs font-black text-slate-900">
                    Rp {trx.total_bayar.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {trx.metode_bayar || 'Tunai'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

