import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { instrumen_id, answers, honeypot } = await request.json();

    // 1. HONEYPOT VALIDATION
    // If the honeypot field is filled, it's highly likely a bot.
    // We return a fake 200 OK success message to fool the bot without saving data.
    if (honeypot && honeypot.length > 0) {
      console.warn(`[SECURITY] Bot detected via honeypot field. Instrumen: ${instrumen_id}`);
      return NextResponse.json({ success: true, message: 'Response recorded (simulated)' }, { status: 200 });
    }

    if (!instrumen_id || !answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 2. Fetch instrumen to validate it's actually PKG and active
    const { data: instrumenData, error: instError } = await supabase
      .from('instrumen')
      .select('*, kegiatan(kategori_program, status)')
      .eq('id', instrumen_id)
      .single();

    if (instError || !instrumenData) {
      return NextResponse.json({ error: 'Instrumen tidak ditemukan' }, { status: 404 });
    }
    
    // @ts-ignore - Supabase join typing
    if (instrumenData.kegiatan?.kategori_program !== 'PKG') {
      return NextResponse.json({ error: 'Endpoint ini khusus untuk formulir PKG' }, { status: 403 });
    }
    
    // @ts-ignore
    if (instrumenData.kegiatan?.status !== 'aktif') {
      return NextResponse.json({ error: 'Sesi evaluasi sudah ditutup' }, { status: 403 });
    }

    // 3. Insert Pengisian
    const { data: pengisianData, error: pengisianError } = await supabase
      .from('pengisian')
      .insert([{
        instrumen_id: instrumen_id,
        metadata_values: {} // Anonim
      }])
      .select()
      .single();

    if (pengisianError) throw pengisianError;

    // 4. Insert Jawaban
    // We assume the frontend has correctly formatted the answers map
    const jawabanArray = Object.entries(answers).map(([itemId, val]: [string, any]) => {
      const isNum = typeof val === 'number';
      return {
        pengisian_id: pengisianData.id,
        item_id: itemId,
        nilai_skor: isNum ? val : null,
        nilai_teks: isNum ? null : String(val),
      };
    });

    const { error: jawabanError } = await supabase
      .from('jawaban')
      .insert(jawabanArray);

    if (jawabanError) throw jawabanError;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[API/submit-pkg] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
