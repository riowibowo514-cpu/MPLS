import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN wajib diisi' }, { status: 400 });
    }

    // Ambil PIN panitia dari database
    const { data: panitiaUser, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('username', 'panitia')
      .single();

    if (error || !panitiaUser) {
      return NextResponse.json({ error: 'Konfigurasi panitia tidak ditemukan' }, { status: 500 });
    }

    if (pin !== panitiaUser.password_hash) {
      return NextResponse.json({ error: 'PIN tidak valid' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
