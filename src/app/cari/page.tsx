"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, MonevEntryData } from '@/lib/supabase';
import { Kegiatan, InstrumenFull, Pengisian } from '@/lib/types';
import { generatePDF } from '@/lib/pdfGenerator';

export default function SearchPage() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [selectedKegiatanId, setSelectedKegiatanId] = useState('');
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Pengisian[]>([]);
  const [oldResults, setOldResults] = useState<MonevEntryData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [petugasMap, setPetugasMap] = useState<Record<string, { nama: string, nip: string }>>({});
  const [petugasMapByName, setPetugasMapByName] = useState<Record<string, string>>({});

  // Untuk keperluan print
  const [schema, setSchema] = useState<InstrumenFull | null>(null);
  const [selectedPengisian, setSelectedPengisian] = useState<Pengisian | null>(null);

  useEffect(() => {
    fetchKegiatans();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('id, nama_lengkap, username');
    if (data) {
      const mapId: Record<string, { nama: string, nip: string }> = {};
      const mapName: Record<string, string> = {};
      data.forEach(u => {
        mapId[u.id] = { nama: u.nama_lengkap, nip: u.username };
        mapName[u.nama_lengkap] = u.username;
      });
      setPetugasMap(mapId);
      setPetugasMapByName(mapName);
    }
  };

  useEffect(() => {
    if (selectedKegiatanId) {
      fetchSchema(selectedKegiatanId);
    } else {
      setSchema(null);
    }
    // Reset search when activity changes
    setResults([]);
    setOldResults([]);
    setHasSearched(false);
    setQuery('');
  }, [selectedKegiatanId]);

  const fetchKegiatans = async () => {
    const { data } = await supabase.from('kegiatan').select('*').eq('status', 'aktif').order('created_at', { ascending: false });
    const dynamicKegiatans = data || [];
    
    // Tambahkan MPLS lama secara manual (karena struktur data lama tidak ada di tabel kegiatan)
    const mplsLama = {
      id: 'mpls-lama',
      nama_kegiatan: 'MPLS 2026 (Format Lama)',
      status: 'aktif',
      created_at: new Date().toISOString(),
      tahun: '2026'
    } as Kegiatan;
    
    setKegiatans([mplsLama, ...dynamicKegiatans]);
  };

  const fetchSchema = async (k_id: string) => {
    const { data: inst } = await supabase.from('instrumen').select('*').eq('kegiatan_id', k_id).single();
    if (!inst) return;
    const { data: metaFields } = await supabase.from('instrumen_metadata_field').select('*').eq('instrumen_id', inst.id).order('urutan', { ascending: true });
    setSchema({
      ...inst,
      metadata_fields: metaFields || [],
      sections: [] // We don't need sections for printing Berita Acara
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema && selectedKegiatanId !== 'mpls-lama') {
      setError('Silakan pilih kegiatan terlebih dahulu.');
      return;
    }
    if (query.trim().length < 3) {
      setError('Kata kunci pencarian minimal 3 karakter.');
      return;
    }
    
    setError('');
    setLoading(true);
    setHasSearched(true);
    
    try {
      if (selectedKegiatanId === 'mpls-lama') {
        const res = await fetch(`/api/monev/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (res.ok) {
          setOldResults(data.data || []);
        } else {
          setError(data.error || 'Terjadi kesalahan.');
          setOldResults([]);
        }
      } else {
        // Ambil data pengisian untuk instrumen ini
        const { data: allPengisian, error: fetchErr } = await supabase
          .from('pengisian')
          .select('*')
          .eq('instrumen_id', schema!.id);

        if (fetchErr) throw fetchErr;

        // Filter di client untuk mencocokkan kata kunci ke dalam semua nilai metadata (JSON)
        const q = query.toLowerCase();
        const filtered = (allPengisian || []).filter(p => {
          const metaValues = Object.values(p.metadata_values || {}) as string[];
          return metaValues.some(val => String(val).toLowerCase().includes(q));
        });

        setResults(filtered);
      }
    } catch (err) {
      setError('Koneksi bermasalah.');
      setResults([]);
      setOldResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (pengisian: Pengisian) => {
    setSelectedPengisian(pengisian);
    // Beri waktu sedikit untuk React me-render komponen hidden khusus print
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Helper untuk mendapatkan nama sekolah/entitas utama dari metadata (biasanya urutan awal)
  const getPrimaryLabel = (p: Pengisian) => {
    if (!schema || schema.metadata_fields.length === 0) return 'Data Pengisian';
    // Coba cari field yang mengandung 'sekolah' atau ambil field pertama
    const sekolahField = schema.metadata_fields.find(m => m.label_field.toLowerCase().includes('sekolah'));
    const fieldId = sekolahField ? sekolahField.id : schema.metadata_fields[0].id;
    return p.metadata_values[fieldId] || 'Data Pengisian';
  };

  const getSecondaryLabel = (p: Pengisian) => {
    if (!schema || schema.metadata_fields.length <= 1) return '';
    // Ambil field kedua atau yang lain sebagai konteks
    const metaValues = Object.values(p.metadata_values).filter(v => typeof v === 'string');
    return metaValues.length > 1 ? metaValues[1] : '';
  };

  return (
    <main className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className="card no-print">
        <h2>Cari Hasil Monev</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Pilih Kegiatan terlebih dahulu, lalu masukkan kata kunci (seperti Nama Sekolah atau NPSN) untuk mencari dan mengunduh laporan (PDF).
        </p>

        <div className="form-group">
          <label>Pilih Kegiatan Monev</label>
          <select 
            value={selectedKegiatanId} 
            onChange={(e) => setSelectedKegiatanId(e.target.value)}
            style={{ marginBottom: '1rem' }}
          >
            <option value="">-- Pilih Kegiatan --</option>
            {kegiatans.map(k => (
              <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Contoh: SD Negeri 1 Padang atau 12345678"
            style={{ flex: 1 }}
            disabled={!selectedKegiatanId}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedKegiatanId}>
            {loading ? 'Mencari...' : 'Cari Data'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {hasSearched && !loading && !error && results.length === 0 && oldResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontWeight: 600 }}>Data tidak ditemukan.</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Pastikan kata kunci diketik dengan benar, atau pastikan petugas sudah mensubmit data untuk kegiatan ini.
            </p>
          </div>
        )}

        {(results.length > 0 || oldResults.length > 0) && (
          <div className="history-list">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Hasil Pencarian:</h3>
            
            {/* Render Hasil MPLS Lama */}
            {oldResults.map((entry) => (
              <div key={entry.id} className="history-item" style={{ cursor: 'default' }}>
                <div className="history-item-content">
                  <h3>{entry.namaSekolah}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Disubmit pada: {entry.tanggal} &bull; Oleh: {entry.namaPetugas}
                  </p>
                </div>
                <div>
                  <button className="btn btn-outline" onClick={() => {
                    try {
                      const entryWithNip = { ...entry, nipPetugas: petugasMapByName[entry.namaPetugas] };
                      generatePDF(entryWithNip);
                    } catch(err) {
                      alert('Gagal mencetak PDF format lama');
                    }
                  }}>
                    Unduh PDF
                  </button>
                </div>
              </div>
            ))}

            {/* Render Hasil Dinamis */}
            {results.map((entry) => (
              <div key={entry.id} className="history-item" style={{ cursor: 'default' }}>
                <div className="history-item-content">
                  <h3>{getPrimaryLabel(entry)}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Disubmit pada: {new Date(entry.tanggal_pengisian || '').toLocaleDateString('id-ID')} &bull; {getSecondaryLabel(entry)}
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

      <div className="no-print" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/" className="btn btn-outline" style={{ border: 'none' }}>
          &larr; Kembali ke Beranda
        </Link>
      </div>

      {/* Bagian khusus untuk di-print sebagai PDF (Berita Acara) */}
      {schema && selectedPengisian && (
        <div className="print-only" style={{ display: 'none', textAlign: 'left', margin: '0 auto', width: '100%', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid black', paddingBottom: '1rem' }}>
            <h2>BERITA ACARA MONEV</h2>
            <h3>{schema.nama_instrumen}</h3>
          </div>
          
          <p>Pada hari ini, telah dilaksanakan Monitoring dan Evaluasi dengan rincian identitas sebagai berikut:</p>
          <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
            <tbody>
              {schema.metadata_fields.map(m => (
                <tr key={m.id}>
                  <td style={{ width: '30%', padding: '0.5rem', border: '1px solid black' }}><strong>{m.label_field}</strong></td>
                  <td style={{ padding: '0.5rem', border: '1px solid black' }}>{selectedPengisian.metadata_values[m.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <p style={{ marginBottom: '4rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', textAlign: 'center' }}>
            <div style={{ width: '40%' }}>
              <p>Responden / Pihak Sekolah,</p>
              <div style={{ height: '80px' }}></div>
              <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>................................................</p>
              <p>NIP/NUPTK: ...........................</p>
            </div>
            <div style={{ width: '40%' }}>
              <p>Petugas Monev,</p>
              <div style={{ height: '80px' }}></div>
              <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{petugasMap[selectedPengisian.petugas_id || '']?.nama || '................................................'}</p>
              <p>NIP: {petugasMap[selectedPengisian.petugas_id || '']?.nip || '...........................'}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
