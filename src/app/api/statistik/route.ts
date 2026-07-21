import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('monev_entry')
      .select('id, jenjang, kabKota, statusFinal, namaSekolah');

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entries = data || [];

    let totalSampel = entries.length;
    let kabKotaSet = new Set<string>();
    
    let statusCounts = { 'SANGAT RAMAH': 0, 'CUKUP RAMAH': 0, 'KURANG': 0 };
    let jenjangCounts = { 'TK': 0, 'SD': 0, 'SMP': 0, 'SMA/K': 0 };

    entries.forEach(entry => {
      if (entry.kabKota) kabKotaSet.add(entry.kabKota);
      
      if (entry.statusFinal === 'SANGAT RAMAH') statusCounts['SANGAT RAMAH']++;
      else if (entry.statusFinal === 'CUKUP RAMAH') statusCounts['CUKUP RAMAH']++;
      else if (entry.statusFinal === 'KURANG') statusCounts['KURANG']++;

      if (entry.jenjang === 'TK' || entry.jenjang === 'TK / PAUD') jenjangCounts['TK']++;
      else if (entry.jenjang === 'SD') jenjangCounts['SD']++;
      else if (entry.jenjang === 'SMP') jenjangCounts['SMP']++;
      else if (entry.jenjang === 'SMA/K' || entry.jenjang === 'SMA / SMK') jenjangCounts['SMA/K']++;
    });

    const statusChartData = [
      { name: 'Sangat Ramah', value: statusCounts['SANGAT RAMAH'], fill: '#10b981' },
      { name: 'Cukup Ramah', value: statusCounts['CUKUP RAMAH'], fill: '#f59e0b' },
      { name: 'Kurang', value: statusCounts['KURANG'], fill: '#ef4444' },
    ];

    const jenjangChartData = [
      { name: 'TK', total: jenjangCounts['TK'] },
      { name: 'SD', total: jenjangCounts['SD'] },
      { name: 'SMP', total: jenjangCounts['SMP'] },
      { name: 'SMA/K', total: jenjangCounts['SMA/K'] }
    ];

    // Group schools by kabKota
    const sekolahPerKabKota: Record<string, { id: string, namaSekolah: string, jenjang: string, statusFinal: string }[]> = {};
    entries.forEach(entry => {
      if (!entry.kabKota) return;
      if (!sekolahPerKabKota[entry.kabKota]) {
        sekolahPerKabKota[entry.kabKota] = [];
      }
      sekolahPerKabKota[entry.kabKota].push({
        id: entry.id,
        namaSekolah: entry.namaSekolah,
        jenjang: entry.jenjang,
        statusFinal: entry.statusFinal
      });
    });

    return NextResponse.json({
      totalSampel,
      totalKabKota: kabKotaSet.size,
      statusChartData,
      jenjangChartData,
      sekolahPerKabKota
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
