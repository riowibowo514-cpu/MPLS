"use client";

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LaporanAnalisisPanitia({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const kegiatanId = unwrappedParams.id;
  const [pin, setPin] = useState<string | null>(null);
  
  const [kegiatan, setKegiatan] = useState<any>(null);
  const [instrumen, setInstrumen] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data agregasi
  const [totalResponden, setTotalResponden] = useState(0);
  const [rataRataAspek, setRataRataAspek] = useState<Record<string, { total_skor: number, count: number }>>({});
  const [daftarSaran, setDaftarSaran] = useState<{ pertanyaan: string, jawaban: string[] }[]>([]);

  useEffect(() => {
    // Ambil PIN dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const pinParam = urlParams.get('pin');
    setPin(pinParam);
    
    if (pinParam) {
      fetchReportData(pinParam);
    } else {
      setError("PIN akses tidak ditemukan. Harap buka laporan ini dari Brankas Data Panitia.");
      setIsLoading(false);
    }
  }, [kegiatanId]);

  const fetchReportData = async (pinAkses: string) => {
    setIsLoading(true);
    try {
      // 1. Verifikasi Kegiatan dan PIN
      const { data: kegData, error: kegErr } = await supabase
        .from('kegiatan')
        .select('*')
        .eq('id', kegiatanId)
        .single();
        
      if (kegErr || !kegData) throw new Error("Kegiatan tidak ditemukan");
      if (kegData.pin_akses !== pinAkses) throw new Error("PIN akses salah atau tidak valid");
      setKegiatan(kegData);

      // 2. Ambil Instrumen & Struktur
      const { data: instData, error: instErr } = await supabase
        .from('instrumen')
        .select('*')
        .eq('kegiatan_id', kegiatanId)
        .single();
      if (instErr || !instData) throw new Error("Instrumen belum dibuat");
      
      const { data: sections } = await supabase
        .from('instrumen_section')
        .select('*, instrumen_item(*)')
        .eq('instrumen_id', instData.id)
        .order('urutan', { ascending: true });
        
      if (!sections) throw new Error("Struktur instrumen kosong");
      
      // Urutkan item per section
      sections.forEach(s => {
        if (s.instrumen_item) {
          s.instrumen_item.sort((a: any, b: any) => a.urutan - b.urutan);
        }
      });
      setInstrumen({ ...instData, sections });

      // 3. Ambil Data Pengisian
      const { data: pengisian, error: pErr } = await supabase
        .from('pengisian')
        .select('id')
        .eq('instrumen_id', instData.id);
        
      if (pErr) throw pErr;
      setTotalResponden(pengisian ? pengisian.length : 0);
      
      if (pengisian && pengisian.length > 0) {
        const pengisianIds = pengisian.map(p => p.id);
        
        // 4. Ambil semua jawaban untuk pengisian tersebut
        const { data: jawaban, error: jErr } = await supabase
          .from('jawaban')
          .select('*')
          .in('pengisian_id', pengisianIds);
          
        if (jErr) throw jErr;
        
        // --- PROSES AGREGASI ---
        const rataRata: Record<string, { total_skor: number, count: number }> = {};
        const masukan: Record<string, { pertanyaan: string, jawaban: string[] }> = {};
        
        sections.forEach((sec: any) => {
          sec.instrumen_item.forEach((item: any) => {
            const isScorable = item.tipe_jawaban.startsWith('likert') || item.tipe_jawaban === 'angka';
            const isText = item.tipe_jawaban === 'esai' || item.tipe_jawaban === 'teks_singkat';
            
            // Siapkan wadah
            if (isScorable) rataRata[item.id] = { total_skor: 0, count: 0 };
            if (isText) masukan[item.id] = { pertanyaan: item.teks_pertanyaan, jawaban: [] };
          });
        });

        jawaban.forEach(jwb => {
          if (rataRata[jwb.item_id] && jwb.nilai_skor !== null) {
            rataRata[jwb.item_id].total_skor += Number(jwb.nilai_skor);
            rataRata[jwb.item_id].count += 1;
          }
          if (masukan[jwb.item_id] && jwb.nilai_teks) {
             masukan[jwb.item_id].jawaban.push(jwb.nilai_teks);
          }
        });

        setRataRataAspek(rataRata);
        setDaftarSaran(Object.values(masukan).filter(m => m.jawaban.length > 0));
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Memuat laporan analisis...</div>;
  if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: 'red' }}><strong>Error:</strong> {error}</div>;

  let grandTotalScore = 0;
  let grandTotalCount = 0;
  const sectionAverages: Record<string, { avg: string, percentage: string }> = {};

  if (instrumen && instrumen.sections) {
    instrumen.sections.forEach((section: any) => {
      let secScore = 0;
      let secCount = 0;
      section.instrumen_item.forEach((item: any) => {
        if (rataRataAspek[item.id]) {
          secScore += rataRataAspek[item.id].total_skor;
          secCount += rataRataAspek[item.id].count;
        }
      });
      grandTotalScore += secScore;
      grandTotalCount += secCount;
      if (secCount > 0) {
        sectionAverages[section.id] = {
          avg: (secScore / secCount).toFixed(2),
          percentage: ((secScore / (secCount * 4)) * 100).toFixed(1)
        };
      }
    });
  }

  const grandAvg = grandTotalCount > 0 ? (grandTotalScore / grandTotalCount).toFixed(2) : "0.00";
  const grandPercentage = grandTotalCount > 0 ? ((grandTotalScore / (grandTotalCount * 4)) * 100).toFixed(1) : "0.0";

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Header Khusus Web (Disembunyikan saat print) */}
      <div className="no-print" style={{ background: '#1e40af', color: 'white', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Portal Panitia: Laporan Analisis</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>Siap untuk dicetak sebagai bahan evaluasi kegiatan.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn btn-primary"
          style={{ background: '#f59e0b', borderColor: '#f59e0b', color: 'white', fontSize: '1.1rem', display: 'flex', gap: '0.5rem' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Cetak PDF
        </button>
      </div>

      {/* Konten Laporan (Kertas A4) */}
      <div className="report-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem', color: '#111827' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Laporan Hasil Evaluasi Penyelenggaraan Kegiatan</h2>
          <h1 style={{ fontSize: '1.75rem', color: '#1e40af', marginBottom: '1rem' }}>{kegiatan?.nama_kegiatan}</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', fontSize: '1.1rem', marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Responden</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{totalResponden} <span style={{fontSize:'1rem', fontWeight:'normal'}}>Orang</span></div>
             </div>
             
             <div style={{ width: '1px', background: '#cbd5e1' }}></div>
             
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kepuasan Keseluruhan</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: Number(grandAvg) >= 3 ? '#10b981' : '#f59e0b' }}>
                 {grandAvg} <span style={{fontSize:'1rem', fontWeight:'normal', color: '#64748b'}}>/ 4.00</span>
               </div>
             </div>
          </div>
        </div>

        {totalResponden === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#f3f4f6', borderRadius: '8px' }}>
             Belum ada responden yang mengisi instrumen evaluasi ini.
          </div>
        ) : (
          <>
            {/* Bagian Rata-Rata Aspek */}
            <h3 style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '0.75rem', marginBottom: '1.5rem' }}>1. Rata-Rata Nilai per Aspek</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Skor dihitung dari skala 1-4 (Sangat Kurang hingga Sangat Baik).</p>
            
            {instrumen?.sections.map((section: any) => {
              const scorableItems = section.instrumen_item.filter((i: any) => rataRataAspek[i.id]);
              if (scorableItems.length === 0) return null;
              
              return (
                <div key={section.id} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', margin: '0 0 1rem 0' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{section.nama_section}</h4>
                    {sectionAverages[section.id] && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: Number(sectionAverages[section.id].avg) >= 3 ? '#10b981' : '#f59e0b' }}>
                          Rata-rata: {sectionAverages[section.id].avg} / 4.00
                        </div>
                      </div>
                    )}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <tbody>
                      {scorableItems.map((item: any, index: number) => {
                        const data = rataRataAspek[item.id];
                        const avg = data.count > 0 ? (data.total_skor / data.count).toFixed(2) : "0.00";
                        const percentage = data.count > 0 ? ((data.total_skor / (data.count * 4)) * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.75rem 0.5rem', width: '5%', verticalAlign: 'top' }}>{index + 1}.</td>
                            <td style={{ padding: '0.75rem 0.5rem', width: '70%', verticalAlign: 'top' }}>{item.teks_pertanyaan}</td>
                            <td style={{ padding: '0.75rem 0.5rem', width: '25%', verticalAlign: 'top', textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: Number(avg) >= 3 ? '#10b981' : '#f59e0b' }}>
                                {avg} / 4.00
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Index: {percentage}%</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}

            {/* Bagian Masukan dan Saran */}
            {daftarSaran.length > 0 && (
              <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
                <h3 style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '0.75rem', marginBottom: '1.5rem' }}>2. Rekapitulasi Masukan & Saran</h3>
                
                {daftarSaran.map((saran, i) => (
                  <div key={i} style={{ marginBottom: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#4c1d95' }}>Q: {saran.pertanyaan}</h4>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                      {saran.jawaban.map((jwb, jIdx) => (
                        <li key={jIdx} style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>"{jwb}"</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '4rem', textAlign: 'right', paddingRight: '2rem' }}>
               <p style={{ marginBottom: '4rem' }}>Ketua Panitia Kegiatan,</p>
               <p style={{ fontWeight: 'bold' }}>..........................................</p>
            </div>
          </>
        )}

      </div>
      
      {/* CSS Khusus Print agar terlihat seperti laporan */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .report-container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}} />
    </div>
  );
}
