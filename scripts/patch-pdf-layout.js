const fs = require('fs');

function patchFile(path, isCari) {
  let content = fs.readFileSync(path, 'utf8');

  const startStr = `<div style={{ marginBottom: '2rem'${!isCari ? ", marginTop: '2rem'" : ""} }}>
            <h4 style={{ borderBottom: '1px solid black', paddingBottom: '0.5rem', marginBottom: '1rem' }}>HASIL ISIAN INSTRUMEN</h4>`;
  
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) {
    console.error('Could not find start block in', path);
    return;
  }
  
  const endStr = `</div>
            ))}
          </div>`;
  const endIndex = content.indexOf(endStr, startIndex) + endStr.length;
  
  if (endIndex < endStr.length) {
    console.error('Could not find end block in', path);
    return;
  }

  const oldBlock = content.substring(startIndex, endIndex);

  const newBlock = `<div style={{ marginBottom: '2rem'${!isCari ? ", marginTop: '2rem'" : ""} }}>
            
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'blue' }}>Petunjuk Pengisian :</p>
              <ol style={{ margin: '0 0 1rem 1rem', padding: 0 }}>
                <li>Berilah tanda ceklist (√) pada alternatif pilihan jawaban yang tersedia.<br/>
                  <div style={{ marginLeft: '1rem' }}>
                    TS = Tidak sesuai<br/>
                    KS = Kurang Sesuai<br/>
                    S = Sesuai<br/>
                    SS = Sangat sesuai
                  </div>
                </li>
                <li style={{ marginTop: '0.5rem' }}>Silahkan melengkapi <strong>Bukti Pembelajaran/Catatan</strong> pilihan jawaban pada kolom yang telah disediakan.</li>
              </ol>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ border: '1px solid black', padding: '0.5rem', width: '5%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>No</th>
                  <th rowSpan={2} style={{ border: '1px solid black', padding: '0.5rem', width: '35%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>Aspek yang Diamati</th>
                  <th colSpan={4} style={{ border: '1px solid black', padding: '0.5rem', width: '20%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>Penilaian</th>
                  <th rowSpan={2} style={{ border: '1px solid black', padding: '0.5rem', width: '40%', textAlign: 'center', backgroundColor: '#bfbfbf' }}>Bukti Pembelajaran/Catatan</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>TS</th>
                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>KS</th>
                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>S</th>
                  <th style={{ border: '1px solid black', padding: '0.25rem', textAlign: 'center', width: '5%', backgroundColor: '#bfbfbf' }}>SS</th>
                </tr>
              </thead>
              <tbody>
                {schema.sections.map((section, sIdx) => {
                  const hasLikert = section.items.some((i: any) => i.tipe_jawaban === 'likert4');
                  const hasEsai = section.items.some((i: any) => i.tipe_jawaban === 'esai');
                  
                  if (hasLikert) {
                    return (
                      <React.Fragment key={section.id}>
                        <tr>
                          <td colSpan={7} style={{ border: '1px solid black', padding: '0.5rem', fontWeight: 'bold', backgroundColor: '#f2f2f2' }}>
                            {section.nama_section}
                          </td>
                        </tr>
                        {section.items.map((item: any, iIdx: number) => {
                          const ans = ${isCari ? 'selectedJawaban' : 'jawabanValues'}[item.id] || {};
                          return (
                            <tr key={item.id}>
                              <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{iIdx + 1}</td>
                              <td style={{ border: '1px solid black', padding: '0.5rem' }}>{item.teks_pertanyaan}</td>
                              <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 1 ? '√' : ''}</td>
                              <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 2 ? '√' : ''}</td>
                              <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 3 ? '√' : ''}</td>
                              <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>{ans.nilai_skor === 4 ? '√' : ''}</td>
                              <td style={{ border: '1px solid black', padding: '0.5rem' }}>{ans.catatan_bukti || ''}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  } else {
                    return (
                      <React.Fragment key={section.id}>
                        <tr>
                          <td colSpan={7} style={{ padding: '2rem 0 0.5rem 0', fontWeight: 'bold', fontSize: '1rem' }}>
                            <u style={{ fontSize: '1.1rem' }}>{section.nama_section}</u>
                          </td>
                        </tr>
                        {section.items.map((item: any, iIdx: number) => {
                          const ans = ${isCari ? 'selectedJawaban' : 'jawabanValues'}[item.id] || {};
                          return (
                            <tr key={item.id}>
                              <td colSpan={7} style={{ border: '1px solid black', padding: '0' }}>
                                <div style={{ display: 'flex', padding: '0.5rem' }}>
                                  <div style={{ width: '5%', textAlign: 'center' }}>{21 + iIdx + 1 /* Just simulating the numbering from the PDF */}</div>
                                  <div style={{ flex: 1, paddingLeft: '0.5rem' }}>{item.teks_pertanyaan}</div>
                                </div>
                                <div style={{ borderTop: '1px solid black', padding: '1rem', minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                                  {ans.nilai_teks || ''}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>`;

  content = content.replace(oldBlock, newBlock);
  
  // We need to make sure React is available if we use React.Fragment
  if (!content.includes("import React")) {
    content = content.replace("import { useState", "import React, { useState");
  }

  fs.writeFileSync(path, content, 'utf8');
  console.log('Patched', path, 'successfully!');
}

patchFile('src/app/cari/page.tsx', true);
patchFile('src/app/kegiatan/[id]/isi-form/page.tsx', false);
