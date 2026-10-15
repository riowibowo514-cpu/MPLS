import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, namaPetugas, namaSekolah, jenjang, kabKota, status, errorMessage } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const logData: any = {
      session_id: sessionId,
      status: status || 'draft',
      updated_at: new Date().toISOString()
    };
    
    if (namaPetugas !== undefined) logData.nama_petugas = namaPetugas;
    if (namaSekolah !== undefined) logData.nama_sekolah = namaSekolah;
    if (jenjang !== undefined) logData.jenjang = jenjang;
    if (kabKota !== undefined) logData.kab_kota = kabKota;
    if (errorMessage !== undefined) logData.error_message = errorMessage;

    // Upsert the log
    const { data, error } = await supabase
      .from('form_access_logs')
      .upsert(logData, { onConflict: 'session_id' });

    if (error) {
      console.error('Supabase error logging access:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Server error logging access:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
