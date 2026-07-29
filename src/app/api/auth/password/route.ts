import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession, createSession } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    
    // Pastikan user login
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword } = await request.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password tidak valid' }, { status: 400 });
    }

    // Update password di database (gunakan hash di prod!)
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPassword })
      .eq('id', session.id);

    if (error) {
      throw error;
    }

    // Refresh sesi JWT untuk menghilangkan flag must_change_password
    await createSession({
      id: session.id,
      username: session.username,
      nama_lengkap: session.nama_lengkap,
      role: session.role,
      instansi_wilayah: session.instansi_wilayah
      // must_change_password dibiarkan kosong (undefined/false)
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
