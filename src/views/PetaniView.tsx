import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  X, 
  Check, 
  ShoppingBag, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';
import type { Petani } from '../types';

interface PetaniViewProps {
  petaniList: Petani[];
  onAddPetani: (petani: Omit<Petani, 'id'>) => Promise<void>;
  onSelectPetaniForPenebusan?: (petani: Petani) => void;
}

export const PetaniView: React.FC<PetaniViewProps> = ({
  petaniList,
  onAddPetani,
  onSelectPetaniForPenebusan
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Farmer Form state
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [poktan, setPoktan] = useState('');
  const [desa, setDesa] = useState('');
  const [kuotaUrea, setKuotaUrea] = useState(300);
  const [kuotaNpk, setKuotaNpk] = useState(250);
  const [kuotaOrganik, setKuotaOrganik] = useState(100);

  const filtered = useMemo(() => {
    if (!search.trim()) return petaniList;
    const q = search.toLowerCase();
    return petaniList.filter(
      p => p.nama.toLowerCase().includes(q) || p.nik.includes(q) || p.poktan.toLowerCase().includes(q) || p.desa.toLowerCase().includes(q)
    );
  }, [petaniList, search]);

  const handleSavePetani = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || !nama || !poktan) {
      alert('Harap isi NIK, Nama Petani, dan Kelompok Tani.');
      return;
    }

    // Cek apakah NIK sudah ada
    if (petaniList.some(p => p.nik === nik)) {
      alert('NIK ini sudah terdaftar dalam sistem e-RDKK!');
      return;
    }

    await onAddPetani({
      nik,
      nama,
      poktan,
      desa: desa || 'Desa Setempat',
      sub_district: 'Kecamatan Setempat',
      kuota_urea_kg: Number(kuotaUrea) || 0,
      kuota_npk_kg: Number(kuotaNpk) || 0,
      kuota_organik_kg: Number(kuotaOrganik) || 0,
      tertebus_urea_kg: 0,
      tertebus_npk_kg: 0,
      tertebus_organik_kg: 0
    });

    setIsAddModalOpen(false);
    setNik('');
    setNama('');
    setPoktan('');
    setDesa('');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Data Petani e-RDKK</h2>
          <p className="text-xs text-slate-500">{petaniList.length} Petani terdaftar di kios</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari NIK, Nama, atau Kelompok Tani..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
        />
      </div>

      {/* Farmer Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-xs font-semibold">Petani tidak ditemukan.</p>
          </div>
        ) : (
          filtered.map(p => {
            const sisaUrea = Math.max(0, (p.kuota_urea_kg || 0) - (p.tertebus_urea_kg || 0));
            const pctUrea = p.kuota_urea_kg ? Math.min(100, Math.round(((p.tertebus_urea_kg || 0) / p.kuota_urea_kg) * 100)) : 0;

            const sisaNpk = Math.max(0, (p.kuota_npk_kg || 0) - (p.tertebus_npk_kg || 0));
            const pctNpk = p.kuota_npk_kg ? Math.min(100, Math.round(((p.tertebus_npk_kg || 0) / p.kuota_npk_kg) * 100)) : 0;

            return (
              <div
                key={p.nik}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{p.nama}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">NIK: {p.nik}</p>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {p.poktan} • {p.desa}
                    </p>
                  </div>
                  {onSelectPetaniForPenebusan && (
                    <button
                      onClick={() => onSelectPetaniForPenebusan(p)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Tebus</span>
                    </button>
                  )}
                </div>

                {/* Quota Progress */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Urea */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Urea ({pctUrea}% tertebus)</span>
                      <span className="font-bold text-slate-800">
                        Sisa {sisaUrea} kg <span className="font-normal text-slate-400">/ {p.kuota_urea_kg} kg</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${pctUrea}%` }}
                      />
                    </div>
                  </div>

                  {/* NPK */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>NPK ({pctNpk}% tertebus)</span>
                      <span className="font-bold text-slate-800">
                        Sisa {sisaNpk} kg <span className="font-normal text-slate-400">/ {p.kuota_npk_kg} kg</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${pctNpk}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Farmer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Tambah Petani e-RDKK</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePetani} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK) *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="16 digit NIK KTP..."
                  value={nik}
                  onChange={e => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Petani *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sesuai KTP..."
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kelompok Tani (Poktan) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Poktan Makmur"
                    value={poktan}
                    onChange={e => setPoktan(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sukamaju"
                    value={desa}
                    onChange={e => setDesa(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Alokasi Kuota Tahunan */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-600 uppercase">
                  Alokasi Kuota e-RDKK (Kg/Tahun)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Urea (kg)</label>
                    <input
                      type="number"
                      value={kuotaUrea}
                      onChange={e => setKuotaUrea(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">NPK (kg)</label>
                    <input
                      type="number"
                      value={kuotaNpk}
                      onChange={e => setKuotaNpk(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Organik (kg)</label>
                    <input
                      type="number"
                      value={kuotaOrganik}
                      onChange={e => setKuotaOrganik(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30"
                >
                  Simpan Petani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

