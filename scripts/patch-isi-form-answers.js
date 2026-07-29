const fs = require('fs');

const path = 'src/app/kegiatan/[id]/isi-form/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldPrintBlock = `{metadataValues['_statusOtomatis'] && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <h4 style={{ borderBottom: '1px solid black', paddingBottom: '0.5rem' }}>HASIL EVALUASI MONEV</h4>
                <p><strong>Status Penilaian Sistem:</strong> {metadataValues['_statusOtomatis']} (Skor: {metadataValues['_skorTotal']}%)</p>
                {metadataValues['_statusFinal'] && metadataValues['_statusFinal'] !== metadataValues['_statusOtomatis'] && (
                  <>
                    <p><strong>Penilaian Subjektif Petugas:</strong> {metadataValues['_statusFinal']}</p>
                    <p><strong>Alasan Perubahan:</strong> {metadataValues['_alasanOverride']}</p>
                  </>
                )}
                <p style={{marginTop: '1rem'}}><strong>Catatan Kritis:</strong><br/>{metadataValues['_catatanKritis'] || '-'}</p>
                <p style={{marginTop: '1rem'}}><strong>Rekomendasi:</strong><br/>{metadataValues['_rekomendasi'] || '-'}</p>
              </div>
            )}`;

const newPrintBlock = `<div style={{ marginBottom: '2rem', marginTop: '2rem' }}>
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
                      const ans = jawabanValues[item.id] || {};
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
          </div>`;

content = content.replace(oldPrintBlock, newPrintBlock);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched isi-form successfully!');
