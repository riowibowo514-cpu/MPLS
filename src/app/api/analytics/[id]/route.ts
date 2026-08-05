import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Revalidate cache every 60 seconds (ISR / Stale-While-Revalidate)
export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unwrappedParams = await params;
    const kegiatan_id = unwrappedParams.id;

    // 1. Ambil schema instrumen
    const { data: inst } = await supabase
      .from('instrumen')
      .select('*')
      .eq('kegiatan_id', kegiatan_id)
      .single();
    
    if (!inst) {
      return NextResponse.json({ error: 'Instrumen tidak ditemukan' }, { status: 404 });
    }

    const { data: metaFields } = await supabase.from('instrumen_metadata_field').select('*').eq('instrumen_id', inst.id).order('urutan');
    const { data: sections } = await supabase.from('instrumen_section').select('*, items:instrumen_item(*)').eq('instrumen_id', inst.id).order('urutan');

    const schema = {
      ...inst,
      metadata_fields: metaFields || [],
      sections: sections || []
    };

    // 2. Ambil seluruh data pengisian dan jawaban
    // (Ini berat, oleh karena itu diletakkan di server side dengan cache 60 detik)
    const { data: pengisians, error: pError } = await supabase
      .from('pengisian')
      .select('*, jawaban(*)')
      .eq('instrumen_id', inst.id)
      .order('tanggal_pengisian', { ascending: true });
      
    if (pError) throw pError;
    const safePengisians = pengisians || [];

    // 3. --- PRE-CALCULATE AGGREGATIONS ---
    const sectionAverages: { nama: string, avg: number }[] = [];
    const itemStats: { id: string, teks: string, section: string, avg: number, total: number }[] = [];
    const rawChoiceCounts: Record<string, Record<string, number>> = {}; // item_id -> text -> count
    
    schema.sections.forEach((sec: any) => {
      let secTotalScore = 0;
      let secTotalAnswers = 0;

      sec.items.forEach((item: any) => {
        if (item.tipe_jawaban.includes('likert')) {
          let itemTotalScore = 0;
          let itemAnswersCount = 0;

          safePengisians.forEach((p: any) => {
            const ans = p.jawaban.find((j: any) => j.item_id === item.id);
            if (ans && ans.nilai_skor) {
              itemTotalScore += ans.nilai_skor;
              itemAnswersCount++;
              secTotalScore += ans.nilai_skor;
              secTotalAnswers++;
            }
          });

          if (itemAnswersCount > 0) {
            itemStats.push({
              id: item.id,
              teks: item.teks_pertanyaan,
              section: sec.nama_section,
              avg: itemTotalScore / itemAnswersCount,
              total: itemAnswersCount
            });
          }
        } else if (item.tipe_jawaban === 'pilihan_ganda') {
          // Hitung distribusi pilihan ganda di server juga
          rawChoiceCounts[item.id] = {};
          if (item.opsi_jawaban) item.opsi_jawaban.forEach((o: string) => rawChoiceCounts[item.id][o] = 0);
          
          let countPG = 0;
          safePengisians.forEach((p: any) => {
            const ans = p.jawaban.find((j: any) => j.item_id === item.id);
            if (ans && ans.nilai_teks) {
              rawChoiceCounts[item.id][ans.nilai_teks] = (rawChoiceCounts[item.id][ans.nilai_teks] || 0) + 1;
              countPG++;
            }
          });
          // Simpan total ke dalam properties khusus agar klien mudah membaca
          rawChoiceCounts[item.id]['_total'] = countPG;
        }
      });

      if (secTotalAnswers > 0) {
        // Abaikan section identitas/saran untuk radar chart
        if (!sec.nama_section.toLowerCase().includes('identitas') && !sec.nama_section.toLowerCase().includes('saran')) {
          sectionAverages.push({
            nama: sec.nama_section,
            avg: secTotalScore / secTotalAnswers
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        schema,
        totalResponden: safePengisians.length,
        sectionAverages,
        itemStats,
        rawChoiceCounts,
        // Kirimkan data pengisians hanya untuk export, 
        // tapi di dunia nyata ini harusnya dipisah ke API export tersendiri.
        // Untuk sekarang kita sertakan agar `page.tsx` tidak rusak.
        pengisians: safePengisians
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (err: any) {
    console.error('[API/analytics] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
