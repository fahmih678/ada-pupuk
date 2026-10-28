import Dexie, { type EntityTable } from 'dexie';
import type { Petani, StokPupuk, TransaksiPenebusan, KiosSettings, RiwayatStokMasuk } from '../types';

export class AdaPupukDatabase extends Dexie {
  petani!: EntityTable<Petani, 'id'>;
  stok!: EntityTable<StokPupuk, 'id'>;
  transaksi!: EntityTable<TransaksiPenebusan, 'id'>;
  settings!: EntityTable<KiosSettings, 'id'>;
  stok_masuk!: EntityTable<RiwayatStokMasuk, 'id'>;

  constructor() {
    super('AdaPupukDB');
    this.version(1).stores({
      petani: '++id, nik, nama, poktan, desa',
      stok: '++id, id_pupuk',
      transaksi: '++id, id_transaksi, nik, timestamp, synced',
      settings: '++id, key',
      stok_masuk: '++id, no_do, tanggal, id_pupuk'
    });
  }
}

export const db = new AdaPupukDatabase();

export async function initDefaultDataIfNeeded() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      nama_kios: 'Kios Tani Barokah (KPL)',
      kode_kios: 'KPL-3201-901',
      pemilik: 'H. Mochammad Ridwan',
      wilayah: 'Kec. Cibadak, Kab. Sukabumi',
      distributor: 'PT Pupuk Sriwidjaja Distribusi Wilayah',
      kontak: '081234567890',
      gas_url: ''
    });
  }

  const stokCount = await db.stok.count();
  if (stokCount === 0) {
    await db.stok.bulkAdd([
      {
        id_pupuk: 'UREA',
        nama_pupuk: 'Urea Bersubsidi',
        stok_kg: 10000,
        het_per_kg: 2250,
        het_per_zak: 112500,
        satuan: 'Kg / Zak 50kg'
      },
      {
        id_pupuk: 'NPK',
        nama_pupuk: 'NPK Phonska Bersubsidi',
        stok_kg: 8000,
        het_per_kg: 2300,
        het_per_zak: 115000,
        satuan: 'Kg / Zak 50kg'
      },
      {
        id_pupuk: 'ORGANIK',
        nama_pupuk: 'Pupuk Organik Bersubsidi',
        stok_kg: 4000,
        het_per_kg: 800,
        het_per_zak: 32000,
        satuan: 'Kg / Zak 40kg'
      }
    ]);
  }

  const petaniCount = await db.petani.count();
  if (petaniCount === 0) {
    await db.petani.bulkAdd([
      {
        nik: '3201010101800001',
        nama: 'Suryanto Wibowo',
        poktan: 'Poktan Makmur Jaya I',
        desa: 'Sukamaju',
        sub_district: 'Cibadak',
        kuota_urea_kg: 300,
        kuota_npk_kg: 250,
        kuota_organik_kg: 100,
        tertebus_urea_kg: 50,
        tertebus_npk_kg: 50,
        tertebus_organik_kg: 0
      },
      {
        nik: '3201010102850002',
        nama: 'Ahmad Supriyadi',
        poktan: 'Poktan Makmur Jaya I',
        desa: 'Sukamaju',
        sub_district: 'Cibadak',
        kuota_urea_kg: 450,
        kuota_npk_kg: 400,
        kuota_organik_kg: 0,
        tertebus_urea_kg: 100,
        tertebus_npk_kg: 100,
        tertebus_organik_kg: 0
      },
      {
        nik: '3201010103780003',
        nama: 'I Made Wardana',
        poktan: 'Poktan Subak Lestari',
        desa: 'Kertajaya',
        sub_district: 'Cibadak',
        kuota_urea_kg: 500,
        kuota_npk_kg: 500,
        kuota_organik_kg: 200,
        tertebus_urea_kg: 0,
        tertebus_npk_kg: 0,
        tertebus_organik_kg: 0
      },
      {
        nik: '3201010104920004',
        nama: 'Dedi Kurniawan',
        poktan: 'Poktan Harapan Bersama',
        desa: 'Sukamaju',
        sub_district: 'Cibadak',
        kuota_urea_kg: 200,
        kuota_npk_kg: 150,
        kuota_organik_kg: 0,
        tertebus_urea_kg: 50,
        tertebus_npk_kg: 0,
        tertebus_organik_kg: 0
      },
      {
        nik: '3201010105880005',
        nama: 'Hj. Siti Rohmah',
        poktan: 'Poktan Harapan Bersama',
        desa: 'Sukamaju',
        sub_district: 'Cibadak',
        kuota_urea_kg: 350,
        kuota_npk_kg: 300,
        kuota_organik_kg: 150,
        tertebus_urea_kg: 0,
        tertebus_npk_kg: 0,
        tertebus_organik_kg: 0
      }
    ]);
  }
}

