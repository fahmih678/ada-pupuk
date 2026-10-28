import React, { useState, useEffect, useCallback } from 'react';
import { db, initDefaultDataIfNeeded } from './db';
import type { Petani, StokPupuk, TransaksiPenebusan, KiosSettings, RiwayatStokMasuk } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav, type TabType } from './components/BottomNav';
import { SyncStatusBanner } from './components/SyncStatusBanner';
import { ReceiptModal } from './components/ReceiptModal';
import { syncPendingTransactions } from './services/sync';

import { DashboardView } from './views/DashboardView';
import { PenebusanView } from './views/PenebusanView';
import { RiwayatView } from './views/RiwayatView';
import { PetaniView } from './views/PetaniView';
import { StokView } from './views/StokView';
import { LaporanView } from './views/LaporanView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Database States
  const [petaniList, setPetaniList] = useState<Petani[]>([]);
  const [stokList, setStokList] = useState<StokPupuk[]>([]);
  const [transactions, setTransactions] = useState<TransaksiPenebusan[]>([]);
  const [stokMasukList, setStokMasukList] = useState<RiwayatStokMasuk[]>([]);
  const [settings, setSettings] = useState<KiosSettings | undefined>(undefined);

  // Modals & Contextual States
  const [selectedReceipt, setSelectedReceipt] = useState<TransaksiPenebusan | null>(null);
  const [preselectedPetani, setPreselectedPetani] = useState<Petani | null>(null);

  // Load all data from Dexie
  const loadData = useCallback(async () => {
    await initDefaultDataIfNeeded();

    const [allPetani, allStok, allTrx, allSettings, allSm] = await Promise.all([
      db.petani.toArray(),
      db.stok.toArray(),
      db.transaksi.reverse().toArray(),
      db.settings.toCollection().first(),
      db.stok_masuk.reverse().toArray()
    ]);

    setPetaniList(allPetani);
    setStokList(allStok);
    setTransactions(allTrx);
    setSettings(allSettings);
    setStokMasukList(allSm);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when reconnecting
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hitung jumlah data yang belum disinkronkan ke Sheets
  const pendingCount = transactions.filter(t => !t.synced).length;

  // Trigger Sync Function
  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await syncPendingTransactions();
      if (result.syncedCount > 0) {
        setSyncMessage(result.message);
        setTimeout(() => setSyncMessage(null), 4000);
      }
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Simpan Transaksi Penebusan Baru
  const handleSaveTransaction = async (trxData: Omit<TransaksiPenebusan, 'id'>) => {
    // 1. Simpan ke IndexedDB
    const id = await db.transaksi.add(trxData as any);
    const savedTrx: TransaksiPenebusan = { ...trxData, id: Number(id) };

    // 2. Potong Stok Kios Lokal
    const jenis = trxData.jenis_pupuk.toUpperCase();
    const targetStok = stokList.find(s => jenis.includes(s.id_pupuk));
    if (targetStok && targetStok.id) {
      const newStokKg = Math.max(0, targetStok.stok_kg - trxData.jumlah_kg);
      await db.stok.update(targetStok.id, { stok_kg: newStokKg });
    }

    // 3. Tambah tertebus pada petani lokal
    const targetPetani = petaniList.find(p => p.nik === trxData.nik);
    if (targetPetani && targetPetani.id) {
      if (jenis.includes('UREA')) {
        await db.petani.update(targetPetani.id, {
          tertebus_urea_kg: (targetPetani.tertebus_urea_kg || 0) + trxData.jumlah_kg
        });
      } else if (jenis.includes('NPK')) {
        await db.petani.update(targetPetani.id, {
          tertebus_npk_kg: (targetPetani.tertebus_npk_kg || 0) + trxData.jumlah_kg
        });
      } else if (jenis.includes('ORGANIK')) {
        await db.petani.update(targetPetani.id, {
          tertebus_organik_kg: (targetPetani.tertebus_organik_kg || 0) + trxData.jumlah_kg
        });
      }
    }

    // Reload state
    await loadData();

    // Buka struk nota penebusan
    setSelectedReceipt(savedTrx);

    // Otomatis sinkronkan jika online & ada GAS URL
    if (navigator.onLine && settings?.gas_url) {
      triggerSync();
    }

    return savedTrx;
  };

  // Tambah Petani Baru
  const handleAddPetani = async (petaniData: Omit<Petani, 'id'>) => {
    await db.petani.add(petaniData as any);
    await loadData();
  };

  // Tambah Stok Masuk DO
  const handleAddStokMasuk = async (smData: Omit<RiwayatStokMasuk, 'id'>) => {
    await db.stok_masuk.add(smData as any);

    // Tambah kuota fisik stok kios
    const s = stokList.find(item => item.id_pupuk === smData.id_pupuk);
    if (s && s.id) {
      await db.stok.update(s.id, {
        stok_kg: s.stok_kg + smData.jumlah_kg
      });
    }

    await loadData();
  };

  // Update Settings Kios
  const handleUpdateSettings = async (newSettings: Partial<KiosSettings>) => {
    const existing = await db.settings.toCollection().first();
    if (existing && existing.id) {
      await db.settings.update(existing.id, newSettings);
    } else {
      await db.settings.add(newSettings as any);
    }
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-emerald-600 selection:text-white">
      {/* Mobile Shell Container (Max width 440px for mobile app feel on desktop) */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col shadow-2xl relative">
        {/* Top App Navbar */}
        <Navbar
          settings={settings}
          isOnline={isOnline}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
          onSync={triggerSync}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* Global Status / Offline Notification Banner */}
          <SyncStatusBanner
            isOnline={isOnline}
            pendingCount={pendingCount}
            isSyncing={isSyncing}
            onSync={triggerSync}
            syncMessage={syncMessage}
          />

          {/* Views Routing */}
          {currentTab === 'dashboard' && (
            <DashboardView
              stokList={stokList}
              petaniList={petaniList}
              transactions={transactions}
              settings={settings}
              onNavigate={setCurrentTab}
              onViewReceipt={setSelectedReceipt}
            />
          )}

          {currentTab === 'penebusan' && (
            <PenebusanView
              petaniList={petaniList}
              stokList={stokList}
              onSaveTransaction={handleSaveTransaction}
              onCancel={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'riwayat' && (
            <RiwayatView
              transactions={transactions}
              onViewReceipt={setSelectedReceipt}
              onNavigateToExport={() => setCurrentTab('laporan')}
            />
          )}

          {currentTab === 'petani' && (
            <PetaniView
              petaniList={petaniList}
              onAddPetani={handleAddPetani}
              onSelectPetaniForPenebusan={petani => {
                setPreselectedPetani(petani);
                setCurrentTab('penebusan');
              }}
            />
          )}

          {currentTab === 'stok' && (
            <StokView
              stokList={stokList}
              transactions={transactions}
              stokMasukList={stokMasukList}
              onAddStokMasuk={handleAddStokMasuk}
            />
          )}

          {currentTab === 'laporan' && (
            <LaporanView
              transactions={transactions}
              stokList={stokList}
              settings={settings}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRefreshAllData={loadData}
            />
          )}
        </main>

        {/* Bottom Mobile Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingCount={pendingCount}
        />

        {/* Receipt / Nota Modal */}
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          transaction={selectedReceipt}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default App;

