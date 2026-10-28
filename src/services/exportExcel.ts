import * as XLSX from 'xlsx';
import type { TransaksiPenebusan, StokPupuk, KiosSettings } from '../types';

export function exportTransactionsToExcel(
  transactions: TransaksiPenebusan[],
  stokList: StokPupuk[],
  settings?: KiosSettings
) {
  const wb = XLSX.utils.book_new();

  // 1. Data Transaksi Detail
  const rowsTransaksi = transactions.map((t, idx) => ({
    'No': idx + 1,
    'ID Transaksi': t.id_transaksi,
    'Waktu': new Date(t.timestamp).toLocaleString('id-ID'),
    'NIK Petani': `'${t.nik}`,
    'Nama Petani': t.nama_petani,
    'Kelompok Tani': t.poktan,
    'Jenis Pupuk': t.jenis_pupuk,
    'Jumlah (Zak)': t.jumlah_zak,
    'Jumlah (Kg)': t.jumlah_kg,
    'Harga HET / Kg (Rp)': t.harga_per_kg,
    'Total Bayar (Rp)': t.total_bayar,
    'Metode Bayar': t.metode_bayar || 'Tunai',
    'Petugas': t.petugas,
    'Status Sync Sheets': t.synced ? 'Tersinkron' : 'Belum Sync'
  }));

  const wsTransaksi = XLSX.utils.json_to_sheet(rowsTransaksi);
  XLSX.utils.book_append_sheet(wb, wsTransaksi, 'Daftar Transaksi');

  // 2. Rekapitulasi per Kelompok Tani (Poktan)
  const poktanMap: Record<string, { urea_kg: number; npk_kg: number; organik_kg: number; total_rp: number; jumlah_transaksi: number }> = {};

  transactions.forEach(t => {
    const pok = t.poktan || 'Lainnya / Umum';
    if (!poktanMap[pok]) {
      poktanMap[pok] = { urea_kg: 0, npk_kg: 0, organik_kg: 0, total_rp: 0, jumlah_transaksi: 0 };
    }
    const jenis = t.jenis_pupuk.toUpperCase();
    if (jenis.includes('UREA')) {
      poktanMap[pok].urea_kg += t.jumlah_kg;
    } else if (jenis.includes('NPK')) {
      poktanMap[pok].npk_kg += t.jumlah_kg;
    } else if (jenis.includes('ORGANIK')) {
      poktanMap[pok].organik_kg += t.jumlah_kg;
    }
    poktanMap[pok].total_rp += t.total_bayar;
    poktanMap[pok].jumlah_transaksi += 1;
  });

  const rowsPoktan = Object.entries(poktanMap).map(([poktan, data], idx) => ({
    'No': idx + 1,
    'Kelompok Tani (Poktan)': poktan,
    'Realisasi Urea (Kg)': data.urea_kg,
    'Realisasi NPK (Kg)': data.npk_kg,
    'Realisasi Organik (Kg)': data.organik_kg,
    'Total Penebusan (Rp)': data.total_rp,
    'Jumlah Transaksi': data.jumlah_transaksi
  }));

  const wsPoktan = XLSX.utils.json_to_sheet(rowsPoktan);
  XLSX.utils.book_append_sheet(wb, wsPoktan, 'Rekap Poktan');

  // 3. Status Stok Kios
  const rowsStok = stokList.map((s, idx) => ({
    'No': idx + 1,
    'Kode Pupuk': s.id_pupuk,
    'Nama Pupuk Bersubsidi': s.nama_pupuk,
    'Sisa Stok Fisik (Kg)': s.stok_kg,
    'Perkiraan Zak': Math.floor(s.stok_kg / 50),
    'HET Resmi / Kg (Rp)': s.het_per_kg,
    'HET Resmi / Zak (Rp)': s.het_per_zak
  }));

  const wsStok = XLSX.utils.json_to_sheet(rowsStok);
  XLSX.utils.book_append_sheet(wb, wsStok, 'Stok Terkini');

  // Generate nama file
  const dateStr = new Date().toISOString().slice(0, 10);
  const kioskCode = settings?.kode_kios ? `_${settings.kode_kios}` : '';
  const fileName = `Laporan_Penyaluran_Pupuk${kioskCode}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

