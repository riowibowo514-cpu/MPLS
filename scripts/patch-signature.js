const fs = require('fs');

function patchSignature(path, isCari) {
  let content = fs.readFileSync(path, 'utf8');
  
  // Use a regex to match the whole <div className="signature-block">...</div>
  // We can just match everything from <div className="signature-block" up to the matching closing div.
  // Since we know the exact structure, we can do a lazy match.
  const regex = /<div className="signature-block"[^>]*>[\s\S]*?<p>NIP: \.{20,}<\/p>\s*<\/div>\s*<\/div>/;
  
  const match = content.match(regex);
  
  if (match) {
    const valuesSrc = isCari ? 'selectedPengisian.metadata_values' : 'metadataValues';
    
    const newBlock = `{(() => {
            const getMeta = (lbl) => {
              const f = schema.metadata_fields.find(m => m.label_field.toLowerCase().includes(lbl.toLowerCase()));
              return f ? ${valuesSrc}[f.id] : '';
            };
            const kab = getMeta('kabupaten') || '................';
            const tgl = getMeta('tanggal') || '................';
            let namaP = getMeta('nama petugas');
            if (!namaP) namaP = '................................................';
            let nipP = getMeta('nip');
            if (!nipP) nipP = '...........................';
            let namaR = getMeta('nama responden');
            if (!namaR) namaR = '................................................';

            let formattedTgl = tgl;
            if (tgl && tgl.includes('-')) {
              const d = new Date(tgl);
              if (!isNaN(d.getTime())) {
                formattedTgl = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
              }
            }

            return (
              <div className="signature-block">
                <div style={{ textAlign: 'right', marginBottom: '1rem', paddingRight: '2rem' }}>
                  {kab}, {formattedTgl}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                  <div style={{ width: '40%' }}>
                    <p>Responden / Pihak Sekolah,</p>
                    <div style={{ height: '80px' }}></div>
                    <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{namaR}</p>
                    <p>NIP/NUPTK: ...........................</p>
                  </div>
                  <div style={{ width: '40%' }}>
                    <p>Petugas Monev,</p>
                    <div style={{ height: '80px' }}></div>
                    <p style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{namaP}</p>
                    <p>NIP: {nipP}</p>
                  </div>
                </div>
              </div>
            );
          })()}`;
          
    content = content.replace(regex, newBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched signature in', path, 'successfully via Regex!');
  } else {
    console.log('Failed to match Regex in', path);
  }
}

patchSignature('src/app/cari/page.tsx', true);
patchSignature('src/app/kegiatan/[id]/isi-form/page.tsx', false);
