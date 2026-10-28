import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  UserCheck, 
  Check, 
  AlertCircle, 
  Camera, 
  PenTool, 
  ShoppingBag, 
  ArrowLeft,
  X,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import type { Petani, StokPupuk, TransaksiPenebusan } from '../types';
import { CameraCapture } from '../components/CameraCapture';
import { SignatureModal } from '../components/SignatureModal';

interface PenebusanViewProps {
  petaniList: Petani[];
  stokList: StokPupuk[];
  onSaveTransaction: (trx: Omit<TransaksiPenebusan, 'id'>) => Promise<TransaksiPenebusan>;
  onCancel?: () => void;
}

export const PenebusanView: React.FC<PenebusanViewProps> = ({
  petaniList,
  stokList,
  onSaveTransaction,
  onCancel
}) => {
  // Search & Selected Farmer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPetani, setSelectedPetani] = useState<Petani | null>(null);

  // Transaction Inputs
  const [selectedPupuk, setSelectedPupuk] = useState<'UREA' | 'NPK' | 'ORGANIK'>('UREA');
  const [satuanInput, setSatuanInput] = useState<'zak' | 'kg'>('zak');
  const [jumlahInput, setJumlahInput] = useState<number>(1);
  const [metodeBayar, setMetodeBayar] = useState<string>('Tunai');

  // Verification
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [ttdBase64, setTtdBase64] = useState<string | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered farmers for autocomplete
  const filteredPetani = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return petaniList.filter(
      p => p.nama.toLowerCase().includes(q) || p.nik.includes(q) || p.poktan.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, petaniList]);

  // Active Stock Info
  const activeStok = useMemo(() => {
    return stokList.find(s => s.id_pupuk === selectedPupuk) || {
      id_pupuk: selectedPupuk,
      nama_pupuk: selectedPupuk,
      stok_kg: 0,
      het_per_kg: selectedPupuk === 'UREA' ? 2250 : selectedPupuk === 'NPK' ? 2300 : 800,
      het_per_zak: selectedPupuk === 'UREA' ? 112500 : selectedPupuk === 'NPK' ? 115000 : 32000,
      satuan: 'Kg'
    };
  }, [selectedPupuk, stokList]);

  // Berat per zak (Organik biasanya 40kg, Urea & NPK 50kg)
  const beratPerZak = selectedPupuk === 'ORGANIK' ? 40 : 50;

  // Total Kg & Zak
  const totalKg = satuanInput === 'zak' ? jumlahInput * beratPerZak : jumlahInput;
  const totalZak = satuanInput === 'zak' ? jumlahInput : Number((jumlahInput / beratPerZak).toFixed(1));
  const totalBayar = totalKg * activeStok.het_per_kg;

  // Sisa Kuota Petani
  const sisaKuota = useMemo(() => {
    if (!selectedPetani) return 0;
    if (selectedPupuk === 'UREA') {
      return Math.max(0, (selectedPetani.kuota_urea_kg || 0) - (selectedPetani.tertebus_urea_kg || 0));
    } else if (selectedPupuk === 'NPK') {
      return Math.max(0, (selectedPetani.kuota_npk_kg || 0) - (selectedPetani.tertebus_npk_kg || 0));
    } else {
      return Math.max(0, (selectedPetani.kuota_organik_kg || 0) - (selectedPetani.tertebus_organik_kg || 0));
    }
  }, [selectedPetani, selectedPupuk]);

  // Validations
  const exceedsQuota = selectedPetani ? totalKg > sisaKuota : false;
  const exceedsStock = totalKg > activeStok.stok_kg;
  const isValid = selectedPetani && totalKg > 0 && !exceedsQuota && !exceedsStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !selectedPetani || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const idTrx = `TRX-${datePart}-${randomSuffix}`;

      await onSaveTransaction({
        id_transaksi: idTrx,
        timestamp: now.toISOString(),
        nik: selectedPetani.nik,
        nama_petani: selectedPetani.nama,
        poktan: selectedPetani.poktan,
        desa: selectedPetani.desa,
        jenis_pupuk: activeStok.nama_pupuk || selectedPupuk,
        jumlah_kg: totalKg,
        jumlah_zak: totalZak,
        harga_per_kg: activeStok.het_per_kg,
        total_bayar: totalBayar,
        metode_bayar: metodeBayar,
        petugas: 'Kasir KPL',
        foto_base64: fotoBase64 || undefined,
        ttd_base64: ttdBase64 || undefined,
        synced: false
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (c) {
        // ignore if not loaded
      }

      // Reset form
      setSelectedPetani(null);
      setSearchQuery('');
      setJumlahInput(1);
      setFotoBase64(null);
      setTtdBase64(null);
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Form */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Penebusan Pupuk Subsidi</h2>
          <p className="text-xs text-slate-500">Pengecekan alokasi kuota e-RDKK & HET Kementan</p>
        </div>
        {selectedPetani && (
          <button
            onClick={() => {
              setSelectedPetani(null);
              setSearchQuery('');
            }}
            className="text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
          >
            Ganti Petani
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Cari & Pilih Petani */}
        {!selectedPetani ? (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Cari Petani Terdaftar (e-RDKK)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik NIK atau Nama Petani..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition-all placeholder:text-slate-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Farmer Suggestion List */}
            {filteredPetani.length > 0 && (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {filteredPetani.map(p => {
                  const sisaUrea = (p.kuota_urea_kg || 0) - (p.tertebus_urea_kg || 0);
                  const sisaNpk = (p.kuota_npk_kg || 0) - (p.tertebus_npk_kg || 0);
                  return (
                    <div
                      key={p.nik}
                      onClick={() => {
                        setSelectedPetani(p);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-emerald-50/60 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-800">{p.nama}</p>
                        <p className="text-[11px] text-slate-500">
                          NIK: <span className="font-mono text-slate-700">{p.nik}</span> • {p.poktan}
                        </p>
                      </div>
                      <div className="text-right text-[10px] space-y-0.5">
                        <span className="inline-block bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          Urea: {sisaUrea} kg
                        </span>
                        <br />
                        <span className="inline-block bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                          NPK: {sisaNpk} kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery && filteredPetani.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-500">
                Petani tidak ditemukan di data e-RDKK lokal.
              </div>
            )}
          </div>
        ) : (
          /* Petani Info Card */
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedPetani.nama}</h3>
                  <p className="text-[11px] text-slate-600 font-mono">NIK: {selectedPetani.nik}</p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    {selectedPetani.poktan} • {selectedPetani.desa}
                  </p>
                </div>
              </div>
            </div>

            {/* Sisa Kuota Pills */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-200/60 text-center">
              <div className="bg-white/80 rounded-xl p-2 border border-emerald-200">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Sisa Urea</p>
                <p className="text-xs font-black text-slate-800">
                  {Math.max(0, (selectedPetani.kuota_urea_kg || 0) - (selectedPetani.tertebus_urea_kg || 0))}
                  <span className="text-[10px] font-normal text-slate-500 ml-0.5">kg</span>
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-emerald-200">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Sisa NPK</p>
                <p className="text-xs font-black text-slate-800">
                  {Math.max(0, (selectedPetani.kuota_npk_kg || 0) - (selectedPetani.tertebus_npk_kg || 0))}
                  <span className="text-[10px] font-normal text-slate-500 ml-0.5">kg</span>
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-emerald-200">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Sisa Organik</p>
                <p className="text-xs font-black text-slate-800">
                  {Math.max(0, (selectedPetani.kuota_organik_kg || 0) - (selectedPetani.tertebus_organik_kg || 0))}
                  <span className="text-[10px] font-normal text-slate-500 ml-0.5">kg</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pilih Pupuk & Hitung Jumlah */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Pilih Pupuk & Jumlah Tebus
          </label>

          {/* Toggle Jenis Pupuk */}
          <div className="grid grid-cols-3 gap-2">
            {(['UREA', 'NPK', 'ORGANIK'] as const).map(pType => (
              <button
                key={pType}
                type="button"
                onClick={() => setSelectedPupuk(pType)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedPupuk === pType
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pType}
              </button>
            ))}
          </div>

          {/* Sisa Stok Kios & HET Banner */}
          <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-600">
              Stok Kios: <strong className="text-slate-800">{activeStok.stok_kg.toLocaleString('id-ID')} kg</strong>
            </span>
            <span className="text-emerald-700 font-bold">
              HET: Rp {activeStok.het_per_kg.toLocaleString('id-ID')}/kg
            </span>
          </div>

          {/* Input Satuan (Zak vs Kg) & Jumlah */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Jumlah Pembelian:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSatuanInput('zak')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    satuanInput === 'zak' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Zak ({beratPerZak} kg)
                </button>
                <button
                  type="button"
                  onClick={() => setSatuanInput('kg')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    satuanInput === 'kg' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Eceran (Kg)
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setJumlahInput(prev => Math.max(1, prev - 1))}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-lg flex items-center justify-center shrink-0"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                step={satuanInput === 'zak' ? '1' : '5'}
                value={jumlahInput}
                onChange={e => setJumlahInput(Math.max(1, Number(e.target.value) || 1))}
                className="flex-1 py-2 text-center text-lg font-black rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
              <button
                type="button"
                onClick={() => setJumlahInput(prev => prev + 1)}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-lg flex items-center justify-center shrink-0"
              >
                +
              </button>
            </div>

            {/* Quick Chips for Zak */}
            {satuanInput === 'zak' && (
              <div className="flex space-x-2 pt-1">
                {[1, 2, 3, 5, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setJumlahInput(n)}
                    className={`flex-1 py-1 text-xs rounded-lg border font-semibold ${
                      jumlahInput === n ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {n} zak
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Validation Warnings */}
          {exceedsQuota && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Melebihi Kuota!</strong> Sisa alokasi petani hanya {sisaKuota} kg ({totalKg} kg diminta).
              </span>
            </div>
          )}

          {exceedsStock && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center space-x-2 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Stok Kios Kurang!</strong> Sisa stok fisik hanya {activeStok.stok_kg} kg.
              </span>
            </div>
          )}

          {/* Price Calculation Box */}
          <div className="pt-3 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Volume Total:</span>
              <span className="font-semibold text-slate-800">
                {totalZak} Zak ({totalKg.toLocaleString('id-ID')} Kg)
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700">Total Pembayaran (HET):</span>
              <span className="text-xl font-black text-emerald-700">
                Rp {totalBayar.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Verifikasi Lapangan (Foto KTP & Tanda Tangan) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Verifikasi Bukti Penebusan (Opsional tapi Sah)
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Foto KTP / Penerima */}
            <div className="border border-dashed border-slate-300 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
              {fotoBase64 ? (
                <div className="relative w-full">
                  <img
                    src={fotoBase64}
                    alt="Foto KTP"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoBase64(null)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Foto Tersimpan</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full py-3 flex flex-col items-center justify-center text-slate-600 hover:text-emerald-700"
                >
                  <Camera className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="text-xs font-semibold">Ambil Foto KTP</span>
                  <span className="text-[10px] text-slate-400">Kamera HP</span>
                </button>
              )}
            </div>

            {/* Tanda Tangan Digital */}
            <div className="border border-dashed border-slate-300 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
              {ttdBase64 ? (
                <div className="relative w-full">
                  <img
                    src={ttdBase64}
                    alt="Tanda Tangan"
                    className="w-full h-24 object-contain bg-slate-50 rounded-lg p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setTtdBase64(null)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Tanda Tangan Sah</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSignatureOpen(true)}
                  disabled={!selectedPetani}
                  className="w-full py-3 flex flex-col items-center justify-center text-slate-600 hover:text-emerald-700 disabled:opacity-40"
                >
                  <PenTool className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="text-xs font-semibold">Tanda Tangan</span>
                  <span className="text-[10px] text-slate-400">Layar Sentuh HP</span>
                </button>
              )}
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-600 mb-1 block">Metode Pembayaran:</span>
            <div className="grid grid-cols-3 gap-2">
              {['Tunai', 'QRIS', 'Transfer'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodeBayar(m)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border ${
                    metodeBayar === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full py-4 px-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
            isValid && !isSubmitting
              ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-emerald-600/30'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>
            {isSubmitting
              ? 'Menyimpan Transaksi...'
              : !selectedPetani
              ? 'Pilih Petani Terlebih Dahulu'
              : exceedsQuota
              ? 'Melebihi Kuota e-RDKK'
              : `Simpan & Cetak Struk (Rp ${totalBayar.toLocaleString('id-ID')})`}
          </span>
        </button>
      </form>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={base64 => setFotoBase64(base64)}
      />

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        onSave={base64 => setTtdBase64(base64)}
        petaniName={selectedPetani?.nama || ''}
      />
    </div>
  );
};

