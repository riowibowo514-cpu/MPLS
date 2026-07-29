import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Cek di tabel users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      // Fallback sementara untuk super admin jika tabel kosong / belum di-seed
      if (username === 'admin' && password === 'D4t4BgtkSumbar') {
        await createSession({
          id: 'super-admin',
          username: 'admin',
          nama_lengkap: 'Super Admin',
          role: 'admin',
        });
        return NextResponse.json({ success: true, redirect: '/dashboard' });
      }
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // 2. Verifikasi Password (di sistem nyata harus pakai bcrypt.compare)
    // Untuk tahap ini kita asumsikan plain-text atau hash sederhana sesuai setup db
    if (user.password_hash !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // 3. Buat Sesi JWT
    await createSession({
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      instansi_wilayah: user.instansi_wilayah
    });

    // Tentukan halaman redirect berdasarkan role
    let redirectUrl = '/dashboard';
    if (user.role === 'petugas') redirectUrl = '/kegiatan';

    return NextResponse.json({ success: true, redirect: redirectUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  // Hapus admin_token lama jika ada
  response.cookies.delete('admin_token');
  return response;
}
