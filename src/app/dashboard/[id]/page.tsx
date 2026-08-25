"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { InstrumenFull } from '@/lib/types';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { generateDynamicPDFSummary } from '@/lib/exportGenerator';

import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, 
  BarElement, PointElement, LineElement, RadialLinearScale, RadarController, Filler 
} from 'chart.js';
import { Pie, Bar, Line, Radar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, 
  BarElement, PointElement, LineElement, RadialLinearScale, RadarController, Filler
);

export default function DetailDashboardKegiatan({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const kegiatan_id = unwrappedParams.id;
  
  const [schema, setSchema] = useState<InstrumenFull | null>(null);
  const [pengisians, setPengisians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [kegiatan_id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Panggil API Analytics yang sudah menggunakan Cache & ISR
      const res = await fetch(`/api/analytics/${kegiatan_id}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Gagal memuat analitik');
      
      setSchema(json.data.schema);
      setAnalyticsData(json.data);
      // Kita tetap simpan pengisians untuk keperluan Export Excel
      setPengisians(json.data.pengisians || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!schema || pengisians.length === 0) return alert('Tidak ada data untuk diekspor');

    const headers = ['ID Pengisian', 'Tanggal Submit'];
    schema.metadata_fields.forEach(m => headers.push(m.label_field));
    
    const orderedItems: any[] = [];
    schema.sections.forEach(sec => {
      const items = [...sec.items].sort((a, b) => a.urutan - b.urutan);
      items.forEach(item => {
        orderedItems.push(item);
        headers.push(`[${sec.nama_section}] ${item.teks_pertanyaan}`);
        if (item.butuh_catatan_bukti) {
          headers.push(`[BUKTI] ${item.teks_pertanyaan}`);
        }
      });
    });

    const rows = pengisians.map(p => {
      const row: any = {
        'ID Pengisian': p.id,
        'Tanggal Submit': new Date(p.tanggal_pengisian).toLocaleString('id-ID')
      };

      schema.metadata_fields.forEach(m => {
        row[m.label_field] = p.metadata_values[m.id] || '';
      });

      const ansMap: Record<string, any> = {};
      p.jawaban.forEach((j: any) => {
        ansMap[j.item_id] = j;
      });

      orderedItems.forEach(item => {
        const headerText = `[${item.section_id ? schema.sections.find(s => s.id === item.section_id)?.nama_section : ''}] ${item.teks_pertanyaan}`;
        const ans = ansMap[item.id];
        
        if (ans) {
          row[headerText] = item.tipe_jawaban.includes('likert') ? ans.nilai_skor : ans.nilai_teks;
          if (item.butuh_catatan_bukti) {
            row[`[BUKTI] ${item.teks_pertanyaan}`] = ans.catatan_bukti || '';
          }
        } else {
          row[headerText] = '';
          if (item.butuh_catatan_bukti) row[`[BUKTI] ${item.teks_pertanyaan}`] = '';
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Monev");
    XLSX.writeFile(workbook, `Rekap_Monev_${schema.nama_instrumen.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);

    try {
      await fetch('/api/track-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aksi: `Export Dashboard Excel: ${schema.nama_instrumen}` })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPDF = async () => {
    if (!schema || pengisians.length === 0) return alert('Tidak ada data untuk diekspor');
    generateDynamicPDFSummary(schema, pengisians);
    
    try {
      await fetch('/api/track-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aksi: `Export Dashboard PDF: ${schema.nama_instrumen}` })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !analyticsData) return <div className="container" style={{ padding: '2rem' }}>Memuat analitik...</div>;
  if (!schema) return <div className="container" style={{ padding: '2rem' }}>Data tidak ditemukan.</div>;

  // Gunakan agregat hasil pre-calculate dari Server API (Sangat Cepat & Ringan)
  const { sectionAverages, itemStats, totalResponden, rawChoiceCounts, userMap } = analyticsData;

  // Lapis 1: Radar Data
  const radarData = {
    labels: sectionAverages.map((s: any) => s.nama),
    datasets: [{
      label: 'Rata-rata Kepuasan (Skala 1-4)',
      data: sectionAverages.map((s: any) => parseFloat(s.avg.toFixed(2))),
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8b5cf6',
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#8b5cf6',
      borderWidth: 2,
    }]
  };

  // Lapis 2: Top & Bottom Insights
  const sortedItems = [...itemStats].sort((a, b) => b.avg - a.avg);
  const top3 = sortedItems.slice(0, 3);
  // Ambil 3 terbawah (pastikan tidak duplikat jika item sedikit)
  const bottom3 = sortedItems.length > 3 ? [...sortedItems].reverse().slice(0, 3) : [];

  // Helper untuk Progress Bar Mini
  const renderProgressBar = (avg: number) => {
    const percentage = (avg / 4) * 100;
    let color = '#ef4444'; // Merah
    if (avg >= 3.5) color = '#10b981'; // Hijau
    else if (avg >= 2.5) color = '#3b82f6'; // Biru
    else if (avg >= 1.5) color = '#f59e0b'; // Kuning

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', background: color, transition: 'width 1s ease-in-out' }} />
        </div>
        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#475569', minWidth: '40px' }}>
          {avg.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <main className="container animate-fade-in" style={{ padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Ringkasan Eksekutif: {schema.nama_instrumen}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Total Responden: <strong>{totalResponden}</strong> orang</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportPDF}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Export PDF
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', borderColor: '#10b981' }} onClick={handleExportExcel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2v4H8z"/><path d="M14 13h2v4h-2z"/></svg>
            Export Excel
          </button>
        </div>
      </div>

      {totalResponden === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          Belum ada data pengisian untuk instrumen ini.
        </div>
      ) : (
        <>
          {/* DAFTAR RIWAYAT PENGISIAN */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              Daftar Riwayat Pengisian
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>No</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Nama Petugas Monev</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Tanggal Submit</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pengisians.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                        {userMap && userMap[p.petugas_id] ? userMap[p.petugas_id].nama : 'Anonim / Publik'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {new Date(p.tanggal_pengisian).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <Link href={`/cari?token=${p.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LAPIS 1 & 2: Overview (Radar & Insights) - HANYA TAMPIL JIKA ADA DATA LIKERT */}
          {sectionAverages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Lapis 1: Radar Chart */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '0.5rem', width: '100%', textAlign: 'center' }}>Kinerja Keseluruhan per Aspek</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>Skala 1 (Kurang) hingga 4 (Baik Sekali)</p>
                
                <div style={{ width: '100%', maxWidth: '600px', height: '350px' }}>
                  <Radar 
                    data={radarData}
                    options={{
                      maintainAspectRatio: false,
                      layout: {
                        padding: {
                          top: 20,
                          bottom: 20,
                          left: 40,
                          right: 40
                        }
                      },
                      scales: {
                        r: {
                          min: 1,
                          max: 4,
                          angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                          grid: { color: 'rgba(0, 0, 0, 0.1)' },
                          pointLabels: { 
                            font: { size: 11, family: "'Inter', sans-serif" }, 
                            color: '#475569',
                            padding: 10
                          },
                          ticks: { stepSize: 1, backdropColor: 'transparent' }
                        }
                      },
                      plugins: { legend: { display: false } }
                    }}
                  />
                </div>
              </div>

              {/* Lapis 2: Insights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ borderLeft: '4px solid #10b981', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏆</span>
                  <h3 style={{ margin: 0, color: '#047857' }}>Kekuatan (3 Terbaik)</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {top3.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < 2 ? '0.75rem' : 0 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#334155', margin: 0, lineHeight: 1.4 }}>{item.teks}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.section}</span>
                      </div>
                      <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        {item.avg.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {bottom3.length > 0 && (
                <div className="card" style={{ borderLeft: '4px solid #ef4444', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <h3 style={{ margin: 0, color: '#b91c1c' }}>Area Perbaikan (3 Terendah)</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bottom3.map((item, i) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < 2 ? '0.75rem' : 0 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#334155', margin: 0, lineHeight: 1.4 }}>{item.teks}</p>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.section}</span>
                        </div>
                        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.875rem' }}>
                          {item.avg.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* LAPIS 3: Tabel Progres Mini per Section */}
          <h2 style={{ fontSize: '1.25rem', marginTop: '3rem', marginBottom: '1.5rem', color: '#1e293b' }}>Rincian Skor per Aspek</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {schema.sections.map((section) => {
              const likertItems = section.items.filter(item => item.tipe_jawaban.includes('likert'));
              const choiceItems = section.items.filter(item => item.tipe_jawaban === 'pilihan_ganda');
              
              if (likertItems.length === 0 && choiceItems.length === 0) return null;

              return (
                <div key={section.id} className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    {section.urutan}. {section.nama_section}
                  </h3>
                  
                  {/* Tabel Likert */}
                  {likertItems.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                      {likertItems.map(item => {
                        const stat = itemStats.find((s: any) => s.id === item.id);
                        return (
                          <div key={item.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
                            <p style={{ flex: '1 1 300px', fontSize: '0.9rem', color: '#475569', margin: 0 }}>
                              {item.teks_pertanyaan}
                            </p>
                            <div style={{ flex: '0 0 250px' }}>
                              {stat ? renderProgressBar(stat.avg) : <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Belum ada data</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tabel Pilihan Ganda (seperti Rekomendasi) */}
                  {choiceItems.length > 0 && (
                    <div style={{ marginTop: likertItems.length > 0 ? '2rem' : '1rem', paddingTop: likertItems.length > 0 ? '1rem' : 0, borderTop: likertItems.length > 0 ? '1px dashed #e2e8f0' : 'none' }}>
                      {choiceItems.map(item => {
                        // Gunakan rawChoiceCounts dari API Server
                        const counts: Record<string, number> = {};
                        if (rawChoiceCounts && rawChoiceCounts[item.id]) {
                          Object.keys(rawChoiceCounts[item.id]).forEach(k => {
                            if (k !== '_total') counts[k] = rawChoiceCounts[item.id][k];
                          });
                        }
                        const total = rawChoiceCounts?.[item.id]?._total || 0;

                        const choiceData = {
                          labels: Object.keys(counts),
                          datasets: [{
                            data: Object.values(counts),
                            backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'],
                            borderWidth: 0
                          }]
                        };

                        return (
                          <div key={item.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            <p style={{ flex: '1 1 300px', fontSize: '0.9rem', color: '#475569', margin: 0, fontWeight: '500' }}>
                              {item.teks_pertanyaan}
                            </p>
                            <div style={{ flex: '0 0 250px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {total > 0 ? (
                                <>
                                  <div style={{ width: '80px', height: '80px' }}>
                                    <Pie data={choiceData} options={{ plugins: { legend: { display: false } } }} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {Object.entries(counts).map(([key, val]) => (
                                      val > 0 && (
                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: choiceData.datasets[0].backgroundColor[Object.keys(counts).indexOf(key) % 5] }} />
                                          {key}: <strong>{val}</strong>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Belum ada data</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link href="/dashboard" className="btn btn-outline" style={{ border: 'none', color: '#64748b' }}>&larr; Kembali ke Daftar Kegiatan</Link>
      </div>
    </main>
  );
}
