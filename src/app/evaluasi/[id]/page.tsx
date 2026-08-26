"use client";

import React, { useState, useEffect, use, useMemo } from 'react';
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

  const metadataGroups = useMemo(() => {
    if (!schema || !schema.metadata_fields) return [];
    const groups: { name: string, fields: any[] }[] = [];
    schema.metadata_fields.forEach(m => {
      let groupName = "Informasi Umum";
      let label = m.label_field || m.nama_field || "Metadata";
      if (!label) label = "";
      const match = label.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        groupName = match[1];
        label = match[2];
      }
      
      let group = groups.find(g => g.name === groupName);
      if (!group) {
        group = { name: groupName, fields: [] };
        groups.push(group);
      }
      group.fields.push({ ...m, parsedLabel: label });
    });
    return groups;
  }, [schema]);

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

    const totalSteps = metadataGroups.length + schema.sections.length + (scoringConfig ? 1 : 0);

    if (currentStep < totalSteps - 1) {
      if (scoringConfig && currentStep === totalSteps - 2) {
        const computed = calculateDynamicScore(scoringConfig, jawabanValues, schema.sections);
        setKesimpulanComputed(computed);
        setKesimpulanInputs(prev => ({ ...prev, statusFinal: computed.finalStatus }));
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Since status final is auto-computed and hidden, no override check is needed.

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
          petugas_id: (currentUser?.id && currentUser.id !== 'super-admin') ? currentUser.id : null,
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
            <p>Terima kasih telah berpartisipasi. Jawaban Anda telah berhasil direkam.</p>
          </div>
          
          {/* Bagian khusus untuk di-print sebagai PDF (Berita Acara) */}
          <div className="print-only" style={{ display: 'none', textAlign: 'left', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.5' }}>
              INSTRUMEN MONITORING DAN EVALUASI<br/>
              IMPLEMENTASI MATEMATIKA GEMBIRA BAGI GURU TK DAN GURU SD<br/>
              TAHUN 2026<br/>
              PROVINSI SUMATERA BARAT
            </div>
            
            <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse', fontSize: '1rem' }}>
              <tbody>
                {schema.metadata_fields.map(m => {
                  const labelField = m.label_field || m.nama_field || '';
                  const match = labelField.match(/^\[(.*?)\]\s*(.*)$/);
                  const lbl = match ? match[2] : labelField;
                  return (
                  <tr key={m.id}>
                    <td style={{ width: '200px', padding: '0.25rem 0' }}>{lbl}</td>
                    <td style={{ width: '20px', padding: '0.25rem 0' }}>:</td>
                    <td style={{ padding: '0.25rem 0' }}>{metadataValues[m.id]}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            
            
            <div style={{ marginBottom: '2rem', marginTop: '2rem' }}>
            
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'blue' }}>Petunjuk Pengisian :</p>
            {(() => {
              const hasAnyLikert = schema.sections.some(s => s.items.some((i: any) => i.tipe_jawaban.startsWith('likert')));
              return (
                <>
                  {hasAnyLikert && (
                    <ol start={1} style={{ margin: 0, paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                      <li>
                        Silahkan melengkapi <strong>Penilaian</strong> dengan memilih salah satu kriteria yang ada.<br/>
                        <div style={{ marginLeft: '1rem' }}>
                          TS = Tidak sesuai<br/>
                          KS = Kurang Sesuai<br/>
                          S = Sesuai<br/>
                          SS = Sangat sesuai
                        </div>
                      </li>
                      <li style={{ marginTop: '0.5rem' }}>Silahkan melengkapi <strong>Bukti Pembelajaran/Catatan</strong> pilihan jawaban pada kolom yang telah disediakan.</li>
                    </ol>
                  )}

                  <div>
                    {schema.sections.map((section, sIdx) => {
                      const hasLikert = section.items.some((i: any) => i.tipe_jawaban.startsWith('likert'));
                      
                      return (
                        <div key={section.id} style={{ marginBottom: '2rem' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            {hasLikert && hasAnyLikert ? (
                              <thead>
                                <tr>
                                  <th colSpan={6} style={{ border: 'none', padding: '0 0 0.5rem 0', textAlign: 'left', backgroundColor: 'transparent' }}>
                                    <h3 style={{ margin: 0, textDecoration: 'underline', fontSize: '1.1rem' }}>{section.nama_section}</h3>
                                  </th>
                                </tr>
                                <tr>
                                  <th rowSpan={2} style={{ border: '1px solid black', padding: '0.5rem', width: '5%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>No</th>
                                  <th rowSpan={2} style={{ border: '1px solid black', padding: '0.5rem', width: '35%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>Aspek yang Diamati</th>
                                  <th colSpan={4} style={{ border: '1px solid black', padding: '0.5rem', width: '20%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>Penilaian</th>
                                  <th rowSpan={2} style={{ border: '1px solid black', padding: '0.5rem', width: '40%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>Bukti Pembelajaran/Catatan</th>
                                </tr>
                                <tr>
                                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>TS</th>
                                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>KS</th>
                                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>S</th>
                                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>SS</th>
                                </tr>
                              </thead>
                            ) : (
                              <thead>
                                <tr>
                                  <th colSpan={2} style={{ border: 'none', padding: '0 0 0.5rem 0', textAlign: 'left', backgroundColor: 'transparent' }}>
                                    <h3 style={{ margin: 0, textDecoration: 'underline', fontSize: '1.1rem' }}>{section.nama_section}</h3>
                                  </th>
                                </tr>
                                <tr>
                                  <th style={{ border: '1px solid black', padding: '0.5rem', width: '5%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>No</th>
                                  <th style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center', backgroundColor: '#bfbfbf' }}>Pertanyaan & Jawaban</th>
                                </tr>
                              </thead>
                            )}
                            <tbody>
                              {section.items.map((item: any, iIdx: number) => {
                                const currentNumber = iIdx + 1;
                                const ans = jawabanValues[item.id] || {};
                                
                                if (hasLikert && hasAnyLikert) {
                                  return (
                                    <tr key={item.id} style={{ pageBreakInside: 'avoid' }}>
                                      <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{currentNumber}</td>
                                      <td style={{ border: '1px solid black', padding: '0.5rem' }}>{item.teks_pertanyaan}</td>
                                      <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 1 ? '√' : ''}</td>
                                      <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 2 ? '√' : ''}</td>
                                      <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 3 ? '√' : ''}</td>
                                      <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 4 ? '√' : ''}</td>
                                      <td style={{ border: '1px solid black', padding: '0.5rem' }}>{ans.catatan_bukti || ''}</td>
                                    </tr>
                                  );
                                } else {
                                  return (
                                    <tr key={item.id} style={{ pageBreakInside: 'avoid' }}>
                                      <td colSpan={2} style={{ border: '1px solid black', padding: '0' }}>
                                        <div style={{ display: 'flex', padding: '0.5rem', backgroundColor: '#fafafa' }}>
                                          <div style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>{currentNumber}</div>
                                          <div style={{ flex: 1, paddingLeft: '0.5rem', fontWeight: 'bold' }}>{item.teks_pertanyaan}</div>
                                        </div>
                                        <div style={{ borderTop: '1px solid black', padding: '1rem', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
                                          {ans.nilai_teks || ''}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
            </div>
          </div>
            
            <p style={{ marginBottom: '4rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>
            {(() => {
              const getMeta = (lbl: string) => {
                const f = schema.metadata_fields.find(m => {
                   const txt = m.label_field || m.nama_field || '';
                   return txt.toLowerCase().includes(lbl.toLowerCase());
                });
                return f ? metadataValues[f.id] : '';
              };
              const kab = getMeta('kabupaten') || '................';
              const tgl = getMeta('tanggal') || '................';
              let namaP = getMeta('nama petugas');
              if (!namaP) namaP = '................................................';
              let nipP = getMeta('nip');
              if (!nipP) nipP = '...........................';
              let namaR = getMeta('nama responden');
              if (!namaR) namaR = '................................................';

              let formattedTgl = tgl;
              if (tgl && tgl.includes('-')) {
                const d = new Date(tgl);
                if (!isNaN(d.getTime())) {
                  formattedTgl = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                }
              }

              return (
                <div className="signature-block">
                  <div style={{ textAlign: 'right', marginBottom: '1rem', paddingRight: '2rem' }}>
                    {kab}, {formattedTgl}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                    <div style={{ width: '40%' }}>
                      <p>Responden / Pihak Sekolah,</p>
                      <div style={{ height: '80px' }}></div>
                      <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{namaR}</p>
                      <p>NIP/NUPTK: ...........................</p>
                    </div>
                    <div style={{ width: '40%' }}>
                      <p>Petugas Monev,</p>
                      <div style={{ height: '80px' }}></div>
                      <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{namaP}</p>
                      <p>NIP: {nipP}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{schema.nama_instrumen}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{schema.deskripsi}</p>
        <div style={{ padding: '1rem', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px', fontSize: '0.9rem', color: '#1e3a8a' }}>
          <strong>Petunjuk Penting:</strong> Karena seluruh pertanyaan wajib diisi, apabila terdapat pertanyaan (khususnya pertanyaan lanjutan/kondisional) yang <strong>tidak relevan</strong> atau <strong>tidak memiliki jawaban</strong>, mohon ketikkan tanda strip (<strong>-</strong>) atau <strong>"Tidak Ada"</strong> pada kolom yang tersedia.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Langkah {currentStep + 1} dari {metadataGroups.length + schema.sections.length + (scoringConfig ? 1 : 0)}
          </span>
          <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '8px', flex: 1, marginLeft: '1rem', overflow: 'hidden' }}>
            <div style={{ 
              background: 'var(--primary)', 
              height: '100%', 
              width: `${((currentStep + 1) / (metadataGroups.length + schema.sections.length + (scoringConfig ? 1 : 0))) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Identitas / Metadata */}
        {metadataGroups.map((group, gIdx) => {
          if (currentStep !== gIdx) return null;
          return (
            <div key={group.name} className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #3b82f6' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>{group.name}</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {group.fields.map(m => (
                  <div key={m.id} className="form-group">
                    <label>{m.parsedLabel} {m.wajib_diisi && <span style={{color:'red'}}>*</span>}</label>
                    {m.parsedLabel.toLowerCase().includes('kabupaten') || m.parsedLabel.toLowerCase().includes('kota') ? (
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
                    ) : m.tipe_field === 'dropdown' && m.opsi_dropdown ? (
                      <div className="radio-group-likert" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', flexDirection: 'column' }}>
                        {(m.opsi_dropdown || []).map((opt: string, optIdx: number) => {
                          if (opt === '__OTHER__') {
                            const isOtherSelected = metadataValues[m.id] !== undefined && !m.opsi_dropdown.includes(metadataValues[m.id]) && metadataValues[m.id] !== '';
                            return (
                              <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name={m.id} 
                                  required={m.wajib_diisi && !metadataValues[m.id]}
                                  checked={isOtherSelected}
                                  onChange={() => {
                                    handleMetadataChange(m.id, 'Lainnya');
                                  }}
                                  style={{ width: '1.2rem', height: '1.2rem' }}
                                />
                                <span>Lainnya:</span>
                                {isOtherSelected && (
                                  <input 
                                    type="text" 
                                    autoFocus
                                    required={m.wajib_diisi}
                                    value={metadataValues[m.id] === 'Lainnya' ? '' : metadataValues[m.id]}
                                    onChange={(e) => handleMetadataChange(m.id, e.target.value)}
                                    placeholder="Tuliskan di sini..."
                                    style={{ flex: 1, padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--primary)', outline: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', background: 'transparent' }}
                                  />
                                )}
                              </label>
                            );
                          }
                          
                          return (
                            <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input 
                                type="radio" 
                                name={m.id} 
                                required={m.wajib_diisi && !metadataValues[m.id]}
                                value={opt}
                                checked={metadataValues[m.id] === opt}
                                onChange={() => handleMetadataChange(m.id, opt)}
                                style={{ width: '1.2rem', height: '1.2rem' }}
                              />
                              <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        type={m.tipe_field}
                        required={m.wajib_diisi}
                        value={metadataValues[m.id] || ''}
                        onChange={e => handleMetadataChange(m.id, e.target.value)}
                        placeholder={`Masukkan ${m.parsedLabel}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Sections & Items */}
        {schema.sections.map((section, sIdx) => {
          const sectionStepIndex = metadataGroups.length + sIdx;
          if (currentStep !== sectionStepIndex) return null;

          return (
            <div key={section.id} className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #8b5cf6' }}>
              <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
              {section.nama_section}
            </h2>

            {section.items.map((item, iIdx) => {
              const isOptional = Array.isArray(item.opsi_jawaban) && item.opsi_jawaban[0] === 'OPTIONAL';
              const isRequired = !isOptional;
              
              return (
              <div key={item.id} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #eaeaea' }}>
                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>
                  {iIdx + 1}. {item.teks_pertanyaan} {isRequired && <span style={{color:'red'}}>*</span>}
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
                          required={isRequired}
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
                      required={isRequired}
                      value={jawabanValues[item.id]?.nilai_teks || ''}
                      onChange={e => handleJawabanChange(item.id, 'nilai_teks', e.target.value)}
                      placeholder="Tuliskan jawaban Anda di sini..."
                    />
                  </div>
                )}

                {/* Tipe: TEKS SINGKAT */}
                {item.tipe_jawaban === 'teks_singkat' && (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <input 
                      type="text"
                      required={isRequired}
                      value={jawabanValues[item.id]?.nilai_teks || ''}
                      onChange={e => handleJawabanChange(item.id, 'nilai_teks', e.target.value)}
                      placeholder="Ketikkan jawaban singkat..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>
                )}

                {/* Tipe: PILIHAN GANDA */}
                {item.tipe_jawaban === 'pilihan_ganda' && item.opsi_jawaban?.[0] !== '__CHECKBOX__' && (
                  <div className="radio-group-likert" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', flexDirection: 'column' }}>
                    {(item.opsi_jawaban || []).map((opt: string, optIdx: number) => {
                      let typeClass = 'default';
                      if (opt.toLowerCase() === 'ya') typeClass = 'ya';
                      if (opt.toLowerCase() === 'tidak') typeClass = 'tidak';
                      
                      return (
                        <label key={optIdx} className="radio-card">
                          <input 
                            type="radio" 
                            name={item.id} 
                            required={isRequired}
                            value={opt}
                            checked={jawabanValues[item.id]?.nilai_teks === opt}
                            onChange={() => handleJawabanChange(item.id, 'nilai_teks', opt)}
                          />
                          <div className={`radio-card-content ${typeClass}`}>
                            {opt}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Tipe: CHECKBOX (Multiple Choice) */}
                {item.tipe_jawaban === 'pilihan_ganda' && item.opsi_jawaban?.[0] === '__CHECKBOX__' && (
                  <div className="checkbox-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexDirection: 'column' }}>
                    {(item.opsi_jawaban || []).filter((o: string) => o !== '__CHECKBOX__').map((opt: string, optIdx: number) => {
                      const currentVals = jawabanValues[item.id]?.nilai_teks ? jawabanValues[item.id].nilai_teks.split('|||') : [];
                      const isChecked = currentVals.includes(opt);
                      
                      const toggleCheck = () => {
                        const newVals = isChecked 
                          ? currentVals.filter((v: string) => v !== opt) 
                          : [...currentVals, opt];
                        handleJawabanChange(item.id, 'nilai_teks', newVals.join('|||'));
                      };

                      return (
                        <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', background: isChecked ? '#e0e7ff' : '#fff' }}>
                          <input 
                            type="checkbox" 
                            required={isRequired && currentVals.length === 0}
                            checked={isChecked}
                            onChange={toggleCheck}
                            style={{ width: '1.2rem', height: '1.2rem' }}
                          />
                          <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Catatan Bukti */}
                {item.butuh_catatan_bukti && (
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bukti Pembelajaran / Catatan Penting {isRequired && <span style={{color:'red'}}>*</span>}</label>
                    <textarea 
                      rows={2} 
                      required={isRequired}
                      value={jawabanValues[item.id]?.catatan_bukti || ''}
                      onChange={e => handleJawabanChange(item.id, 'catatan_bukti', e.target.value)}
                      placeholder="Masukkan deskripsi bukti atau link drive..."
                      style={{ background: 'white' }}
                    />
                  </div>
                )}
              </div>
            )})}
          </div>
          );
        })}

        {/* Kesimpulan Step */}
        {scoringConfig && currentStep === metadataGroups.length + schema.sections.length && (
          <div className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #10b981' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Kesimpulan & Rekapitulasi</h2>
            
            {/* Skor dan Status Disembunyikan (Berdasarkan Evaluasi Atasan) */}
            <input type="hidden" value={kesimpulanInputs.statusFinal} />

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Catatan Kritis / Temuan Lapangan <span style={{color:'red'}}>*</span></label>
              <textarea 
                required
                value={kesimpulanInputs.catatanKritis}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, catatanKritis: e.target.value })}
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Rekomendasi <span style={{color:'red'}}>*</span></label>
              <textarea 
                required
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
            {isSubmitting ? 'Menyimpan...' : (currentStep === (metadataGroups.length + schema.sections.length + (scoringConfig ? 1 : 0) - 1) ? 'Kirim Form Monev' : 'Selanjutnya')}
          </button>
        </div>
      </form>
    </main>
  );
}
