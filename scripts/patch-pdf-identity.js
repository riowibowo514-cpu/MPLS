const fs = require('fs');

function patchIdentity(path, isCari) {
  let content = fs.readFileSync(path, 'utf8');

  const oldBlockCari = `<div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid black', paddingBottom: '1rem' }}>
            <h2>BERITA ACARA MONEV</h2>
            <h3>{schema.nama_instrumen}</h3>
          </div>
          
          <p>Pada hari ini, telah dilaksanakan Monitoring dan Evaluasi dengan rincian identitas sebagai berikut:</p>
          <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
            <tbody>
              {schema.metadata_fields.map(m => (
                <tr key={m.id}>
                  <td style={{ width: '30%', padding: '0.5rem', border: '1px solid black' }}><strong>{m.label_field}</strong></td>
                  <td style={{ padding: '0.5rem', border: '1px solid black' }}>{selectedPengisian.metadata_values[m.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>`;

  const oldBlockIsiForm = `<div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid black', paddingBottom: '1rem' }}>
              <h2>BERITA ACARA MONEV</h2>
              <h3>{schema.nama_instrumen}</h3>
            </div>
            
            <p>Pada hari ini, telah dilaksanakan Monitoring dan Evaluasi dengan rincian identitas sebagai berikut:</p>
            <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
              <tbody>
                {schema.metadata_fields.map(m => (
                  <tr key={m.id}>
                    <td style={{ width: '30%', padding: '0.5rem', border: '1px solid black' }}><strong>{m.label_field}</strong></td>
                    <td style={{ padding: '0.5rem', border: '1px solid black' }}>{metadataValues[m.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>`;

  const newBlockCari = `<div style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.5' }}>
            INSTRUMEN MONITORING DAN EVALUASI<br/>
            IMPLEMENTASI MATEMATIKA GEMBIRA BAGI GURU TK DAN GURU SD<br/>
            TAHUN 2026<br/>
            PROVINSI SUMATERA BARAT
          </div>
          
          <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse', fontSize: '1rem' }}>
            <tbody>
              {schema.metadata_fields.map(m => (
                <tr key={m.id}>
                  <td style={{ width: '200px', padding: '0.25rem 0' }}>{m.label_field}</td>
                  <td style={{ width: '20px', padding: '0.25rem 0' }}>:</td>
                  <td style={{ padding: '0.25rem 0' }}>{selectedPengisian.metadata_values[m.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>`;

  const newBlockIsiForm = `<div style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.5' }}>
              INSTRUMEN MONITORING DAN EVALUASI<br/>
              IMPLEMENTASI MATEMATIKA GEMBIRA BAGI GURU TK DAN GURU SD<br/>
              TAHUN 2026<br/>
              PROVINSI SUMATERA BARAT
            </div>
            
            <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse', fontSize: '1rem' }}>
              <tbody>
                {schema.metadata_fields.map(m => (
                  <tr key={m.id}>
                    <td style={{ width: '200px', padding: '0.25rem 0' }}>{m.label_field}</td>
                    <td style={{ width: '20px', padding: '0.25rem 0' }}>:</td>
                    <td style={{ padding: '0.25rem 0' }}>{metadataValues[m.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>`;

  const oldBlock = isCari ? oldBlockCari : oldBlockIsiForm;
  const newBlock = isCari ? newBlockCari : newBlockIsiForm;

  if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched identity in', path, 'successfully!');
  } else {
    // If exact match fails, let's try a regex or manual substring replace
    console.log('Could not exact match oldBlock in', path);
    // Use manual slicing
    const startStr = `<div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid black', paddingBottom: '1rem' }}>`;
    const startIndex = content.indexOf(startStr);
    
    if (startIndex !== -1) {
       const endStr = `</table>`;
       let searchIdx = startIndex;
       let tableCount = 0;
       
       // find the first </table> after the start index
       const endIndex = content.indexOf(endStr, startIndex) + endStr.length;
       if (endIndex > startStr.length) {
          const oldChunk = content.substring(startIndex, endIndex);
          content = content.replace(oldChunk, newBlock);
          fs.writeFileSync(path, content, 'utf8');
          console.log('Patched identity in', path, 'successfully via manual chunk!');
       }
    }
  }
}

patchIdentity('src/app/cari/page.tsx', true);
patchIdentity('src/app/kegiatan/[id]/isi-form/page.tsx', false);
