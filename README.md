# 🌾 Ada Pupuk - Aplikasi Pencatatan Penyaluran Pupuk Bersubsidi (KPL)

Aplikasi Web Mobile-First (PWA) yang dirancang khusus untuk **Kios Pengecer Lengkap (KPL / Pengecer Resmi Lini IV)** dalam mencatat penyaluran pupuk bersubsidi (Urea, NPK Phonska, dan Organik) sesuai regulasi Kementerian Pertanian & e-RDKK.

Aplikasi ini beroperasi **100% Gratis (Zero Server Cost)** tanpa perlu menyewa database berbayar, memanfaatkan **Google Sheets & Google Drive** sebagai database dan penyimpanan arsip, serta dapat di-hosting gratis selamanya di **Vercel** atau **Cloudflare Pages**.

---

## ✨ Fitur Utama

- 📱 **Mobile-First & PWA (Installable)**: Dapat dipasang langsung ke layar utama (*Home Screen*) HP Android & iPhone seperti aplikasi native tanpa perlu Play Store.
- 📶 **Offline-First (IndexedDB)**: Tetap dapat melakukan transaksi dan mencatat data saat koneksi internet lemah atau mati di daerah pedesaan. Data akan otomatis disinkronkan ke Google Sheets saat internet kembali aktif.
- 🔍 **Validasi Kuota e-RDKK & HET**: Pencarian cepat petani berdasarkan NIK / Nama, menampilkan sisa kuota hak petani, dan menghitung otomatis nominal rupiah sesuai Harga Eceran Tertinggi (HET) per Zak atau per Kg.
- 📷 **Verifikasi Kamera & Tanda Tangan**:
  - Ambil foto KTP / Petani penerima langsung menggunakan kamera smartphone.
  - Tanda tangan digital penerima di layar sentuh HP.
- 🧾 **Nota & Struk Digital**:
  - Cetak struk langsung via printer thermal Bluetooth atau cetak standar.
  - Bagikan bukti transaksi sah langsung ke WhatsApp petani.
- 📊 **Export Laporan Lengkap**:
  - **Export PDF Form F6 KPL**: Format laporan resmi bulanan rekapitulasi penyaluran pupuk bersubsidi tingkat pengecer untuk diserahkan ke Distributor Lini III dan Tim Verval Dinas Pertanian.
  - **Export Excel (.xlsx)**: Rekap mutasi, daftar transaksi lengkap per petani, dan rekap per kelompok tani (Poktan).
- 📦 **Manajemen Stok Kios**: Pencatatan penerimaan stok masuk berdasarkan Nomor Surat Jalan / DO dari distributor.

---

## 🛠️ Tech Stack & Biaya Hosting (100% Gratis)

| Komponen | Teknologi | Biaya |
|---|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS | Gratis |
| **PWA Engine** | Vite PWA Plugin + Service Worker | Gratis |
| **Offline Storage** | Dexie.js (IndexedDB Browser) | Gratis |
| **Backend API** | Google Apps Script (GAS) Web App | Gratis (Akun Google Pribadi) |
| **Database** | Google Spreadsheet (Sheet e-RDKK, Stok, Transaksi) | Gratis (Kapasitas s/d 10 juta sel) |
| **Storage Foto/TTD** | Google Drive (Folder `AdaPupuk_Arsip`) | Gratis (Kapasitas 15 GB Google) |
| **Hosting Web** | Vercel / Cloudflare Pages / GitHub Pages | Gratis (Termasuk SSL/HTTPS & CDN) |

---

## 🚀 Panduan Menjalankan Proyek Lokal

```bash
# 1. Masuk ke direktori proyek
cd /home/fahmih678/Projects/ada-pupuk

# 2. Jalankan development server
npm run dev

# 3. Build untuk production PWA
npm run build
```

---

## ☁️ Panduan Menghubungkan Google Sheets (Database)

Petunjuk lengkap tersedia di file [`google-apps-script/README_SETUP.md`](google-apps-script/README_SETUP.md):

1. Buat Spreadsheet baru di [Google Sheets](https://sheets.new).
2. Buka menu **Ekstensi** > **Apps Script**.
3. Salin seluruh kode dari file [`google-apps-script/Code.gs`](google-apps-script/Code.gs) dan tempel di editor Apps Script.
4. Klik **Deploy** > **New Deployment** > Pilih jenis **Web App** (Execute as: **Me**, Who has access: **Anyone**).
5. Salin URL Web App yang dihasilkan.
6. Buka aplikasi Ada Pupuk > Menu **Setelan** > Tempelkan URL tersebut > Klik **Inisialisasi & Tes Koneksi**.

---

## 🌐 Panduan Deploy Gratis ke Vercel

1. Push folder proyek ini ke repositori GitHub Anda.
2. Buka [Vercel](https://vercel.com) dan login dengan akun GitHub Anda.
3. Klik **Add New** > **Project** > Pilih repositori `ada-pupuk`.
4. Pengaturan build default Vercel sudah otomatis mengenali Vite:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Klik **Deploy**! Dalam ~1 menit, aplikasi Anda sudah live dengan domain HTTPS gratis (contoh: `ada-pupuk.vercel.app`).

