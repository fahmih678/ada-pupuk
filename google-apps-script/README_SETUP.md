# Panduan Setup Google Sheets & Google Apps Script (Gratis 100%)

Aplikasi **Ada Pupuk** menggunakan Google Spreadsheet sebagai database utama dan Google Drive untuk arsip foto/tanda tangan tanpa biaya bulanan atau server.

Ikuti 3 langkah mudah berikut untuk menghubungkan aplikasi Anda:

---

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda dengan akun Google Anda.
2. Beri nama spreadsheet Anda, misalnya: `Database Penyaluran Pupuk Bersubsidi - KPL Berkah`.

---

### Langkah 2: Pasang Skrip Google Apps Script
1. Di halaman Google Spreadsheet Anda, klik menu **Ekstensi** > **Apps Script** (*Extensions* > *Apps Script*).
2. Hapus semua teks yang ada di editor skrip (`function myFunction() {}`).
3. Buka file [Code.gs](file:///home/fahmih678/Projects/ada-pupuk/google-apps-script/Code.gs) di proyek ini, copy seluruh kodenya, dan paste ke editor Apps Script.
4. Klik tombol **Simpan** (ikon disket atau `Ctrl + S`).

---

### Langkah 3: Deploy sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** > **New deployment** (*Penerapan baru*).
2. Klik ikon gerigi ⚙️ di samping *Select type*, pilih **Web app**.
3. Isi konfigurasi berikut:
   - **Description**: `API Ada Pupuk v1`
   - **Execute as**: **Me** (Akun Google Anda)
   - **Who has access**: **Anyone** (Siapa saja — *wajib agar aplikasi frontend PWA bisa mengirim data tanpa login OAuth rumit*)
4. Klik tombol **Deploy**.
5. Jika muncul peringatan izin (*Authorization required*):
   - Klik **Authorize access** (Pilih akun Google Anda).
   - Klik **Advanced** (Lanjutan) di kiri bawah pop-up.
   - Klik **Go to Ada Pupuk (unsafe)**.
   - Klik **Allow** (Izinkan).
6. Salin **Web app URL** yang muncul (berakhiran `/exec`).
   *Contoh URL*: `https://script.google.com/macros/s/AKfycbx.../exec`

---

### Langkah 4: Hubungkan ke Aplikasi Ada Pupuk
1. Buka aplikasi **Ada Pupuk** di smartphone atau browser Anda.
2. Masuk ke menu **Pengaturan** (ikon gerigi).
3. Tempelkan URL Web App yang Anda salin tadi ke kolom **URL Google Apps Script**.
4. Klik tombol **Inisialisasi & Tes Koneksi**.
5. Selesai! Spreadsheet Anda otomatis akan terisi sheet `Petani_eRDKK`, `Stok_Kios`, `Transaksi_Penebusan`, dan `Pengaturan_Kios`.

