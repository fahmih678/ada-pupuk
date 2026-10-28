import React, { useState } from 'react';
import { 
  Settings, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Store, 
  Save, 
  HelpCircle,
  Database,
  ExternalLink,
  ShieldCheck 
} from 'lucide-react';
import type { KiosSettings } from '../types';
import { pingGas, initGasSpreadsheet } from '../services/api';
import { pullLatestFromGoogleSheets } from '../services/sync';

interface SettingsViewProps {
  settings?: KiosSettings;
  onUpdateSettings: (newSettings: Partial<KiosSettings>) => Promise<void>;
  onRefreshAllData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRefreshAllData
}) => {
  const [gasUrl, setGasUrl] = useState(settings?.gas_url || '');
  const [namaKios, setNamaKios] = useState(settings?.nama_kios || 'Kios Tani Barokah (KPL)');
  const [kodeKios, setKodeKios] = useState(settings?.kode_kios || 'KPL-3201-901');
  const [pemilik, setPemilik] = useState(settings?.pemilik || 'H. Mochammad Ridwan');
  const [wilayah, setWilayah] = useState(settings?.wilayah || 'Kec. Cibadak, Kab. Sukabumi');
  const [distributor, setDistributor] = useState(settings?.distributor || 'PT Pupuk Sriwidjaja Distribusi Wilayah');
  const [kontak, setKontak] = useState(settings?.kontak || '081234567890');

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pullingData, setPullingData] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestAndInit = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ success: false, message: 'Harap masukkan URL Web App Google Apps Script.' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);

    try {
      const isAlive = await pingGas(gasUrl.trim());
      if (isAlive) {
        // Lakukan inisialisasi sheet
        const initRes = await initGasSpreadsheet(gasUrl.trim());
        setTestResult({
          success: true,
          message: 'Berhasil terhubung ke Google Sheets! Struktur tabel e-RDKK siap digunakan.'
        });
        // Simpan URL
        await onUpdateSettings({ gas_url: gasUrl.trim() });
      } else {
        setTestResult({
          success: false,
          message: 'Gagal terhubung. Pastikan Web App disetel ke "Anyone" saat Deployment di Apps Script.'
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${e.message || 'Cek URL dan koneksi internet.'}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handlePullData = async () => {
    setPullingData(true);
    try {
      const res = await pullLatestFromGoogleSheets();
      if (res.success) {
        await onRefreshAllData();
        alert('Data Petani & Stok berhasil diperbarui dari Google Sheets!');
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert(`Gagal sinkron data: ${e.message}`);
    } finally {
      setPullingData(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      nama_kios: namaKios,
      kode_kios: kodeKios,
      pemilik: pemilik,
      wilayah: wilayah,
      distributor: distributor,
      kontak: kontak,
      gas_url: gasUrl.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Setelan & Integrasi Google</h2>
        <p className="text-xs text-slate-500">Konfigurasi database Google Sheets & Profil KPL</p>
      </div>

      {/* Google Spreadsheet Integration Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Koneksi Google Apps Script</h3>
            <p className="text-[11px] text-slate-500">Database & backup cloud gratis 100%</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            URL Web App Google Apps Script
          </label>
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            value={gasUrl}
            onChange={e => setGasUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono outline-none focus:border-emerald-500"
          />
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-1">
          <button
            type="button"
            onClick={handleTestAndInit}
            disabled={testingConnection}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'Menguji...' : 'Inisialisasi & Tes Koneksi'}</span>
          </button>

          <button
            type="button"
            onClick={handlePullData}
            disabled={pullingData || !gasUrl}
            className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center space-x-1 transition-all"
            title="Tarik data terbaru dari Google Sheets"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{pullingData ? 'Tarik...' : 'Unduh Data'}</span>
          </button>
        </div>

        {/* Quick Help Guide Notice */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Panduan 3 Menit Pasang Google Sheets
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            File <code>google-apps-script/Code.gs</code> sudah disertakan dalam proyek ini. Buka Google Sheets &gt; Ekstensi &gt; Apps Script, tempel kode tersebut, dan Deploy sebagai Web App (Akses: Anyone).
          </p>
        </div>
      </div>

      {/* Profil Kios Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Identitas Kios Pengecer (KPL)</h3>
            <p className="text-[11px] text-slate-500">Dicantumkan pada Struk dan Laporan Form F6</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Nama Kios Pengecer Resmi
          </label>
          <input
            type="text"
            required
            value={namaKios}
            onChange={e => setNamaKios(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Kode KPL Resmi
            </label>
            <input
              type="text"
              required
              value={kodeKios}
              onChange={e => setKodeKios(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              No. Kontak / WhatsApp
            </label>
            <input
              type="text"
              value={kontak}
              onChange={e => setKontak(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Nama Pemilik / Penanggung Jawab
          </label>
          <input
            type="text"
            value={pemilik}
            onChange={e => setPemilik(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Wilayah Kerja / Kecamatan / Kabupaten
          </label>
          <input
            type="text"
            value={wilayah}
            onChange={e => setWilayah(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Distributor Lini III Pembina
          </label>
          <input
            type="text"
            value={distributor}
            onChange={e => setDistributor(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        {savedSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profil Kios berhasil disimpan!</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Setelan</span>
        </button>
      </form>
    </div>
  );
};

