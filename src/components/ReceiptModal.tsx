import React from 'react';
import { Printer, Share2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { TransaksiPenebusan, KiosSettings } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransaksiPenebusan | null;
  settings?: KiosSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  settings
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*BUKTI PENEBUSAN PUPUK BERSUBSIDI*\n` +
      `*${settings?.nama_kios || 'Kios Pengecer Resmi (KPL)'}*\n` +
      `Kode Kios: ${settings?.kode_kios || '-'}\n` +
      `--------------------------------\n` +
      `No. Transaksi: ${transaction.id_transaksi}\n` +
      `Tanggal: ${new Date(transaction.timestamp).toLocaleString('id-ID')}\n` +
      `Nama Petani: *${transaction.nama_petani}*\n` +
      `NIK: ${transaction.nik}\n` +
      `Kelompok Tani: ${transaction.poktan}\n` +
      `--------------------------------\n` +
      `Komoditas: ${transaction.jenis_pupuk}\n` +
      `Jumlah: *${transaction.jumlah_zak} Zak* (${transaction.jumlah_kg} Kg)\n` +
      `Harga HET: Rp ${transaction.harga_per_kg.toLocaleString('id-ID')}/Kg\n` +
      `*TOTAL BAYAR: Rp ${transaction.total_bayar.toLocaleString('id-ID')}*\n` +
      `Metode: ${transaction.metode_bayar || 'Tunai'}\n` +
      `--------------------------------\n` +
      `Status: SAH (Sesuai Alokasi e-RDKK)\n` +
      `_Simpan bukti ini sebagai tanda penebusan sah._`;

    const encoded = encodeURI(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-w-none print:shadow-none print:rounded-none">
        {/* Header - Hidden on Print */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800 text-sm">Nota Penebusan Sah</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content Printable Area */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-slate-800">
          {/* Header Toko */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-bold text-base font-sans text-slate-900 tracking-tight">
              {settings?.nama_kios || 'KIOS PENGECER RESMI'}
            </h2>
            <p className="text-[11px] text-slate-600">Kode KPL: {settings?.kode_kios || 'KPL-XXXX'}</p>
            <p className="text-[10px] text-slate-500">{settings?.wilayah || 'Wilayah Kerja Pertanian'}</p>
            <p className="text-[10px] text-slate-500">Telp/WA: {settings?.kontak || '-'}</p>
          </div>

          {/* Meta Info Transaksi */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Trx:</span>
              <span className="font-semibold">{transaction.id_transaksi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{new Date(transaction.timestamp).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Petugas:</span>
              <span>{transaction.petugas || 'Kasir KPL'}</span>
            </div>
          </div>

          {/* Data Petani */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Petani:</span>
              <span className="font-bold font-sans">{transaction.nama_petani}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NIK:</span>
              <span>{transaction.nik}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Poktan:</span>
              <span className="truncate max-w-[170px]">{transaction.poktan}</span>
            </div>
          </div>

          {/* Rincian Pembelian */}
          <div className="py-3 border-b border-slate-300 space-y-2">
            <div className="flex justify-between font-bold text-slate-900 font-sans">
              <span>{transaction.jenis_pupuk}</span>
              <span>Rp {transaction.total_bayar.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>
                {transaction.jumlah_zak} Zak ({transaction.jumlah_kg} Kg) @ Rp {transaction.harga_per_kg.toLocaleString('id-ID')}/Kg
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 pb-2 space-y-1.5 font-sans">
            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
              <span>TOTAL BAYAR:</span>
              <span className="text-base text-emerald-700">Rp {transaction.total_bayar.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Metode Bayar:</span>
              <span className="font-semibold text-slate-700">{transaction.metode_bayar || 'Tunai'}</span>
            </div>
          </div>

          {/* Bukti Foto & TTD jika ada */}
          {(transaction.ttd_base64 || transaction.foto_base64) && (
            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-around">
              {transaction.foto_base64 && (
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 mb-1">Foto KTP/Penerima</p>
                  <img
                    src={transaction.foto_base64}
                    alt="KTP"
                    className="w-16 h-12 object-cover rounded border border-slate-300 mx-auto"
                  />
                </div>
              )}
              {transaction.ttd_base64 && (
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 mb-1">Tanda Tangan</p>
                  <img
                    src={transaction.ttd_base64}
                    alt="TTD"
                    className="w-16 h-12 object-contain bg-slate-50 rounded border border-slate-300 mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* Footer Struk */}
          <div className="mt-4 pt-2 text-center text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center justify-center space-x-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TERVERIFIKASI SISTEM e-RDKK</span>
            </div>
            <p>Pupuk bersubsidi dilarang diperjualbelikan kembali di atas HET pemerintah.</p>
            <p className="font-mono text-[9px] text-slate-400">--- Terima Kasih ---</p>
          </div>
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 print:hidden">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs active:scale-95 transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WA</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs active:scale-95 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};

