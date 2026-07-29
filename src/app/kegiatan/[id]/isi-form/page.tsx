"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { InstrumenFull, InstrumenMetadataField, InstrumenSection, InstrumenItem } from '@/lib/types';
import { DYNAMIC_SCORING_REGISTRY, calculateDynamicScore, DynamicScoringConfig } from '@/config/dynamicScoring';

const KABUPATEN_KOTA_SUMBAR = [
  "Kabupaten Agam",
  "Kabupaten Dharmasraya",
  "Kabupaten Kepulauan Mentawai",
  "Kabupaten Lima Puluh Kota",
  "Kabupaten Padang Pariaman",
  "Kabupaten Pasaman",
  "Kabupaten Pasaman Barat",
  "Kabupaten Pesisir Selatan",
  "Kabupaten Sijunjung",
  "Kabupaten Solok",
  "Kabupaten Solok Selatan",
  "Kabupaten Tanah Datar",
  "Kota Bukittinggi",
  "Kota Padang",
  "Kota Padang Panjang",
  "Kota Pariaman",
  "Kota Payakumbuh",
  "Kota Sawahlunto",
  "Kota Solok"
];

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
  const [currentStep, setCurrentStep] = useState(0);
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({});
  const [jawabanValues, setJawabanValues] = useState<Record<string, any>>({});
  
  const [scoringConfig, setScoringConfig] = useState<DynamicScoringConfig | null>(null);
  const [kesimpulanComputed, setKesimpulanComputed] = useState<any>(null);
  const [kesimpulanInputs, setKesimpulanInputs] = useState({
    statusFinal: '',
    alasanOverride: '',
    catatanKritis: '',
    rekomendasi: ''
  });
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchSchema();
    fetchUser();
  }, [kegiatan_id]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch(err) {}
  };

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

      if (DYNAMIC_SCORING_REGISTRY[inst.nama_instrumen]) {
        setScoringConfig(DYNAMIC_SCORING_REGISTRY[inst.nama_instrumen]);
      }

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

    const hasMeta = schema.metadata_fields.length > 0;
    const totalSteps = (hasMeta ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0);

    if (currentStep < totalSteps - 1) {
      if (scoringConfig && currentStep === totalSteps - 2) {
        const computed = calculateDynamicScore(scoringConfig, jawabanValues, schema.sections);
        setKesimpulanComputed(computed);
        if (!kesimpulanInputs.statusFinal) {
          setKesimpulanInputs(prev => ({ ...prev, statusFinal: computed.finalStatus }));
        }
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    if (scoringConfig) {
      if (kesimpulanInputs.statusFinal !== kesimpulanComputed?.finalStatus && !kesimpulanInputs.alasanOverride) {
        setError('Alasan Mengubah Status wajib diisi karena Anda mengubah status yang disarankan sistem.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    const finalMetadata = { ...metadataValues };
    if (scoringConfig) {
       finalMetadata['_statusOtomatis'] = kesimpulanComputed?.finalStatus || '';
       finalMetadata['_statusFinal'] = kesimpulanInputs.statusFinal;
       finalMetadata['_alasanOverride'] = kesimpulanInputs.alasanOverride;
       finalMetadata['_catatanKritis'] = kesimpulanInputs.catatanKritis;
       finalMetadata['_rekomendasi'] = kesimpulanInputs.rekomendasi;
       finalMetadata['_skorTotal'] = kesimpulanComputed?.totalScorePercentage?.toFixed(2) || '0';
       // We must update state so it shows up in success page properly
       setMetadataValues(finalMetadata);
    }

    try {
      // 1. Simpan tabel pengisian
      const { data: pengisianData, error: pengisianErr } = await supabase
        .from('pengisian')
        .insert([{
          instrumen_id: schema.id,
          petugas_id: currentUser?.id || null, // gunakan id dari session
          metadata_values: finalMetadata
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
          <div className="no-print">
            <h2 style={{ color: '#10b981' }}>Berhasil Disimpan!</h2>
            <p>Terima kasih telah mengisi instrumen <strong>{schema.nama_instrumen}</strong>.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => window.print()}>
                Cetak Bukti (PDF)
              </button>
              <button className="btn btn-primary" onClick={() => router.push('/kegiatan')}>
                Kembali ke Daftar Kegiatan
              </button>
            </div>
          </div>
          
          {/* Bagian khusus untuk di-print sebagai PDF (Berita Acara) */}
          <div className="print-only" style={{ display: 'none', textAlign: 'left', margin: '0 auto', width: '100%' }}>
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
                    <td style={{ padding: '0.5rem', border: '1px solid black' }}>{metadataValues[m.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            
            {metadataValues['_statusOtomatis'] && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <h4 style={{ borderBottom: '1px solid black', paddingBottom: '0.5rem' }}>HASIL EVALUASI MONEV</h4>
                <p><strong>Status Penilaian Sistem:</strong> {metadataValues['_statusOtomatis']} (Skor: {metadataValues['_skorTotal']}%)</p>
                {metadataValues['_statusFinal'] && metadataValues['_statusFinal'] !== metadataValues['_statusOtomatis'] && (
                  <>
                    <p><strong>Penilaian Subjektif Petugas:</strong> {metadataValues['_statusFinal']}</p>
                    <p><strong>Alasan Perubahan:</strong> {metadataValues['_alasanOverride']}</p>
                  </>
                )}
                <p style={{marginTop: '1rem'}}><strong>Catatan Kritis:</strong><br/>{metadataValues['_catatanKritis'] || '-'}</p>
                <p style={{marginTop: '1rem'}}><strong>Rekomendasi:</strong><br/>{metadataValues['_rekomendasi'] || '-'}</p>
              </div>
            )}
            
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
                <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{currentUser?.nama_lengkap || '................................................'}</p>
                <p>NIP: {currentUser?.username || '...........................'}</p>
              </div>
            </div>
          </div>
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
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Langkah {currentStep + 1} dari {(schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0)}
          </span>
          <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '8px', flex: 1, marginLeft: '1rem', overflow: 'hidden' }}>
            <div style={{ 
              background: 'var(--primary)', 
              height: '100%', 
              width: `${((currentStep + 1) / ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0))) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Identitas / Metadata */}
        {schema.metadata_fields.length > 0 && currentStep === 0 && (
          <div className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #3b82f6' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Informasi Umum</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {schema.metadata_fields.map(m => (
                <div key={m.id} className="form-group">
                  <label>{m.label_field} {m.wajib_diisi && <span style={{color:'red'}}>*</span>}</label>
                  {m.label_field.toLowerCase().includes('kabupaten') || m.label_field.toLowerCase().includes('kota') ? (
                    <select
                      required={m.wajib_diisi}
                      value={metadataValues[m.id] || ''}
                      onChange={e => handleMetadataChange(m.id, e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                    >
                      <option value="">-- Pilih Kabupaten/Kota --</option>
                      {KABUPATEN_KOTA_SUMBAR.map(kab => (
                        <option key={kab} value={kab}>{kab}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={m.tipe_field}
                      required={m.wajib_diisi}
                      value={metadataValues[m.id] || ''}
                      onChange={e => handleMetadataChange(m.id, e.target.value)}
                      placeholder={`Masukkan ${m.label_field}...`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections & Items */}
        {schema.sections.map((section, sIdx) => {
          const sectionStepIndex = schema.metadata_fields.length > 0 ? sIdx + 1 : sIdx;
          if (currentStep !== sectionStepIndex) return null;

          return (
            <div key={section.id} className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #8b5cf6' }}>
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
          );
        })}

        {/* Kesimpulan Step */}
        {scoringConfig && currentStep === (schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length && (
          <div className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #10b981' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Kesimpulan & Rekapitulasi</h2>
            
            <div style={{ padding: '1rem', backgroundColor: '#eef2ff', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Total Skor Sistem</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', display: 'block' }}>
                  {kesimpulanComputed?.totalScorePercentage?.toFixed(2)}%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Status Disarankan: <strong>{kesimpulanComputed?.finalStatus}</strong>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Konfirmasi Status Final</label>
              <select 
                value={kesimpulanInputs.statusFinal}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, statusFinal: e.target.value })}
                style={{ fontWeight: 600, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', width: '100%' }}
              >
                {scoringConfig.status_thresholds.map(t => (
                  <option key={t.status} value={t.status}>{t.status}</option>
                ))}
              </select>
            </div>

            {kesimpulanInputs.statusFinal !== kesimpulanComputed?.finalStatus && (
              <div className="form-group animate-fade-in" style={{ marginTop: '1rem' }}>
                <label style={{ color: 'var(--warning)' }}>Alasan Mengubah Status (Wajib)</label>
                <textarea 
                  value={kesimpulanInputs.alasanOverride}
                  onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, alasanOverride: e.target.value })}
                  rows={2}
                  style={{ borderColor: 'var(--warning)', padding: '0.75rem', borderRadius: 'var(--radius-md)', width: '100%' }}
                />
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Catatan Kritis / Temuan Lapangan</label>
              <textarea 
                value={kesimpulanInputs.catatanKritis}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, catatanKritis: e.target.value })}
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Rekomendasi</label>
              <textarea 
                value={kesimpulanInputs.rekomendasi}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, rekomendasi: e.target.value })}
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {currentStep === 0 ? (
            <button type="button" className="btn btn-outline" onClick={() => router.push('/kegiatan')}>
              Batal
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={() => { setCurrentStep(prev => prev - 1); window.scrollTo(0, 0); }}>
              Sebelumnya
            </button>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (currentStep === ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0) - 1) ? 'Kirim Form Monev' : 'Selanjutnya')}
          </button>
        </div>
      </form>
    </main>
  );
}
