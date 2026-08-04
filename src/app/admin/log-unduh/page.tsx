"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LogUnduhPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pdf_export_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Log Unduh & Cetak Dokumen</h2>
        <button className="btn btn-outline" onClick={fetchLogs}>
          Refresh Data
        </button>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Nama Pengguna</th>
              <th>Peran (Role)</th>
              <th>Aksi / Keterangan Dokumen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Belum ada log aktivitas unduh/cetak dokumen.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td>
                    <strong>{log.nama_user}</strong>
                    {log.user_id === null && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>(Sistem/Super Admin)</span>}
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: log.role === 'admin' ? 'var(--primary)' : 'var(--warning)', color: log.role === 'admin' ? 'white' : 'black' }}>
                      {log.role}
                    </span>
                  </td>
                  <td>{log.aksi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
