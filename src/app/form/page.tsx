"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INSTRUMEN_BARU, calculateStatus, getItemsForJenjang } from '@/config/instruments';

export default function FormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [identitas, setIdentitas] = useState({
    namaSekolah: '',
    jenjang: 'TK',
    alamat: '',
    namaPetugas: '',
    tanggal: new Date().toISOString().split('T')[0],
    namaKepsek: ''
  });

  const [jawabanUmum, setJawabanUmum] = useState<Record<string, { jawaban?: boolean, catatan?: string }>>({});
  const [kesimpulan, setKesimpulan] = useState({
    statusFinal: '',
    alasanOverride: '',
    catatanKritis: '',
    rekomendasi: ''
  });

  const [statusOtomatis, setStatusOtomatis] = useState<{ status: string, label: string } | null>(null);

  useEffect(() => {
    if (step >= 2) {
      const result = calculateStatus(jawabanUmum, identitas.jenjang as any);
      setStatusOtomatis(result);
      if (!kesimpulan.statusFinal || step === 4) {
        setKesimpulan(prev => ({ ...prev, statusFinal: result.status }));
      }
    }
  }, [jawabanUmum, identitas.jenjang, step]);

  // removed inline import
  const handleNext = () => {
    if (step === 1) {
      if (!identitas.namaSekolah || !identitas.alamat || !identitas.namaPetugas || !identitas.namaKepsek) {
        setError('Harap lengkapi semua field identitas.');
        return;
      }
    } else if (step === 2) {
      const perencanaan = INSTRUMEN_BARU.find(k => k.id === 'perencanaan');
      const pelaksanaan = INSTRUMEN_BARU.find(k => k.id === 'pelaksanaan');
      const itemsPerencanaan = perencanaan ? getItemsForJenjang(perencanaan, identitas.jenjang as any) : [];
      const itemsPelaksanaan = pelaksanaan ? getItemsForJenjang(pelaksanaan, identitas.jenjang as any) : [];
      const isComplete = [...itemsPerencanaan, ...itemsPelaksanaan].every(item => jawabanUmum[item.id]?.jawaban !== undefined);
      
      if (!isComplete) {
        setError('Harap jawab semua pertanyaan di tahap ini.');
        return;
      }
    } else if (step === 3) {
      const asesmen = INSTRUMEN_BARU.find(k => k.id === 'asesmen');
      const kepatuhan = INSTRUMEN_BARU.find(k => k.id === 'kepatuhan');
      const outcome = INSTRUMEN_BARU.find(k => k.id === 'outcome');
      
      const itemsAsesmen = asesmen ? getItemsForJenjang(asesmen, identitas.jenjang as any) : [];
      const itemsKepatuhan = kepatuhan ? getItemsForJenjang(kepatuhan, identitas.jenjang as any) : [];
      const itemsOutcome = outcome ? getItemsForJenjang(outcome, identitas.jenjang as any) : [];
      
      const isComplete = [...itemsAsesmen, ...itemsKepatuhan, ...itemsOutcome].every(item => jawabanUmum[item.id]?.jawaban !== undefined);
      if (!isComplete) {
        setError('Harap jawab semua pertanyaan di tahap ini.');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setError('');
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (kesimpulan.statusFinal !== statusOtomatis?.status && !kesimpulan.alasanOverride.trim()) {
      setError('Anda mengubah status akhir, harap isi alasan override.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...identitas,
        jawabanUmum,
        jawabanKhusus: {},
        ...kesimpulan,
        statusOtomatis: statusOtomatis?.status
      };

      const response = await fetch('/api/monev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan saat menyimpan data');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data');
      setIsSubmitting(false);
    }
  };

  const renderRadioKategori = (kategoriId: string) => {
    const kategori = INSTRUMEN_BARU.find(k => k.id === kategoriId);
    if (!kategori) return null;

    const validItems = getItemsForJenjang(kategori, identitas.jenjang as any);
    if (validItems.length === 0) return null;

    return (
      <div key={kategori.id} style={{ marginBottom: '3rem' }}>
        <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
          {kategori.judul}
        </h3>
        {validItems.map((item, index) => (
          <div key={item.id} className="form-group" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {index + 1}. {item.pertanyaan}
            </p>
            <div className="radio-group" style={{ marginBottom: '1rem' }}>
              <label className="radio-card">
                <input 
                  type="radio" 
                  name={item.id} 
                  checked={jawabanUmum[item.id]?.jawaban === true}
                  onChange={() => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], jawaban: true } })}
                />
                <div className="radio-card-content ya">Ya</div>
              </label>
              <label className="radio-card">
                <input 
                  type="radio" 
                  name={item.id} 
                  checked={jawabanUmum[item.id]?.jawaban === false}
                  onChange={() => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], jawaban: false } })}
                />
                <div className="radio-card-content tidak">Tidak</div>
              </label>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Catatan / Bukti Fisik (Opsional)</label>
              <input
                type="text"
                placeholder="Tuliskan catatan..."
                value={jawabanUmum[item.id]?.catatan || ''}
                onChange={e => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], catatan: e.target.value } })}
                style={{ padding: '0.5rem', fontSize: '0.875rem', marginTop: '0.25rem' }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="card animate-fade-in">
      <h2>Identitas Sekolah</h2>
      <div className="form-group">
        <label>Nama Sekolah</label>
        <input type="text" value={identitas.namaSekolah} onChange={e => setIdentitas({ ...identitas, namaSekolah: e.target.value })} placeholder="Contoh: SD Negeri 1 Padang" />
      </div>
      <div className="form-group">
        <label>Jenjang Pendidikan</label>
        <select value={identitas.jenjang} onChange={e => setIdentitas({ ...identitas, jenjang: e.target.value })}>
          <option value="TK">TK / PAUD</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA/K">SMA / SMK</option>
        </select>
      </div>
      <div className="form-group">
        <label>Alamat Sekolah</label>
        <textarea value={identitas.alamat} onChange={e => setIdentitas({ ...identitas, alamat: e.target.value })} rows={3} />
      </div>
      <div className="form-group">
        <label>Nama Kepala Sekolah</label>
        <input type="text" value={identitas.namaKepsek} onChange={e => setIdentitas({ ...identitas, namaKepsek: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Nama Petugas Monev</label>
        <input type="text" value={identitas.namaPetugas} onChange={e => setIdentitas({ ...identitas, namaPetugas: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Tanggal Pelaksanaan Monev</label>
        <input type="date" value={identitas.tanggal} onChange={e => setIdentitas({ ...identitas, tanggal: e.target.value })} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="card animate-fade-in">
      <h2>Instrumen (Bagian 1)</h2>
      {renderRadioKategori('perencanaan')}
      {renderRadioKategori('pelaksanaan')}
    </div>
  );

  const renderStep3 = () => (
    <div className="card animate-fade-in">
      <h2>Instrumen (Bagian 2)</h2>
      {renderRadioKategori('asesmen')}
      {renderRadioKategori('kepatuhan')}
      {renderRadioKategori('outcome')}
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-fade-in">
      <div className="card">
        <h2>Kesimpulan Status Monev</h2>
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Status yang Dihasilkan Sistem:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {statusOtomatis?.status}
            </span>
            <span className="badge badge-default">{statusOtomatis?.label}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Konfirmasi Status Final</label>
          <select 
            value={kesimpulan.statusFinal}
            onChange={e => setKesimpulan({ ...kesimpulan, statusFinal: e.target.value })}
            style={{ fontWeight: 600 }}
          >
            <option value="SANGAT RAMAH">SANGAT RAMAH</option>
            <option value="CUKUP RAMAH">CUKUP RAMAH</option>
            <option value="KURANG">KURANG</option>
          </select>
        </div>

        {kesimpulan.statusFinal !== statusOtomatis?.status && (
          <div className="form-group animate-fade-in">
            <label style={{ color: 'var(--warning)' }}>Alasan Mengubah Status (Wajib)</label>
            <textarea 
              value={kesimpulan.alasanOverride}
              onChange={e => setKesimpulan({ ...kesimpulan, alasanOverride: e.target.value })}
              rows={2}
              placeholder="Berikan alasan mengapa status final berbeda dengan hitungan sistem..."
              style={{ borderColor: 'var(--warning)' }}
            />
          </div>
        )}
      </div>

      <div className="card">
        <h2>Catatan Tambahan (Opsional)</h2>
        <div className="form-group">
          <label>Catatan Kritis / Temuan Lapangan</label>
          <textarea 
            value={kesimpulan.catatanKritis}
            onChange={e => setKesimpulan({ ...kesimpulan, catatanKritis: e.target.value })}
            rows={4}
            placeholder="Tuliskan temuan atau hal-hal kritis di lapangan..."
          />
        </div>
        <div className="form-group">
          <label>Rekomendasi Perbaikan</label>
          <textarea 
            value={kesimpulan.rekomendasi}
            onChange={e => setKesimpulan({ ...kesimpulan, rekomendasi: e.target.value })}
            rows={4}
            placeholder="Tuliskan rekomendasi perbaikan untuk sekolah..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <main className="container">
      <div className="steps-container">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`step ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
            {s}
          </div>
        ))}
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--danger)', margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        {step > 1 ? (
          <button className="btn btn-outline" onClick={handlePrev} disabled={isSubmitting}>
            Kembali
          </button>
        ) : <div />}

        {step < 4 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Selanjutnya
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Submit Monev'}
          </button>
        )}
      </div>
    </main>
  );
}
