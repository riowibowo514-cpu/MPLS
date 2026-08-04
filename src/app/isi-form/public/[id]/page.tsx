"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InstrumenFull } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function PublicFormPKG() {
  const params = useParams();
  const kegiatan_id = params.id as string;

  const [instrumen, setInstrumen] = useState<InstrumenFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Jawaban { item_id: jawaban (string/number) }
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  useEffect(() => {
    // 1. Cek LocalStorage untuk mencegah duplikasi (Anti-Spam)
    if (typeof window !== 'undefined') {
      const submittedFlag = localStorage.getItem(`submitted_pkg_${kegiatan_id}`);
      if (submittedFlag) {
        setHasSubmitted(true);
        setLoading(false);
        return;
      }
    }

    fetchInstrumen();
  }, [kegiatan_id]);

  const fetchInstrumen = async () => {
    try {
      // Validasi kegiatan adalah PKG
      const { data: kegiatanData, error: kegError } = await supabase
        .from('kegiatan')
        .select('kategori_program, status')
        .eq('id', kegiatan_id)
        .single();
        
      if (kegError || !kegiatanData) throw new Error("Kegiatan tidak ditemukan");
      if (kegiatanData.kategori_program !== 'PKG') throw new Error("Tautan ini hanya untuk kegiatan PKG");
      if (kegiatanData.status !== 'aktif') throw new Error("Sesi evaluasi untuk kegiatan ini sudah ditutup");

      // Ambil instrumen yang terhubung ke kegiatan ini
      const { data: instData, error: instError } = await supabase
        .from('instrumen')
        .select('*')
        .eq('kegiatan_id', kegiatan_id)
        .single();

      if (instError || !instData) throw new Error("Instrumen belum digenerate untuk kegiatan ini");

      // Ambil sections & items
      const { data: sectionsData } = await supabase
        .from('instrumen_section')
        .select(`
          *,
          items:instrumen_item(*)
        `)
        .eq('instrumen_id', instData.id)
        .order('urutan');

      // Sort items within sections
      const sortedSections = (sectionsData || []).map(sec => ({
        ...sec,
        items: (sec.items || []).sort((a: any, b: any) => a.urutan - b.urutan)
      }));

      setInstrumen({
        ...instData,
        metadata_fields: [], // PKG tidak pakai metadata field (anonim)
        sections: sortedSections as any
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (itemId: string, value: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrumen) return;
    
    // Validasi item wajib
    let missing = false;
    for (const section of instrumen.sections) {
      for (const item of section.items) {
        if (!answers[item.id]) {
          missing = true;
        }
      }
    }
    
    if (missing) {
      alert("Mohon lengkapi semua pertanyaan yang wajib diisi (*)");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Buat record Pengisian
      const { data: pengisianData, error: pengisianError } = await supabase
        .from('pengisian')
        .insert([{
          instrumen_id: instrumen.id,
          // Tidak ada petugas_id (karena ini anonim publik)
          metadata_values: {} // Anonim
        }])
        .select()
        .single();

      if (pengisianError) throw pengisianError;

      // 2. Insert semua jawaban
      const jawabanArray = Object.entries(answers).map(([itemId, val]) => {
        const item = instrumen.sections.flatMap(s => s.items).find(i => i.id === itemId);
        const isNum = item?.tipe_jawaban === 'likert4' || item?.tipe_jawaban === 'likert5';
        return {
          pengisian_id: pengisianData.id,
          item_id: itemId,
          nilai_skor: isNum ? Number(val) : null,
          nilai_teks: isNum ? null : String(val),
        };
      });

      const { error: jawabanError } = await supabase
        .from('jawaban')
        .insert(jawabanArray);

      if (jawabanError) throw jawabanError;

      // 3. Sukses! Simpan flag di localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`submitted_pkg_${kegiatan_id}`, 'true');
      }
      setHasSubmitted(true);

    } catch (err: any) {
      console.error(err);
      alert("Gagal mengirimkan jawaban. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <p>Memuat instrumen evaluasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Akses Ditolak</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Terima Kasih!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Tanggapan Anda telah berhasil dikirim dan direkam oleh sistem. 
            Masukan Anda sangat berharga bagi peningkatan mutu kegiatan BGTK di masa mendatang.
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: '2rem', color: '#94a3b8' }}>
            Anda dapat menutup halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #8b5cf6' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>
            {instrumen?.nama_instrumen}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {instrumen?.deskripsi}
          </p>
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <strong>Penting:</strong> Form ini dikumpulkan secara anonim untuk menjaga kerahasiaan. Data yang Anda masukkan murni akan digunakan untuk keperluan evaluasi mutu internal lembaga.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {instrumen?.sections.map((section, idx) => (
            <div key={section.id} className="card animate-slide-up" style={{ marginBottom: '2rem', animationDelay: `${idx * 0.1}s` }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', color: '#334155' }}>
                {section.urutan}. {section.nama_section}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {section.items.map((item) => (
                  <div key={item.id}>
                    <p style={{ fontWeight: '500', marginBottom: '0.75rem', color: '#1e293b' }}>
                      {item.teks_pertanyaan} <span style={{ color: '#ef4444' }}>*</span>
                    </p>
                    
                    {/* Render Input based on type */}
                    {item.tipe_jawaban === 'likert4' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {[
                          { val: 1, label: 'Kurang' },
                          { val: 2, label: 'Cukup' },
                          { val: 3, label: 'Baik' },
                          { val: 4, label: 'Baik Sekali' }
                        ].map(opt => (
                          <label 
                            key={opt.val} 
                            style={{ 
                              flex: 1, 
                              minWidth: '100px',
                              padding: '0.75rem', 
                              border: `1px solid ${answers[item.id] === opt.val ? '#8b5cf6' : 'var(--border-color)'}`,
                              background: answers[item.id] === opt.val ? '#ede9fe' : 'transparent',
                              borderRadius: 'var(--radius-md)',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input 
                              type="radio" 
                              name={item.id} 
                              value={opt.val}
                              checked={answers[item.id] === opt.val}
                              onChange={() => handleAnswerChange(item.id, opt.val)}
                              style={{ display: 'none' }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: answers[item.id] === opt.val ? '600' : '400', color: answers[item.id] === opt.val ? '#6d28d9' : 'inherit' }}>
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {item.tipe_jawaban === 'pilihan_ganda' && (
                      <select 
                        value={answers[item.id] || ""}
                        onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'white' }}
                      >
                        <option value="" disabled>-- Pilih Jawaban --</option>
                        {item.opsi_jawaban?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {item.tipe_jawaban === 'esai' && (
                      <textarea 
                        rows={4}
                        value={answers[item.id] || ""}
                        onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                        placeholder="Ketik tanggapan Anda di sini..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', resize: 'vertical' }}
                      />
                    )}

                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ position: 'sticky', bottom: '1rem', padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: '#8b5cf6' }}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Tanggapan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
