"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MonevEntryData } from '@/lib/supabase';
import { INSTRUMEN_BARU, getItemsForJenjang } from '@/config/instruments';
import { generatePDF } from '@/lib/pdfGenerator';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<MonevEntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;
    
    fetch(`/api/monev/${params.id}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) throw new Error(resData.error);
        setData(resData.data);
      })
      .catch(err => {
        console.error(err);
        setError('Gagal memuat detail monev. Mungkin data tidak ditemukan.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Memuat data...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="container">
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
          <Link href="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>Kembali ke Daftar</Link>
        </div>
      </main>
    );
  }

  const getBadgeClass = (status: string) => {
    if (status === 'SANGAT RAMAH') return 'badge-sangat-ramah';
    if (status === 'CUKUP RAMAH') return 'badge-cukup-ramah';
    if (status === 'KURANG') return 'badge-kurang';
    return 'badge-default';
  };

  const handleDownloadPDF = () => {
    generatePDF(data);
  };

  return (
    <main className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>{data.namaSekolah}</h1>
          <p style={{ margin: 0 }}>{data.jenjang} &bull; {data.tanggal}</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Unduh PDF
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Identitas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>NPSN</div>
          <div style={{ fontWeight: 500 }}>{data.npsn || '-'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Kabupaten / Kota</div>
          <div style={{ fontWeight: 500 }}>{data.kabKota || '-'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Alamat</div>
          <div style={{ fontWeight: 500 }}>{data.alamat}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Kepala Sekolah</div>
          <div style={{ fontWeight: 500 }}>{data.namaKepsek}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Petugas Monev</div>
          <div style={{ fontWeight: 500 }}>{data.namaPetugas}</div>
        </div>
      </div>

      <div className="card">
        <h2>Kesimpulan</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status Sistem</div>
            <span className="badge badge-default">{data.statusOtomatis}</span>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status Final</div>
            <span className={`badge ${getBadgeClass(data.statusFinal)}`}>{data.statusFinal}</span>
          </div>
        </div>

        {data.alasanOverride && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <strong>Alasan Perubahan Status:</strong><br/>
            {data.alasanOverride}
          </div>
        )}

        {data.catatanKritis && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Catatan Kritis / Temuan Lapangan:</strong>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{data.catatanKritis}</p>
          </div>
        )}

        {data.rekomendasi && (
          <div>
            <strong>Rekomendasi Perbaikan:</strong>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{data.rekomendasi}</p>
          </div>
        )}
      </div>

      {/* Materi & Rangkaian Tes MPLS */}
      {data.materiTes && (
        <div className="card">
          <h2>Materi & Rangkaian Tes MPLS</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {data.materiTes.materiUtama && (data.materiTes.materiUtama.rincian || data.materiTes.materiUtama.waktu) && (
              <div>
                <strong style={{ color: 'var(--primary)' }}>1. Materi Utama</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{data.materiTes.materiUtama.rincian || '-'}</p>
                <small style={{ color: 'var(--text-secondary)' }}>Waktu: {data.materiTes.materiUtama.waktu || '-'}</small>
              </div>
            )}
            {data.materiTes.materiPilihan && (data.materiTes.materiPilihan.rincian || data.materiTes.materiPilihan.waktu) && (
              <div>
                <strong style={{ color: 'var(--primary)' }}>2. Materi Pilihan</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{data.materiTes.materiPilihan.rincian || '-'}</p>
                <small style={{ color: 'var(--text-secondary)' }}>Waktu: {data.materiTes.materiPilihan.waktu || '-'}</small>
              </div>
            )}
            {data.materiTes.rangkianTes && (data.materiTes.rangkianTes.rincian || data.materiTes.rangkianTes.waktu) && (
              <div>
                <strong style={{ color: 'var(--primary)' }}>3. Rangkaian Tes (Asesmen Profil/Awal)</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{data.materiTes.rangkianTes.rincian || '-'}</p>
                <small style={{ color: 'var(--text-secondary)' }}>Waktu: {data.materiTes.rangkianTes.waktu || '-'}</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permasalahan & Solusi */}
      {data.permasalahanSolusi && (
        <div className="card">
          <h2>Permasalahan & Solusi</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem', width: '150px' }}>Tahap</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Permasalahan / Kendala</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Solusi Penyelesaian</th>
              </tr>
            </thead>
            <tbody>
              {data.permasalahanSolusi.perencanaan && (data.permasalahanSolusi.perencanaan.rincian || data.permasalahanSolusi.perencanaan.solusi) && (
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600, verticalAlign: 'top' }}>Perencanaan</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.perencanaan.rincian || '-'}</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.perencanaan.solusi || '-'}</td>
                </tr>
              )}
              {data.permasalahanSolusi.pelaksanaan && (data.permasalahanSolusi.pelaksanaan.rincian || data.permasalahanSolusi.pelaksanaan.solusi) && (
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600, verticalAlign: 'top' }}>Pelaksanaan</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.pelaksanaan.rincian || '-'}</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.pelaksanaan.solusi || '-'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {INSTRUMEN_BARU.map((kategori) => {
        const validItems = getItemsForJenjang(kategori, data.jenjang as any);
        if (validItems.length === 0) return null;

        return (
          <div className="card" key={kategori.id}>
            <h2>{kategori.judul}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {validItems.map((item, i) => {
                  const ans = data.jawabanUmum[item.id] || {};
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0', width: '30px', verticalAlign: 'top', color: 'var(--text-secondary)' }}>{i + 1}.</td>
                      <td style={{ padding: '1rem 0', verticalAlign: 'top' }}>
                        {item.pertanyaan}
                        {ans.catatan && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <strong>Catatan:</strong> {ans.catatan}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0', verticalAlign: 'top', textAlign: 'right', fontWeight: 600 }}>
                        {ans.jawaban === true ? <span style={{ color: 'var(--success)' }}>Ya</span> : ans.jawaban === false ? <span style={{ color: 'var(--danger)' }}>Tidak</span> : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/" className="btn btn-outline">Kembali ke Daftar</Link>
      </div>
    </main>
  );
}
