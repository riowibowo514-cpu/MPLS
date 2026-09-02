"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Instrumen, InstrumenMetadataField, InstrumenSection, InstrumenItem, TipeJawabanItem } from '@/lib/types';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kegiatan_id = searchParams.get('kegiatan_id');

  const [instrumen, setInstrumen] = useState<Partial<Instrumen>>({ nama_instrumen: '', deskripsi: '' });
  const [metadataFields, setMetadataFields] = useState<Partial<InstrumenMetadataField>[]>([]);
  const [sections, setSections] = useState<(Partial<InstrumenSection> & { items: Partial<InstrumenItem>[] })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !kegiatan_id) return;

    setIsReadingFile(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kegiatan_id', kegiatan_id);

      const response = await fetch('/api/admin/auto-build', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengekstrak PDF');
      }

      alert(`Sukses! AI berhasil membangun form instrumen dari PDF.`);
      
      // Update form di UI
      setInstrumen(prev => ({
        ...prev,
        nama_instrumen: `Instrumen (Hasil Ekstrak ${file.name.split('.')[0]})`,
        deskripsi: 'Hasil ekstrak otomatis menggunakan kecerdasan buatan (AI).'
      }));

      // Load format ke array yang sudah kompatibel dengan Builder
      const aiSections = result.data;
      if (Array.isArray(aiSections)) {
        const builtSections = aiSections.map((sec: any, sIdx: number) => ({
          nama_section: sec.nama_section || `Bagian ${sIdx + 1}`,
          urutan: sIdx,
          items: Array.isArray(sec.items) ? sec.items.map((item: any, iIdx: number) => ({
            teks_pertanyaan: item.teks_pertanyaan || 'Pertanyaan',
            tipe_jawaban: item.tipe_jawaban || 'teks_singkat',
            opsi_jawaban: item.opsi_jawaban || null,
            butuh_catatan_bukti: !!item.butuh_catatan_bukti,
            urutan: iIdx
          })) : []
        }));
        
        setSections(builtSections);
      }
      
    } catch (err: any) {
      alert(`Error AI: ${err.message}`);
    } finally {
      setIsReadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  
  const [existingInstrumenId, setExistingInstrumenId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!kegiatan_id) {
      router.push('/admin/kegiatan');
      return;
    }

    const fetchExisting = async () => {
      setIsLoadingData(true);
      try {
        const { data: instData, error: instErr } = await supabase
          .from('instrumen')
          .select('*')
          .eq('kegiatan_id', kegiatan_id)
          .single();
        
        if (instErr || !instData) {
          // Jika instrumen belum ada, ambil nama kegiatannya untuk dijadikan default judul instrumen
          const { data: kegData } = await supabase.from('kegiatan').select('nama_kegiatan, deskripsi').eq('id', kegiatan_id).single();
          if (kegData) {
            setInstrumen({ nama_instrumen: kegData.nama_kegiatan, deskripsi: kegData.deskripsi || '' });
          }
          return;
        }
        
        setExistingInstrumenId(instData.id);
        setInstrumen({ nama_instrumen: instData.nama_instrumen, deskripsi: instData.deskripsi });

        const { data: mFields } = await supabase
          .from('instrumen_metadata_field')
          .select('*')
          .eq('instrumen_id', instData.id)
          .order('urutan', { ascending: true });
        
        if (mFields) setMetadataFields(mFields);

        const { data: secs } = await supabase
          .from('instrumen_section')
          .select('*, items:instrumen_item(*)')
          .eq('instrumen_id', instData.id)
          .order('urutan', { ascending: true });

        if (secs) {
          // Sort items for each section
          const sortedSecs = secs.map(s => {
            s.items.sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));
            return s;
          });
          setSections(sortedSecs as any);
        }
      } catch (err) {
        console.error("Gagal memuat instrumen lama", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExisting();
  }, [kegiatan_id, router]);


  const addMetadataField = () => {
    setMetadataFields([...metadataFields, { label_field: '', tipe_field: 'text', wajib_diisi: true, urutan: metadataFields.length }]);
  };

  const addSection = () => {
    setSections([...sections, { nama_section: '', urutan: sections.length, items: [] }]);
  };

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push({
      teks_pertanyaan: '',
      tipe_jawaban: 'likert4',
      butuh_catatan_bukti: false,
      urutan: newSections[sectionIndex].items.length
    });
    setSections(newSections);
  };

  const handleSave = async () => {
    if (!instrumen.nama_instrumen) return alert('Nama instrumen wajib diisi!');
    setIsSaving(true);

    
    try {
      let instrumenId = existingInstrumenId;

      if (existingInstrumenId) {
        // Update instrumen
        await supabase
          .from('instrumen')
          .update({ nama_instrumen: instrumen.nama_instrumen, deskripsi: instrumen.deskripsi })
          .eq('id', existingInstrumenId);
          
        // Hapus metadata, section, items lama untuk di-replace
        // Karena cascading delete mungkin tidak aktif, kita hapus manual dari bawah
        const { data: oldSecs } = await supabase.from('instrumen_section').select('id').eq('instrumen_id', existingInstrumenId);
        if (oldSecs && oldSecs.length > 0) {
           const oldSecIds = oldSecs.map(s => s.id);
           await supabase.from('instrumen_item').delete().in('section_id', oldSecIds);
           await supabase.from('instrumen_section').delete().eq('instrumen_id', existingInstrumenId);
        }
        await supabase.from('instrumen_metadata_field').delete().eq('instrumen_id', existingInstrumenId);

      } else {
        // Insert Instrumen baru
        const { data: instData, error: instError } = await supabase
          .from('instrumen')
          .insert([{ kegiatan_id, nama_instrumen: instrumen.nama_instrumen, deskripsi: instrumen.deskripsi }])
          .select()
          .single();
          
        if (instError) throw instError;
        instrumenId = instData.id;
      }


      // 2. Save Metadata Fields
      if (metadataFields.length > 0) {
        const mFields = metadataFields.map((m, i) => ({ ...m, instrumen_id: instrumenId, urutan: i }));
        await supabase.from('instrumen_metadata_field').insert(mFields as any);
      }

      // 3. Save Sections & Items
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const { data: secData, error: secErr } = await supabase
          .from('instrumen_section')
          .insert([{ instrumen_id: instrumenId, nama_section: sec.nama_section, urutan: i }])
          .select()
          .single();

        if (secErr) throw secErr;

        if (sec.items.length > 0) {
          const itemsToInsert = sec.items.map((item, j) => ({
            ...item,
            section_id: secData.id,
            urutan: j
          }));
          await supabase.from('instrumen_item').insert(itemsToInsert as any);
        }
      }

      alert('Instrumen berhasil disimpan!');
      router.push('/admin/kegiatan');
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Memuat data instrumen lama...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Form Builder (Instrumen)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
          
          <button 
            className="btn btn-outline" 
            onClick={() => fileInputRef.current?.click()} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#8b5cf6', color: '#8b5cf6' }} 
            disabled={isReadingFile}
          >
            {isReadingFile ? 'Membaca...' : '✨ Unggah (AI)'}
          </button>
          
          <button 
            className="btn btn-outline" 
            onClick={() => alert('Fitur Uji Coba: Instrumen akan dirender dalam bentuk Pop-up Preview sebelum disimpan. Sedang dikembangkan!')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            👁️ Uji Coba
          </button>

          <button className="btn btn-outline" onClick={() => router.push('/admin/kegiatan')}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan Instrumen'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Informasi Umum Instrumen</h3>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Judul Instrumen</label>
          <input type="text" value={instrumen.nama_instrumen} onChange={e => setInstrumen({...instrumen, nama_instrumen: e.target.value})} placeholder="Contoh: Instrumen Monitoring Matgem" />
        </div>
        <div className="form-group">
          <label>Deskripsi/Petunjuk Pengisian</label>
          <textarea rows={3} value={instrumen.deskripsi} onChange={e => setInstrumen({...instrumen, deskripsi: e.target.value})} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Metadata / Header Form</h3>
          <button className="btn btn-outline" onClick={addMetadataField} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>+ Tambah Field</button>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Tentukan field identitas yang harus diisi petugas sebelum mulai (misal: Nama Sekolah, Tanggal).
        </p>
        
        {metadataFields.map((field, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ flex: 2 }}>
              <label>Label Field</label>
              <input type="text" value={field.label_field} onChange={e => {
                const newF = [...metadataFields]; newF[idx].label_field = e.target.value; setMetadataFields(newF);
              }} placeholder="Misal: Nama Sekolah" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Tipe</label>
              <select value={field.tipe_field} onChange={e => {
                const newF = [...metadataFields]; newF[idx].tipe_field = e.target.value as any; setMetadataFields(newF);
              }}>
                <option value="text">Teks Singkat</option>
                <option value="date">Tanggal</option>
                <option value="number">Angka</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '1.5rem', gap: '0.5rem' }}>
              <input type="checkbox" checked={field.wajib_diisi} onChange={e => {
                const newF = [...metadataFields]; newF[idx].wajib_diisi = e.target.checked; setMetadataFields(newF);
              }} />
              <label style={{ margin: 0 }}>Wajib Diisi</label>
            </div>
            <button className="btn btn-outline" style={{ paddingTop: '1.5rem', color: 'var(--danger)', border: 'none' }} onClick={() => {
              setMetadataFields(metadataFields.filter((_, i) => i !== idx));
            }}>X</button>
          </div>
        ))}
      </div>

      <div className="card" style={{ borderTop: '4px solid #8b5cf6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Daftar Pertanyaan (Section)</h3>
          <button className="btn btn-outline" onClick={addSection} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }} disabled={isReadingFile}>+ Tambah Bagian Baru</button>
        </div>

        {sections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: '#fafafa' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label>Nama Section (Bagian)</label>
                <input type="text" value={section.nama_section} onChange={e => {
                  const newS = [...sections]; newS[sIdx].nama_section = e.target.value; setSections(newS);
                }} placeholder="Misal: A. Perencanaan" style={{ fontWeight: 'bold' }} />
              </div>
              <button className="btn btn-outline" style={{ marginTop: '1.5rem', color: 'var(--danger)' }} onClick={() => {
                setSections(sections.filter((_, i) => i !== sIdx));
              }}>Hapus Section</button>
            </div>

            {section.items.map((item, iIdx) => (
              <div key={iIdx} style={{ marginLeft: '2rem', marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid #eaeaea', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 3 }}>
                    <label>Teks Pertanyaan</label>
                    <textarea rows={2} value={item.teks_pertanyaan} onChange={e => {
                      const newS = [...sections]; newS[sIdx].items[iIdx].teks_pertanyaan = e.target.value; setSections(newS);
                    }} placeholder="Masukkan pertanyaan atau indikator penilian..." />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Tipe Jawaban</label>
                    <select value={item.tipe_jawaban} onChange={e => {
                      const newS = [...sections]; newS[sIdx].items[iIdx].tipe_jawaban = e.target.value as TipeJawabanItem; setSections(newS);
                    }}>
                      <option value="likert4">Skala 4 Poin (TS/KS/S/SS)</option>
                      <option value="likert5">Skala 5 Poin (1-5)</option>
                      <option value="esai">Teks Bebas (Esai)</option>
                    </select>
                  </div>
                  <button className="btn btn-outline" style={{ marginTop: '1.5rem', color: 'var(--danger)', border: 'none', padding: '0.5rem' }} onClick={() => {
                    const newS = [...sections]; newS[sIdx].items.splice(iIdx, 1); setSections(newS);
                  }}>X</button>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={item.butuh_catatan_bukti} onChange={e => {
                      const newS = [...sections]; newS[sIdx].items[iIdx].butuh_catatan_bukti = e.target.checked; setSections(newS);
                    }} />
                    Wajibkan kolom "Catatan / Bukti Pendukung" untuk pertanyaan ini
                  </label>
                </div>
              </div>
            ))}
            
            <button className="btn btn-outline" style={{ marginLeft: '2rem', fontSize: '0.875rem' }} onClick={() => addItem(sIdx)}>
              + Tambah Pertanyaan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense fallback={<div>Loading builder...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
