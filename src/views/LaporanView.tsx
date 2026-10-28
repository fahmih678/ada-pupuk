import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import type { TransaksiPenebusan, StokPupuk, KiosSettings } from '../types';
import { exportTransactionsToExcel } from '../services/exportExcel';
import { exportFormF6Pdf } from '../services/exportPdfF6';

interface LaporanViewProps {
  transactions: TransaksiPenebusan[];
  stokList: StokPupuk[];
  settings?: KiosSettings;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  transactions,
  stokList,
  settings
}) => {
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter transaksi berdasarkan bulan yang dipilih
  const monthlyTransactions = transactions.filter(t => t.timestamp.startsWith(filterMonth));

  // Hitung metrik
  let ureaKg = 0;
  let npkKg = 0;
  let organikKg = 0;
  let totalOmset = 0;
  const uniqueFarmers = new Set<string>();

  monthlyTransactions.forEach(t => {
    uniqueFarmers.add(t.nik);
    totalOmset += t.total_bayar;
    const j = t.jenis_pupuk.toUpperCase();
    if (j.includes('UREA')) ureaKg += t.jumlah_kg;
    else if (j.includes('NPK')) npkKg += t.jumlah_kg;
    else if (j.includes('ORGANIK')) organikKg += t.jumlah_kg;
  });

  const handleExportExcel = () => {
    exportTransactionsToExcel(
      monthlyTransactions.length > 0 ? monthlyTransactions : transactions,
      stokList,
      settings
    );
  };

  const handleExportPdfF6 = () => {
    const dateObj = new Date(filterMonth + '-01');
    const periodName = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    exportFormF6Pdf(
      monthlyTransactions.length > 0 ? monthlyTransactions : transactions,
      settings,
      periodName
    );
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Pusat Laporan & Export</h2>
        <p className="text-xs text-slate-500">Unduh dokumen resmi pertanggungjawaban penyaluran</p>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">Periode Laporan:</span>
        </div>
        <input
          type="month"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500"
        />
      </div>

      {/* Metrics Card for Selected Month */}
      <div className="bg-emerald-900 text-white rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-emerald-800 pb-2">
          <span className="font-semibold text-emerald-200">Realisasi Bulan Ini</span>
          <span className="font-mono bg-emerald-800 px-2 py-0.5 rounded text-[11px]">
            {monthlyTransactions.length} Transaksi
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-800/60 p-2 rounded-xl">
            <p className="text-[10px] text-emerald-300 font-medium">Urea</p>
            <p className="text-sm font-black">{ureaKg.toLocaleString('id-ID')} <span className="text-[10px] font-normal">kg</span></p>
          </div>
          <div className="bg-emerald-800/60 p-2 rounded-xl">
            <p className="text-[10px] text-emerald-300 font-medium">NPK Phonska</p>
            <p className="text-sm font-black">{npkKg.toLocaleString('id-ID')} <span className="text-[10px] font-normal">kg</span></p>
          </div>
          <div className="bg-emerald-800/60 p-2 rounded-xl">
            <p className="text-[10px] text-emerald-300 font-medium">Organik</p>
            <p className="text-sm font-black">{organikKg.toLocaleString('id-ID')} <span className="text-[10px] font-normal">kg</span></p>
          </div>
        </div>

        <div className="flex justify-between items-baseline pt-1 text-xs">
          <span className="text-emerald-200">Total Nilai Penebusan HET:</span>
          <span className="text-base font-black text-amber-300">
            Rp {totalOmset.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Export Action Cards */}
      <div className="space-y-3">
        {/* Card 1: PDF Form F6 KPL */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3 hover:border-emerald-300 transition-all">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-800">Laporan Resmi Form F6 KPL</h3>
                <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded uppercase">
                  PDF
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Format standar pelaporan penyaluran pupuk bersubsidi tingkat pengecer ke distributor & tim Verval dinas pertanian.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportPdfF6}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Form F6 KPL</span>
          </button>
        </div>

        {/* Card 2: Excel (.xlsx) Rekap Penjualan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3 hover:border-emerald-300 transition-all">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-800">Rekapitulasi Penjualan (.xlsx)</h3>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded uppercase">
                  Excel
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                File spreadsheet lengkap dengan sheet transaksi per petani, rekap per kelompok tani (Poktan), dan sisa stok kios.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportExcel}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download File Excel (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

