import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSession, getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password, expectedRole } = await request.json();

    // 1. Cek di tabel users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      // Fallback sementara untuk super admin jika tabel kosong / belum di-seed
      if (username === 'admin' && password === 'D4t4BgtkSumbar') {
        if (expectedRole && expectedRole !== 'admin') {
          return NextResponse.json({ error: `Akses ditolak. Anda login ke portal ${expectedRole}, namun akun ini adalah Admin.` }, { status: 403 });
        }
        await createSession({
          id: 'super-admin',
          username: 'admin',
          nama_lengkap: 'Super Admin',
          role: 'admin',
        });
        return NextResponse.json({ success: true, redirect: '/admin/kegiatan' });
      }
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // 2. Verifikasi Password (di sistem nyata harus pakai bcrypt.compare)
    if (user.password_hash !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // 3. Verifikasi Role
    if (expectedRole && user.role !== expectedRole) {
      const roleCapitalized = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      return NextResponse.json({ error: `Akses ditolak. Akun Anda terdaftar sebagai ${roleCapitalized}, bukan ${expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)}.` }, { status: 403 });
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
    if (user.role === 'admin') redirectUrl = '/admin/kegiatan';

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

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}
