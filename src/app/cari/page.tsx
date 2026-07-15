"use client";
import { useState } from 'react';
import Link from 'next/link';
import { generatePDF } from '@/lib/pdfGenerator';
import { MonevEntryData } from '@/lib/supabase';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MonevEntryData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      setError('Kata kunci pencarian minimal 3 karakter.');
      return;
    }
    
    setError('');
    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/monev/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (res.ok) {
        setResults(data.data || []);
      } else {
        setError(data.error || 'Terjadi kesalahan.');
        setResults([]);
      }
    } catch (err) {
      setError('Koneksi bermasalah.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (entry: MonevEntryData) => {
    try {
      generatePDF(entry);
    } catch (err) {
      alert('Gagal mengunduh PDF.');
    }
  };

  return (
    <main className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className="card">
        <h2>Cari Hasil Monev</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Masukkan nama sekolah Anda untuk mencari dan mengunduh laporan hasil Monitoring dan Evaluasi (PDF).
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Contoh: SD Negeri 1 Padang"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Mencari...' : 'Cari Sekolah'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {hasSearched && !loading && !error && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontWeight: 600 }}>Sekolah tidak ditemukan.</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Pastikan nama sekolah diketik dengan benar atau pastikan petugas sudah mensubmit data monev sekolah Anda.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="history-list">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Hasil Pencarian:</h3>
            {results.map((entry) => (
              <div key={entry.id} className="history-item" style={{ cursor: 'default' }}>
                <div className="history-item-content">
                  <h3>{entry.namaSekolah}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Disubmit pada: {entry.tanggal} &bull; Oleh: {entry.namaPetugas}
                  </p>
                </div>
                <div>
                  <button className="btn btn-outline" onClick={() => handleDownload(entry)}>
                    Unduh PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/" className="btn btn-outline" style={{ border: 'none' }}>
          &larr; Kembali ke Form
        </Link>
      </div>
    </main>
  );
}
