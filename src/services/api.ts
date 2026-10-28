import type { TransaksiPenebusan, Petani, StokPupuk, KiosSettings } from '../types';

export interface GasResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  petani?: Petani[];
  stok?: StokPupuk[];
  settings?: Record<string, string>;
  transaksi?: TransaksiPenebusan[];
  processed?: number;
  [key: string]: any;
}

export async function pingGas(url: string): Promise<boolean> {
  if (!url || !url.trim()) return false;
  try {
    const res = await fetch(`${url.trim()}?action=ping`, {
      method: 'GET',
      mode: 'cors'
    });
    const json = await res.json();
    return json.status === 'success';
  } catch (e) {
    console.error('Ping GAS failed:', e);
    return false;
  }
}

export async function initGasSpreadsheet(url: string): Promise<GasResponse> {
  const res = await fetch(`${url.trim()}?action=init`, {
    method: 'GET',
    mode: 'cors'
  });
  return await res.json();
}

export async function fetchAllFromGas(url: string): Promise<GasResponse> {
  const res = await fetch(`${url.trim()}?action=getData`, {
    method: 'GET',
    mode: 'cors'
  });
  return await res.json();
}

export async function postTransactionToGas(url: string, trx: TransaksiPenebusan): Promise<GasResponse> {
  const res = await fetch(url.trim(), {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8' // avoids preflight OPTIONS blocking in GAS
    },
    body: JSON.stringify({
      action: 'syncTransaction',
      transaction: trx
    })
  });
  return await res.json();
}

export async function postBatchTransactionsToGas(url: string, transactions: TransaksiPenebusan[]): Promise<GasResponse> {
  const res = await fetch(url.trim(), {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'syncBatch',
      transactions: transactions
    })
  });
  return await res.json();
}

export async function postStokMasukToGas(url: string, data: { id_pupuk: string; jumlah_kg: number }): Promise<GasResponse> {
  const res = await fetch(url.trim(), {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'addStokMasuk',
      data: data
    })
  });
  return await res.json();
}

