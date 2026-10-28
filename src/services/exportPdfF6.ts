import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TransaksiPenebusan, KiosSettings } from '../types';

export function exportFormF6Pdf(
  transactions: TransaksiPenebusan[],
  settings?: KiosSettings,
  monthYear?: string
) {
  // A4 Landscape untuk format form F6 resmi tabel lebar
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const period = monthYear || new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const kioskName = settings?.nama_kios || 'KIOS PENYALUR RESMI';
  const kioskCode = settings?.kode_kios || 'KPL-XXXXX';
  const region = settings?.wilayah || 'Wilayah Kerja KPL';
  const distributor = settings?.distributor || 'Distributor Resmi Lini III';
  const owner = settings?.pemilik || 'Penanggung Jawab KPL';

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FORM F6 : LAPORAN PENYALURAN PUPUK BERSUBSIDI TINGKAT PENGECER (KPL)', 148, 14, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode Penyaluran: ${period}`, 148, 20, { align: 'center' });

  // Info Kios
  doc.setFontSize(9);
  doc.text(`Nama Kios Pengecer (KPL) : ${kioskName}`, 14, 28);
  doc.text(`Kode Resmi Pengecer       : ${kioskCode}`, 14, 33);
  doc.text(`Wilayah / Kecamatan       : ${region}`, 14, 38);

  doc.text(`Distributor Pembina : ${distributor}`, 190, 28);
  doc.text(`Tanggal Cetak Dokumen : ${new Date().toLocaleDateString('id-ID')}`, 190, 33);

  // Group by Petani to sum their purchases in this period
  const farmerMap: Record<string, {
    nik: string;
    nama: string;
    poktan: string;
    desa: string;
    urea_kg: number;
    npk_kg: number;
    organik_kg: number;
    total_rp: number;
    trx_count: number;
  }> = {};

  transactions.forEach(t => {
    if (!farmerMap[t.nik]) {
      farmerMap[t.nik] = {
        nik: t.nik,
        nama: t.nama_petani,
        poktan: t.poktan,
        desa: t.desa || '-',
        urea_kg: 0,
        npk_kg: 0,
        organik_kg: 0,
        total_rp: 0,
        trx_count: 0
      };
    }
    const jenis = t.jenis_pupuk.toUpperCase();
    if (jenis.includes('UREA')) {
      farmerMap[t.nik].urea_kg += t.jumlah_kg;
    } else if (jenis.includes('NPK')) {
      farmerMap[t.nik].npk_kg += t.jumlah_kg;
    } else if (jenis.includes('ORGANIK')) {
      farmerMap[t.nik].organik_kg += t.jumlah_kg;
    }
    farmerMap[t.nik].total_rp += t.total_bayar;
    farmerMap[t.nik].trx_count += 1;
  });

  let totalUrea = 0;
  let totalNpk = 0;
  let totalOrganik = 0;
  let grandTotalRp = 0;

  const tableData = Object.values(farmerMap).map((f, idx) => {
    totalUrea += f.urea_kg;
    totalNpk += f.npk_kg;
    totalOrganik += f.organik_kg;
    grandTotalRp += f.total_rp;

    return [
      idx + 1,
      f.nik,
      f.nama,
      f.poktan,
      f.desa,
      f.urea_kg.toLocaleString('id-ID'),
      f.npk_kg.toLocaleString('id-ID'),
      f.organik_kg.toLocaleString('id-ID'),
      `Rp ${f.total_rp.toLocaleString('id-ID')}`,
      'Sah (e-RDKK)'
    ];
  });

  // Tambahkan baris total
  const footerRow = [
    '',
    '',
    'TOTAL REALISASI PENYALURAN',
    '',
    '',
    totalUrea.toLocaleString('id-ID'),
    totalNpk.toLocaleString('id-ID'),
    totalOrganik.toLocaleString('id-ID'),
    `Rp ${grandTotalRp.toLocaleString('id-ID')}`,
    ''
  ];

  autoTable(doc, {
    startY: 42,
    head: [[
      'No',
      'NIK Petani',
      'Nama Petani',
      'Kelompok Tani',
      'Desa',
      'Urea (Kg)',
      'NPK (Kg)',
      'Organik (Kg)',
      'Total Nilai HET',
      'Status'
    ]],
    body: tableData,
    foot: [footerRow],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center'
    },
    headStyles: {
      fillColor: [21, 128, 61], // Emerald Green
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35, halign: 'left' },
      2: { cellWidth: 40, halign: 'left' },
      3: { cellWidth: 35, halign: 'left' },
      4: { cellWidth: 25, halign: 'left' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
      8: { cellWidth: 32, halign: 'right' },
      9: { cellWidth: 25 }
    }
  });

  // Tanda Tangan Pengesahan di Bawah
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Jika terlalu dekat dengan batas bawah, buat halaman baru
  let signY = finalY;
  if (signY > 165) {
    doc.addPage();
    signY = 25;
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mengetahui,`, 40, signY);
  doc.text(`Petugas Lapangan / PPL Pertanian`, 40, signY + 5);

  doc.text(`${region.split(',')[0] || 'Tempat'}, ${currentDate}`, 215, signY);
  doc.text(`Pengelola Kios Pengecer Resmi (KPL)`, 215, signY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(`( .................................................. )`, 40, signY + 28);
  doc.text(`NIP.`, 40, signY + 33);

  doc.text(`( ${owner} )`, 215, signY + 28);
  doc.text(`Kode KPL: ${kioskCode}`, 215, signY + 33);

  // Download PDF
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan_Form_F6_${kioskCode}_${dateStr}.pdf`);
}

