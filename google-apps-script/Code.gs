/**
 * ADA PUPUK - GOOGLE APPS SCRIPT BACKEND
 * API Web App gratis untuk Aplikasi Pencatatan Penyaluran Pupuk Bersubsidi (KPL)
 * Terhubung langsung ke Google Sheets & Google Drive
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'getData';
  
  if (action === 'ping') {
    return createJsonResponse({ status: 'success', message: 'Ada Pupuk API is active' });
  }
  
  if (action === 'init') {
    return createJsonResponse(initializeSpreadsheet());
  }
  
  if (action === 'getData') {
    return createJsonResponse(getAllData());
  }

  return createJsonResponse({ status: 'error', message: 'Aksi GET tidak dikenali: ' + action });
}

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '';
    var payload = {};
    if (rawData) {
      payload = JSON.parse(rawData);
    }
    
    var action = payload.action;

    if (action === 'init') {
      return createJsonResponse(initializeSpreadsheet());
    }

    if (action === 'syncTransaction') {
      return createJsonResponse(saveTransaction(payload.transaction));
    }

    if (action === 'syncBatch') {
      return createJsonResponse(saveBatchTransactions(payload.transactions));
    }

    if (action === 'addStokMasuk') {
      return createJsonResponse(addStokMasuk(payload.data));
    }

    if (action === 'updateSettings') {
      return createJsonResponse(updateSettings(payload.settings));
    }

    return createJsonResponse({ status: 'error', message: 'Aksi POST tidak dikenali: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Inisialisasi struktur sheet otomatis jika belum dibuat
 */
function initializeSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Petani_eRDKK
  var sheetPetani = ss.getSheetByName('Petani_eRDKK');
  if (!sheetPetani) {
    sheetPetani = ss.insertSheet('Petani_eRDKK');
    var headersPetani = [
      'nik', 'nama', 'poktan', 'desa', 'sub_district', 
      'kuota_urea_kg', 'kuota_npk_kg', 'kuota_organik_kg', 
      'tertebus_urea_kg', 'tertebus_npk_kg', 'tertebus_organik_kg'
    ];
    sheetPetani.appendRow(headersPetani);
    sheetPetani.getRange(1, 1, 1, headersPetani.length).setFontWeight('bold').setBackground('#dcfce7');
    
    // Sample Petani
    sheetPetani.appendRow(['3201010101800001', 'Suryanto Wibowo', 'Poktan Makmur Jaya I', 'Sukamaju', 'Cibadak', 300, 250, 100, 0, 0, 0]);
    sheetPetani.appendRow(['3201010102850002', 'Ahmad Supriyadi', 'Poktan Makmur Jaya I', 'Sukamaju', 'Cibadak', 450, 400, 0, 0, 0, 0]);
    sheetPetani.appendRow(['3201010103780003', 'I Made Wardana', 'Poktan Subak Lestari', 'Kertajaya', 'Cibadak', 500, 500, 200, 0, 0, 0]);
    sheetPetani.appendRow(['3201010104920004', 'Dedi Kurniawan', 'Poktan Harapan Bersama', 'Sukamaju', 'Cibadak', 200, 150, 0, 0, 0, 0]);
    sheetPetani.appendRow(['3201010105880005', 'Hj. Siti Rohmah', 'Poktan Harapan Bersama', 'Sukamaju', 'Cibadak', 350, 300, 150, 0, 0, 0]);
  }

  // 2. Sheet Stok_Kios
  var sheetStok = ss.getSheetByName('Stok_Kios');
  if (!sheetStok) {
    sheetStok = ss.insertSheet('Stok_Kios');
    var headersStok = ['id_pupuk', 'nama_pupuk', 'stok_kg', 'het_per_kg', 'het_per_zak', 'satuan'];
    sheetStok.appendRow(headersStok);
    sheetStok.getRange(1, 1, 1, headersStok.length).setFontWeight('bold').setBackground('#fef08a');
    
    // Sample Stok awal (HET resmi Kementan)
    sheetStok.appendRow(['UREA', 'Urea Bersubsidi', 10000, 2250, 112500, 'Kg / Zak 50kg']);
    sheetStok.appendRow(['NPK', 'NPK Phonska Bersubsidi', 8000, 2300, 115000, 'Kg / Zak 50kg']);
    sheetStok.appendRow(['ORGANIK', 'Pupuk Organik Bersubsidi', 4000, 800, 32000, 'Kg / Zak 40kg']);
  }

  // 3. Sheet Transaksi_Penebusan
  var sheetTrx = ss.getSheetByName('Transaksi_Penebusan');
  if (!sheetTrx) {
    sheetTrx = ss.insertSheet('Transaksi_Penebusan');
    var headersTrx = [
      'id_transaksi', 'timestamp', 'nik', 'nama_petani', 'poktan', 
      'jenis_pupuk', 'jumlah_kg', 'jumlah_zak', 'harga_per_kg', 'total_bayar', 
      'metode_bayar', 'petugas', 'foto_url', 'ttd_url'
    ];
    sheetTrx.appendRow(headersTrx);
    sheetTrx.getRange(1, 1, 1, headersTrx.length).setFontWeight('bold').setBackground('#bae6fd');
  }

  // 4. Sheet Pengaturan_Kios
  var sheetConfig = ss.getSheetByName('Pengaturan_Kios');
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet('Pengaturan_Kios');
    sheetConfig.appendRow(['key', 'value']);
    sheetConfig.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#e2e8f0');
    sheetConfig.appendRow(['nama_kios', 'Kios Tani Barokah (KPL-001)']);
    sheetConfig.appendRow(['kode_kios', 'KPL-3201-901']);
    sheetConfig.appendRow(['pemilik', 'H. Mochammad Ridwan']);
    sheetConfig.appendRow(['wilayah', 'Kec. Cibadak, Kab. Sukabumi']);
    sheetConfig.appendRow(['distributor', 'PT Pupuk Sriwidjaja Distribusi Wilayah']);
    sheetConfig.appendRow(['kontak', '081234567890']);
  }

  // Hapus 'Sheet1' default jika ada
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  return { status: 'success', message: 'Google Sheets berhasil diinisialisasi!' };
}

/**
 * Mengambil seluruh data terkini
 */
function getAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Data Petani
  var sheetPetani = ss.getSheetByName('Petani_eRDKK');
  var dataPetani = [];
  if (sheetPetani) {
    var rowsPetani = sheetPetani.getDataRange().getValues();
    if (rowsPetani.length > 1) {
      var headers = rowsPetani[0];
      for (var i = 1; i < rowsPetani.length; i++) {
        var row = rowsPetani[i];
        if (row[0]) {
          var item = {};
          for (var h = 0; h < headers.length; h++) {
            item[headers[h]] = row[h];
          }
          dataPetani.push(item);
        }
      }
    }
  }

  // Data Stok
  var sheetStok = ss.getSheetByName('Stok_Kios');
  var dataStok = [];
  if (sheetStok) {
    var rowsStok = sheetStok.getDataRange().getValues();
    if (rowsStok.length > 1) {
      var headersStok = rowsStok[0];
      for (var s = 1; s < rowsStok.length; s++) {
        var rStok = rowsStok[s];
        if (rStok[0]) {
          var sItem = {};
          for (var hs = 0; hs < headersStok.length; hs++) {
            sItem[headersStok[hs]] = rStok[hs];
          }
          dataStok.push(sItem);
        }
      }
    }
  }

  // Pengaturan Kios
  var sheetConfig = ss.getSheetByName('Pengaturan_Kios');
  var settings = {};
  if (sheetConfig) {
    var rowsConfig = sheetConfig.getDataRange().getValues();
    for (var c = 1; c < rowsConfig.length; c++) {
      if (rowsConfig[c][0]) {
        settings[rowsConfig[c][0]] = rowsConfig[c][1];
      }
    }
  }

  // Transaksi Terakhir (Maksimal 200 transaksi)
  var sheetTrx = ss.getSheetByName('Transaksi_Penebusan');
  var dataTrx = [];
  if (sheetTrx) {
    var rowsTrx = sheetTrx.getDataRange().getValues();
    if (rowsTrx.length > 1) {
      var headersTrx = rowsTrx[0];
      var start = Math.max(1, rowsTrx.length - 200);
      for (var t = start; t < rowsTrx.length; t++) {
        var rTrx = rowsTrx[t];
        if (rTrx[0]) {
          var tItem = {};
          for (var ht = 0; ht < headersTrx.length; ht++) {
            tItem[headersTrx[ht]] = rTrx[ht];
          }
          dataTrx.push(tItem);
        }
      }
    }
  }

  return {
    status: 'success',
    petani: dataPetani,
    stok: dataStok,
    settings: settings,
    transaksi: dataTrx
  };
}

/**
 * Menyimpan satu transaksi penebusan pupuk
 */
function saveTransaction(trx) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTrx = ss.getSheetByName('Transaksi_Penebusan');
  var sheetPetani = ss.getSheetByName('Petani_eRDKK');
  var sheetStok = ss.getSheetByName('Stok_Kios');

  if (!sheetTrx || !sheetPetani || !sheetStok) {
    initializeSpreadsheet();
    sheetTrx = ss.getSheetByName('Transaksi_Penebusan');
    sheetPetani = ss.getSheetByName('Petani_eRDKK');
    sheetStok = ss.getSheetByName('Stok_Kios');
  }

  // Upload Foto & TTD ke Google Drive jika ada
  var fotoUrl = '';
  var ttdUrl = '';
  
  if (trx.foto_base64) {
    fotoUrl = saveBase64ToDrive('KTP_' + trx.nik + '_' + trx.id_transaksi + '.jpg', trx.foto_base64, 'image/jpeg');
  } else if (trx.foto_url) {
    fotoUrl = trx.foto_url;
  }

  if (trx.ttd_base64) {
    ttdUrl = saveBase64ToDrive('TTD_' + trx.nik + '_' + trx.id_transaksi + '.png', trx.ttd_base64, 'image/png');
  } else if (trx.ttd_url) {
    ttdUrl = trx.ttd_url;
  }

  // Append row transaksi
  sheetTrx.appendRow([
    trx.id_transaksi,
    trx.timestamp || new Date().toISOString(),
    "'" + trx.nik, // format as text
    trx.nama_petani,
    trx.poktan,
    trx.jenis_pupuk,
    trx.jumlah_kg,
    trx.jumlah_zak,
    trx.harga_per_kg,
    trx.total_bayar,
    trx.metode_bayar || 'Tunai',
    trx.petugas || 'Petugas KPL',
    fotoUrl,
    ttdUrl
  ]);

  // Update realisasi kuota petani di sheet Petani_eRDKK
  var petaniRows = sheetPetani.getDataRange().getValues();
  for (var p = 1; p < petaniRows.length; p++) {
    if (String(petaniRows[p][0]).replace(/'/g, '').trim() === String(trx.nik).trim()) {
      var colIdx = -1;
      var jenis = String(trx.jenis_pupuk).toUpperCase();
      if (jenis.indexOf('UREA') >= 0) colIdx = 9;       // tertebus_urea_kg (col index 9, 1-based is 9)
      else if (jenis.indexOf('NPK') >= 0) colIdx = 10;   // tertebus_npk_kg
      else if (jenis.indexOf('ORGANIK') >= 0) colIdx = 11; // tertebus_organik_kg

      if (colIdx > 0) {
        var currentTertebus = Number(petaniRows[p][colIdx - 1]) || 0;
        sheetPetani.getRange(p + 1, colIdx).setValue(currentTertebus + Number(trx.jumlah_kg));
      }
      break;
    }
  }

  // Potong stok kios di sheet Stok_Kios
  var stokRows = sheetStok.getDataRange().getValues();
  for (var s = 1; s < stokRows.length; s++) {
    var idPupuk = String(stokRows[s][0]).toUpperCase();
    var trxJenis = String(trx.jenis_pupuk).toUpperCase();
    if (trxJenis.indexOf(idPupuk) >= 0 || idPupuk.indexOf(trxJenis) >= 0) {
      var currentStok = Number(stokRows[s][2]) || 0;
      var sisaStok = Math.max(0, currentStok - Number(trx.jumlah_kg));
      sheetStok.getRange(s + 1, 3).setValue(sisaStok);
      break;
    }
  }

  return {
    status: 'success',
    id_transaksi: trx.id_transaksi,
    foto_url: fotoUrl,
    ttd_url: ttdUrl
  };
}

/**
 * Menyimpan antrian transaksi offline secara serentak
 */
function saveBatchTransactions(transactions) {
  var results = [];
  if (transactions && transactions.length > 0) {
    for (var i = 0; i < transactions.length; i++) {
      try {
        var res = saveTransaction(transactions[i]);
        results.push(res);
      } catch (e) {
        results.push({ status: 'error', id_transaksi: transactions[i].id_transaksi, error: e.toString() });
      }
    }
  }
  return { status: 'success', processed: results.length, details: results };
}

/**
 * Mencatat penambahan stok (DO / Surat Jalan dari Distributor)
 */
function addStokMasuk(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetStok = ss.getSheetByName('Stok_Kios');
  if (!sheetStok) return { status: 'error', message: 'Sheet Stok_Kios tidak ditemukan' };

  var rows = sheetStok.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(data.id_pupuk).toUpperCase()) {
      var current = Number(rows[i][2]) || 0;
      sheetStok.getRange(i + 1, 3).setValue(current + Number(data.jumlah_kg));
      return { status: 'success', new_stok: current + Number(data.jumlah_kg) };
    }
  }
  return { status: 'error', message: 'Jenis pupuk tidak cocok' };
}

/**
 * Simpan string base64 menjadi file di Google Drive
 */
function saveBase64ToDrive(filename, base64Data, mimeType) {
  try {
    var base64Clean = base64Data;
    if (base64Data.indexOf(',') >= 0) {
      base64Clean = base64Data.split(',')[1];
    }
    var decoded = Utilities.base64Decode(base64Clean);
    var blob = Utilities.newBlob(decoded, mimeType, filename);

    // Dapatkan atau buat folder penyimpanan arsip
    var folders = DriveApp.getFoldersByName('AdaPupuk_Arsip');
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('AdaPupuk_Arsip');
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return 'Gagal simpan Drive: ' + e.toString();
  }
}

