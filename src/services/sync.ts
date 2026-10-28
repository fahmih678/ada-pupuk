import { db } from '../db';
import { postBatchTransactionsToGas, fetchAllFromGas } from './api';
import type { TransaksiPenebusan } from '../types';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  message: string;
}

export async function syncPendingTransactions(): Promise<SyncResult> {
  const settings = await db.settings.toCollection().first();
  const gasUrl = settings?.gas_url;

  if (!gasUrl || !gasUrl.trim()) {
    return {
      success: false,
      syncedCount: 0,
      message: 'URL Google Apps Script belum diatur di Pengaturan.'
    };
  }

  // Ambil transaksi yang belum tersinkron (synced = false)
  const unsyncedList = await db.transaksi.where('synced').equals(0).toArray();
  // Catatan: Di IndexedDB / Dexie boolean false bisa berupa 0 atau false
  const unsyncedReal = unsyncedList.length > 0 
    ? unsyncedList 
    : (await db.transaksi.toArray()).filter(t => !t.synced);

  if (unsyncedReal.length === 0) {
    return {
      success: true,
      syncedCount: 0,
      message: 'Semua data transaksi sudah tersinkron dengan Google Sheets.'
    };
  }

  try {
    const res = await postBatchTransactionsToGas(gasUrl, unsyncedReal);
    if (res.status === 'success') {
      // Tandai transaksi sebagai synced
      for (const trx of unsyncedReal) {
        if (trx.id) {
          await db.transaksi.update(trx.id, {
            synced: true,
            sync_error: undefined
          });
        }
      }

      // Update waktu sync terakhir di settings
      if (settings?.id) {
        await db.settings.update(settings.id, {
          last_sync: new Date().toISOString()
        });
      }

      return {
        success: true,
        syncedCount: unsyncedReal.length,
        message: `Berhasil menyinkronkan ${unsyncedReal.length} transaksi ke Google Sheets!`
      };
    } else {
      return {
        success: false,
        syncedCount: 0,
        message: res.message || 'Gagal sinkronisasi ke Google Apps Script.'
      };
    }
  } catch (err: any) {
    console.error('Error saat sinkronisasi:', err);
    return {
      success: false,
      syncedCount: 0,
      message: `Gagal terhubung: ${err.message || 'Cek koneksi internet Anda.'}`
    };
  }
}

export async function pullLatestFromGoogleSheets(): Promise<{ success: boolean; message: string }> {
  const settings = await db.settings.toCollection().first();
  const gasUrl = settings?.gas_url;

  if (!gasUrl || !gasUrl.trim()) {
    return { success: false, message: 'URL Google Apps Script belum disetel.' };
  }

  try {
    const res = await fetchAllFromGas(gasUrl);
    if (res.status === 'success') {
      // Update Petani
      if (res.petani && res.petani.length > 0) {
        await db.petani.clear();
        await db.petani.bulkAdd(res.petani);
      }

      // Update Stok
      if (res.stok && res.stok.length > 0) {
        await db.stok.clear();
        await db.stok.bulkAdd(res.stok);
      }

      // Update info kios jika ada
      if (res.settings && Object.keys(res.settings).length > 0 && settings?.id) {
        await db.settings.update(settings.id, {
          nama_kios: res.settings.nama_kios || settings.nama_kios,
          kode_kios: res.settings.kode_kios || settings.kode_kios,
          pemilik: res.settings.pemilik || settings.pemilik,
          wilayah: res.settings.wilayah || settings.wilayah,
          distributor: res.settings.distributor || settings.distributor,
          kontak: res.settings.kontak || settings.kontak,
          last_sync: new Date().toISOString()
        });
      }

      return { success: true, message: 'Berhasil mengunduh data terbaru dari Google Sheets!' };
    }
    return { success: false, message: res.message || 'Gagal mengambil data dari Google Sheets.' };
  } catch (err: any) {
    return { success: false, message: `Gagal mengunduh: ${err.message || 'Cek koneksi internet'}` };
  }
}

