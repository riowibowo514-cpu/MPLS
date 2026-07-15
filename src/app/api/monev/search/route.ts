import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 3) {
      return NextResponse.json({ error: 'Kata kunci pencarian minimal 3 karakter' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('monev_entry')
      .select('*')
      .or(`namaSekolah.ilike.%${q}%,npsn.ilike.%${q}%`)
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
