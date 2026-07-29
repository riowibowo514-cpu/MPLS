"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { InstrumenFull } from '@/lib/types';
import Link from 'next/link';
import * as XLSX from 'xlsx';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function DetailDashboardKegiatan({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const kegiatan_id = unwrappedParams.id;
  
  const [schema, setSchema] = useState<InstrumenFull | null>(null);
  const [pengisians, setPengisians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [kegiatan_id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // 1. Ambil schema instrumen
      const { data: inst } = await supabase
        .from('instrumen')
        .select('*')
        .eq('kegiatan_id', kegiatan_id)
        .single();
      
      if (!inst) throw new Error('Instrumen tidak ditemukan');

      const { data: metaFields } = await supabase.from('instrumen_metadata_field').select('*').eq('instrumen_id', inst.id).order('urutan');
      const { data: sections } = await supabase.from('instrumen_section').select('*, items:instrumen_item(*)').eq('instrumen_id', inst.id).order('urutan');

      setSchema({
        ...inst,
        metadata_fields: metaFields || [],
        sections: sections || []
      });

      // 2. Ambil data pengisian dan jawaban
      const { data: pData } = await supabase
        .from('pengisian')
        .select('*, jawaban(*)')
        .eq('instrumen_id', inst.id)
        .order('tanggal_pengisian', { ascending: true }); // urutkan waktu
        
      setPengisians(pData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!schema || pengisians.length === 0) return alert('Tidak ada data untuk diekspor');

    // Siapkan Header
    const headers = ['ID Pengisian', 'Tanggal Submit'];
    schema.metadata_fields.forEach(m => headers.push(m.label_field));
    
    // Sort items by section and item order to make columns predictable
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

    // Siapkan Baris Data
    const rows = pengisians.map(p => {
      const row: any = {
        'ID Pengisian': p.id,
        'Tanggal Submit': new Date(p.tanggal_pengisian).toLocaleString('id-ID')
      };

      // Metadata
      schema.metadata_fields.forEach(m => {
        row[m.label_field] = p.metadata_values[m.id] || '';
      });

      // Jawaban mapping
      const ansMap: Record<string, any> = {};
      p.jawaban.forEach((j: any) => {
        ansMap[j.item_id] = j;
      });

      // Pertanyaan
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
  };

  if (isLoading) return <div className="container" style={{ padding: '2rem' }}>Memuat analitik...</div>;
  if (!schema) return <div className="container" style={{ padding: '2rem' }}>Data tidak ditemukan.</div>;

  // Chart Data Preparation
  const dateCounts = pengisians.reduce((acc, p) => {
    const date = new Date(p.tanggal_pengisian).toLocaleDateString('id-ID');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineData = {
    labels: Object.keys(dateCounts),
    datasets: [{
      label: 'Pertumbuhan Responden Masuk',
      data: Object.values(dateCounts),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.3
    }]
  };

  let pieData = null;
  let pieTitle = '';
  // Coba ambil field metadata pertama (contoh: Jenjang, Kabupaten) untuk chart Pie
  if (schema.metadata_fields.length > 0) {
    const firstMeta = schema.metadata_fields[0];
    pieTitle = `Distribusi by ${firstMeta.label_field}`;
    const metaCounts = pengisians.reduce((acc, p) => {
      const val = p.metadata_values[firstMeta.id] || 'Tidak Diisi';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    pieData = {
      labels: Object.keys(metaCounts),
      datasets: [{
        data: Object.values(metaCounts),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'],
        borderWidth: 0
      }]
    };
  }

  return (
    <main className="container animate-fade-in" style={{ padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Analitik: {schema.nama_instrumen}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Total Responden: <strong>{pengisians.length}</strong> sekolah/guru</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => alert('Fitur Ekspor PDF Naratif sedang dalam pengembangan')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Export PDF
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', borderColor: '#10b981' }} onClick={handleExportExcel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2v4H8z"/><path d="M14 13h2v4h-2z"/></svg>
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {pengisians.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          Belum ada data pengisian untuk instrumen ini.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {pieData && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>{pieTitle}</h3>
                <div style={{ width: '100%', maxWidth: '250px' }}>
                  <Pie data={pieData} />
                </div>
              </div>
            )}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Pertumbuhan Data Harian</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <Line data={lineData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Data Terbaru Masuk</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.75rem' }}>Tanggal</th>
                  {schema.metadata_fields.map(m => (
                    <th key={m.id} style={{ padding: '0.75rem' }}>{m.label_field}</th>
                  ))}
                  <th style={{ padding: '0.75rem' }}>Total Item Terjawab</th>
                </tr>
              </thead>
              <tbody>
                {pengisians.slice(0, 10).map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(p.tanggal_pengisian).toLocaleDateString('id-ID')}</td>
                    {schema.metadata_fields.map(m => (
                      <td key={m.id} style={{ padding: '0.75rem' }}>{p.metadata_values[m.id] || '-'}</td>
                    ))}
                    <td style={{ padding: '0.75rem' }}>{p.jawaban.length} item</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pengisians.length > 10 && (
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'gray', marginTop: '1rem' }}>
              Menampilkan 10 data terbaru. Silakan Export Excel untuk melihat seluruh {pengisians.length} baris data mentah.
            </p>
          )}
        </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/dashboard" className="btn btn-outline" style={{ border: 'none' }}>&larr; Kembali ke Daftar Kegiatan</Link>
      </div>
    </main>
  );
}
