import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Truck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import type { StokPupuk, TransaksiPenebusan, RiwayatStokMasuk } from '../types';

interface StokViewProps {
  stokList: StokPupuk[];
  transactions: TransaksiPenebusan[];
  stokMasukList: RiwayatStokMasuk[];
  onAddStokMasuk: (data: Omit<RiwayatStokMasuk, 'id'>) => Promise<void>;
  onUpdateHet?: (idPupuk: string, hetKg: number, hetZak: number) => Promise<void>;
}

export const StokView: React.FC<StokViewProps> = ({
  stokList,
  transactions,
  stokMasukList,
  onAddStokMasuk
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPupuk, setSelectedPupuk] = useState<'UREA' | 'NPK' | 'ORGANIK'>('UREA');
  const [noDo, setNoDo] = useState('');
  const [jumlahZak, setJumlahZak] = useState(200);
  const [distributor, setDistributor] = useState('PT Pupuk Sriwidjaja Distribusi');
  const [catatan, setCatatan] = useState('');

  const beratPerZak = selectedPupuk === 'ORGANIK' ? 40 : 50;
  const totalKgMasuk = jumlahZak * beratPerZak;

  const handleSaveStokMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noDo || jumlahZak <= 0) {
      alert('Harap masukkan Nomor DO / Surat Jalan dan jumlah zak.');
      return;
    }

    await onAddStokMasuk({
      no_do: noDo,
      tanggal: new Date().toISOString(),
      id_pupuk: selectedPupuk,
      jumlah_zak: jumlahZak,
      jumlah_kg: totalKgMasuk,
      distributor: distributor,
      catatan: catatan
    });

    setIsModalOpen(false);
    setNoDo('');
    setCatatan('');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Manajemen Stok Pupuk</h2>
          <p className="text-xs text-slate-500">Penerimaan DO distributor & sisa stok fisik</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Stok Masuk (DO)</span>
        </button>
      </div>

      {/* Stock Cards */}
      <div className="space-y-3">
        {stokList.map(stok => {
          const beratZak = stok.id_pupuk === 'ORGANIK' ? 40 : 50;
          const zakCount = Math.floor(stok.stok_kg / beratZak);
          const isLow = stok.stok_kg < 1000;

          return (
            <div
              key={stok.id_pupuk}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {stok.id_pupuk}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{stok.nama_pupuk}</h3>
                  <p className="text-[11px] text-slate-500">Kemasan {beratZak} Kg / Zak</p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">
                    {stok.stok_kg.toLocaleString('id-ID')}
                    <span className="text-xs font-normal text-slate-500 ml-1">kg</span>
                  </p>
                  <p className="text-xs font-bold text-emerald-700">
                    ± {zakCount.toLocaleString('id-ID')} Zak
                  </p>
                  {isLow && (
                    <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-1 border border-rose-200">
                      Stok Menipis
                    </span>
                  )}
                </div>
              </div>

              {/* HET Rate strip */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">HET Resmi / Kg:</span>
                  <span className="font-bold text-slate-800">Rp {stok.het_per_kg.toLocaleString('id-ID')}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">HET Resmi / Zak:</span>
                  <span className="font-bold text-slate-800">Rp {stok.het_per_zak.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Riwayat Penerimaan DO */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Riwayat Penerimaan DO Distributor</span>
        </h3>

        {stokMasukList.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Belum ada catatan penerimaan stok masuk DO.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stokMasukList.slice(0, 10).map((sm, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    No. DO: {sm.no_do}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {sm.id_pupuk} • {sm.distributor}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(sm.tanggal).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700">
                    +{sm.jumlah_zak} Zak
                  </span>
                  <p className="text-[11px] text-slate-500">({sm.jumlah_kg.toLocaleString('id-ID')} kg)</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Stok Masuk DO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Catat Penerimaan DO</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStokMasuk} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Jenis Pupuk Bersubsidi *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UREA', 'NPK', 'ORGANIK'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPupuk(p)}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        selectedPupuk === p ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Surat Jalan / Delivery Order (DO) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DO/2026/X/00192"
                  value={noDo}
                  onChange={e => setNoDo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Jumlah Zak Diterima *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={jumlahZak}
                  onChange={e => setJumlahZak(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-emerald-700 font-medium mt-1">
                  Setara: {totalKgMasuk.toLocaleString('id-ID')} Kg ({beratPerZak} kg/zak)
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Distributor Pengirim
                </label>
                <input
                  type="text"
                  value={distributor}
                  onChange={e => setDistributor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30"
                >
                  Tambah ke Stok Kios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

