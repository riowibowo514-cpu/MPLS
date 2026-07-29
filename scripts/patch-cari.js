const fs = require('fs');

const path = 'src/app/cari/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add selectedJawaban state
content = content.replace(
  `const [selectedPengisian, setSelectedPengisian] = useState<Pengisian | null>(null);`,
  `const [selectedPengisian, setSelectedPengisian] = useState<Pengisian | null>(null);\n  const [selectedJawaban, setSelectedJawaban] = useState<Record<string, any>>({});`
);

// 2. Modify fetchSchema to fetch sections and items
content = content.replace(
  `const fetchSchema = async (k_id: string) => {
    const { data: inst } = await supabase.from('instrumen').select('*').eq('kegiatan_id', k_id).single();
    if (!inst) return;
    const { data: metaFields } = await supabase.from('instrumen_metadata_field').select('*').eq('instrumen_id', inst.id).order('urutan', { ascending: true });
    setSchema({
      ...inst,
      metadata_fields: metaFields || [],
      sections: [] // We don't need sections for printing Berita Acara
    });
  };`,
  `const fetchSchema = async (k_id: string) => {
    const { data: inst } = await supabase.from('instrumen').select('*').eq('kegiatan_id', k_id).single();
    if (!inst) return;
    const { data: metaFields } = await supabase.from('instrumen_metadata_field').select('*').eq('instrumen_id', inst.id).order('urutan', { ascending: true });
    
    const { data: sections } = await supabase
      .from('instrumen_section')
      .select('*, items:instrumen_item(*)')
      .eq('instrumen_id', inst.id)
      .order('urutan', { ascending: true });

    if (sections) {
      sections.forEach(s => s.items.sort((a: any, b: any) => a.urutan - b.urutan));
    }

    setSchema({
      ...inst,
      metadata_fields: metaFields || [],
      sections: sections || []
    });
  };`
);

// 3. Modify handleDownload to fetch jawaban
content = content.replace(
  `const handleDownload = (pengisian: Pengisian) => {
    setSelectedPengisian(pengisian);
    // Beri waktu sedikit untuk React me-render komponen hidden khusus print
    setTimeout(() => {
      window.print();
    }, 300);
  };`,
  `const handleDownload = async (pengisian: Pengisian) => {
    setSelectedPengisian(pengisian);
    
    const { data: jawabanList } = await supabase
      .from('jawaban')
      .select('*')
      .eq('pengisian_id', pengisian.id);
      
    const jMap: Record<string, any> = {};
    if (jawabanList) {
      jawabanList.forEach(j => jMap[j.item_id] = j);
    }
    setSelectedJawaban(jMap);

    // Beri waktu sedikit untuk React me-render komponen hidden khusus print
    setTimeout(() => {
      window.print();
    }, 500);
  };`
);

// 4. Update the print layout
const oldPrintBlock = `          <p style={{ marginBottom: '2rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>
          
          {selectedPengisian.metadata_values['_statusOtomatis'] && (
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <h4 style={{ borderBottom: '1px solid black', paddingBottom: '0.5rem' }}>HASIL EVALUASI MONEV</h4>
              <p><strong>Status Penilaian Sistem:</strong> {selectedPengisian.metadata_values['_statusOtomatis']} (Skor: {selectedPengisian.metadata_values['_skorTotal']}%)</p>
              {selectedPengisian.metadata_values['_statusFinal'] && selectedPengisian.metadata_values['_statusFinal'] !== selectedPengisian.metadata_values['_statusOtomatis'] && (
                <>
                  <p><strong>Penilaian Subjektif Petugas:</strong> {selectedPengisian.metadata_values['_statusFinal']}</p>
                  <p><strong>Alasan Perubahan:</strong> {selectedPengisian.metadata_values['_alasanOverride']}</p>
                </>
              )}
              <p style={{marginTop: '1rem'}}><strong>Catatan Kritis:</strong><br/>{selectedPengisian.metadata_values['_catatanKritis'] || '-'}</p>
              <p style={{marginTop: '1rem'}}><strong>Rekomendasi:</strong><br/>{selectedPengisian.metadata_values['_rekomendasi'] || '-'}</p>
            </div>
          )}`;

const newPrintBlock = `          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ borderBottom: '1px solid black', paddingBottom: '0.5rem', marginBottom: '1rem' }}>HASIL ISIAN INSTRUMEN</h4>
            {schema.sections.map((section, sIdx) => (
              <div key={section.id} style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0' }}>{sIdx + 1}. {section.nama_section}</h5>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid black', padding: '0.5rem', width: '5%' }}>No</th>
                      <th style={{ border: '1px solid black', padding: '0.5rem', width: '45%' }}>Pertanyaan</th>
                      <th style={{ border: '1px solid black', padding: '0.5rem', width: '20%' }}>Jawaban</th>
                      <th style={{ border: '1px solid black', padding: '0.5rem', width: '30%' }}>Catatan/Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item: any, iIdx: number) => {
                      const ans = selectedJawaban[item.id] || {};
                      let valDisplay = '-';
                      if (item.tipe_jawaban === 'likert4') {
                        const val = ans.nilai_skor;
                        if (val === 4) valDisplay = '4 (Sangat Sesuai)';
                        else if (val === 3) valDisplay = '3 (Sesuai)';
                        else if (val === 2) valDisplay = '2 (Kurang Sesuai)';
                        else if (val === 1) valDisplay = '1 (Tidak Sesuai)';
                      } else if (item.tipe_jawaban === 'esai') {
                        valDisplay = ans.nilai_teks || '-';
                      }
                      
                      return (
                        <tr key={item.id}>
                          <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{iIdx + 1}</td>
                          <td style={{ border: '1px solid black', padding: '0.5rem' }}>{item.teks_pertanyaan}</td>
                          <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{valDisplay}</td>
                          <td style={{ border: '1px solid black', padding: '0.5rem' }}>{ans.catatan_bukti || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          
          <p style={{ marginBottom: '2rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>`;

content = content.replace(oldPrintBlock, newPrintBlock);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched successfully!');
