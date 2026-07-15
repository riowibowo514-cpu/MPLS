import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi dasar
    if (!body.namaSekolah || !body.jenjang) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('monev_entry')
      .insert([
        {
          namaSekolah: body.namaSekolah,
          jenjang: body.jenjang,
          alamat: body.alamat,
          namaPetugas: body.namaPetugas,
          tanggal: body.tanggal,
          namaKepsek: body.namaKepsek,
          jawabanUmum: body.jawabanUmum,
          jawabanKhusus: body.jawabanKhusus,
          catatanKritis: body.catatanKritis,
          rekomendasi: body.rekomendasi,
          statusOtomatis: body.statusOtomatis,
          statusFinal: body.statusFinal,
          alasanOverride: body.alasanOverride
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data[0] }, { status: 201 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Ambil data terbaru, batasi 100
    const { data, error } = await supabase
      .from('monev_entry')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
