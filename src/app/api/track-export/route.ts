import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { aksi } = await request.json();
    if (!aksi) {
      return NextResponse.json({ error: 'Parameter aksi diperlukan' }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak ada sesi aktif' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('pdf_export_logs')
      .insert([{
        user_id: session.id !== 'super-admin' ? session.id : null,
        nama_user: session.nama_lengkap || session.username,
        role: session.role,
        aksi: aksi
      }]);

    if (error) {
      console.error('Gagal mencatat log:', error);
      return NextResponse.json({ error: 'Gagal mencatat log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Invalid request in track-export:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
