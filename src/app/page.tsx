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
    npsn: '',
    jenjang: 'TK',
    kabKota: '',
    namaPetugas: '',
    tanggal: new Date().toISOString().split('T')[0],
    namaKepsek: ''
  });

  const [materiTes, setMateriTes] = useState({
    materiUtama: { rincian: '', waktu: '' },
    materiPilihan: { rincian: '', waktu: '' },
    rangkianTes: { rincian: '', waktu: '' }
  });

  const [permasalahanSolusi, setPermasalahanSolusi] = useState({
    perencanaan: { rincian: '', solusi: '' },
    pelaksanaan: { rincian: '', solusi: '' }
  });

  const [jawabanUmum, setJawabanUmum] = useState<Record<string, { jawaban?: boolean | string, catatan?: string }>>({});
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
      if (!kesimpulan.statusFinal || step === 5) {
        setKesimpulan(prev => ({ ...prev, statusFinal: result.status }));
      }
    }
  }, [jawabanUmum, identitas.jenjang, step]);

  // removed inline import
  const scrollToField = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!identitas.namaSekolah) { setError('Nama Sekolah wajib diisi.'); scrollToField('field-namaSekolah'); return; }
      if (!identitas.npsn) { setError('NPSN wajib diisi.'); scrollToField('field-npsn'); return; }
      if (!identitas.kabKota) { setError('Kabupaten/Kota wajib dipilih.'); scrollToField('field-kabKota'); return; }
      if (!identitas.namaKepsek) { setError('Nama Kepala Sekolah wajib diisi.'); scrollToField('field-namaKepsek'); return; }
      if (!identitas.namaPetugas) { setError('Nama Petugas Monev wajib diisi.'); scrollToField('field-namaPetugas'); return; }
    } else if (step === 2) {
      const perencanaan = INSTRUMEN_BARU.find(k => k.id === 'perencanaan');
      const itemsPerencanaan = perencanaan ? getItemsForJenjang(perencanaan, identitas.jenjang as any) : [];
      for (const item of itemsPerencanaan) {
        if (jawabanUmum[item.id]?.jawaban === undefined) {
          setError(`Harap jawab pertanyaan: ${item.pertanyaan}`);
          scrollToField(`field-${item.id}`);
          return;
        }
      }
    } else if (step === 3) {
      const pelaksanaan = INSTRUMEN_BARU.find(k => k.id === 'pelaksanaan');
      const itemsPelaksanaan = pelaksanaan ? getItemsForJenjang(pelaksanaan, identitas.jenjang as any) : [];
      for (const item of itemsPelaksanaan) {
        if (jawabanUmum[item.id]?.jawaban === undefined) {
          setError(`Harap jawab pertanyaan: ${item.pertanyaan}`);
          scrollToField(`field-${item.id}`);
          return;
        }
      }
    }
    setError('');
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setError('');
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    // Validasi Step 4
    if (!materiTes.materiUtama.rincian || !materiTes.materiUtama.waktu) {
      setError('Materi Utama (Rincian & Waktu) wajib diisi.'); scrollToField('field-materiUtama'); return;
    }
    if (!materiTes.materiPilihan.rincian || !materiTes.materiPilihan.waktu) {
      setError('Materi Pilihan (Rincian & Waktu) wajib diisi.'); scrollToField('field-materiPilihan'); return;
    }
    if (!materiTes.rangkianTes.rincian || !materiTes.rangkianTes.waktu) {
      setError('Rangkaian Tes (Rincian & Waktu) wajib diisi.'); scrollToField('field-rangkianTes'); return;
    }
    if (!permasalahanSolusi.perencanaan.rincian || !permasalahanSolusi.perencanaan.solusi) {
      setError('Permasalahan & Solusi Tahap Perencanaan wajib diisi.'); scrollToField('field-permasalahanPerencanaan'); return;
    }
    if (!permasalahanSolusi.pelaksanaan.rincian || !permasalahanSolusi.pelaksanaan.solusi) {
      setError('Permasalahan & Solusi Tahap Pelaksanaan wajib diisi.'); scrollToField('field-permasalahanPelaksanaan'); return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...identitas,
        jawabanUmum,
        jawabanKhusus: {},
        ...kesimpulan, // will default to the auto calculated status
        statusOtomatis: statusOtomatis?.status,
        materiTes,
        permasalahanSolusi
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
          <div key={item.id} id={`field-${item.id}`} className="form-group" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {index + 1}. {item.pertanyaan}
            </p>
            {kategori.tipeJawaban === 'ya-tidak' ? (
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
            ) : (
              <div className="radio-group-likert" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['SS', 'S', 'TS', 'STS'].map(val => (
                  <label key={val} className="radio-card" style={{ flex: '1 1 auto', minWidth: '80px' }}>
                    <input 
                      type="radio" 
                      name={item.id} 
                      checked={jawabanUmum[item.id]?.jawaban === val}
                      onChange={() => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], jawaban: val } })}
                    />
                    <div className="radio-card-content default">{val}</div>
                  </label>
                ))}
                <div style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  *SS = Sangat Sesuai, S = Sesuai, TS = Tidak Sesuai, STS = Sangat Tidak Sesuai
                </div>
              </div>
            )}
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Catatan / Keterangan</label>
              <input
                type="text"
                placeholder="Tuliskan catatan/keterangan..."
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
      <div className="form-group" id="field-namaSekolah">
        <label>Nama Sekolah</label>
        <input type="text" value={identitas.namaSekolah} onChange={e => setIdentitas({ ...identitas, namaSekolah: e.target.value })} placeholder="Contoh: SD Negeri 1 Padang" />
      </div>
      <div className="form-group" id="field-npsn">
        <label>NPSN</label>
        <input type="text" value={identitas.npsn} onChange={e => setIdentitas({ ...identitas, npsn: e.target.value })} placeholder="Contoh: 12345678" />
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
      <div className="form-group" id="field-kabKota">
        <label>Kabupaten / Kota</label>
        <select value={identitas.kabKota} onChange={e => setIdentitas({ ...identitas, kabKota: e.target.value })}>
          <option value="">-- Pilih Kabupaten/Kota --</option>
          {[
            'Kabupaten Agam', 'Kabupaten Dharmasraya', 'Kabupaten Kepulauan Mentawai', 'Kabupaten Lima Puluh Kota', 'Kabupaten Padang Pariaman', 'Kabupaten Pasaman', 'Kabupaten Pasaman Barat', 'Kabupaten Pesisir Selatan', 'Kabupaten Sijunjung', 'Kabupaten Solok', 'Kabupaten Solok Selatan', 'Kabupaten Tanah Datar', 'Kota Bukittinggi', 'Kota Padang', 'Kota Padang Panjang', 'Kota Pariaman', 'Kota Payakumbuh', 'Kota Sawahlunto', 'Kota Solok'
          ].map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="form-group" id="field-namaKepsek">
        <label>Nama Kepala Sekolah</label>
        <input type="text" value={identitas.namaKepsek} onChange={e => setIdentitas({ ...identitas, namaKepsek: e.target.value })} />
      </div>
      <div className="form-group" id="field-namaPetugas">
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
      <h2>Instrumen (Bagian A)</h2>
      {renderRadioKategori('perencanaan')}
    </div>
  );

  const renderStep3 = () => (
    <div className="card animate-fade-in">
      <h2>Instrumen (Bagian B)</h2>
      {renderRadioKategori('pelaksanaan')}
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-fade-in">
      <div className="card">
        <h2>Materi & Rangkaian Tes MPLS</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Tuliskan rincian materi/kegiatan serta waktu pelaksanaan yang dilakukan sekolah.
        </p>
        
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }} id="field-materiUtama">
          <h3>1. Materi Utama <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Rincian Kegiatan</label>
            <textarea 
              value={materiTes.materiUtama.rincian} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiUtama: { ...materiTes.materiUtama, rincian: e.target.value }
              })} 
              placeholder="Contoh: Pengenalan warga sekolah, visi misi, tata tertib, budaya 5S..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Waktu Pelaksanaan</label>
            <input 
              type="text" 
              value={materiTes.materiUtama.waktu} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiUtama: { ...materiTes.materiUtama, waktu: e.target.value }
              })} 
              placeholder="Contoh: Hari ke-1 & ke-2, Pukul 07.30 - 10.00 WIB"
            />
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }} id="field-materiPilihan">
          <h3>2. Materi Pilihan <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Rincian Kegiatan</label>
            <textarea 
              value={materiTes.materiPilihan.rincian} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiPilihan: { ...materiTes.materiPilihan, rincian: e.target.value }
              })} 
              placeholder="Contoh: Penanggulangan kekerasan, simulasi mitigasi bencana, pola hidup bersih..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Waktu Pelaksanaan</label>
            <input 
              type="text" 
              value={materiTes.materiPilihan.waktu} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiPilihan: { ...materiTes.materiPilihan, waktu: e.target.value }
              })} 
              placeholder="Contoh: Hari ke-2, Pukul 10.30 - 12.00 WIB"
            />
          </div>
        </div>

        <div id="field-rangkianTes">
          <h3>3. Rangkaian Tes (Asesmen Profil/Awal) <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Rincian Kegiatan</label>
            <textarea 
              value={materiTes.rangkianTes.rincian} 
              onChange={e => setMateriTes({
                ...materiTes,
                rangkianTes: { ...materiTes.rangkianTes, rincian: e.target.value }
              })} 
              placeholder="Contoh: Pengamatan perilaku, wawancara sederhana, tes literasi & numerasi awal..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Waktu Pelaksanaan</label>
            <input 
              type="text" 
              value={materiTes.rangkianTes.waktu} 
              onChange={e => setMateriTes({
                ...materiTes,
                rangkianTes: { ...materiTes.rangkianTes, waktu: e.target.value }
              })} 
              placeholder="Contoh: Hari ke-3, Pukul 08.00 - 11.00 WIB"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Permasalahan & Solusi</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Tuliskan kendala/permasalahan yang dihadapi serta solusi penyelesaiannya di masing-masing tahap.
        </p>

        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }} id="field-permasalahanPerencanaan">
          <h3>1. Tahap Perencanaan <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Permasalahan / Kendala</label>
            <textarea 
              value={permasalahanSolusi.perencanaan.rincian} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                perencanaan: { ...permasalahanSolusi.perencanaan, rincian: e.target.value }
              })} 
              placeholder="Contoh: Beberapa narasumber eksternal berhalangan hadir di hari yang ditentukan..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Solusi Penyelesaian</label>
            <textarea 
              value={permasalahanSolusi.perencanaan.solusi} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                perencanaan: { ...permasalahanSolusi.perencanaan, solusi: e.target.value }
              })} 
              placeholder="Contoh: Menjadwalkan ulang ke hari berikutnya atau mengganti dengan narasumber internal..."
              rows={3}
            />
          </div>
        </div>

        <div id="field-permasalahanPelaksanaan">
          <h3>2. Tahap Pelaksanaan <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Permasalahan / Kendala</label>
            <textarea 
              value={permasalahanSolusi.pelaksanaan.rincian} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                pelaksanaan: { ...permasalahanSolusi.pelaksanaan, rincian: e.target.value }
              })} 
              placeholder="Contoh: Cuaca hujan lebat mengganggu kegiatan pengenalan lingkungan luar ruangan..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Solusi Penyelesaian</label>
            <textarea 
              value={permasalahanSolusi.pelaksanaan.solusi} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                pelaksanaan: { ...permasalahanSolusi.pelaksanaan, solusi: e.target.value }
              })} 
              placeholder="Contoh: Pengenalan lingkungan diganti menggunakan media video/presentasi di dalam aula..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
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

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)', padding: '1rem', marginTop: '1.5rem', marginBottom: '0' }}>
          <p style={{ color: 'var(--danger)', margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      )}

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
