import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kegiatan_id = searchParams.get('kegiatan_id');

    if (!kegiatan_id) {
      return NextResponse.json({ error: 'kegiatan_id is required' }, { status: 400 });
    }

    // 1. Dapatkan Instrumen
    const { data: instrumen, error: instErr } = await supabase
      .from('instrumen')
      .select('*')
      .eq('kegiatan_id', kegiatan_id)
      .single();

    if (instErr || !instrumen) {
      return NextResponse.json({ error: 'Instrumen tidak ditemukan untuk kegiatan ini' }, { status: 404 });
    }

    // 2. Dapatkan Struktur Instrumen
    const { data: metaFields } = await supabase
      .from('instrumen_metadata_field')
      .select('*')
      .eq('instrumen_id', instrumen.id)
      .order('urutan', { ascending: true });

    const { data: sections } = await supabase
      .from('instrumen_section')
      .select('*, items:instrumen_item(*)')
      .eq('instrumen_id', instrumen.id)
      .order('urutan', { ascending: true });

    if (sections) {
      sections.forEach(s => s.items.sort((a: any, b: any) => a.urutan - b.urutan));
    }

    // 3. Dapatkan Data Pengisian
    const { data: pengisianList, error: pErr } = await supabase
      .from('pengisian')
      .select('*')
      .eq('instrumen_id', instrumen.id);

    if (pErr) throw pErr;

    // 4. Dapatkan Semua Jawaban yang terkait dengan pengisian tersebut
    const pengisianIds = pengisianList ? pengisianList.map(p => p.id) : [];
    let jawabanMap: Record<string, any[]> = {}; // pengisian_id -> list of jawaban

    if (pengisianIds.length > 0) {
      const { data: jawabanList } = await supabase
        .from('jawaban')
        .select('*')
        .in('pengisian_id', pengisianIds);

      if (jawabanList) {
        jawabanList.forEach(j => {
          if (!jawabanMap[j.pengisian_id]) jawabanMap[j.pengisian_id] = [];
          jawabanMap[j.pengisian_id].push(j);
        });
      }
    }

    // 5. Mapping Data Petugas
    const { data: users } = await supabase.from('users').select('id, nama_lengkap, username');
    const userMap: Record<string, { nama: string, nip: string }> = {};
    if (users) {
      users.forEach(u => userMap[u.id] = { nama: u.nama_lengkap, nip: u.username });
    }

    // --- MULAI MERANGKAI EXCEL --- //

    const rows: any[] = [];
    const headers = [];

    // Header Identitas
    headers.push('ID Pengisian', 'Tanggal Submit', 'Nama Petugas Akun', 'NIP Akun');
    metaFields?.forEach(mf => {
      headers.push(mf.nama_field || mf.label_field);
    });

    // Header Hasil Skoring (Hanya jika instrumen memiliki sistem skoring)
    const hasScoring = instrumen.config_skoring ? true : false;
    if (hasScoring) {
      headers.push('Status Sistem (Otomatis)', 'Skor Total Sistem (%)', 'Status Final (Subjektif)', 'Alasan Perubahan Status', 'Catatan Kritis', 'Rekomendasi');
    }

    // Header Soal
    sections?.forEach(sec => {
      sec.items.forEach((item: any, idx: number) => {
        const title = `[${sec.nama_section}] ${item.teks_pertanyaan}`;
        if (item.tipe_jawaban === 'likert4') {
          headers.push(`${title} (Nilai 1-4)`);
        } else if (item.tipe_jawaban === 'esai') {
          headers.push(`${title} (Teks)`);
        } else if (item.tipe_jawaban === 'pilihan_ganda') {
          headers.push(`${title} (Pilihan Ganda)`);
        } else if (item.tipe_jawaban === 'checkbox') {
          headers.push(`${title} (Multikriteria)`);
        }
        
        if (item.butuh_catatan_bukti) {
          headers.push(`${title} (Catatan/Bukti)`);
        }
      });
    });

    rows.push(headers);

    // Isi Baris Data
    pengisianList?.forEach(p => {
      const row = [];
      
      // Identitas
      row.push(p.id);
      const d = new Date(p.tanggal_pengisian);
      const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
      row.push(formattedDate);
      row.push(userMap[p.petugas_id]?.nama || '-');
      row.push(userMap[p.petugas_id]?.nip || '-');
      
      metaFields?.forEach(mf => {
        row.push(p.metadata_values[mf.id] || '');
      });

      // Skoring
      if (hasScoring) {
        row.push(p.metadata_values['_statusOtomatis'] || '');
        row.push(p.metadata_values['_skorTotal'] || '');
        row.push(p.metadata_values['_statusFinal'] || '');
        row.push(p.metadata_values['_alasanOverride'] || '');
        row.push(p.metadata_values['_catatanKritis'] || '');
        row.push(p.metadata_values['_rekomendasi'] || '');
      }

      // Soal & Jawaban
      const jList = jawabanMap[p.id] || [];
      const itemToJawaban: Record<string, any> = {};
      jList.forEach(j => itemToJawaban[j.item_id] = j);

      sections?.forEach(sec => {
        sec.items.forEach((item: any) => {
          const ans = itemToJawaban[item.id];
          if (item.tipe_jawaban === 'likert4') {
            row.push(ans ? ans.nilai_skor : '');
          } else if (item.tipe_jawaban === 'esai' || item.tipe_jawaban === 'pilihan_ganda' || item.tipe_jawaban === 'checkbox') {
            row.push(ans ? ans.nilai_teks : '');
          }
          
          if (item.butuh_catatan_bukti) {
            row.push(ans ? ans.catatan_bukti : '');
          }
        });
      });

      rows.push(row);
    });

    // Buat Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    
    // Set Column Widths based on header length (max 50 chars to avoid absurdly wide columns)
    const colWidths = headers.map(header => {
      return { wch: Math.min(50, Math.max(15, String(header).length + 2)) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Monev');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Data_Monev_${instrumen.nama_instrumen.replace(/[^a-z0-9]/gi, '_')}.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error('Excel Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
