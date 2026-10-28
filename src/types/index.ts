export interface Petani {
  id?: number;
  nik: string;
  nama: string;
  poktan: string;
  desa: string;
  sub_district: string;
  kuota_urea_kg: number;
  kuota_npk_kg: number;
  kuota_organik_kg: number;
  tertebus_urea_kg: number;
  tertebus_npk_kg: number;
  tertebus_organik_kg: number;
  updated_at?: string;
}

export interface StokPupuk {
  id?: number;
  id_pupuk: 'UREA' | 'NPK' | 'ORGANIK' | string;
  nama_pupuk: string;
  stok_kg: number;
  het_per_kg: number;
  het_per_zak: number;
  satuan: string;
  updated_at?: string;
}

export interface TransaksiPenebusan {
  id?: number;
  id_transaksi: string;
  timestamp: string;
  nik: string;
  nama_petani: string;
  poktan: string;
  desa?: string;
  jenis_pupuk: string;
  jumlah_kg: number;
  jumlah_zak: number;
  harga_per_kg: number;
  total_bayar: number;
  metode_bayar: string;
  petugas: string;
  foto_base64?: string;
  foto_url?: string;
  ttd_base64?: string;
  ttd_url?: string;
  synced: boolean;
  sync_error?: string;
}

export interface KiosSettings {
  id?: number;
  key?: string;
  nama_kios: string;
  kode_kios: string;
  pemilik: string;
  wilayah: string;
  distributor: string;
  kontak: string;
  gas_url: string;
  last_sync?: string;
}

export interface RiwayatStokMasuk {
  id?: number;
  no_do: string;
  tanggal: string;
  id_pupuk: string;
  jumlah_zak: number;
  jumlah_kg: number;
  distributor: string;
  catatan?: string;
}

