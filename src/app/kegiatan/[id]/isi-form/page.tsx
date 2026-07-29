"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { InstrumenFull, InstrumenMetadataField, InstrumenSection, InstrumenItem } from '@/lib/types';

export default function IsiFormDinamis({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const kegiatan_id = unwrappedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [schema, setSchema] = useState<InstrumenFull | null>(null);
  
  // State untuk form
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({});
  // Format jawaban: { [item_id]: { nilai_skor: number, nilai_teks: string, catatan_bukti: string } }
  const [jawabanValues, setJawabanValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSchema();
  }, [kegiatan_id]);

  const fetchSchema = async () => {
    try {
      setIsLoading(true);
      // 1. Dapatkan instrumen dari kegiatan_id
      const { data: inst, error: errInst } = await supabase
        .from('instrumen')
        .select('*')
        .eq('kegiatan_id', kegiatan_id)
        .single();
      
      if (errInst || !inst) throw new Error('Instrumen tidak ditemukan untuk kegiatan ini.');

      // 2. Dapatkan metadata fields
      const { data: metaFields } = await supabase
        .from('instrumen_metadata_field')
        .select('*')
        .eq('instrumen_id', inst.id)
        .order('urutan', { ascending: true });

      // 3. Dapatkan sections & items
      const { data: sections } = await supabase
        .from('instrumen_section')
        .select(`
          *,
          items:instrumen_item(*)
        `)
        .eq('instrumen_id', inst.id)
        .order('urutan', { ascending: true });

      // Urutkan item di dalam section
      if (sections) {
        sections.forEach(s => {
          s.items.sort((a: any, b: any) => a.urutan - b.urutan);
        });
      }

      setSchema({
        ...inst,
        metadata_fields: metaFields || [],
        sections: sections || []
      });

      // Init default values
      const initMeta: Record<string, string> = {};
      metaFields?.forEach(m => {
        initMeta[m.id] = m.tipe_field === 'date' ? new Date().toISOString().split('T')[0] : '';
      });
      setMetadataValues(initMeta);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetadataChange = (id: string, value: string) => {
    setMetadataValues(prev => ({ ...prev, [id]: value }));
  };

  const handleJawabanChange = (itemId: string, field: 'nilai_skor' | 'nilai_teks' | 'catatan_bukti', value: any) => {
    setJawabanValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema) return;
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Simpan tabel pengisian
      const { data: pengisianData, error: pengisianErr } = await supabase
        .from('pengisian')
        .insert([{
          instrumen_id: schema.id,
          // petugas_id di-set via API khusus atau biarkan null jika public form
          metadata_values: metadataValues
        }])
        .select()
        .single();

      if (pengisianErr) throw pengisianErr;

      // 2. Simpan semua jawaban
      const listJawaban = [];
      for (const section of schema.sections) {
        for (const item of section.items) {
          const ans = jawabanValues[item.id] || {};
          listJawaban.push({
            pengisian_id: pengisianData.id,
            item_id: item.id,
            nilai_skor: ans.nilai_skor || null,
            nilai_teks: ans.nilai_teks || null,
            catatan_bukti: ans.catatan_bukti || null
          });
        }
      }

      if (listJawaban.length > 0) {
        const { error: jawabanErr } = await supabase.from('jawaban').insert(listJawaban);
        if (jawabanErr) throw jawabanErr;
      }

      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="container" style={{ padding: '2rem 1rem' }}>Memuat instrumen...</div>;
  if (error) return <div className="container" style={{ padding: '2rem 1rem', color: 'red' }}>Error: {error}</div>;
  if (!schema) return null;

  if (isSuccess) {
    return (
      <main className="container animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
          <h2 style={{ color: '#10b981' }}>Berhasil Disimpan!</h2>
          <p>Terima kasih telah mengisi instrumen <strong>{schema.nama_instrumen}</strong>.</p>
          <button className="btn btn-primary" onClick={() => router.push('/kegiatan')} style={{ marginTop: '1.5rem' }}>
            Kembali ke Daftar Kegiatan
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{schema.nama_instrumen}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{schema.deskripsi}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Identitas / Metadata */}
        {schema.metadata_fields.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #3b82f6' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Informasi Umum</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {schema.metadata_fields.map(m => (
                <div key={m.id} className="form-group">
                  <label>{m.label_field} {m.wajib_diisi && <span style={{color:'red'}}>*</span>}</label>
                  <input
                    type={m.tipe_field}
                    required={m.wajib_diisi}
                    value={metadataValues[m.id] || ''}
                    onChange={e => handleMetadataChange(m.id, e.target.value)}
                    placeholder={`Masukkan ${m.label_field}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections & Items */}
        {schema.sections.map((section, sIdx) => (
          <div key={section.id} className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #8b5cf6' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
              {section.nama_section}
            </h2>

            {section.items.map((item, iIdx) => (
              <div key={item.id} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #eaeaea' }}>
                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>
                  {iIdx + 1}. {item.teks_pertanyaan}
                </p>

                {/* Tipe: LIKERT 4 */}
                {item.tipe_jawaban === 'likert4' && (
                  <div className="radio-group-likert" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { val: 1, label: 'TS' },
                      { val: 2, label: 'KS' },
                      { val: 3, label: 'S' },
                      { val: 4, label: 'SS' }
                    ].map(opt => (
                      <label key={opt.val} className="radio-card" style={{ flex: '1 1 auto', minWidth: '60px' }}>
                        <input 
                          type="radio" 
                          name={item.id} 
                          required
                          checked={jawabanValues[item.id]?.nilai_skor === opt.val}
                          onChange={() => handleJawabanChange(item.id, 'nilai_skor', opt.val)}
                        />
                        <div className="radio-card-content default">{opt.label}</div>
                      </label>
                    ))}
                    <div style={{ width: '100%', fontSize: '0.75rem', color: 'gray', marginTop: '0.25rem' }}>
                      TS=Tidak Sesuai, KS=Kurang Sesuai, S=Sesuai, SS=Sangat Sesuai
                    </div>
                  </div>
                )}

                {/* Tipe: ESAI */}
                {item.tipe_jawaban === 'esai' && (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <textarea 
                      rows={3} 
                      required
                      value={jawabanValues[item.id]?.nilai_teks || ''}
                      onChange={e => handleJawabanChange(item.id, 'nilai_teks', e.target.value)}
                      placeholder="Tuliskan jawaban Anda di sini..."
                    />
                  </div>
                )}

                {/* Catatan Bukti */}
                {item.butuh_catatan_bukti && (
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bukti Pembelajaran / Catatan Penting <span style={{color:'red'}}>*</span></label>
                    <textarea 
                      rows={2}
                      required
                      value={jawabanValues[item.id]?.catatan_bukti || ''}
                      onChange={e => handleJawabanChange(item.id, 'catatan_bukti', e.target.value)}
                      placeholder="Masukkan deskripsi bukti atau link drive..."
                      style={{ background: 'white' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => router.push('/kegiatan')}>
            Kembali
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan Data...' : 'Kirim Form Monev'}
          </button>
        </div>
      </form>
    </main>
  );
}
