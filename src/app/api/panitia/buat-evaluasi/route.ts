import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { namaKegiatan, deskripsi, tanggalMulai, tanggalSelesai, adaKonsumsi, adaPenginapan, pin } = body;

    if (!namaKegiatan || !tanggalMulai || !tanggalSelesai || !pin) {
      return NextResponse.json({ error: 'Data tidak lengkap (Nama, Tanggal, dan PIN wajib diisi).' }, { status: 400 });
    }

    // Format tanggal
    const dateMulai = new Date(tanggalMulai);
    const dateSelesai = new Date(tanggalSelesai);
    const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
    
    let formattedTanggal = '';
    if (tanggalMulai === tanggalSelesai) {
      formattedTanggal = dateMulai.toLocaleDateString('id-ID', options);
    } else {
      formattedTanggal = `${dateMulai.toLocaleDateString('id-ID', options)} s.d. ${dateSelesai.toLocaleDateString('id-ID', options)}`;
    }

    // 1. Cari Master Template
    const { data: templateKegiatan, error: templateError } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('kategori_program', 'TEMPLATE_EVALUASI')
      .limit(1)
      .single();

    if (templateError || !templateKegiatan) {
      return NextResponse.json({ 
        error: 'Master Template Evaluasi belum dibuat oleh Admin Utama BGTK. Harap hubungi Admin BGTK untuk membuat 1 instrumen dengan kategori TEMPLATE_EVALUASI.' 
      }, { status: 404 });
    }

    const { data: templateInstrumen, error: instrumenError } = await supabase
      .from('instrumen')
      .select('*')
      .eq('kegiatan_id', templateKegiatan.id)
      .limit(1)
      .single();

    if (instrumenError || !templateInstrumen) {
      return NextResponse.json({ error: 'Master Template Instrumen tidak ditemukan.' }, { status: 404 });
    }

    // 2. Buat ID Baru
    const newKegiatanId = crypto.randomUUID();
    const newInstrumenId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 3. Simpan Kegiatan Baru (Sebagai EVALUASI_PANITIA)
    const { error: insertKegiatanError } = await supabase
      .from('kegiatan')
      .insert({
        id: newKegiatanId,
        nama_kegiatan: namaKegiatan,
        deskripsi: deskripsi || '',
        tahun: formattedTanggal,
        status: 'aktif',
        kategori_program: 'EVALUASI_PANITIA',
        pin_akses: pin, // Kolom PIN rahasia untuk panitia!
        created_at: now
      });

    if (insertKegiatanError) throw insertKegiatanError;

    // 4. Simpan Instrumen Baru
    const { error: insertInstrumenError } = await supabase
      .from('instrumen')
      .insert({
        id: newInstrumenId,
        kegiatan_id: newKegiatanId,
        nama_instrumen: `Instrumen Evaluasi: ${namaKegiatan}`,
        deskripsi: `Dibuat secara mandiri oleh Panitia pada ${new Date().toLocaleDateString()}`,
        created_at: now
      });

    if (insertInstrumenError) throw insertInstrumenError;

    // 5. Kloning Metadata Fields (Data Peserta/Asal Sekolah dll)
    const { data: metaFields } = await supabase
      .from('instrumen_metadata_field')
      .select('*')
      .eq('instrumen_id', templateInstrumen.id);

    if (metaFields && metaFields.length > 0) {
      const newMetaFields = metaFields.map(field => ({
        ...field,
        id: crypto.randomUUID(),
        instrumen_id: newInstrumenId
      }));
      await supabase.from('instrumen_metadata_field').insert(newMetaFields);
    }

    // 6. Kloning Sections & Items
    const { data: sections } = await supabase
      .from('instrumen_section')
      .select('*')
      .eq('instrumen_id', templateInstrumen.id)
      .order('urutan');

    if (sections && sections.length > 0) {
      for (const section of sections) {
        const sectionNameLower = section.nama_section.toLowerCase();
        
        // Logika Cerdas: Hapus section jika panitia tidak mencentang!
        if (!adaKonsumsi && (sectionNameLower.includes('konsumsi') || sectionNameLower.includes('makan'))) {
          continue; // Lewati section ini
        }
        if (!adaPenginapan && (sectionNameLower.includes('penginapan') || sectionNameLower.includes('akomodasi') || sectionNameLower.includes('hotel'))) {
          continue; // Lewati section ini
        }

        const newSectionId = crypto.randomUUID();
        
        // Simpan Section Baru
        await supabase.from('instrumen_section').insert({
          id: newSectionId,
          instrumen_id: newInstrumenId,
          nama_section: section.nama_section,
          urutan: section.urutan
        });

        // Ambil Items dari Section Lama
        const { data: items } = await supabase
          .from('instrumen_item')
          .select('*')
          .eq('section_id', section.id)
          .order('urutan');

        if (items && items.length > 0) {
          const newItems = items.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            section_id: newSectionId
          }));
          await supabase.from('instrumen_item').insert(newItems);
        }
      }
    }

    // Sukses
    return NextResponse.json({ 
      success: true, 
      kegiatan_id: newKegiatanId 
    }, { status: 201 });

  } catch (error: any) {
    console.error('API Error Buat Evaluasi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem internal: ' + error.message }, { status: 500 });
  }
}
