# PERLU BGTK Codebase



## File: AGENTS.md
```md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

```


## File: next-env.d.ts
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```


## File: next.config.ts
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```


## File: package.json
```json
{
  "name": "temp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.110.3",
    "chart.js": "^4.5.1",
    "jose": "^6.2.4",
    "jspdf": "^4.2.1",
    "jspdf-autotable": "^5.0.8",
    "next": "16.2.10",
    "react": "19.2.4",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "19.2.4",
    "recharts": "^3.10.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "typescript": "^5"
  }
}

```


## File: scripts\clear-dummy.js
```js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDummyData() {
  console.log('Menghapus data pengisian dummy MPLS (monev)...');
  const { error: err1 } = await supabase.from('monev').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error('Error hapus monev:', err1.message);
  else console.log('Berhasil membersihkan monev.');

  console.log('Menghapus data jawaban dinamis (jawaban)...');
  const { error: err2 } = await supabase.from('jawaban').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err2) console.error('Error hapus jawaban:', err2.message);
  else console.log('Berhasil membersihkan jawaban dinamis.');

  console.log('Menghapus data pengisian dinamis (pengisian)...');
  const { error: err3 } = await supabase.from('pengisian').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err3) console.error('Error hapus pengisian:', err3.message);
  else console.log('Berhasil membersihkan pengisian dinamis.');

  console.log('Database berhasil dibersihkan dari data uji coba! Siap untuk produksi.');
}

clearDummyData();

```


## File: scripts\count-data.js
```js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { count: countPengisian } = await supabase.from('pengisian').select('*', { count: 'exact', head: true });
  console.log('Jumlah Data Baru (Form Dinamis / Matgem): ' + countPengisian);
}

checkData();

```


## File: scripts\create-log-table.js
```js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
// We need the service role key to execute DDL if possible, but actually we can just use SQL or we can create it via SQL function.
// Since we don't have direct SQL access through supabase-js unless we have a custom RPC function, I will use a direct postgres connection string if available, or I will use node-postgres.
// Wait, we used `supabase-js` to create tables before? No, we created them manually or via migrations.
// Let's check if we can just create it using standard PostgreSQL query if the DB string is available.
// I will check the .env.local for DATABASE_URL.

```


## File: scripts\export-codebase.js
```js
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const outputFile = path.resolve(projectDir, 'PERLU_BGTK_Codebase.md');

// Direktori dan file yang akan diabaikan
const ignoreDirs = ['node_modules', '.git', '.next', 'public'];
const validExtensions = ['.ts', '.tsx', '.js', '.json', '.sql', '.css'];

let combinedContent = '# PERLU BGTK Codebase\n\n';

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);

  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        walkDir(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (validExtensions.includes(ext) || file === '.env.example' || file === 'AGENTS.md') {
        // Abaikan file lock yang terlalu besar
        if (file === 'package-lock.json') continue;

        try {
          const relativePath = path.relative(projectDir, fullPath);
          const content = fs.readFileSync(fullPath, 'utf8');
          combinedContent += `\n\n## File: ${relativePath}\n\`\`\`${ext.replace('.', '')}\n${content}\n\`\`\`\n`;
        } catch (e) {
          console.error(`Gagal membaca ${file}:`, e);
        }
      }
    }
  }
}

console.log('Mulai mengumpulkan kode sumber...');
walkDir(projectDir);
fs.writeFileSync(outputFile, combinedContent, 'utf8');
console.log(`Berhasil! Kode berhasil diekspor ke: ${outputFile}`);

```


## File: scripts\patch-cari.js
```js
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

```


## File: scripts\patch-isi-form-answers.js
```js
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

```


## File: scripts\patch-isi-form.js
```js
const fs = require('fs');

const path = 'src/app/kegiatan/[id]/isi-form/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  "import { InstrumenFull, InstrumenMetadataField, InstrumenSection, InstrumenItem } from '@/lib/types';",
  "import { InstrumenFull, InstrumenMetadataField, InstrumenSection, InstrumenItem } from '@/lib/types';\nimport { DYNAMIC_SCORING_REGISTRY, calculateDynamicScore, DynamicScoringConfig } from '@/config/dynamicScoring';"
);

// 2. States
content = content.replace(
  "const [jawabanValues, setJawabanValues] = useState<Record<string, any>>({});",
  `const [jawabanValues, setJawabanValues] = useState<Record<string, any>>({});
  
  const [scoringConfig, setScoringConfig] = useState<DynamicScoringConfig | null>(null);
  const [kesimpulanComputed, setKesimpulanComputed] = useState<any>(null);
  const [kesimpulanInputs, setKesimpulanInputs] = useState({
    statusFinal: '',
    alasanOverride: '',
    catatanKritis: '',
    rekomendasi: ''
  });`
);

// 3. fetchSchema
content = content.replace(
  `setSchema({
        ...inst,
        metadata_fields: metaFields || [],
        sections: sections || []
      });`,
  `setSchema({
        ...inst,
        metadata_fields: metaFields || [],
        sections: sections || []
      });

      if (DYNAMIC_SCORING_REGISTRY[inst.nama_instrumen]) {
        setScoringConfig(DYNAMIC_SCORING_REGISTRY[inst.nama_instrumen]);
      }`
);

// 4. handleSubmit
content = content.replace(
  `const hasMeta = schema.metadata_fields.length > 0;
    const totalSteps = (hasMeta ? 1 : 0) + schema.sections.length;

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setError('');`,
  `const hasMeta = schema.metadata_fields.length > 0;
    const totalSteps = (hasMeta ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0);

    if (currentStep < totalSteps - 1) {
      if (scoringConfig && currentStep === totalSteps - 2) {
        const computed = calculateDynamicScore(scoringConfig, jawabanValues, schema.sections);
        setKesimpulanComputed(computed);
        if (!kesimpulanInputs.statusFinal) {
          setKesimpulanInputs(prev => ({ ...prev, statusFinal: computed.finalStatus }));
        }
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    if (scoringConfig) {
      if (kesimpulanInputs.statusFinal !== kesimpulanComputed?.finalStatus && !kesimpulanInputs.alasanOverride) {
        setError('Alasan Mengubah Status wajib diisi karena Anda mengubah status yang disarankan sistem.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    const finalMetadata = { ...metadataValues };
    if (scoringConfig) {
       finalMetadata['_statusOtomatis'] = kesimpulanComputed?.finalStatus || '';
       finalMetadata['_statusFinal'] = kesimpulanInputs.statusFinal;
       finalMetadata['_alasanOverride'] = kesimpulanInputs.alasanOverride;
       finalMetadata['_catatanKritis'] = kesimpulanInputs.catatanKritis;
       finalMetadata['_rekomendasi'] = kesimpulanInputs.rekomendasi;
       finalMetadata['_skorTotal'] = kesimpulanComputed?.totalScorePercentage?.toFixed(2) || '0';
       // We must update state so it shows up in success page properly
       setMetadataValues(finalMetadata);
    }`
);

content = content.replace(
  `metadata_values: metadataValues`,
  `metadata_values: finalMetadata`
);

// 5. Kesimpulan UI
content = content.replace(
  `        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>`,
  `        {/* Kesimpulan Step */}
        {scoringConfig && currentStep === (schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length && (
          <div className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #10b981' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Kesimpulan & Rekapitulasi</h2>
            
            <div style={{ padding: '1rem', backgroundColor: '#eef2ff', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Total Skor Sistem</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', display: 'block' }}>
                  {kesimpulanComputed?.totalScorePercentage?.toFixed(2)}%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Status Disarankan: <strong>{kesimpulanComputed?.finalStatus}</strong>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Konfirmasi Status Final</label>
              <select 
                value={kesimpulanInputs.statusFinal}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, statusFinal: e.target.value })}
                style={{ fontWeight: 600, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', width: '100%' }}
              >
                {scoringConfig.status_thresholds.map(t => (
                  <option key={t.status} value={t.status}>{t.status}</option>
                ))}
              </select>
            </div>

            {kesimpulanInputs.statusFinal !== kesimpulanComputed?.finalStatus && (
              <div className="form-group animate-fade-in" style={{ marginTop: '1rem' }}>
                <label style={{ color: 'var(--warning)' }}>Alasan Mengubah Status (Wajib)</label>
                <textarea 
                  value={kesimpulanInputs.alasanOverride}
                  onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, alasanOverride: e.target.value })}
                  rows={2}
                  style={{ borderColor: 'var(--warning)', padding: '0.75rem', borderRadius: 'var(--radius-md)', width: '100%' }}
                />
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Catatan Kritis / Temuan Lapangan</label>
              <textarea 
                value={kesimpulanInputs.catatanKritis}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, catatanKritis: e.target.value })}
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Rekomendasi</label>
              <textarea 
                value={kesimpulanInputs.rekomendasi}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, rekomendasi: e.target.value })}
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>`
);

// 6. Progress Bar
content = content.replace(
  `Langkah {currentStep + 1} dari {(schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length}`,
  `Langkah {currentStep + 1} dari {(schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0)}`
);
content = content.replace(
  `width: \`\${((currentStep + 1) / ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length)) * 100}%\`,`,
  `width: \`\${((currentStep + 1) / ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0))) * 100}%\`,`
);
content = content.replace(
  `{isSubmitting ? 'Menyimpan...' : (currentStep === ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length - 1) ? 'Kirim Form Monev' : 'Selanjutnya')}`,
  `{isSubmitting ? 'Menyimpan...' : (currentStep === ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0) - 1) ? 'Kirim Form Monev' : 'Selanjutnya')}`
);

// 7. Berita Acara PDF Update
content = content.replace(
  `<p style={{ marginBottom: '4rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>`,
  `
            {metadataValues['_statusOtomatis'] && (
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
            )}
            
            <p style={{ marginBottom: '4rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched successfully!');

```


## File: scripts\patch-pdf-identity.js
```js
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

```


## File: scripts\patch-pdf-layout.js
```js
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

```


## File: scripts\patch-print-css-margin.js
```js
const fs = require('fs');

const globalsCssPath = 'src/app/globals.css';
let css = fs.readFileSync(globalsCssPath, 'utf8');

css = css.replace(/@page\s*\{\s*size:\s*auto;\s*margin:\s*0mm;\s*\}/g, '@page {\n    size: auto;\n    margin: 1.5cm;\n  }');
css = css.replace(/body\s*\{\s*margin:\s*1\.5cm;\s*\}/g, 'body {\n    margin: 0;\n  }');

fs.writeFileSync(globalsCssPath, css, 'utf8');
console.log('globals.css patched for proper page margins');

```


## File: scripts\patch-print-css.js
```js
const fs = require('fs');

// Append to globals.css
const globalsCssPath = 'src/app/globals.css';
const printCss = `

@media print {
  @page {
    size: auto;
    margin: 0mm;
  }
  body {
    margin: 1.5cm;
  }
  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .signature-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
`;
fs.appendFileSync(globalsCssPath, printCss, 'utf8');

// Update cari/page.tsx
let cariPath = 'src/app/cari/page.tsx';
let cariContent = fs.readFileSync(cariPath, 'utf8');
cariContent = cariContent.replace(
  `<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', textAlign: 'center' }}>`,
  `<div className="signature-block" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', textAlign: 'center' }}>`
);
fs.writeFileSync(cariPath, cariContent, 'utf8');

// Update isi-form/page.tsx
let isiFormPath = 'src/app/kegiatan/[id]/isi-form/page.tsx';
let isiFormContent = fs.readFileSync(isiFormPath, 'utf8');
isiFormContent = isiFormContent.replace(
  `<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', textAlign: 'center' }}>`,
  `<div className="signature-block" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', textAlign: 'center' }}>`
);
fs.writeFileSync(isiFormPath, isiFormContent, 'utf8');

console.log('Successfully patched for print CSS and page break avoidance!');

```


## File: scripts\patch-signature.js
```js
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

```


## File: scripts\read-data.js
```js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function readData() {
  const { data, error } = await supabase
    .from('pengisian')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((row, i) => {
    console.log(`\n--- Data ke-${i + 1} ---`);
    console.log(JSON.stringify(row.metadata_values, null, 2));
  });
}

readData();

```


## File: scripts\seed-matgem.js
```js
const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding MATGEM...');
  
  // 1. Insert Kegiatan
  const { data: kegiatan, error: errK } = await supabase.from('kegiatan').insert({
    nama_kegiatan: 'Monitoring dan Evaluasi Implementasi Matematika GEMBIRA',
    deskripsi: 'Instrumen monitoring dan evaluasi implementasi Matematika Gembira bagi Guru TK dan Guru SD Provinsi Sumatera Barat',
    tahun: '2026',
    status: 'aktif'
  }).select().single();
  
  if (errK) {
    console.error('Error insert kegiatan:', errK);
    return;
  }
  console.log('Created Kegiatan:', kegiatan.id);

  // 2. Insert Instrumen
  const { data: instrumen, error: errI } = await supabase.from('instrumen').insert({
    kegiatan_id: kegiatan.id,
    nama_instrumen: 'Instrumen MONEV MATGEM 2026',
    deskripsi: 'Berilah tanda ceklist (v) pada alternatif pilihan jawaban yang tersedia, dan lengkapi Bukti Pembelajaran/Catatan.'
  }).select().single();

  if (errI) {
    console.error('Error insert instrumen:', errI);
    return;
  }
  console.log('Created Instrumen:', instrumen.id);

  // 3. Insert Metadata Fields
  const identitas = [
    { label_field: 'Nama Petugas', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'NIP', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'Hari / Tanggal', tipe_field: 'date', wajib_diisi: true },
    { label_field: 'Nama Sekolah', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'NPSN Sekolah', tipe_field: 'text', wajib_diisi: true },
    { label_field: 'Kabupaten/Kota', tipe_field: 'dropdown', wajib_diisi: true },
    { label_field: 'Nama Responden (Guru)', tipe_field: 'text', wajib_diisi: true }
  ];

  for (let i = 0; i < identitas.length; i++) {
    await supabase.from('instrumen_metadata_field').insert({
      instrumen_id: instrumen.id,
      label_field: identitas[i].label_field,
      tipe_field: identitas[i].tipe_field,
      urutan: i + 1,
      wajib_diisi: identitas[i].wajib_diisi
    });
  }

  // 4. Insert Sections & Items
  const sectionsData = [
    {
      title: 'Perencanaan',
      questions: [
        'Guru menyiapkan RPP atau modul ajar yang telah menggunakan alur pembelajaran Matematika GEMBIRA',
        'Tujuan pembelajaran dikembangkan dari capaian pembelajaran pada fase pondasi (untuk TK) atau fase A (untuk SD)',
        'Aktivitas belajar yang direncanakan telah mengakomodir pembelajaran matematika GEMBIRA',
        'Asesmen dirancang sesuai dengan tujuan pembelajaran',
        'Asesmen yang dibuat berbasis proses, bukan sekedar menilai benar atau salah'
      ]
    },
    {
      title: 'Pelaksanaan',
      questions: [
        'Guru mengkondisikan kelas sebelum memulai kegiatan pembelajaran',
        'Guru melakukan gali eksplorasi pemahaman awal murid terhadap konteks yang digunakan',
        'Guru mengajak murid memahami konten materi melalui objek nyata, lingkungan sekitar, dan/atau permainan',
        'Guru membuat aktivitas belajar yang relevan dengan kehidupan sehari-hari yang dekat dengan murid',
        'Aktivitas belajar berfokus pada kegiatan numerasi',
        'Aktivitas belajar mendorong kegiatan eksplorasi, diskusi serta kolaborasi',
        'Guru mendorong dialog interaktif dan mengajukan pertanyaan pemantik selama aktivitas pembelajaran',
        'Guru mengidentifikasi miskonsepsi yang terjadi',
        'Guru memberikan umpan balik ketika aktivitas pembelajaran berlangsung',
        'Guru melakukan refleksi diakhir pembelajaran',
        'Guru memberikan apresiasi terhadap usaha dan kemajuan murid'
      ]
    },
    {
      title: 'Evaluasi',
      questions: [
        'Guru memahami konsep Matematika GEMBIRA',
        'Guru mampu membuat aktivitas pembelajaran yang menyenangkan dan berpusat pada murid',
        'Kepala sekolah mendukung program pembelajaran matematika GEMBIRA untuk diimplementasikan di kelas',
        'Tersedianya media pembelajaran yang dibutuhkan dalam mengimplementasikan Matematika GEMBIRA di kelas',
        'Adanya pojok numerasi di kelas/sekolah'
      ]
    },
    {
      title: 'Wawancara Refleksi',
      questions: [
        'Apa perubahan yang dirasakan setelah menerapkan Matematika GEMBIRA?',
        'Aktivitas apa yang paling disukai murid dalam alur GEMBIRA?',
        'Kendala apa yang dihadapi dalam mengimplementasikan pembelajaran dengan alur GEMBIRA?',
        'Dukungan apa yang dibutuhkan guru dalam mengimplementasikan pembelajaran dengan alur GEMBIRA?',
        'Apa inovasi yang telah dilakukan dalam menerapkan pembelajaran Matematika GEMBIRA?'
      ]
    }
  ];

  let itemUrutan = 1;
  for (let i = 0; i < sectionsData.length; i++) {
    const sData = sectionsData[i];
    const { data: section } = await supabase.from('instrumen_section').insert({
      instrumen_id: instrumen.id,
      nama_section: sData.title,
      urutan: i + 1
    }).select().single();

    for (let j = 0; j < sData.questions.length; j++) {
      const q = sData.questions[j];
      const isRefleksi = sData.title === 'Wawancara Refleksi';
      await supabase.from('instrumen_item').insert({
        section_id: section.id,
        teks_pertanyaan: q,
        tipe_jawaban: isRefleksi ? 'esai' : 'likert4',
        butuh_catatan_bukti: !isRefleksi, // Wawancara gak butuh bukti file/tambahan krn itu esai
        urutan: itemUrutan++
      });
    }
  }

  console.log('Seeding Complete! MATGEM ready.');
}

seed();

```


## File: scripts\test-dummy-matgem.js
```js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDummy() {
  console.log('Fetching Matgem instrument...');
  const { data: instrumen } = await supabase.from('instrumen')
    .select('id, nama_instrumen')
    .eq('nama_instrumen', 'Instrumen MONEV MATGEM 2026')
    .single();

  if (!instrumen) {
    console.error('Instrumen Matgem not found.');
    return;
  }

  // Get metadata fields
  const { data: metaFields } = await supabase.from('instrumen_metadata_field')
    .select('id, label_field')
    .eq('instrumen_id', instrumen.id);

  // Get sections & items
  const { data: sections } = await supabase.from('instrumen_section')
    .select('id, nama_section, instrumen_item(id, tipe_jawaban, teks_pertanyaan)')
    .eq('instrumen_id', instrumen.id);

  // We will simulate almost perfect scores, but with one or two flaws.
  const jawabanValues = {};
  
  // Weights configuration (Simulating the frontend logic)
  const config = {
    weights: { 'Perencanaan': 0.3, 'Pelaksanaan': 0.5, 'Evaluasi': 0.2 },
    max_value: 4,
    thresholds: [
      { min: 85, status: 'SANGAT SESUAI' },
      { min: 70, status: 'SESUAI' },
      { min: 50, status: 'KURANG SESUAI' },
      { min: 0, status: 'TIDAK SESUAI' }
    ]
  };

  let sectionScores = { 'Perencanaan': 0, 'Pelaksanaan': 0, 'Evaluasi': 0 };
  let sectionMax = { 'Perencanaan': 0, 'Pelaksanaan': 0, 'Evaluasi': 0 };

  const listJawabanInsert = [];

  sections.forEach(sec => {
    sec.instrumen_item.forEach(item => {
      let skor = null;
      let teks = null;
      let catatan = null;

      if (item.tipe_jawaban === 'likert4') {
        // give 4s mostly, some 3s
        skor = Math.random() > 0.2 ? 4 : 3;
        catatan = 'Bukti observasi terlihat jelas di RPP dan kelas.';
        
        if (config.weights[sec.nama_section] !== undefined) {
          sectionScores[sec.nama_section] += skor;
          sectionMax[sec.nama_section] += config.max_value;
        }
      } else if (item.tipe_jawaban === 'esai') {
        teks = 'Guru sangat antusias, murid terlihat aktif berkolaborasi memecahkan masalah matematika menggunakan alat peraga.';
      }

      listJawabanInsert.push({
        item_id: item.id,
        nilai_skor: skor,
        nilai_teks: teks,
        catatan_bukti: catatan
      });
    });
  });

  // Calculate score
  let totalScorePercentage = 0;
  Object.keys(config.weights).forEach(secName => {
    const p = (sectionScores[secName] / sectionMax[secName]) * 100;
    totalScorePercentage += p * config.weights[secName];
  });

  let finalStatus = 'TIDAK SESUAI';
  for (const t of config.thresholds) {
    if (totalScorePercentage >= t.min) {
      finalStatus = t.status;
      break;
    }
  }

  // Create Metadata Values
  const metadataValues = {};
  metaFields.forEach(mf => {
    if (mf.label_field === 'Nama Sekolah') metadataValues[mf.id] = 'SD NEGERI 99 DUMMY MATGEM';
    else if (mf.label_field === 'NPSN Sekolah') metadataValues[mf.id] = '99999999';
    else if (mf.label_field === 'Kabupaten/Kota') metadataValues[mf.id] = 'Kota Padang';
    else if (mf.label_field === 'Hari / Tanggal') metadataValues[mf.id] = new Date().toISOString().split('T')[0];
    else if (mf.label_field === 'Nama Petugas') metadataValues[mf.id] = 'Petugas Dummy AI';
    else if (mf.label_field === 'NIP') metadataValues[mf.id] = '123456789';
    else metadataValues[mf.id] = 'Responden Contoh';
  });

  // Add calculated kesimpulan
  metadataValues['_statusOtomatis'] = finalStatus;
  metadataValues['_skorTotal'] = totalScorePercentage.toFixed(2);
  metadataValues['_statusFinal'] = finalStatus; // Petugas setuju dgn sistem
  metadataValues['_catatanKritis'] = 'Proses pembelajaran Matematika GEMBIRA sudah berjalan dengan sangat baik, namun beberapa guru perlu penyesuaian durasi waktu alat peraga.';
  metadataValues['_rekomendasi'] = 'Perlu diadakan lokakarya penyegaran pembuatan alat peraga dari barang bekas untuk memperkaya variasi eksplorasi.';

  // Find a valid petugas id
  const { data: user } = await supabase.from('users').select('id').eq('role', 'petugas').limit(1).single();

  console.log('Inserting Pengisian...');
  const { data: pengisian, error: pErr } = await supabase.from('pengisian').insert({
    instrumen_id: instrumen.id,
    petugas_id: user ? user.id : null,
    metadata_values: metadataValues
  }).select().single();

  if (pErr) {
    console.error('Error insert pengisian:', pErr);
    return;
  }

  console.log('Pengisian Created ID:', pengisian.id);

  // Map pengisian ID to list jawaban
  listJawabanInsert.forEach(ans => ans.pengisian_id = pengisian.id);

  console.log('Inserting Jawaban...');
  const { error: jErr } = await supabase.from('jawaban').insert(listJawabanInsert);
  if (jErr) {
    console.error('Error insert jawaban:', jErr);
  } else {
    console.log('SUCCESS! Dummy data inserted.');
    console.log(`Skor Total: ${totalScorePercentage.toFixed(2)}% | Status: ${finalStatus}`);
  }
}

createDummy();

```


## File: src\app\admin\instrumen\builder\page.tsx
```tsx
"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Instrumen, InstrumenMetadataField, InstrumenSection, InstrumenItem, TipeJawabanItem } from '@/lib/types';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kegiatan_id = searchParams.get('kegiatan_id');

  const [instrumen, setInstrumen] = useState<Partial<Instrumen>>({ nama_instrumen: '', deskripsi: '' });
  const [metadataFields, setMetadataFields] = useState<Partial<InstrumenMetadataField>[]>([]);
  const [sections, setSections] = useState<(Partial<InstrumenSection> & { items: Partial<InstrumenItem>[] })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate AI reading process
    setIsReadingFile(true);
    setTimeout(() => {
      setIsReadingFile(false);
      alert(`Berhasil membaca dokumen: ${file.name}\nAI telah mengekstrak struktur instrumen secara otomatis!`);
      
      setInstrumen(prev => ({
        ...prev,
        nama_instrumen: `Instrumen (Hasil Ekstrak ${file.name.split('.')[0]})`,
        deskripsi: 'Hasil ekstrak otomatis dari dokumen rancangan menggunakan AI (Computer Vision & NLP).'
      }));
      
      setSections([
        {
          nama_section: 'A. Perencanaan',
          urutan: 0,
          items: [
            { teks_pertanyaan: 'Kesesuaian materi dengan kurikulum', tipe_jawaban: 'likert4', butuh_catatan_bukti: true, urutan: 0 },
            { teks_pertanyaan: 'Ketersediaan sarana prasarana', tipe_jawaban: 'likert4', butuh_catatan_bukti: true, urutan: 1 }
          ]
        },
        {
          nama_section: 'B. Pelaksanaan',
          urutan: 1,
          items: [
            { teks_pertanyaan: 'Antusiasme peserta dalam kegiatan', tipe_jawaban: 'likert4', butuh_catatan_bukti: false, urutan: 0 },
            { teks_pertanyaan: 'Catatan kendala yang dihadapi di lapangan', tipe_jawaban: 'esai', butuh_catatan_bukti: false, urutan: 1 }
          ]
        }
      ]);

      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 2500);
  };

  useEffect(() => {
    if (!kegiatan_id) {
      router.push('/admin/kegiatan');
    }
  }, [kegiatan_id, router]);

  const addMetadataField = () => {
    setMetadataFields([...metadataFields, { label_field: '', tipe_field: 'text', wajib_diisi: true, urutan: metadataFields.length }]);
  };

  const addSection = () => {
    setSections([...sections, { nama_section: '', urutan: sections.length, items: [] }]);
  };

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push({
      teks_pertanyaan: '',
      tipe_jawaban: 'likert4',
      butuh_catatan_bukti: false,
      urutan: newSections[sectionIndex].items.length
    });
    setSections(newSections);
  };

  const handleSave = async () => {
    if (!instrumen.nama_instrumen) return alert('Nama instrumen wajib diisi!');
    setIsSaving(true);

    try {
      // 1. Save Instrumen
      const { data: instData, error: instError } = await supabase
        .from('instrumen')
        .insert([{ kegiatan_id, nama_instrumen: instrumen.nama_instrumen, deskripsi: instrumen.deskripsi }])
        .select()
        .single();
        
      if (instError) throw instError;
      const instrumenId = instData.id;

      // 2. Save Metadata Fields
      if (metadataFields.length > 0) {
        const mFields = metadataFields.map((m, i) => ({ ...m, instrumen_id: instrumenId, urutan: i }));
        await supabase.from('instrumen_metadata_field').insert(mFields as any);
      }

      // 3. Save Sections & Items
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const { data: secData, error: secErr } = await supabase
          .from('instrumen_section')
          .insert([{ instrumen_id: instrumenId, nama_section: sec.nama_section, urutan: i }])
          .select()
          .single();

        if (secErr) throw secErr;

        if (sec.items.length > 0) {
          const itemsToInsert = sec.items.map((item, j) => ({
            ...item,
            section_id: secData.id,
            urutan: j
          }));
          await supabase.from('instrumen_item').insert(itemsToInsert as any);
        }
      }

      alert('Instrumen berhasil disimpan!');
      router.push('/admin/kegiatan');
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Form Builder (Instrumen)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
          
          <button 
            className="btn btn-outline" 
            onClick={() => fileInputRef.current?.click()} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#8b5cf6', color: '#8b5cf6' }} 
            disabled={isReadingFile}
          >
            {isReadingFile ? 'Membaca...' : '✨ Unggah (AI)'}
          </button>
          
          <button 
            className="btn btn-outline" 
            onClick={() => alert('Fitur Uji Coba: Instrumen akan dirender dalam bentuk Pop-up Preview sebelum disimpan. Sedang dikembangkan!')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            👁️ Uji Coba
          </button>

          <button className="btn btn-outline" onClick={() => router.push('/admin/kegiatan')}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan Instrumen'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Informasi Umum Instrumen</h3>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Judul Instrumen</label>
          <input type="text" value={instrumen.nama_instrumen} onChange={e => setInstrumen({...instrumen, nama_instrumen: e.target.value})} placeholder="Contoh: Instrumen Monitoring Matgem" />
        </div>
        <div className="form-group">
          <label>Deskripsi/Petunjuk Pengisian</label>
          <textarea rows={3} value={instrumen.deskripsi} onChange={e => setInstrumen({...instrumen, deskripsi: e.target.value})} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Metadata / Header Form</h3>
          <button className="btn btn-outline" onClick={addMetadataField} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>+ Tambah Field</button>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Tentukan field identitas yang harus diisi petugas sebelum mulai (misal: Nama Sekolah, Tanggal).
        </p>
        
        {metadataFields.map((field, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ flex: 2 }}>
              <label>Label Field</label>
              <input type="text" value={field.label_field} onChange={e => {
                const newF = [...metadataFields]; newF[idx].label_field = e.target.value; setMetadataFields(newF);
              }} placeholder="Misal: Nama Sekolah" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Tipe</label>
              <select value={field.tipe_field} onChange={e => {
                const newF = [...metadataFields]; newF[idx].tipe_field = e.target.value as any; setMetadataFields(newF);
              }}>
                <option value="text">Teks Singkat</option>
                <option value="date">Tanggal</option>
                <option value="number">Angka</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '1.5rem', gap: '0.5rem' }}>
              <input type="checkbox" checked={field.wajib_diisi} onChange={e => {
                const newF = [...metadataFields]; newF[idx].wajib_diisi = e.target.checked; setMetadataFields(newF);
              }} />
              <label style={{ margin: 0 }}>Wajib Diisi</label>
            </div>
            <button className="btn btn-outline" style={{ paddingTop: '1.5rem', color: 'var(--danger)', border: 'none' }} onClick={() => {
              setMetadataFields(metadataFields.filter((_, i) => i !== idx));
            }}>X</button>
          </div>
        ))}
      </div>

      <div className="card" style={{ borderTop: '4px solid #8b5cf6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Daftar Pertanyaan (Section)</h3>
          <button className="btn btn-outline" onClick={addSection} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }} disabled={isReadingFile}>+ Tambah Bagian Baru</button>
        </div>

        {sections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: '#fafafa' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label>Nama Section (Bagian)</label>
                <input type="text" value={section.nama_section} onChange={e => {
                  const newS = [...sections]; newS[sIdx].nama_section = e.target.value; setSections(newS);
                }} placeholder="Misal: A. Perencanaan" style={{ fontWeight: 'bold' }} />
              </div>
              <button className="btn btn-outline" style={{ marginTop: '1.5rem', color: 'var(--danger)' }} onClick={() => {
                setSections(sections.filter((_, i) => i !== sIdx));
              }}>Hapus Section</button>
            </div>

            {section.items.map((item, iIdx) => (
              <div key={iIdx} style={{ marginLeft: '2rem', marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid #eaeaea', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 3 }}>
                    <label>Teks Pertanyaan</label>
                    <textarea rows={2} value={item.teks_pertanyaan} onChange={e => {
                      const newS = [...sections]; newS[sIdx].items[iIdx].teks_pertanyaan = e.target.value; setSections(newS);
                    }} placeholder="Masukkan pertanyaan atau indikator penilian..." />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Tipe Jawaban</label>
                    <select value={item.tipe_jawaban} onChange={e => {
                      const newS = [...sections]; newS[sIdx].items[iIdx].tipe_jawaban = e.target.value as TipeJawabanItem; setSections(newS);
                    }}>
                      <option value="likert4">Skala 4 Poin (TS/KS/S/SS)</option>
                      <option value="likert5">Skala 5 Poin (1-5)</option>
                      <option value="esai">Teks Bebas (Esai)</option>
                    </select>
                  </div>
                  <button className="btn btn-outline" style={{ marginTop: '1.5rem', color: 'var(--danger)', border: 'none', padding: '0.5rem' }} onClick={() => {
                    const newS = [...sections]; newS[sIdx].items.splice(iIdx, 1); setSections(newS);
                  }}>X</button>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={item.butuh_catatan_bukti} onChange={e => {
                      const newS = [...sections]; newS[sIdx].items[iIdx].butuh_catatan_bukti = e.target.checked; setSections(newS);
                    }} />
                    Wajibkan kolom "Catatan / Bukti Pendukung" untuk pertanyaan ini
                  </label>
                </div>
              </div>
            ))}
            
            <button className="btn btn-outline" style={{ marginLeft: '2rem', fontSize: '0.875rem' }} onClick={() => addItem(sIdx)}>
              + Tambah Pertanyaan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense fallback={<div>Loading builder...</div>}>
      <BuilderContent />
    </Suspense>
  );
}

```


## File: src\app\admin\kegiatan\page.tsx
```tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function KelolaKegiatan() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    nama_kegiatan: '',
    deskripsi: '',
    tahun: new Date().getFullYear().toString(),
  });

  const router = useRouter();

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const fetchKegiatan = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setKegiatans(data);
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('kegiatan')
      .insert([form]);
      
    if (!error) {
      setIsModalOpen(false);
      setForm({ nama_kegiatan: '', deskripsi: '', tahun: new Date().getFullYear().toString() });
      fetchKegiatan();
    } else {
      alert('Gagal membuat kegiatan');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Kelola Kegiatan Monev</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Tambah Kegiatan Baru
        </button>
      </div>

      {isLoading ? (
        <p>Memuat data...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {/* Card untuk MPLS Lama */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0 }}>Masa Pengenalan Lingkungan Sekolah (MPLS)</h3>
              <span style={{ fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>AKTIF</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
              Instrumen monitoring dan evaluasi MPLS bagi Sekolah Dasar dan SMP (2026).
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  disabled
                >
                  Kelola Instrumen
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => router.push('/dashboard/mpls-lama')}
                >
                  Lihat Dashboard
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a 
                  href="/dashboard/mpls-lama"
                  className="btn btn-outline"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none', lineHeight: '2.5' }}
                >
                  Unduh Excel
                </a>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '0 0.5rem' }}
                  onClick={() => alert('Gunakan tombol Unduh PDF di dalam Dashboard MPLS')}
                >
                  Unduh PDF
                </button>
              </div>
            </div>
          </div>

          {/* Render Kegiatan Dinamis */}
          {kegiatans.map(k => (
            <div key={k.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{k.nama_kegiatan}</h3>
                <span style={{ fontSize: '0.75rem', background: k.status === 'aktif' ? '#10b981' : 'var(--text-secondary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>
                  {k.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
                {k.deskripsi} ({k.tahun})
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => router.push(`/admin/instrumen/builder?kegiatan_id=${k.id}`)}
                  >
                    Kelola Instrumen
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => router.push(`/dashboard/${k.id}`)}
                  >
                    Lihat Dashboard
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a 
                    href={`/api/admin/export-excel?kegiatan_id=${k.id}`}
                    className="btn btn-outline"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', lineHeight: '2.5' }}
                  >
                    Unduh Excel
                  </a>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1, padding: '0 0.5rem' }}
                    onClick={() => alert('Fitur Unduh Rekap PDF sedang dikembangkan (AI-Generated PDF)')}
                  >
                    Unduh PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Buat Kegiatan Baru</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nama Kegiatan</label>
                <input required type="text" value={form.nama_kegiatan} onChange={e => setForm({...form, nama_kegiatan: e.target.value})} placeholder="Contoh: Monev Matgem 2026" />
              </div>
              <div className="form-group">
                <label>Deskripsi (Opsional)</label>
                <textarea rows={3} value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} placeholder="Penjelasan singkat tentang kegiatan..." />
              </div>
              <div className="form-group">
                <label>Tahun Pelaksanaan</label>
                <input required type="number" value={form.tahun} onChange={e => setForm({...form, tahun: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

```


## File: src\app\admin\layout.tsx
```tsx
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        <Link href="/admin/kegiatan" className="btn btn-outline" style={{ border: 'none', borderBottom: '2px solid transparent' }}>
          Kelola Kegiatan
        </Link>
        <Link href="/admin/pengguna" className="btn btn-outline" style={{ border: 'none', borderBottom: '2px solid transparent' }}>
          Kelola Pengguna
        </Link>
        <Link href="/admin/log-unduh" className="btn btn-outline" style={{ border: 'none', borderBottom: '2px solid transparent' }}>
          Log Unduh & Cetak
        </Link>
        {/* We can add active state highlighting if needed, but keeping it simple for now */}
      </div>
      {children}
    </div>
  );
}

```


## File: src\app\admin\log-unduh\page.tsx
```tsx
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LogUnduhPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pdf_export_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Log Unduh & Cetak Dokumen</h2>
        <button className="btn btn-outline" onClick={fetchLogs}>
          Refresh Data
        </button>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Nama Pengguna</th>
              <th>Peran (Role)</th>
              <th>Aksi / Keterangan Dokumen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Belum ada log aktivitas unduh/cetak dokumen.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td>
                    <strong>{log.nama_user}</strong>
                    {log.user_id === null && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>(Sistem/Super Admin)</span>}
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: log.role === 'admin' ? 'var(--primary)' : 'var(--warning)', color: log.role === 'admin' ? 'white' : 'black' }}>
                      {log.role}
                    </span>
                  </td>
                  <td>{log.aksi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

```


## File: src\app\admin\pengguna\page.tsx
```tsx
"use client";

import { useState, useEffect } from 'react';

type User = {
  id: string;
  username: string;
  nama_lengkap: string;
  role: string;
  created_at: string;
};

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk form ganti password
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat pengguna');
      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    if (!confirm(`Yakin ingin mereset password untuk user ${selectedUser.username}?`)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset password');
      
      alert('Password berhasil direset!');
      setSelectedUser(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Kelola Pengguna</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Daftar akun dan pengaturan akses</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Memuat data pengguna...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {users.map(user => (
            <div key={user.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user.nama_lengkap} 
                  <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.75rem' }}>{user.role}</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Username: <strong>{user.username}</strong></p>
              </div>
              <div>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setSelectedUser(user)}
                  style={{ fontSize: '0.875rem' }}
                >
                  Reset Password
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reset Password */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Reset Password</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Setel ulang password untuk akun <strong>{selectedUser.username}</strong> ({selectedUser.nama_lengkap}).
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Password Baru</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setSelectedUser(null)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

```


## File: src\app\api\admin\export-excel\route.ts
```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kegiatan_id = searchParams.get('kegiatan_id');

    if (!kegiatan_id) {
      return NextResponse.json({ error: 'kegiatan_id is required' }, { status: 400 });
    }

    // 1. Dapatkan Instrumen
    const { data: instrumen, error: instErr } = await supabase
      .from('instrumen')
      .select('*')
      .eq('kegiatan_id', kegiatan_id)
      .single();

    if (instErr || !instrumen) {
      return NextResponse.json({ error: 'Instrumen tidak ditemukan untuk kegiatan ini' }, { status: 404 });
    }

    // 2. Dapatkan Struktur Instrumen
    const { data: metaFields } = await supabase
      .from('instrumen_metadata_field')
      .select('*')
      .eq('instrumen_id', instrumen.id)
      .order('urutan', { ascending: true });

    const { data: sections } = await supabase
      .from('instrumen_section')
      .select('*, items:instrumen_item(*)')
      .eq('instrumen_id', instrumen.id)
      .order('urutan', { ascending: true });

    if (sections) {
      sections.forEach(s => s.items.sort((a: any, b: any) => a.urutan - b.urutan));
    }

    // 3. Dapatkan Data Pengisian
    const { data: pengisianList, error: pErr } = await supabase
      .from('pengisian')
      .select('*')
      .eq('instrumen_id', instrumen.id);

    if (pErr) throw pErr;

    // 4. Dapatkan Semua Jawaban yang terkait dengan pengisian tersebut
    const pengisianIds = pengisianList ? pengisianList.map(p => p.id) : [];
    let jawabanMap: Record<string, any[]> = {}; // pengisian_id -> list of jawaban

    if (pengisianIds.length > 0) {
      const { data: jawabanList } = await supabase
        .from('jawaban')
        .select('*')
        .in('pengisian_id', pengisianIds);

      if (jawabanList) {
        jawabanList.forEach(j => {
          if (!jawabanMap[j.pengisian_id]) jawabanMap[j.pengisian_id] = [];
          jawabanMap[j.pengisian_id].push(j);
        });
      }
    }

    // 5. Mapping Data Petugas
    const { data: users } = await supabase.from('users').select('id, nama_lengkap, username');
    const userMap: Record<string, { nama: string, nip: string }> = {};
    if (users) {
      users.forEach(u => userMap[u.id] = { nama: u.nama_lengkap, nip: u.username });
    }

    // --- MULAI MERANGKAI EXCEL --- //

    const rows: any[] = [];
    const headers = [];

    // Header Identitas
    headers.push('ID Pengisian', 'Tanggal Submit', 'Nama Petugas Akun', 'NIP Akun');
    metaFields?.forEach(mf => {
      headers.push(mf.label_field);
    });

    // Header Hasil Skoring (Jika Ada)
    headers.push('Status Sistem (Otomatis)', 'Skor Total Sistem (%)', 'Status Final (Subjektif)', 'Alasan Perubahan Status', 'Catatan Kritis', 'Rekomendasi');

    // Header Soal
    sections?.forEach(sec => {
      sec.items.forEach((item: any, idx: number) => {
        const title = `[${sec.nama_section}] ${item.teks_pertanyaan.substring(0, 50)}...`;
        if (item.tipe_jawaban === 'likert4') {
          headers.push(`${title} (Nilai 1-4)`);
        } else if (item.tipe_jawaban === 'esai') {
          headers.push(`${title} (Teks)`);
        }
        if (item.butuh_catatan_bukti) {
          headers.push(`${title} (Catatan/Bukti)`);
        }
      });
    });

    rows.push(headers);

    // Isi Baris Data
    pengisianList?.forEach(p => {
      const row = [];
      
      // Identitas
      row.push(p.id);
      row.push(new Date(p.created_at).toLocaleString('id-ID'));
      row.push(userMap[p.petugas_id]?.nama || '-');
      row.push(userMap[p.petugas_id]?.nip || '-');
      
      metaFields?.forEach(mf => {
        row.push(p.metadata_values[mf.id] || '');
      });

      // Skoring
      row.push(p.metadata_values['_statusOtomatis'] || '');
      row.push(p.metadata_values['_skorTotal'] || '');
      row.push(p.metadata_values['_statusFinal'] || '');
      row.push(p.metadata_values['_alasanOverride'] || '');
      row.push(p.metadata_values['_catatanKritis'] || '');
      row.push(p.metadata_values['_rekomendasi'] || '');

      // Soal & Jawaban
      const jList = jawabanMap[p.id] || [];
      const itemToJawaban: Record<string, any> = {};
      jList.forEach(j => itemToJawaban[j.item_id] = j);

      sections?.forEach(sec => {
        sec.items.forEach((item: any) => {
          const ans = itemToJawaban[item.id];
          if (item.tipe_jawaban === 'likert4') {
            row.push(ans ? ans.nilai_skor : '');
          } else if (item.tipe_jawaban === 'esai') {
            row.push(ans ? ans.nilai_teks : '');
          }
          if (item.butuh_catatan_bukti) {
            row.push(ans ? ans.catatan_bukti : '');
          }
        });
      });

      rows.push(row);
    });

    // Buat Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Monev');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Data_Monev_${instrumen.nama_instrumen.replace(/[^a-z0-9]/gi, '_')}.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error('Excel Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

```


## File: src\app\api\admin\users\password\route.ts
```ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, newPassword } = await request.json();
    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Data tidak valid (password minimal 6 karakter)' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPassword })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

```


## File: src\app\api\admin\users\route.ts
```ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, username, nama_lengkap, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

```


## File: src\app\api\auth\route.ts
```ts
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

```


## File: src\app\api\monev\route.ts
```ts
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
          npsn: body.npsn,
          jenjang: body.jenjang,
          kabKota: body.kabKota,
          alamat: body.alamat || "-",
          namaPetugas: body.namaPetugas,
          tanggal: body.tanggal,
          namaKepsek: body.namaKepsek,
          jawabanUmum: body.jawabanUmum,
          jawabanKhusus: body.jawabanKhusus,
          catatanKritis: body.catatanKritis,
          rekomendasi: body.rekomendasi,
          statusOtomatis: body.statusOtomatis,
          statusFinal: body.statusFinal,
          alasanOverride: body.alasanOverride,
          materiTes: body.materiTes,
          permasalahanSolusi: body.permasalahanSolusi
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';

    let query = supabase
      .from('monev_entry')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!fetchAll) {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

```


## File: src\app\api\monev\search\route.ts
```ts
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

```


## File: src\app\api\monev\[id]\route.ts
```ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('monev_entry')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

```


## File: src\app\api\statistik\route.ts
```ts
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

```


## File: src\app\api\track-export\route.ts
```ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { aksi } = await request.json();
    if (!aksi) {
      return NextResponse.json({ error: 'Parameter aksi diperlukan' }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak ada sesi aktif' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('pdf_export_logs')
      .insert([{
        user_id: session.id !== 'super-admin' ? session.id : null,
        nama_user: session.nama_lengkap || session.username,
        role: session.role,
        aksi: aksi
      }]);

    if (error) {
      console.error('Gagal mencatat log:', error);
      return NextResponse.json({ error: 'Gagal mencatat log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Invalid request in track-export:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

```


## File: src\app\cari\page.tsx
```tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, MonevEntryData } from '@/lib/supabase';
import { Kegiatan, InstrumenFull, Pengisian } from '@/lib/types';
import { generatePDF } from '@/lib/pdfGenerator';

export default function SearchPage() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [selectedKegiatanId, setSelectedKegiatanId] = useState('');
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Pengisian[]>([]);
  const [oldResults, setOldResults] = useState<MonevEntryData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [petugasMap, setPetugasMap] = useState<Record<string, { nama: string, nip: string }>>({});
  const [petugasMapByName, setPetugasMapByName] = useState<Record<string, string>>({});

  // Untuk keperluan print
  const [schema, setSchema] = useState<InstrumenFull | null>(null);
  const [selectedPengisian, setSelectedPengisian] = useState<Pengisian | null>(null);
  const [selectedJawaban, setSelectedJawaban] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchKegiatans();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('id, nama_lengkap, username');
    if (data) {
      const mapId: Record<string, { nama: string, nip: string }> = {};
      const mapName: Record<string, string> = {};
      data.forEach(u => {
        mapId[u.id] = { nama: u.nama_lengkap, nip: u.username };
        mapName[u.nama_lengkap] = u.username;
      });
      setPetugasMap(mapId);
      setPetugasMapByName(mapName);
    }
  };

  useEffect(() => {
    if (selectedKegiatanId) {
      fetchSchema(selectedKegiatanId);
    } else {
      setSchema(null);
    }
    // Reset search when activity changes
    setResults([]);
    setOldResults([]);
    setHasSearched(false);
    setQuery('');
  }, [selectedKegiatanId]);

  const fetchKegiatans = async () => {
    const { data } = await supabase.from('kegiatan').select('*').eq('status', 'aktif').order('created_at', { ascending: false });
    const dynamicKegiatans = data || [];
    
    // Tambahkan MPLS lama secara manual (karena struktur data lama tidak ada di tabel kegiatan)
    const mplsLama = {
      id: 'mpls-lama',
      nama_kegiatan: 'MPLS 2026 (Format Lama)',
      status: 'aktif',
      created_at: new Date().toISOString(),
      tahun: '2026'
    } as Kegiatan;
    
    setKegiatans([mplsLama, ...dynamicKegiatans]);
  };

  const fetchSchema = async (k_id: string) => {
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
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema && selectedKegiatanId !== 'mpls-lama') {
      setError('Silakan pilih kegiatan terlebih dahulu.');
      return;
    }
    if (query.trim().length < 3) {
      setError('Kata kunci pencarian minimal 3 karakter.');
      return;
    }
    
    setError('');
    setLoading(true);
    setHasSearched(true);
    
    try {
      if (selectedKegiatanId === 'mpls-lama') {
        const res = await fetch(`/api/monev/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (res.ok) {
          setOldResults(data.data || []);
        } else {
          setError(data.error || 'Terjadi kesalahan.');
          setOldResults([]);
        }
      } else {
        // Ambil data pengisian untuk instrumen ini
        const { data: allPengisian, error: fetchErr } = await supabase
          .from('pengisian')
          .select('*')
          .eq('instrumen_id', schema!.id);

        if (fetchErr) throw fetchErr;

        // Filter di client untuk mencocokkan kata kunci ke dalam semua nilai metadata (JSON)
        const q = query.toLowerCase();
        const filtered = (allPengisian || []).filter(p => {
          const metaValues = Object.values(p.metadata_values || {}) as string[];
          return metaValues.some(val => String(val).toLowerCase().includes(q));
        });

        setResults(filtered);
      }
    } catch (err) {
      setError('Koneksi bermasalah.');
      setResults([]);
      setOldResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (pengisian: Pengisian) => {
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

    // Track the download
    try {
      await fetch('/api/track-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aksi: `Cetak PDF Hasil: ${getPrimaryLabel(pengisian)}` })
      });
    } catch (e) {
      console.error('Tracking failed', e);
    }

    // Beri waktu sedikit untuk React me-render komponen hidden khusus print
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Helper untuk mendapatkan nama sekolah/entitas utama dari metadata (biasanya urutan awal)
  const getPrimaryLabel = (p: Pengisian) => {
    if (!schema || schema.metadata_fields.length === 0) return 'Data Pengisian';
    // Coba cari field yang mengandung 'sekolah' atau ambil field pertama
    const sekolahField = schema.metadata_fields.find(m => m.label_field.toLowerCase().includes('sekolah'));
    const fieldId = sekolahField ? sekolahField.id : schema.metadata_fields[0].id;
    return p.metadata_values[fieldId] || 'Data Pengisian';
  };

  const getSecondaryLabel = (p: Pengisian) => {
    if (!schema || schema.metadata_fields.length <= 1) return '';
    // Ambil field kedua atau yang lain sebagai konteks
    const metaValues = Object.values(p.metadata_values).filter(v => typeof v === 'string');
    return metaValues.length > 1 ? metaValues[1] : '';
  };

  return (
    <main className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className="card no-print">
        <h2>Cari Hasil Monev</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Pilih Kegiatan terlebih dahulu, lalu masukkan kata kunci (seperti Nama Sekolah atau NPSN) untuk mencari dan mengunduh laporan (PDF).
        </p>

        <div className="form-group">
          <label>Pilih Kegiatan Monev</label>
          <select 
            value={selectedKegiatanId} 
            onChange={(e) => setSelectedKegiatanId(e.target.value)}
            style={{ marginBottom: '1rem' }}
          >
            <option value="">-- Pilih Kegiatan --</option>
            {kegiatans.map(k => (
              <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Contoh: SD Negeri 1 Padang atau 12345678"
            style={{ flex: 1 }}
            disabled={!selectedKegiatanId}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedKegiatanId}>
            {loading ? 'Mencari...' : 'Cari Data'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {hasSearched && !loading && !error && results.length === 0 && oldResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontWeight: 600 }}>Data tidak ditemukan.</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Pastikan kata kunci diketik dengan benar, atau pastikan petugas sudah mensubmit data untuk kegiatan ini.
            </p>
          </div>
        )}

        {(results.length > 0 || oldResults.length > 0) && (
          <div className="history-list">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Hasil Pencarian:</h3>
            
            {/* Render Hasil MPLS Lama */}
            {oldResults.map((entry) => (
              <div key={entry.id} className="history-item" style={{ cursor: 'default' }}>
                <div className="history-item-content">
                  <h3>{entry.namaSekolah}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Disubmit pada: {entry.tanggal} &bull; Oleh: {entry.namaPetugas}
                  </p>
                </div>
                <div>
                  <button className="btn btn-outline" onClick={async () => {
                    try {
                      const entryWithNip = { ...entry, nipPetugas: petugasMapByName[entry.namaPetugas] };
                      generatePDF(entryWithNip);
                      
                      // Track the download
                      try {
                        await fetch('/api/track-export', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ aksi: `Cetak PDF Hasil MPLS Lama: ${entry.namaSekolah}` })
                        });
                      } catch (e) {
                        console.error('Tracking failed', e);
                      }
                    } catch(err) {
                      alert('Gagal mencetak PDF format lama');
                    }
                  }}>
                    Unduh PDF
                  </button>
                </div>
              </div>
            ))}

            {/* Render Hasil Dinamis */}
            {results.map((entry) => (
              <div key={entry.id} className="history-item" style={{ cursor: 'default' }}>
                <div className="history-item-content">
                  <h3>{getPrimaryLabel(entry)}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Disubmit pada: {new Date(entry.tanggal_pengisian || '').toLocaleDateString('id-ID')} &bull; {getSecondaryLabel(entry)}
                  </p>
                </div>
                <div>
                  <button className="btn btn-outline" onClick={() => handleDownload(entry)}>
                    Unduh PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="no-print" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/" className="btn btn-outline" style={{ border: 'none' }}>
          &larr; Kembali ke Beranda
        </Link>
      </div>

      {/* Bagian khusus untuk di-print sebagai PDF (Berita Acara) */}
      {schema && selectedPengisian && (
        <div className="print-only" style={{ display: 'none', textAlign: 'left', margin: '0 auto', width: '100%', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.5' }}>
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
          </table>
          
          <div style={{ marginBottom: '2rem' }}>
            
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
                          const ans = selectedJawaban[item.id] || {};
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
                          const ans = selectedJawaban[item.id] || {};
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
          </div>
          
          <p style={{ marginBottom: '2rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>
          
          {(() => {
            const getMeta = (lbl: string) => {
              const f = schema.metadata_fields.find(m => m.label_field.toLowerCase().includes(lbl.toLowerCase()));
              return f ? selectedPengisian.metadata_values[f.id] : '';
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
          })()}
        </div>
      )}
    </main>
  );
}

```


## File: src\app\dashboard\mpls-lama\page.tsx
```tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MonevEntryData } from '@/lib/supabase';
import { generateExcelSummary, generatePDFSummary } from '@/lib/exportGenerator';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Home() {
  const [entries, setEntries] = useState<MonevEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/monev?all=true')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setEntries(data.data || []);
      })
      .catch(err => {
        console.error(err);
        setError('Gagal memuat data riwayat monev.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getBadgeClass = (status: string) => {
    if (status === 'SANGAT RAMAH') return 'badge-sangat-ramah';
    if (status === 'CUKUP RAMAH') return 'badge-cukup-ramah';
    if (status === 'KURANG') return 'badge-kurang';
    return 'badge-default';
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      if (entries.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
      }
      if (type === 'excel') {
        generateExcelSummary(entries);
      } else {
        generatePDFSummary(entries);
      }

      try {
        await fetch('/api/track-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aksi: `Export Dashboard ${type.toUpperCase()}: MPLS Lama` })
        });
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh rekap data');
    } finally {
      setExporting(false);
    }
  };

  // Kalkulasi Statistik
  const statusCounts = entries.reduce((acc, entry) => {
    acc[entry.statusFinal] = (acc[entry.statusFinal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jenjangCounts = entries.reduce((acc, entry) => {
    acc[entry.jenjang] = (acc[entry.jenjang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: ['Sangat Ramah', 'Cukup Ramah', 'Kurang'],
    datasets: [{
      data: [
        statusCounts['SANGAT RAMAH'] || 0, 
        statusCounts['CUKUP RAMAH'] || 0, 
        statusCounts['KURANG'] || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: ['TK', 'SD', 'SMP', 'SMA/K', 'SLB'],
    datasets: [{
      label: 'Jumlah Sekolah',
      data: [
        jenjangCounts['TK'] || 0,
        jenjangCounts['SD'] || 0,
        jenjangCounts['SMP'] || 0,
        jenjangCounts['SMA/K'] || 0,
        jenjangCounts['SLB'] || 0
      ],
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  };

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Riwayat Monev MPLS 2026
          </h1>
          <p>Dashboard analitik dan daftar seluruh hasil pemantauan.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => handleExport('excel')}
            disabled={exporting || loading || entries.length === 0}
            style={{ backgroundColor: '#fff' }}
          >
            {exporting ? 'Memproses...' : 'Unduh Excel'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleExport('pdf')}
            disabled={exporting || loading || entries.length === 0}
          >
            {exporting ? 'Memproses...' : 'Unduh PDF'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Memuat data...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3>Belum ada data monev</h3>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ marginBottom: '1rem' }}>Persentase Status</h3>
              <div style={{ width: '100%', maxWidth: '320px' }}>
                <Pie data={pieData} />
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Sebaran Jenjang</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '1rem' }}>Data Terbaru</h3>
          <div className="history-list">
          {entries.map((entry) => (
            <Link href={`/${entry.id}`} key={entry.id} className="history-item">
              <div className="history-item-content">
                <h3>{entry.namaSekolah}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {entry.jenjang} &bull; Oleh: {entry.namaPetugas} &bull; {entry.tanggal}
                </p>
              </div>
              <div>
                <span className={`badge ${getBadgeClass(entry.statusFinal)}`}>
                  {entry.statusFinal}
                </span>
              </div>
            </Link>
          ))}
        </div>
        </>
      )}
    </main>
  );
}

```


## File: src\app\dashboard\page.tsx
```tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchKegiatan = async () => {
      const { data } = await supabase
        .from('kegiatan')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setKegiatans(data);
      setIsLoading(false);
    };
    fetchKegiatan();
  }, []);

  return (
    <main className="container animate-fade-in" style={{ padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Dashboard Pimpinan BGTK</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Silakan pilih kegiatan untuk melihat grafik analitik dan mengunduh rekapitulasi data.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center' }}>Memuat data kegiatan...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Card Khusus MPLS Lama */}
          <div className="card" style={{ borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>MPLS 2026 (Sistem Lama)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
              Dashboard analitik untuk program Masa Pengenalan Lingkungan Sekolah (data lama).
            </p>
            <Link href="/dashboard/mpls-lama" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Lihat Analitik
            </Link>
          </div>

          {/* Render Kegiatan Baru */}
          {kegiatans.map(k => (
            <div key={k.id} className="card" style={{ borderTop: '4px solid #3b82f6', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{k.nama_kegiatan}</h3>
                <span style={{ fontSize: '0.75rem', background: k.status === 'aktif' ? '#10b981' : 'gray', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {k.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                {k.deskripsi || 'Tidak ada deskripsi'}
              </p>
              <Link href={`/dashboard/${k.id}`} className="btn btn-primary" style={{ textAlign: 'center' }}>
                Lihat Analitik
              </Link>
            </div>
          ))}

        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/" className="btn btn-outline" style={{ border: 'none' }}>&larr; Kembali ke Portal</Link>
      </div>
    </main>
  );
}

```


## File: src\app\dashboard\[id]\page.tsx
```tsx
"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { InstrumenFull } from '@/lib/types';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { generateDynamicPDFSummary } from '@/lib/exportGenerator';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function DetailDashboardKegiatan({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const kegiatan_id = unwrappedParams.id;
  
  const [schema, setSchema] = useState<InstrumenFull | null>(null);
  const [pengisians, setPengisians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [kegiatan_id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // 1. Ambil schema instrumen
      const { data: inst } = await supabase
        .from('instrumen')
        .select('*')
        .eq('kegiatan_id', kegiatan_id)
        .single();
      
      if (!inst) throw new Error('Instrumen tidak ditemukan');

      const { data: metaFields } = await supabase.from('instrumen_metadata_field').select('*').eq('instrumen_id', inst.id).order('urutan');
      const { data: sections } = await supabase.from('instrumen_section').select('*, items:instrumen_item(*)').eq('instrumen_id', inst.id).order('urutan');

      setSchema({
        ...inst,
        metadata_fields: metaFields || [],
        sections: sections || []
      });

      // 2. Ambil data pengisian dan jawaban
      const { data: pData } = await supabase
        .from('pengisian')
        .select('*, jawaban(*)')
        .eq('instrumen_id', inst.id)
        .order('tanggal_pengisian', { ascending: true }); // urutkan waktu
        
      setPengisians(pData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!schema || pengisians.length === 0) return alert('Tidak ada data untuk diekspor');

    // Siapkan Header
    const headers = ['ID Pengisian', 'Tanggal Submit'];
    schema.metadata_fields.forEach(m => headers.push(m.label_field));
    
    // Sort items by section and item order to make columns predictable
    const orderedItems: any[] = [];
    schema.sections.forEach(sec => {
      const items = [...sec.items].sort((a, b) => a.urutan - b.urutan);
      items.forEach(item => {
        orderedItems.push(item);
        headers.push(`[${sec.nama_section}] ${item.teks_pertanyaan}`);
        if (item.butuh_catatan_bukti) {
          headers.push(`[BUKTI] ${item.teks_pertanyaan}`);
        }
      });
    });

    // Siapkan Baris Data
    const rows = pengisians.map(p => {
      const row: any = {
        'ID Pengisian': p.id,
        'Tanggal Submit': new Date(p.tanggal_pengisian).toLocaleString('id-ID')
      };

      // Metadata
      schema.metadata_fields.forEach(m => {
        row[m.label_field] = p.metadata_values[m.id] || '';
      });

      // Jawaban mapping
      const ansMap: Record<string, any> = {};
      p.jawaban.forEach((j: any) => {
        ansMap[j.item_id] = j;
      });

      // Pertanyaan
      orderedItems.forEach(item => {
        const headerText = `[${item.section_id ? schema.sections.find(s => s.id === item.section_id)?.nama_section : ''}] ${item.teks_pertanyaan}`;
        const ans = ansMap[item.id];
        
        if (ans) {
          row[headerText] = item.tipe_jawaban.includes('likert') ? ans.nilai_skor : ans.nilai_teks;
          if (item.butuh_catatan_bukti) {
            row[`[BUKTI] ${item.teks_pertanyaan}`] = ans.catatan_bukti || '';
          }
        } else {
          row[headerText] = '';
          if (item.butuh_catatan_bukti) row[`[BUKTI] ${item.teks_pertanyaan}`] = '';
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Monev");
    XLSX.writeFile(workbook, `Rekap_Monev_${schema.nama_instrumen.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);

    try {
      await fetch('/api/track-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aksi: `Export Dashboard Excel: ${schema.nama_instrumen}` })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPDF = async () => {
    if (!schema || pengisians.length === 0) return alert('Tidak ada data untuk diekspor');
    generateDynamicPDFSummary(schema, pengisians);
    
    try {
      await fetch('/api/track-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aksi: `Export Dashboard PDF: ${schema.nama_instrumen}` })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="container" style={{ padding: '2rem' }}>Memuat analitik...</div>;
  if (!schema) return <div className="container" style={{ padding: '2rem' }}>Data tidak ditemukan.</div>;

  // Chart Data Preparation
  const dateCounts = pengisians.reduce((acc, p) => {
    const date = new Date(p.tanggal_pengisian).toLocaleDateString('id-ID');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineData = {
    labels: Object.keys(dateCounts),
    datasets: [{
      label: 'Pertumbuhan Responden Masuk',
      data: Object.values(dateCounts),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.3
    }]
  };

  let pieData = null;
  let pieTitle = '';
  // Coba ambil field metadata pertama (contoh: Jenjang, Kabupaten) untuk chart Pie
  if (schema.metadata_fields.length > 0) {
    const firstMeta = schema.metadata_fields[0];
    pieTitle = `Distribusi by ${firstMeta.label_field}`;
    const metaCounts = pengisians.reduce((acc, p) => {
      const val = p.metadata_values[firstMeta.id] || 'Tidak Diisi';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    pieData = {
      labels: Object.keys(metaCounts),
      datasets: [{
        data: Object.values(metaCounts),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'],
        borderWidth: 0
      }]
    };
  }

  return (
    <main className="container animate-fade-in" style={{ padding: '2rem 1rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Analitik: {schema.nama_instrumen}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Total Responden: <strong>{pengisians.length}</strong> sekolah/guru</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportPDF}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Export PDF
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', borderColor: '#10b981' }} onClick={handleExportExcel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2v4H8z"/><path d="M14 13h2v4h-2z"/></svg>
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {pengisians.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          Belum ada data pengisian untuk instrumen ini.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {pieData && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>{pieTitle}</h3>
                <div style={{ width: '100%', maxWidth: '320px' }}>
                  <Pie data={pieData} />
                </div>
              </div>
            )}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Pertumbuhan Data Harian</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <Line data={lineData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Data Terbaru Masuk</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.75rem' }}>Tanggal</th>
                  {schema.metadata_fields.map(m => (
                    <th key={m.id} style={{ padding: '0.75rem' }}>{m.label_field}</th>
                  ))}
                  <th style={{ padding: '0.75rem' }}>Total Item Terjawab</th>
                </tr>
              </thead>
              <tbody>
                {pengisians.slice(0, 10).map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(p.tanggal_pengisian).toLocaleDateString('id-ID')}</td>
                    {schema.metadata_fields.map(m => (
                      <td key={m.id} style={{ padding: '0.75rem' }}>{p.metadata_values[m.id] || '-'}</td>
                    ))}
                    <td style={{ padding: '0.75rem' }}>{p.jawaban.length} item</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pengisians.length > 10 && (
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'gray', marginTop: '1rem' }}>
              Menampilkan 10 data terbaru. Silakan Export Excel untuk melihat seluruh {pengisians.length} baris data mentah.
            </p>
          )}
        </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/dashboard" className="btn btn-outline" style={{ border: 'none' }}>&larr; Kembali ke Daftar Kegiatan</Link>
      </div>
    </main>
  );
}

```


## File: src\app\globals.css
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  /* Colors - Modern, vibrant, professional */
  --bg-color: #f8fafc;
  --bg-card: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-light: #eff6ff;
  
  --success: #10b981;
  --success-bg: #d1fae5;
  --warning: #f59e0b;
  --warning-bg: #fef3c7;
  --danger: #ef4444;
  --danger-bg: #fee2e2;

  --border-color: #e2e8f0;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-glow: 0 0 15px rgba(59, 130, 246, 0.3);

  /* Radius */
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Transitions */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Layout */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Typography */
h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.025em;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-outline {
  background-color: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}

.btn-outline:hover {
  background-color: var(--primary-light);
}

/* Forms */
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

input[type="text"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: #fff;
  transition: var(--transition);
}

input[type="text"]:focus,
input[type="date"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Radio Cards (for Ya/Tidak) */
.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-card {
  flex: 1;
  position: relative;
}

.radio-card input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 10;
}

.radio-card-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: 600;
  color: var(--text-secondary);
  transition: var(--transition);
  background: white;
}

.radio-card input:checked + .radio-card-content.ya {
  border-color: var(--success);
  background-color: var(--success-bg);
  color: var(--success);
}

.radio-card input:checked + .radio-card-content.tidak {
  border-color: var(--danger);
  background-color: var(--danger-bg);
  color: var(--danger);
}

.radio-card input:checked + .radio-card-content.default {
  border-color: var(--primary);
  background-color: var(--primary-light);
  color: var(--primary);
}

.radio-card:hover .radio-card-content {
  border-color: var(--primary-light);
  transform: translateY(-2px);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-sangat-ramah { background-color: var(--success-bg); color: #065f46; }
.badge-cukup-ramah { background-color: var(--warning-bg); color: #92400e; }
.badge-kurang { background-color: var(--danger-bg); color: #991b1b; }
.badge-default { background-color: var(--bg-color); color: var(--text-secondary); }

/* Steps indicator */
.steps-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.steps-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--border-color);
  z-index: 1;
  transform: translateY(-50%);
}

.step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-secondary);
  position: relative;
  z-index: 2;
  transition: var(--transition);
}

.step.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
  box-shadow: 0 0 0 4px var(--primary-light);
}

.step.completed {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Admin Table */
.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.admin-table th, .admin-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.admin-table th {
  background-color: var(--bg-color);
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border-color);
}

.admin-table tbody tr {
  transition: var(--transition);
}

.admin-table tbody tr:hover {
  background-color: var(--primary-light);
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
}

.history-item:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.history-item-content h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.history-item-content p {
  margin: 0;
  font-size: 0.875rem;
}

/* Header */
.app-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-color);
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.app-logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Print Styles */
@media print {
  .no-print, .app-header, .btn, button {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
  
  body {
    background: white;
    color: black;
  }
  
  .card {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}


@media print {
  @page {
    size: auto;
    margin: 1.5cm;
  }
  body {
    margin: 0;
  }
  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .signature-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}

```


## File: src\app\isi-form\page.tsx
```tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INSTRUMEN_BARU, calculateStatus, getItemsForJenjang, StatusResult } from '@/config/instruments';

export default function FormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [identitas, setIdentitas] = useState({
    namaSekolah: '',
    npsn: '',
    jenjang: 'TK',
    kabKota: '',
    namaPetugas: '',
    tanggal: new Date().toISOString().split('T')[0],
    namaKepsek: ''
  });

  const [materiTes, setMateriTes] = useState({
    materiUtama: { rincian: '', waktu: '' },
    materiPilihan: { rincian: '', waktu: '' },
    rangkianTes: { rincian: '', waktu: '' }
  });

  const [permasalahanSolusi, setPermasalahanSolusi] = useState({
    perencanaan: { rincian: '', solusi: '' },
    pelaksanaan: { rincian: '', solusi: '' }
  });

  const [jawabanUmum, setJawabanUmum] = useState<Record<string, { jawaban?: boolean | string, catatan?: string }>>({});
  const [kesimpulan, setKesimpulan] = useState({
    statusFinal: '',
    alasanOverride: '',
    catatanKritis: '',
    rekomendasi: ''
  });

  const [statusOtomatis, setStatusOtomatis] = useState<{
    perencanaan: StatusResult;
    pelaksanaan: StatusResult;
    rekapitulasi: StatusResult;
  } | null>(null);

  useEffect(() => {
    if (step >= 2) {
      const result = calculateStatus(jawabanUmum, identitas.jenjang as any);
      setStatusOtomatis(result);
      if (!kesimpulan.statusFinal || step === 5) {
        setKesimpulan(prev => ({ ...prev, statusFinal: result.rekapitulasi.status }));
      }
    }
  }, [jawabanUmum, identitas.jenjang, step]);

  // removed inline import
  const scrollToField = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = el.querySelector('input, select, textarea') as HTMLElement;
      if (input) {
        // focus with small delay to allow scroll first
        setTimeout(() => input.focus(), 300);
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!identitas.namaSekolah) { setError('Nama Sekolah wajib diisi.'); scrollToField('field-namaSekolah'); return; }
      if (!identitas.npsn) { setError('NPSN wajib diisi.'); scrollToField('field-npsn'); return; }
      if (!identitas.kabKota) { setError('Kabupaten/Kota wajib dipilih.'); scrollToField('field-kabKota'); return; }
      if (!identitas.namaKepsek) { setError('Nama Kepala Sekolah wajib diisi.'); scrollToField('field-namaKepsek'); return; }
      if (!identitas.namaPetugas) { setError('Nama Petugas Monev wajib diisi.'); scrollToField('field-namaPetugas'); return; }
    } else if (step === 2) {
      const perencanaan = INSTRUMEN_BARU.find(k => k.id === 'perencanaan');
      const itemsPerencanaan = perencanaan ? getItemsForJenjang(perencanaan, identitas.jenjang as any) : [];
      for (const item of itemsPerencanaan) {
        if (jawabanUmum[item.id]?.jawaban === undefined) {
          setError(`Harap jawab pertanyaan: ${item.pertanyaan}`);
          scrollToField(`field-${item.id}`);
          return;
        }
      }
    } else if (step === 3) {
      const pelaksanaan = INSTRUMEN_BARU.find(k => k.id === 'pelaksanaan');
      const itemsPelaksanaan = pelaksanaan ? getItemsForJenjang(pelaksanaan, identitas.jenjang as any) : [];
      for (const item of itemsPelaksanaan) {
        if (jawabanUmum[item.id]?.jawaban === undefined) {
          setError(`Harap jawab pertanyaan: ${item.pertanyaan}`);
          scrollToField(`field-${item.id}`);
          return;
        }
      }
    }
    setError('');
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setError('');
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    // Validasi Step 4
    if (step === 4) {
      if (!materiTes.materiUtama.rincian || !materiTes.materiUtama.waktu) {
        setError('Materi Utama (Rincian & Waktu) wajib diisi.'); scrollToField('field-materiUtama'); return;
      }
      if (!materiTes.materiPilihan.rincian || !materiTes.materiPilihan.waktu) {
        setError('Materi Pilihan (Rincian & Waktu) wajib diisi.'); scrollToField('field-materiPilihan'); return;
      }
      if (!materiTes.rangkianTes.rincian || !materiTes.rangkianTes.waktu) {
        setError('Rangkaian Tes (Rincian & Waktu) wajib diisi.'); scrollToField('field-rangkianTes'); return;
      }
      if (!permasalahanSolusi.perencanaan.rincian || !permasalahanSolusi.perencanaan.solusi) {
        setError('Permasalahan & Solusi Tahap Perencanaan wajib diisi.'); scrollToField('field-permasalahanPerencanaan'); return;
      }
      if (!permasalahanSolusi.pelaksanaan.rincian || !permasalahanSolusi.pelaksanaan.solusi) {
        setError('Permasalahan & Solusi Tahap Pelaksanaan wajib diisi.'); scrollToField('field-permasalahanPelaksanaan'); return;
      }
    }

    if (step === 5) {
      if (kesimpulan.statusFinal === 'KURANG' && !kesimpulan.alasanOverride) {
        setError('Karena Status Final adalah KURANG, Anda wajib memberikan catatan/alasan pada kolom Alasan Mengubah Status.');
        return;
      }
      if (kesimpulan.statusFinal !== statusOtomatis?.rekapitulasi?.status && !kesimpulan.alasanOverride) {
        setError('Alasan Mengubah Status wajib diisi karena Anda mengubah status yang disarankan sistem.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...identitas,
        jawabanUmum,
        jawabanKhusus: {},
        ...kesimpulan, // will default to the auto calculated status
        statusOtomatis: statusOtomatis?.rekapitulasi.status,
        materiTes,
        permasalahanSolusi
      };

      const response = await fetch('/api/monev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan saat menyimpan data');
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data');
      setIsSubmitting(false);
    }
  };

  const renderRadioKategori = (kategoriId: string) => {
    const kategori = INSTRUMEN_BARU.find(k => k.id === kategoriId);
    if (!kategori) return null;

    const validItems = getItemsForJenjang(kategori, identitas.jenjang as any);
    if (validItems.length === 0) return null;

    return (
      <div key={kategori.id} style={{ marginBottom: '3rem' }}>
        <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
          {kategori.judul}
        </h3>
        {validItems.map((item, index) => (
          <div key={item.id} id={`field-${item.id}`} className="form-group" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {index + 1}. {item.pertanyaan}
            </p>
            {kategori.tipeJawaban === 'ya-tidak' ? (
              <div className="radio-group" style={{ marginBottom: '1rem' }}>
                <label className="radio-card">
                  <input 
                    type="radio" 
                    name={item.id} 
                    checked={jawabanUmum[item.id]?.jawaban === true}
                    onChange={() => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], jawaban: true } })}
                  />
                  <div className="radio-card-content ya">Ya</div>
                </label>
                <label className="radio-card">
                  <input 
                    type="radio" 
                    name={item.id} 
                    checked={jawabanUmum[item.id]?.jawaban === false}
                    onChange={() => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], jawaban: false } })}
                  />
                  <div className="radio-card-content tidak">Tidak</div>
                </label>
              </div>
            ) : (
              <div className="radio-group-likert" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['SS', 'S', 'TS', 'STS'].map(val => (
                  <label key={val} className="radio-card" style={{ flex: '1 1 auto', minWidth: '80px' }}>
                    <input 
                      type="radio" 
                      name={item.id} 
                      checked={jawabanUmum[item.id]?.jawaban === val}
                      onChange={() => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], jawaban: val } })}
                    />
                    <div className="radio-card-content default">{val}</div>
                  </label>
                ))}
                <div style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  *SS = Sangat Sesuai, S = Sesuai, TS = Tidak Sesuai, STS = Sangat Tidak Sesuai
                </div>
              </div>
            )}
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Catatan / Keterangan</label>
              <input
                type="text"
                placeholder="Tuliskan catatan/keterangan..."
                value={jawabanUmum[item.id]?.catatan || ''}
                onChange={e => setJawabanUmum({ ...jawabanUmum, [item.id]: { ...jawabanUmum[item.id], catatan: e.target.value } })}
                style={{ padding: '0.5rem', fontSize: '0.875rem', marginTop: '0.25rem' }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="card animate-fade-in">
      <h2>Identitas Sekolah</h2>
      <div className="form-group" id="field-namaSekolah">
        <label>Nama Sekolah</label>
        <input type="text" value={identitas.namaSekolah} onChange={e => setIdentitas({ ...identitas, namaSekolah: e.target.value })} placeholder="Contoh: SD Negeri 1 Padang" />
      </div>
      <div className="form-group" id="field-npsn">
        <label>NPSN</label>
        <input type="text" value={identitas.npsn} onChange={e => setIdentitas({ ...identitas, npsn: e.target.value })} placeholder="Contoh: 12345678" />
      </div>
      <div className="form-group">
        <label>Jenjang Pendidikan</label>
        <select value={identitas.jenjang} onChange={e => setIdentitas({ ...identitas, jenjang: e.target.value })}>
          <option value="TK">TK / PAUD</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA/K">SMA / SMK</option>
        </select>
      </div>
      <div className="form-group" id="field-kabKota">
        <label>Kabupaten / Kota</label>
        <select value={identitas.kabKota} onChange={e => setIdentitas({ ...identitas, kabKota: e.target.value })}>
          <option value="">-- Pilih Kabupaten/Kota --</option>
          {[
            'Kabupaten Agam', 'Kabupaten Dharmasraya', 'Kabupaten Kepulauan Mentawai', 'Kabupaten Lima Puluh Kota', 'Kabupaten Padang Pariaman', 'Kabupaten Pasaman', 'Kabupaten Pasaman Barat', 'Kabupaten Pesisir Selatan', 'Kabupaten Sijunjung', 'Kabupaten Solok', 'Kabupaten Solok Selatan', 'Kabupaten Tanah Datar', 'Kota Bukittinggi', 'Kota Padang', 'Kota Padang Panjang', 'Kota Pariaman', 'Kota Payakumbuh', 'Kota Sawahlunto', 'Kota Solok'
          ].map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="form-group" id="field-namaKepsek">
        <label>Nama Kepala Sekolah</label>
        <input type="text" value={identitas.namaKepsek} onChange={e => setIdentitas({ ...identitas, namaKepsek: e.target.value })} />
      </div>
      <div className="form-group" id="field-namaPetugas">
        <label>Nama Petugas Monev</label>
        <input type="text" value={identitas.namaPetugas} onChange={e => setIdentitas({ ...identitas, namaPetugas: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Tanggal Pelaksanaan Monev</label>
        <input type="date" value={identitas.tanggal} onChange={e => setIdentitas({ ...identitas, tanggal: e.target.value })} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="card animate-fade-in">
      <h2>Instrumen (Bagian A)</h2>
      {renderRadioKategori('perencanaan')}
    </div>
  );

  const renderStep3 = () => (
    <div className="card animate-fade-in">
      <h2>Instrumen (Bagian B)</h2>
      {renderRadioKategori('pelaksanaan')}
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-fade-in">
      <div className="card">
        <h2>Materi & Rangkaian Tes MPLS</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Tuliskan rincian materi/kegiatan serta waktu pelaksanaan yang dilakukan sekolah.
        </p>
        
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }} id="field-materiUtama">
          <h3>1. Materi Utama <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Rincian Kegiatan</label>
            <textarea 
              value={materiTes.materiUtama.rincian} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiUtama: { ...materiTes.materiUtama, rincian: e.target.value }
              })} 
              placeholder="Contoh: Pengenalan warga sekolah, visi misi, tata tertib, budaya 5S..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Waktu Pelaksanaan</label>
            <input 
              type="date" 
              value={materiTes.materiUtama.waktu} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiUtama: { ...materiTes.materiUtama, waktu: e.target.value }
              })} 
            />
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }} id="field-materiPilihan">
          <h3>2. Materi Pilihan <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Rincian Kegiatan</label>
            <textarea 
              value={materiTes.materiPilihan.rincian} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiPilihan: { ...materiTes.materiPilihan, rincian: e.target.value }
              })} 
              placeholder="Contoh: Penanggulangan kekerasan, simulasi mitigasi bencana, pola hidup bersih..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Waktu Pelaksanaan</label>
            <input 
              type="date" 
              value={materiTes.materiPilihan.waktu} 
              onChange={e => setMateriTes({
                ...materiTes,
                materiPilihan: { ...materiTes.materiPilihan, waktu: e.target.value }
              })} 
            />
          </div>
        </div>

        <div id="field-rangkianTes">
          <h3>3. Rangkaian Tes (Asesmen Profil/Awal) <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Rincian Kegiatan</label>
            <textarea 
              value={materiTes.rangkianTes.rincian} 
              onChange={e => setMateriTes({
                ...materiTes,
                rangkianTes: { ...materiTes.rangkianTes, rincian: e.target.value }
              })} 
              placeholder="Contoh: Pengamatan perilaku, wawancara sederhana, tes literasi & numerasi awal..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Waktu Pelaksanaan</label>
            <input 
              type="date" 
              value={materiTes.rangkianTes.waktu} 
              onChange={e => setMateriTes({
                ...materiTes,
                rangkianTes: { ...materiTes.rangkianTes, waktu: e.target.value }
              })} 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Permasalahan & Solusi</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Tuliskan kendala/permasalahan yang dihadapi serta solusi penyelesaiannya di masing-masing tahap.
        </p>

        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }} id="field-permasalahanPerencanaan">
          <h3>1. Tahap Perencanaan <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Permasalahan / Kendala</label>
            <textarea 
              value={permasalahanSolusi.perencanaan.rincian} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                perencanaan: { ...permasalahanSolusi.perencanaan, rincian: e.target.value }
              })} 
              placeholder="Contoh: Beberapa narasumber eksternal berhalangan hadir di hari yang ditentukan..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Solusi Penyelesaian</label>
            <textarea 
              value={permasalahanSolusi.perencanaan.solusi} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                perencanaan: { ...permasalahanSolusi.perencanaan, solusi: e.target.value }
              })} 
              placeholder="Contoh: Menjadwalkan ulang ke hari berikutnya atau mengganti dengan narasumber internal..."
              rows={3}
            />
          </div>
        </div>

        <div id="field-permasalahanPelaksanaan">
          <h3>2. Tahap Pelaksanaan <span style={{color:'var(--danger)'}}>*</span></h3>
          <div className="form-group">
            <label>Permasalahan / Kendala</label>
            <textarea 
              value={permasalahanSolusi.pelaksanaan.rincian} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                pelaksanaan: { ...permasalahanSolusi.pelaksanaan, rincian: e.target.value }
              })} 
              placeholder="Contoh: Cuaca hujan lebat mengganggu kegiatan pengenalan lingkungan luar ruangan..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Solusi Penyelesaian</label>
            <textarea 
              value={permasalahanSolusi.pelaksanaan.solusi} 
              onChange={e => setPermasalahanSolusi({
                ...permasalahanSolusi,
                pelaksanaan: { ...permasalahanSolusi.pelaksanaan, solusi: e.target.value }
              })} 
              placeholder="Contoh: Pengenalan lingkungan diganti menggunakan media video/presentasi di dalam aula..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-fade-in">
      <div className="card">
        <h2>Kesimpulan Status Monev</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Perencanaan */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #3b82f6' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Tahap Perencanaan</p>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                {statusOtomatis?.perencanaan?.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {statusOtomatis?.perencanaan?.label}
              </span>
            </div>
          </div>

          {/* Pelaksanaan */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #8b5cf6' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Tahap Pelaksanaan</p>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                {statusOtomatis?.pelaksanaan?.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {statusOtomatis?.pelaksanaan?.label}
              </span>
            </div>
          </div>

          {/* Rekapitulasi */}
          <div style={{ padding: '1rem', backgroundColor: '#eef2ff', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Rekapitulasi Total</p>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', display: 'block' }}>
                {statusOtomatis?.rekapitulasi?.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {statusOtomatis?.rekapitulasi?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Konfirmasi Status Final</label>
          <select 
            value={kesimpulan.statusFinal}
            onChange={e => setKesimpulan({ ...kesimpulan, statusFinal: e.target.value })}
            style={{ fontWeight: 600 }}
          >
            <option value="SANGAT RAMAH">SANGAT RAMAH</option>
            <option value="CUKUP RAMAH">CUKUP RAMAH</option>
            <option value="KURANG">KURANG</option>
          </select>
        </div>

        {(kesimpulan.statusFinal !== statusOtomatis?.rekapitulasi?.status || kesimpulan.statusFinal === 'KURANG') && (
          <div className="form-group animate-fade-in">
            <label style={{ color: 'var(--warning)' }}>Alasan / Catatan (Wajib)</label>
            <textarea 
              value={kesimpulan.alasanOverride}
              onChange={e => setKesimpulan({ ...kesimpulan, alasanOverride: e.target.value })}
              rows={2}
              placeholder={kesimpulan.statusFinal === 'KURANG' ? "Berikan catatan mengapa status sekolah ini KURANG..." : "Berikan alasan mengapa status final berbeda dengan hitungan rekapitulasi sistem..."}
              style={{ borderColor: 'var(--warning)' }}
            />
          </div>
        )}
      </div>

      <div className="card">
        <h2>Catatan Tambahan (Opsional)</h2>
        <div className="form-group">
          <label>Catatan Kritis / Temuan Lapangan</label>
          <textarea 
            value={kesimpulan.catatanKritis}
            onChange={e => setKesimpulan({ ...kesimpulan, catatanKritis: e.target.value })}
            rows={4}
            placeholder="Tuliskan temuan atau hal-hal kritis di lapangan..."
          />
        </div>
        <div className="form-group">
          <label>Rekomendasi Perbaikan</label>
          <textarea 
            value={kesimpulan.rekomendasi}
            onChange={e => setKesimpulan({ ...kesimpulan, rekomendasi: e.target.value })}
            rows={4}
            placeholder="Tuliskan rekomendasi perbaikan untuk sekolah..."
          />
        </div>
      </div>
    </div>
  );

  if (isSuccess) {
    return (
      <main className="container animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Instrumen Selesai Diisi!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Terima kasih telah mengisi instrumen Monitoring dan Evaluasi MPLS Ramah 2026. Data untuk sekolah <strong>{identitas.namaSekolah}</strong> telah berhasil disimpan secara permanen.
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Untuk mengunduh laporan pengisian ini (format PDF), Anda dapat menuju ke halaman <strong>Cari Hasil</strong>.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => window.location.reload()}>
              Isi Sekolah Lain
            </button>
            <button className="btn btn-primary" onClick={() => router.push('/cari')}>
              Ke Halaman Cari Hasil
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="steps-container">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`step ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
            {s}
          </div>
        ))}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)', padding: '1rem', marginTop: '1.5rem', marginBottom: '0' }}>
          <p style={{ color: 'var(--danger)', margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        {step > 1 ? (
          <button className="btn btn-outline" onClick={handlePrev} disabled={isSubmitting}>
            Kembali
          </button>
        ) : <div />}

        {step < 5 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Selanjutnya
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Submit Monev'}
          </button>
        )}
      </div>
    </main>
  );
}

```


## File: src\app\kegiatan\page.tsx
```tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Kegiatan } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DaftarKegiatanPetugas() {
  const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const fetchKegiatan = async () => {
    setIsLoading(true);
    // Hanya ambil kegiatan yang berstatus aktif
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('status', 'aktif')
      .order('created_at', { ascending: false });
      
    if (data) setKegiatans(data);
    setIsLoading(false);
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Pilih Kegiatan Monev</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Silakan pilih instrumen kegiatan yang akan Anda isi.
        </p>
      </div>

      {isLoading ? (
        <p>Memuat data...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          
          {/* Card untuk MPLS Lama */}
          <div className="card" style={{ borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0 }}>Masa Pengenalan Lingkungan Sekolah (MPLS)</h3>
              <span style={{ fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>AKTIF</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
              Instrumen monitoring dan evaluasi Masa Pengenalan Lingkungan Sekolah.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => router.push('/isi-form')}
            >
              Mulai Mengisi
            </button>
          </div>

          {/* Render Kegiatan Dinamis */}
          {kegiatans.map(k => (
            <div key={k.id} className="card" style={{ borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{k.nama_kegiatan}</h3>
                <span style={{ fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>AKTIF</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                {k.deskripsi || 'Tidak ada deskripsi.'}
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => router.push(`/kegiatan/${k.id}/isi-form`)}
              >
                Mulai Mengisi
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

```


## File: src\app\kegiatan\[id]\isi-form\page.tsx
```tsx
"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { InstrumenFull, InstrumenMetadataField, InstrumenSection, InstrumenItem } from '@/lib/types';
import { DYNAMIC_SCORING_REGISTRY, calculateDynamicScore, DynamicScoringConfig } from '@/config/dynamicScoring';

const KABUPATEN_KOTA_SUMBAR = [
  "Kabupaten Agam",
  "Kabupaten Dharmasraya",
  "Kabupaten Kepulauan Mentawai",
  "Kabupaten Lima Puluh Kota",
  "Kabupaten Padang Pariaman",
  "Kabupaten Pasaman",
  "Kabupaten Pasaman Barat",
  "Kabupaten Pesisir Selatan",
  "Kabupaten Sijunjung",
  "Kabupaten Solok",
  "Kabupaten Solok Selatan",
  "Kabupaten Tanah Datar",
  "Kota Bukittinggi",
  "Kota Padang",
  "Kota Padang Panjang",
  "Kota Pariaman",
  "Kota Payakumbuh",
  "Kota Sawahlunto",
  "Kota Solok"
];

export default function IsiFormDinamis({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const kegiatan_id = unwrappedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [schema, setSchema] = useState<InstrumenFull | null>(null);
  
  // State untuk form
  const [currentStep, setCurrentStep] = useState(0);
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({});
  const [jawabanValues, setJawabanValues] = useState<Record<string, any>>({});
  
  const [scoringConfig, setScoringConfig] = useState<DynamicScoringConfig | null>(null);
  const [kesimpulanComputed, setKesimpulanComputed] = useState<any>(null);
  const [kesimpulanInputs, setKesimpulanInputs] = useState({
    statusFinal: '',
    alasanOverride: '',
    catatanKritis: '',
    rekomendasi: ''
  });
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchSchema();
    fetchUser();
  }, [kegiatan_id]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch(err) {}
  };

  const fetchSchema = async () => {
    try {
      setIsLoading(true);
      // 1. Dapatkan instrumen dari kegiatan_id
      const { data: inst, error: errInst } = await supabase
        .from('instrumen')
        .select('*')
        .eq('kegiatan_id', kegiatan_id)
        .single();
      
      if (errInst || !inst) throw new Error('Instrumen tidak ditemukan untuk kegiatan ini.');

      // 2. Dapatkan metadata fields
      const { data: metaFields } = await supabase
        .from('instrumen_metadata_field')
        .select('*')
        .eq('instrumen_id', inst.id)
        .order('urutan', { ascending: true });

      // 3. Dapatkan sections & items
      const { data: sections } = await supabase
        .from('instrumen_section')
        .select(`
          *,
          items:instrumen_item(*)
        `)
        .eq('instrumen_id', inst.id)
        .order('urutan', { ascending: true });

      // Urutkan item di dalam section
      if (sections) {
        sections.forEach(s => {
          s.items.sort((a: any, b: any) => a.urutan - b.urutan);
        });
      }

      setSchema({
        ...inst,
        metadata_fields: metaFields || [],
        sections: sections || []
      });

      if (DYNAMIC_SCORING_REGISTRY[inst.nama_instrumen]) {
        setScoringConfig(DYNAMIC_SCORING_REGISTRY[inst.nama_instrumen]);
      }

      // Init default values
      const initMeta: Record<string, string> = {};
      metaFields?.forEach(m => {
        initMeta[m.id] = m.tipe_field === 'date' ? new Date().toISOString().split('T')[0] : '';
      });
      setMetadataValues(initMeta);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetadataChange = (id: string, value: string) => {
    setMetadataValues(prev => ({ ...prev, [id]: value }));
  };

  const handleJawabanChange = (itemId: string, field: 'nilai_skor' | 'nilai_teks' | 'catatan_bukti', value: any) => {
    setJawabanValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema) return;

    const hasMeta = schema.metadata_fields.length > 0;
    const totalSteps = (hasMeta ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0);

    if (currentStep < totalSteps - 1) {
      if (scoringConfig && currentStep === totalSteps - 2) {
        const computed = calculateDynamicScore(scoringConfig, jawabanValues, schema.sections);
        setKesimpulanComputed(computed);
        setKesimpulanInputs(prev => ({ ...prev, statusFinal: computed.finalStatus }));
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Since status final is auto-computed and hidden, no override check is needed.

    setIsSubmitting(true);
    setError('');

    const finalMetadata = { ...metadataValues };
    if (scoringConfig) {
       finalMetadata['_statusOtomatis'] = kesimpulanComputed?.finalStatus || '';
       finalMetadata['_statusFinal'] = kesimpulanInputs.statusFinal;
       finalMetadata['_alasanOverride'] = kesimpulanInputs.alasanOverride;
       finalMetadata['_catatanKritis'] = kesimpulanInputs.catatanKritis;
       finalMetadata['_rekomendasi'] = kesimpulanInputs.rekomendasi;
       finalMetadata['_skorTotal'] = kesimpulanComputed?.totalScorePercentage?.toFixed(2) || '0';
       // We must update state so it shows up in success page properly
       setMetadataValues(finalMetadata);
    }

    try {
      // 1. Simpan tabel pengisian
      const { data: pengisianData, error: pengisianErr } = await supabase
        .from('pengisian')
        .insert([{
          instrumen_id: schema.id,
          petugas_id: (currentUser?.id && currentUser.id !== 'super-admin') ? currentUser.id : null,
          metadata_values: finalMetadata
        }])
        .select()
        .single();

      if (pengisianErr) throw pengisianErr;

      // 2. Simpan semua jawaban
      const listJawaban = [];
      for (const section of schema.sections) {
        for (const item of section.items) {
          const ans = jawabanValues[item.id] || {};
          listJawaban.push({
            pengisian_id: pengisianData.id,
            item_id: item.id,
            nilai_skor: ans.nilai_skor || null,
            nilai_teks: ans.nilai_teks || null,
            catatan_bukti: ans.catatan_bukti || null
          });
        }
      }

      if (listJawaban.length > 0) {
        const { error: jawabanErr } = await supabase.from('jawaban').insert(listJawaban);
        if (jawabanErr) throw jawabanErr;
      }

      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="container" style={{ padding: '2rem 1rem' }}>Memuat instrumen...</div>;
  if (error) return <div className="container" style={{ padding: '2rem 1rem', color: 'red' }}>Error: {error}</div>;
  if (!schema) return null;

  if (isSuccess) {
    return (
      <main className="container animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div className="no-print">
            <h2 style={{ color: '#10b981' }}>Berhasil Disimpan!</h2>
            <p>Terima kasih telah mengisi instrumen <strong>{schema.nama_instrumen}</strong>.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => window.print()}>
                Cetak Bukti (PDF)
              </button>
              <button className="btn btn-primary" onClick={() => router.push('/kegiatan')}>
                Kembali ke Daftar Kegiatan
              </button>
            </div>
          </div>
          
          {/* Bagian khusus untuk di-print sebagai PDF (Berita Acara) */}
          <div className="print-only" style={{ display: 'none', textAlign: 'left', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.5' }}>
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
            </table>
            
            
            <div style={{ marginBottom: '2rem', marginTop: '2rem' }}>
            
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
                          const ans = jawabanValues[item.id] || {};
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
                          const ans = jawabanValues[item.id] || {};
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
          </div>
            
            <p style={{ marginBottom: '4rem' }}>Demikian form instrumen ini diisi dengan sebenar-benarnya sesuai dengan kondisi di lapangan.</p>
            {(() => {
              const getMeta = (lbl: string) => {
                const f = schema.metadata_fields.find(m => m.label_field.toLowerCase().includes(lbl.toLowerCase()));
                return f ? metadataValues[f.id] : '';
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
            })()}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{schema.nama_instrumen}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{schema.deskripsi}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Langkah {currentStep + 1} dari {(schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0)}
          </span>
          <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '8px', flex: 1, marginLeft: '1rem', overflow: 'hidden' }}>
            <div style={{ 
              background: 'var(--primary)', 
              height: '100%', 
              width: `${((currentStep + 1) / ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0))) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Identitas / Metadata */}
        {schema.metadata_fields.length > 0 && currentStep === 0 && (
          <div className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #3b82f6' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Informasi Umum</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {schema.metadata_fields.map(m => (
                <div key={m.id} className="form-group">
                  <label>{m.label_field} {m.wajib_diisi && <span style={{color:'red'}}>*</span>}</label>
                  {m.label_field.toLowerCase().includes('kabupaten') || m.label_field.toLowerCase().includes('kota') ? (
                    <select
                      required={m.wajib_diisi}
                      value={metadataValues[m.id] || ''}
                      onChange={e => handleMetadataChange(m.id, e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                    >
                      <option value="">-- Pilih Kabupaten/Kota --</option>
                      {KABUPATEN_KOTA_SUMBAR.map(kab => (
                        <option key={kab} value={kab}>{kab}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={m.tipe_field}
                      required={m.wajib_diisi}
                      value={metadataValues[m.id] || ''}
                      onChange={e => handleMetadataChange(m.id, e.target.value)}
                      placeholder={`Masukkan ${m.label_field}...`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections & Items */}
        {schema.sections.map((section, sIdx) => {
          const sectionStepIndex = schema.metadata_fields.length > 0 ? sIdx + 1 : sIdx;
          if (currentStep !== sectionStepIndex) return null;

          return (
            <div key={section.id} className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #8b5cf6' }}>
              <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
              {section.nama_section}
            </h2>

            {section.items.map((item, iIdx) => (
              <div key={item.id} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px solid #eaeaea' }}>
                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>
                  {iIdx + 1}. {item.teks_pertanyaan}
                </p>

                {/* Tipe: LIKERT 4 */}
                {item.tipe_jawaban === 'likert4' && (
                  <div className="radio-group-likert" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { val: 1, label: 'TS' },
                      { val: 2, label: 'KS' },
                      { val: 3, label: 'S' },
                      { val: 4, label: 'SS' }
                    ].map(opt => (
                      <label key={opt.val} className="radio-card" style={{ flex: '1 1 auto', minWidth: '60px' }}>
                        <input 
                          type="radio" 
                          name={item.id} 
                          required
                          checked={jawabanValues[item.id]?.nilai_skor === opt.val}
                          onChange={() => handleJawabanChange(item.id, 'nilai_skor', opt.val)}
                        />
                        <div className="radio-card-content default">{opt.label}</div>
                      </label>
                    ))}
                    <div style={{ width: '100%', fontSize: '0.75rem', color: 'gray', marginTop: '0.25rem' }}>
                      TS=Tidak Sesuai, KS=Kurang Sesuai, S=Sesuai, SS=Sangat Sesuai
                    </div>
                  </div>
                )}

                {/* Tipe: ESAI */}
                {item.tipe_jawaban === 'esai' && (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <textarea 
                      rows={3} 
                      required
                      value={jawabanValues[item.id]?.nilai_teks || ''}
                      onChange={e => handleJawabanChange(item.id, 'nilai_teks', e.target.value)}
                      placeholder="Tuliskan jawaban Anda di sini..."
                    />
                  </div>
                )}

                {/* Catatan Bukti */}
                {item.butuh_catatan_bukti && (
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bukti Pembelajaran / Catatan Penting <span style={{color:'red'}}>*</span></label>
                    <textarea 
                      rows={2}
                      required
                      value={jawabanValues[item.id]?.catatan_bukti || ''}
                      onChange={e => handleJawabanChange(item.id, 'catatan_bukti', e.target.value)}
                      placeholder="Masukkan deskripsi bukti atau link drive..."
                      style={{ background: 'white' }}
                    />
                  </div>
                )}
              </div>
            ))}
            </div>
          );
        })}

        {/* Kesimpulan Step */}
        {scoringConfig && currentStep === (schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length && (
          <div className="card animate-fade-in" style={{ marginBottom: '2rem', borderTop: '4px solid #10b981' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Kesimpulan & Rekapitulasi</h2>
            
            {/* Skor dan Status Disembunyikan (Berdasarkan Evaluasi Atasan) */}
            <input type="hidden" value={kesimpulanInputs.statusFinal} />

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Catatan Kritis / Temuan Lapangan <span style={{color:'red'}}>*</span></label>
              <textarea 
                required
                value={kesimpulanInputs.catatanKritis}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, catatanKritis: e.target.value })}
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Rekomendasi <span style={{color:'red'}}>*</span></label>
              <textarea 
                required
                value={kesimpulanInputs.rekomendasi}
                onChange={e => setKesimpulanInputs({ ...kesimpulanInputs, rekomendasi: e.target.value })}
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
              />
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {currentStep === 0 ? (
            <button type="button" className="btn btn-outline" onClick={() => router.push('/kegiatan')}>
              Batal
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={() => { setCurrentStep(prev => prev - 1); window.scrollTo(0, 0); }}>
              Sebelumnya
            </button>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (currentStep === ((schema.metadata_fields.length > 0 ? 1 : 0) + schema.sections.length + (scoringConfig ? 1 : 0) - 1) ? 'Kirim Form Monev' : 'Selanjutnya')}
          </button>
        </div>
      </form>
    </main>
  );
}

```


## File: src\app\layout.tsx
```tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import HeaderActions from '@/components/HeaderActions';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = {
  title: "Monev MPLS Ramah 2026",
  description: "Aplikasi Monitoring dan Evaluasi MPLS Ramah 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <header className="app-header">
          <div className="container" style={{ paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" className="app-logo" style={{ gap: '1rem' }}>
              <img src="/logo-bgtk.png" alt="Logo BGTK Sumbar" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.2' }}>PORTAL EVALUASI</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.2' }}>BGTK SUMATERA BARAT</span>
              </div>
            </Link>
            <HeaderActions />
          </div>
        </header>
        {children}
        <BackButton />
      </body>
    </html>
  );
}

```


## File: src\app\login\page.tsx
```tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const expectedRole = urlParams.get('role');
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, expectedRole })
      });

      if (res.ok) {
        const data = await res.json();
        // Gunakan window.location.href agar middleware dapat membaca cookie baru dengan sempurna
        window.location.href = data.redirect || '/dashboard';
      } else {
        const data = await res.json();
        setError(data.error || 'Terjadi kesalahan saat login.');
      }
    } catch (err) {
      setError('Koneksi bermasalah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container animate-fade-in" style={{ maxWidth: '400px', marginTop: '6rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Login Portal Monev</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Silakan masuk menggunakan kredensial {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('role') ? new URLSearchParams(window.location.search).get('role') : 'Anda'}.
        </p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username / NIP</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Masukkan username..."
              autoFocus
              style={{ width: '100%' }}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Masukkan password..."
                style={{ width: '100%', paddingRight: '2.5rem' }}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '0.75rem', 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={() => router.push('/')} 
          className="btn btn-outline" 
          style={{ border: 'none' }}
        >
          &larr; Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}

```


## File: src\app\page.module.css
```css
.page {
  --background: #fafafa;
  --foreground: #fff;

  --text-primary: #000;
  --text-secondary: #666;

  --button-primary-hover: #383838;
  --button-secondary-hover: #f2f2f2;
  --button-secondary-border: #ebebeb;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-geist-sans);
  background-color: var(--background);
}

.main {
  display: flex;
  flex: 1;
  width: 100%;
  max-width: 800px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  background-color: var(--foreground);
  padding: 120px 60px;
}

.intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 24px;
}

.intro h1 {
  max-width: 320px;
  font-size: 40px;
  font-weight: 600;
  line-height: 48px;
  letter-spacing: -2.4px;
  text-wrap: balance;
  color: var(--text-primary);
}

.intro p {
  max-width: 440px;
  font-size: 18px;
  line-height: 32px;
  text-wrap: balance;
  color: var(--text-secondary);
}

.intro a {
  font-weight: 500;
  color: var(--text-primary);
}

.ctas {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 440px;
  gap: 16px;
  font-size: 14px;
}

.ctas a {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border-radius: 128px;
  border: 1px solid transparent;
  transition: 0.2s;
  cursor: pointer;
  width: fit-content;
  font-weight: 500;
}

a.primary {
  background: var(--text-primary);
  color: var(--background);
  gap: 8px;
}

a.secondary {
  border-color: var(--button-secondary-border);
}

/* Enable hover only on non-touch devices */
@media (hover: hover) and (pointer: fine) {
  a.primary:hover {
    background: var(--button-primary-hover);
    border-color: transparent;
  }

  a.secondary:hover {
    background: var(--button-secondary-hover);
    border-color: transparent;
  }
}

@media (max-width: 600px) {
  .main {
    padding: 48px 24px;
  }

  .intro {
    gap: 16px;
  }

  .intro h1 {
    font-size: 32px;
    line-height: 40px;
    letter-spacing: -1.92px;
  }
}

@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert();
  }

  .page {
    --background: #000;
    --foreground: #000;

    --text-primary: #ededed;
    --text-secondary: #999;

    --button-primary-hover: #ccc;
    --button-secondary-hover: #1a1a1a;
    --button-secondary-border: #1a1a1a;
  }
}

```


## File: src\app\page.tsx
```tsx
"use client";

import Link from 'next/link';

export default function PortalMonevPage() {
  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
          Portal Evaluasi BGTK Provinsi Sumatera Barat
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Sistem Terpadu Monitoring dan Evaluasi (Monev) Kegiatan Guru dan Tenaga Kependidikan. Silakan pilih akses masuk Anda:
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Card Petugas */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #10b981' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Saya Petugas Monev</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Akses untuk mengisi instrumen monev (seperti MPLS, Matgem) yang siap ditandatangani.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <Link href="/kegiatan" className="btn btn-primary" style={{ width: '100%' }}>
              Isi Instrumen Baru
            </Link>
          </div>
        </div>

        {/* Card Pimpinan */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #3b82f6' }}>
          <div style={{ width: '64px', height: '64px', background: '#dbeafe', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Saya Pimpinan</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Akses dashboard terbatas untuk memantau rekapitulasi data, grafik, dan statistik dari seluruh kegiatan Monev BGTK.
          </p>
          <Link href="/login?role=pimpinan" className="btn btn-primary" style={{ width: '100%', background: '#3b82f6' }}>
            Login Pimpinan
          </Link>
        </div>

        {/* Card Admin */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ width: '64px', height: '64px', background: '#ede9fe', color: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Saya Admin BGTK</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', flex: 1 }}>
            Area khusus untuk membuat kegiatan baru, menyusun form instrumen dinamis, dan mengekspor seluruh data mentah (Excel).
          </p>
          <Link href="/login?role=admin" className="btn btn-primary" style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6', color: 'white' }}>
            Login Admin
          </Link>
        </div>

      </div>
    </main>
  );
}

```


## File: src\app\[id]\page.tsx
```tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MonevEntryData } from '@/lib/supabase';
import { INSTRUMEN_BARU, getItemsForJenjang, calculateStatus } from '@/config/instruments';
import { generatePDF } from '@/lib/pdfGenerator';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<MonevEntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;
    
    fetch(`/api/monev/${params.id}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) throw new Error(resData.error);
        setData(resData.data);
      })
      .catch(err => {
        console.error(err);
        setError('Gagal memuat detail monev. Mungkin data tidak ditemukan.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Memuat data...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="container">
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
          <Link href="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>Kembali ke Daftar</Link>
        </div>
      </main>
    );
  }

  const getBadgeClass = (status: string) => {
    if (status === 'SANGAT RAMAH') return 'badge-sangat-ramah';
    if (status === 'CUKUP RAMAH') return 'badge-cukup-ramah';
    if (status === 'KURANG') return 'badge-kurang';
    return 'badge-default';
  };

  const statusDetail = data ? calculateStatus(data.jawabanUmum || {}, data.jenjang as any) : null;

  const handleDownloadPDF = () => {
    generatePDF(data);
  };

  return (
    <main className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>{data.namaSekolah}</h1>
          <p style={{ margin: 0 }}>{data.jenjang} &bull; {data.tanggal}</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Unduh PDF
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Identitas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>NPSN</div>
          <div style={{ fontWeight: 500 }}>{data.npsn || '-'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Kabupaten / Kota</div>
          <div style={{ fontWeight: 500 }}>{data.kabKota || '-'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Alamat</div>
          <div style={{ fontWeight: 500 }}>{data.alamat}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Kepala Sekolah</div>
          <div style={{ fontWeight: 500 }}>{data.namaKepsek}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Petugas Monev</div>
          <div style={{ fontWeight: 500 }}>{data.namaPetugas}</div>
        </div>
      </div>

      <div className="card">
        <h2>Kesimpulan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
          {statusDetail && (
            <>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tahap Perencanaan</div>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{statusDetail.perencanaan.status}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{statusDetail.perencanaan.label}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tahap Pelaksanaan</div>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{statusDetail.pelaksanaan.status}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{statusDetail.pelaksanaan.label}</div>
              </div>
            </>
          )}
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Rekapitulasi (Sistem)</div>
            <span className="badge badge-default">{data.statusOtomatis}</span>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status Final (Asesor)</div>
            <span className={`badge ${getBadgeClass(data.statusFinal)}`}>{data.statusFinal}</span>
          </div>
        </div>

        {data.alasanOverride && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <strong>Alasan Perubahan Status / Catatan Observer:</strong><br/>
            {data.alasanOverride}
          </div>
        )}

        {data.catatanKritis && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Catatan Kritis / Temuan Lapangan:</strong>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{data.catatanKritis}</p>
          </div>
        )}

        {data.rekomendasi && (
          <div>
            <strong>Rekomendasi Perbaikan:</strong>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{data.rekomendasi}</p>
          </div>
        )}
      </div>

      {/* Materi & Rangkaian Tes MPLS */}
      {data.materiTes && (
        <div className="card">
          <h2>Materi & Rangkaian Tes MPLS</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {data.materiTes.materiUtama && (data.materiTes.materiUtama.rincian || data.materiTes.materiUtama.waktu) && (
              <div>
                <strong style={{ color: 'var(--primary)' }}>1. Materi Utama</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{data.materiTes.materiUtama.rincian || '-'}</p>
                <small style={{ color: 'var(--text-secondary)' }}>Waktu: {data.materiTes.materiUtama.waktu || '-'}</small>
              </div>
            )}
            {data.materiTes.materiPilihan && (data.materiTes.materiPilihan.rincian || data.materiTes.materiPilihan.waktu) && (
              <div>
                <strong style={{ color: 'var(--primary)' }}>2. Materi Pilihan</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{data.materiTes.materiPilihan.rincian || '-'}</p>
                <small style={{ color: 'var(--text-secondary)' }}>Waktu: {data.materiTes.materiPilihan.waktu || '-'}</small>
              </div>
            )}
            {data.materiTes.rangkianTes && (data.materiTes.rangkianTes.rincian || data.materiTes.rangkianTes.waktu) && (
              <div>
                <strong style={{ color: 'var(--primary)' }}>3. Rangkaian Tes (Asesmen Profil/Awal)</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{data.materiTes.rangkianTes.rincian || '-'}</p>
                <small style={{ color: 'var(--text-secondary)' }}>Waktu: {data.materiTes.rangkianTes.waktu || '-'}</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permasalahan & Solusi */}
      {data.permasalahanSolusi && (
        <div className="card">
          <h2>Permasalahan & Solusi</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem', width: '150px' }}>Tahap</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Permasalahan / Kendala</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Solusi Penyelesaian</th>
              </tr>
            </thead>
            <tbody>
              {data.permasalahanSolusi.perencanaan && (data.permasalahanSolusi.perencanaan.rincian || data.permasalahanSolusi.perencanaan.solusi) && (
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600, verticalAlign: 'top' }}>Perencanaan</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.perencanaan.rincian || '-'}</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.perencanaan.solusi || '-'}</td>
                </tr>
              )}
              {data.permasalahanSolusi.pelaksanaan && (data.permasalahanSolusi.pelaksanaan.rincian || data.permasalahanSolusi.pelaksanaan.solusi) && (
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600, verticalAlign: 'top' }}>Pelaksanaan</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.pelaksanaan.rincian || '-'}</td>
                  <td style={{ padding: '1rem 0.5rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{data.permasalahanSolusi.pelaksanaan.solusi || '-'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {INSTRUMEN_BARU.map((kategori) => {
        const validItems = getItemsForJenjang(kategori, data.jenjang as any);
        if (validItems.length === 0) return null;

        return (
          <div className="card" key={kategori.id}>
            <h2>{kategori.judul}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {validItems.map((item, i) => {
                  const ans = data.jawabanUmum[item.id] || {};
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0', width: '30px', verticalAlign: 'top', color: 'var(--text-secondary)' }}>{i + 1}.</td>
                      <td style={{ padding: '1rem 0', verticalAlign: 'top' }}>
                        {item.pertanyaan}
                        {ans.catatan && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <strong>Catatan:</strong> {ans.catatan}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0', verticalAlign: 'top', textAlign: 'right', fontWeight: 600 }}>
                        {ans.jawaban === true ? <span style={{ color: 'var(--success)' }}>Ya</span> : ans.jawaban === false ? <span style={{ color: 'var(--danger)' }}>Tidak</span> : typeof ans.jawaban === 'string' ? <span style={{ color: 'var(--primary)' }}>{ans.jawaban}</span> : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/" className="btn btn-outline">Kembali ke Daftar</Link>
      </div>
    </main>
  );
}

```


## File: src\components\BackButton.tsx
```tsx
"use client";

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <div style={{ textAlign: 'center', margin: '3rem auto 2rem' }} className="container">
      <button 
        onClick={() => router.back()} 
        className="btn btn-outline"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Kembali ke Halaman Sebelumnya
      </button>
    </div>
  );
}

```


## File: src\components\DashboardCharts.tsx
```tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function DashboardCharts({ statusData, jenjangData }: { statusData: any[], jenjangData: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Avoid hydration mismatch for Recharts

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      
      {/* Donut Chart */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Sebaran Status Sampel</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} Sekolah`, 'Total']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Distribusi Jenjang Pendidikan</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={jenjangData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--bg-color)' }}
                formatter={(value: any) => [`${value} Sekolah`, 'Total']}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

```


## File: src\components\DashboardSchoolList.tsx
```tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

type School = {
  id: string;
  namaSekolah: string;
  jenjang: string;
  statusFinal: string;
};

export default function DashboardSchoolList({ data, mode = 'sekolah' }: { data: Record<string, School[]>, mode?: 'sekolah' | 'daerah' }) {
  const [expandedKabKota, setExpandedKabKota] = useState<string | null>(null);

  if (!data || Object.keys(data).length === 0) return null;

  const kabKotaList = Object.keys(data).sort();

  const toggleKabKota = (kabKota: string) => {
    if (expandedKabKota === kabKota) {
      setExpandedKabKota(null);
    } else {
      setExpandedKabKota(kabKota);
    }
  };

  const getBadgeClass = (status: string) => {
    if (status === 'SANGAT RAMAH') return 'badge-sangat-ramah';
    if (status === 'CUKUP RAMAH') return 'badge-cukup-ramah';
    if (status === 'KURANG') return 'badge-kurang';
    return 'badge-default';
  };

  return (
    <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', textAlign: 'center' }}>
        {mode === 'daerah' ? 'Daftar Keterwakilan Kabupaten / Kota' : 'Daftar Sampel Sekolah per Kabupaten / Kota'}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {kabKotaList.map(kabKota => (
          <div 
            key={kabKota} 
            style={{ 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <button 
              onClick={() => mode === 'sekolah' && toggleKabKota(kabKota)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: expandedKabKota === kabKota ? 'var(--bg-color)' : '#fff',
                border: 'none',
                cursor: mode === 'sekolah' ? 'pointer' : 'default',
                textAlign: 'left',
                transition: 'background-color 0.2s ease'
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--primary)' }}>
                {kabKota}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge badge-default" style={{ fontSize: '0.75rem' }}>
                  {data[kabKota].length} Sekolah
                </span>
                {mode === 'sekolah' && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ 
                      transform: expandedKabKota === kabKota ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </div>
            </button>
            
            {expandedKabKota === kabKota && mode === 'sekolah' && (
              <div style={{ padding: '0 1rem 1rem 1rem', backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
                  {data[kabKota].map((school, i) => (
                    <Link 
                      href={`/${school.id}`}
                      key={i} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: '0.25rem', transition: 'color 0.2s ease' }}>
                          {school.namaSekolah}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Jenjang: {school.jenjang}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${getBadgeClass(school.statusFinal)}`}>
                          {school.statusFinal}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

```


## File: src\components\HeaderActions.tsx
```tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderActions() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      window.location.href = '/';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', whiteSpace: 'nowrap' }}>
      <Link href="/" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
        Beranda
      </Link>
      <Link href="/cari" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
        Cari Hasil
      </Link>
      {isAdmin && (
        <button 
          className="btn" 
          onClick={handleLogout} 
          style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.875rem', 
            backgroundColor: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            border: '1px solid var(--danger)',
            marginLeft: '0.5rem'
          }}
        >
          Logout Admin
        </button>
      )}
    </div>
  );
}

```


## File: src\config\dynamicScoring.ts
```ts
export type ScoringThreshold = {
  min_percentage: number;
  status: string;
};

export type DynamicScoringConfig = {
  method: 'weighted_average_percentage';
  weights: Record<string, number>; // section_name -> weight
  max_value_per_question: number;
  status_thresholds: ScoringThreshold[];
  has_kesimpulan: boolean;
};

// Map instrumen_nama -> config
// Kita gunakan nama_instrumen sebagai key karena ID bisa berubah jika di-seed ulang
export const DYNAMIC_SCORING_REGISTRY: Record<string, DynamicScoringConfig> = {
  'Instrumen MONEV MATGEM 2026': {
    method: 'weighted_average_percentage',
    weights: {
      'Perencanaan': 0.3,
      'Pelaksanaan': 0.5,
      'Evaluasi': 0.2
      // 'Wawancara Refleksi' tidak ada di bobot, jadi tidak dihitung
    },
    max_value_per_question: 4,
    has_kesimpulan: true,
    status_thresholds: [
      { min_percentage: 85, status: 'SANGAT SESUAI' },
      { min_percentage: 70, status: 'SESUAI' },
      { min_percentage: 50, status: 'KURANG SESUAI' },
      { min_percentage: 0, status: 'TIDAK SESUAI' }
    ]
  }
};

export function calculateDynamicScore(
  config: DynamicScoringConfig,
  jawabanValues: Record<string, any>,
  sections: any[]
) {
  let totalScorePercentage = 0;
  
  const sectionScores: Record<string, {
    score: number;
    maxScore: number;
    percentage: number;
    weightedPercentage: number;
  }> = {};

  sections.forEach(section => {
    const weight = config.weights[section.nama_section];
    if (weight !== undefined) {
      let sectionScore = 0;
      let sectionMaxScore = 0;
      
      section.items.forEach((item: any) => {
        if (item.tipe_jawaban === 'likert4') {
          const ans = jawabanValues[item.id];
          if (ans && typeof ans.nilai_skor === 'number') {
            sectionScore += ans.nilai_skor;
            sectionMaxScore += config.max_value_per_question;
          }
        }
      });
      
      const percentage = sectionMaxScore > 0 ? (sectionScore / sectionMaxScore) * 100 : 0;
      const weightedPercentage = percentage * weight;
      
      sectionScores[section.nama_section] = {
        score: sectionScore,
        maxScore: sectionMaxScore,
        percentage,
        weightedPercentage
      };
      
      totalScorePercentage += weightedPercentage;
    }
  });

  // Tentukan status
  let finalStatus = config.status_thresholds[config.status_thresholds.length - 1].status;
  for (const threshold of config.status_thresholds) {
    if (totalScorePercentage >= threshold.min_percentage) {
      finalStatus = threshold.status;
      break;
    }
  }

  return {
    totalScorePercentage,
    finalStatus,
    sectionScores
  };
}

```


## File: src\config\instruments.ts
```ts
export type Jenjang = 'TK' | 'SD' | 'SMP' | 'SMA/K';
export type TipeJawaban = 'ya-tidak' | 'skala-4';

export interface InstrumenItem {
  id: string;
  pertanyaan: string;
  jenjangTarget?: Jenjang[];
}

export interface KategoriInstrumen {
  id: string;
  judul: string;
  tipeJawaban: TipeJawaban;
  items: InstrumenItem[];
}

export const INSTRUMEN_BARU: KategoriInstrumen[] = [
  {
    id: 'perencanaan',
    judul: 'A. Perencanaan Kegiatan',
    tipeJawaban: 'ya-tidak',
    items: [
      { id: 'a1', pertanyaan: 'Membentuk kepanitiaan yang dibuktikan dari SK Panitia MPLS' },
      { id: 'a2', pertanyaan: 'Panitia terdiri dari kepala sekolah, guru, tenaga kependidikan, dan unsur terkait' },
      { id: 'a3', pertanyaan: 'Sekolah menyusun program dan jadwal MPLS selama 5 hari' },
      { id: 'a4', pertanyaan: 'Program MPLS mengacu pada Permendikdasmen No.12 Tahun 2026' },
      { id: 'a5', pertanyaan: 'Materi MPLS Ramah mengacu Kepmendikdasmen No.198 Tahun 2026' },
      { id: 'a6', pertanyaan: 'Sekolah melaksanakan sosialisasi kepada orang tua sebelum MPLS' },
      { id: 'a7', pertanyaan: 'Sekolah menyiapkan narasumber dan fasilitator' },
      { id: 'a8', pertanyaan: 'Sekolah menyiapkan mekanisme pengaduan apabila terjadi pelanggaran' }
    ]
  },
  {
    id: 'pelaksanaan',
    judul: 'B. Pelaksanaan Kegiatan',
    tipeJawaban: 'skala-4',
    items: [
      { id: 'b9', pertanyaan: 'Kegiatan MPLS berjalan tertib' },
      { id: 'b10', pertanyaan: 'Peserta didik memperoleh sambutan yang ramah' },
      { id: 'b11', pertanyaan: 'Seluruh kegiatan berlangsung aman dan nyaman' },
      { id: 'b12', pertanyaan: 'Guru menjadi pendamping utama selama MPLS' },
      { id: 'b13', pertanyaan: 'Peserta aktif mengikuti kegiatan' },
      { id: 'b14', pertanyaan: 'Pembelajaran berlangsung menyenangkan' },
      { id: 'b15', pertanyaan: 'Tidak terdapat diskriminasi terhadap peserta didik' },
      { id: 'b16', pertanyaan: 'Seluruh kegiatan sesuai jadwal' },
      { id: 'b17', pertanyaan: 'Kegiatan mencerminkan budaya sekolah yang positif' },
      { id: 'b18', pertanyaan: 'Dilaksanakan refleksi kegiatan MPLS harian' },
      { id: 'b19', pertanyaan: 'Pelaksanaan MPLS selama 5 hari' },
      { id: 'b20', pertanyaan: 'Lokasi seluruh kegiatan MPLS berada di lingkungan Sekolah' },
      { id: 'b21', pertanyaan: 'Sekolah menentukan seragam dan atribut yang digunakan oleh Murid baru dalam pelaksanaan MPLS' },
      { id: 'b22', pertanyaan: 'Seragam dan atribut tidak memberatkan Murid atau orang tua/wali Murid' }
    ]
  }
];

export function getItemsForJenjang(kategori: KategoriInstrumen, jenjang: Jenjang): InstrumenItem[] {
  return kategori.items.filter(item => !item.jenjangTarget || item.jenjangTarget.includes(jenjang));
}

export interface StatusResult {
  status: 'SANGAT RAMAH' | 'CUKUP RAMAH' | 'KURANG';
  percentage: number;
  label: string;
}

function getStatusFromPercentage(percentage: number, totalSkor: number, maksimalSkor: number): StatusResult {
  if (percentage >= 90) {
    return { status: 'SANGAT RAMAH', percentage, label: `Skor ${totalSkor}/${maksimalSkor} (${percentage}%)` };
  } else if (percentage >= 70) {
    return { status: 'CUKUP RAMAH', percentage, label: `Skor ${totalSkor}/${maksimalSkor} (${percentage}%)` };
  } else {
    return { status: 'KURANG', percentage, label: `Skor ${totalSkor}/${maksimalSkor} (${percentage}%)` };
  }
}

// Menghitung status berdasarkan skor
// Ya = 4, Tidak = 0
// SS = 4, S = 3, TS = 2, STS = 1
export function calculateStatus(
  jawabanUmum: Record<string, { jawaban?: boolean | string, catatan?: string }>,
  jenjang: Jenjang
): { perencanaan: StatusResult, pelaksanaan: StatusResult, rekapitulasi: StatusResult } {
  let skorPerencanaan = 0, maxPerencanaan = 0;
  let skorPelaksanaan = 0, maxPelaksanaan = 0;

  INSTRUMEN_BARU.forEach(kategori => {
    const validItems = getItemsForJenjang(kategori, jenjang);
    validItems.forEach(item => {
      const ans = jawabanUmum[item.id]?.jawaban;
      
      let itemSkor = 0;
      let itemMax = 0;

      if (kategori.tipeJawaban === 'ya-tidak') {
        itemMax = 4;
        if (ans === true) itemSkor = 4;
      } else if (kategori.tipeJawaban === 'skala-4') {
        itemMax = 4;
        if (ans === 'SS') itemSkor = 4;
        else if (ans === 'S') itemSkor = 3;
        else if (ans === 'TS') itemSkor = 2;
        else if (ans === 'STS') itemSkor = 1;
      }

      if (kategori.id === 'perencanaan') {
        skorPerencanaan += itemSkor;
        maxPerencanaan += itemMax;
      } else if (kategori.id === 'pelaksanaan') {
        skorPelaksanaan += itemSkor;
        maxPelaksanaan += itemMax;
      }
    });
  });
  
  const pctPerencanaan = maxPerencanaan === 0 ? 0 : Math.round((skorPerencanaan / maxPerencanaan) * 100);
  const pctPelaksanaan = maxPelaksanaan === 0 ? 0 : Math.round((skorPelaksanaan / maxPelaksanaan) * 100);
  
  const skorTotal = skorPerencanaan + skorPelaksanaan;
  const maxTotal = maxPerencanaan + maxPelaksanaan;
  const pctTotal = maxTotal === 0 ? 0 : Math.round((skorTotal / maxTotal) * 100);

  return {
    perencanaan: getStatusFromPercentage(pctPerencanaan, skorPerencanaan, maxPerencanaan),
    pelaksanaan: getStatusFromPercentage(pctPelaksanaan, skorPelaksanaan, maxPelaksanaan),
    rekapitulasi: getStatusFromPercentage(pctTotal, skorTotal, maxTotal)
  };
}

```


## File: src\lib\auth.ts
```ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { Role } from './types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-bgtk-sumbar-2026'
);

export interface SessionPayload {
  id: string;
  username: string;
  nama_lengkap: string;
  role: Role;
  instansi_wilayah?: string;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

```


## File: src\lib\exportGenerator.ts
```ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonevEntryData } from './supabase';
import { INSTRUMEN_BARU } from '@/config/instruments';
import { InstrumenFull } from '@/lib/types';

export function generateExcelSummary(dataList: MonevEntryData[]) {
  const questionMap: Record<string, string> = {};
  
  INSTRUMEN_BARU.forEach(kategori => {
    kategori.items.forEach((item, idx) => {
      const qCode = `${kategori.id === 'perencanaan' ? 'A' : 'B'}${idx + 1}`;
      questionMap[item.id] = `${qCode}. ${item.pertanyaan}`;
      // Simpan qCode ke properti item khusus buat excel (karena ts tidak bisa, kita pakai trik di bawah)
    });
  });

  const rows = dataList.map((data, index) => {
    const row: any = {
      'No': index + 1,
      'Nama Sekolah': data.namaSekolah,
      'NPSN': data.npsn || '-',
      'Jenjang': data.jenjang,
      'Kabupaten/Kota': data.kabKota || '-',
      'Kepala Sekolah': data.namaKepsek,
      'Petugas Monev': data.namaPetugas,
      'Tanggal Monev': data.tanggal,
      'Status Sistem': data.statusOtomatis,
      'Status Final': data.statusFinal,
      'Catatan Kritis': data.catatanKritis || '-',
      'Rekomendasi': data.rekomendasi || '-'
    };

    INSTRUMEN_BARU.forEach(kategori => {
      kategori.items.forEach((item, idx) => {
        const qTitle = questionMap[item.id];
        const qCode = `${kategori.id === 'perencanaan' ? 'A' : 'B'}${idx + 1}`;
        const cTitle = `Catatan ${qCode}`;
        const ansObj = data.jawabanUmum?.[item.id];
        let val = '-';
        let cat = '-';
        if (ansObj) {
          if (ansObj.jawaban === true) val = 'Ya';
          else if (ansObj.jawaban === false) val = 'Tidak';
          else if (typeof ansObj.jawaban === 'string') val = ansObj.jawaban;
          
          if (ansObj.catatan) cat = ansObj.catatan;
        }
        row[qTitle] = val;
        row[cTitle] = cat;
      });
    });

    // Menambahkan data Bagian 4 (Materi Tes & Permasalahan Solusi)
    row['Materi Utama (Rincian)'] = data.materiTes?.materiUtama?.rincian || '-';
    row['Materi Utama (Waktu)'] = data.materiTes?.materiUtama?.waktu || '-';
    row['Materi Pilihan (Rincian)'] = data.materiTes?.materiPilihan?.rincian || '-';
    row['Materi Pilihan (Waktu)'] = data.materiTes?.materiPilihan?.waktu || '-';
    row['Rangkaian Tes (Rincian)'] = data.materiTes?.rangkianTes?.rincian || '-';
    row['Rangkaian Tes (Waktu)'] = data.materiTes?.rangkianTes?.waktu || '-';
    
    row['Masalah Perencanaan'] = data.permasalahanSolusi?.perencanaan?.rincian || '-';
    row['Solusi Perencanaan'] = data.permasalahanSolusi?.perencanaan?.solusi || '-';
    row['Masalah Pelaksanaan'] = data.permasalahanSolusi?.pelaksanaan?.rincian || '-';
    row['Solusi Pelaksanaan'] = data.permasalahanSolusi?.pelaksanaan?.solusi || '-';

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Monev');
  
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Rekap_Monev_MPLS_${today}.xlsx`);
}

export function generatePDFSummary(dataList: MonevEntryData[]) {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAPITULASI HASIL MONITORING DAN EVALUASI (MONEV)', 148, 15, { align: 'center' });
  doc.text('MPLS RAMAH 2026', 148, 22, { align: 'center' });
  
  const headers = [['No', 'NPSN', 'Nama Sekolah', 'Jenjang', 'Kab/Kota', 'Petugas', 'Tanggal', 'Status Final']];
  const rows = dataList.map((data, index) => [
    index + 1,
    data.npsn || '-',
    data.namaSekolah,
    data.jenjang,
    data.kabKota || '-',
    data.namaPetugas,
    data.tanggal,
    data.statusFinal
  ]);

  autoTable(doc, {
    startY: 30,
    head: headers,
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], halign: 'center' },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 20 },
      4: { cellWidth: 40 },
      5: { cellWidth: 40 },
      6: { cellWidth: 25 },
      7: { halign: 'center', fontStyle: 'bold' }
    },
  });

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Rekap_Monev_MPLS_${today}.pdf`);
}

export function generateDynamicPDFSummary(schema: InstrumenFull, pengisians: any[]) {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAPITULASI HASIL MONITORING DAN EVALUASI', 148, 15, { align: 'center' });
  doc.text(schema.nama_instrumen.toUpperCase(), 148, 22, { align: 'center' });
  
  const headers = ['No', 'Tanggal Submit'];
  
  // Ambil maksimal 5 metadata pertama agar tabel tidak keluar batas
  const metaToShow = schema.metadata_fields.slice(0, 5);
  metaToShow.forEach(m => headers.push(m.label_field));
  
  headers.push('Status');

  const rows = pengisians.map((p, index) => {
    const row: any[] = [
      index + 1,
      new Date(p.tanggal_pengisian).toLocaleDateString('id-ID')
    ];
    
    metaToShow.forEach(m => {
      row.push(p.metadata_values[m.id] || '-');
    });

    row.push(p.metadata_values['_statusFinal'] || p.metadata_values['_statusOtomatis'] || '-');
    return row;
  });

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], halign: 'center' }, // Emerald 500
    styles: { fontSize: 9, cellPadding: 2 },
  });

  const today = new Date().toISOString().split('T')[0];
  doc.save(`Rekap_${schema.nama_instrumen.replace(/[^a-zA-Z0-9]/g, '_')}_${today}.pdf`);
}

```


## File: src\lib\pdfGenerator.ts
```ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonevEntryData } from './supabase';
import { INSTRUMEN_BARU, getItemsForJenjang, Jenjang } from '@/config/instruments';

export function generatePDF(data: MonevEntryData) {
  const doc = new jsPDF();
  
  // Halaman 1: Identitas dan Kop
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTRUMEN MONITORING DAN EVALUASI (MONEV)', 105, 20, { align: 'center' });
  doc.text('MPLS RAMAH 2026', 105, 26, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Identitas Sekolah', 20, 38);
  
  const col1X = 20;
  const col2X = 55;
  
  doc.text('Nama Sekolah', col1X, 44); doc.text(`: ${data.namaSekolah}`, col2X, 44);
  doc.text('NPSN', col1X, 50); doc.text(`: ${data.npsn || '-'}`, col2X, 50);
  doc.text('Kabupaten/Kota', col1X, 56); doc.text(`: ${data.kabKota || '-'}`, col2X, 56);
  doc.text('Jenjang', col1X, 62); doc.text(`: ${data.jenjang}`, col2X, 62);
  doc.text('Tanggal', col1X, 68); doc.text(`: ${data.tanggal}`, col2X, 68);
  doc.text('Petugas Monev', col1X, 74); doc.text(`: ${data.namaPetugas}`, col2X, 74);
  doc.text('NIP Petugas', col1X, 80); doc.text(`: ${data.nipPetugas || '...........................'}`, col2X, 80);

  let currentY = 88;

  // Render semua kategori instrumen
  INSTRUMEN_BARU.forEach((kategori) => {
    const validItems = getItemsForJenjang(kategori, data.jenjang as Jenjang);
    if (validItems.length === 0) return;

    // Jika sisa ruang terlalu kecil, buat halaman baru
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246); // Warna biru ala header lama (sesuaikan jika perlu, misal hitam)
    doc.text(kategori.judul, 20, currentY);
    
    let head: string[][] = [];
    let rows: any[][] = [];
    let colStyles: any = {};

    if (kategori.tipeJawaban === 'ya-tidak') {
      head = [['No', 'Pernyataan', 'Ya', 'Tidak', 'Catatan/Keterangan']];
      colStyles = { 
        0: { cellWidth: 10 }, 
        2: { cellWidth: 15, halign: 'center' }, 
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 40 }
      };
      rows = validItems.map((item, index) => {
        const ans = data.jawabanUmum[item.id] || {};
        return [
          index + 1,
          item.pertanyaan,
          ans.jawaban === true ? 'V' : '',
          ans.jawaban === false ? 'V' : '',
          ans.catatan || ''
        ];
      });
    } else {
      head = [['No', 'Pernyataan', 'SS', 'S', 'TS', 'STS', 'Catatan/Keterangan']];
      colStyles = { 
        0: { cellWidth: 10 }, 
        2: { cellWidth: 10, halign: 'center' }, 
        3: { cellWidth: 10, halign: 'center' },
        4: { cellWidth: 10, halign: 'center' },
        5: { cellWidth: 10, halign: 'center' },
        6: { cellWidth: 35 }
      };
      rows = validItems.map((item, index) => {
        const ans = data.jawabanUmum[item.id] || {};
        return [
          index + 1,
          item.pertanyaan,
          ans.jawaban === 'SS' ? 'V' : '',
          ans.jawaban === 'S' ? 'V' : '',
          ans.jawaban === 'TS' ? 'V' : '',
          ans.jawaban === 'STS' ? 'V' : '',
          ans.catatan || ''
        ];
      });
    }

    autoTable(doc, {
      startY: currentY + 3,
      head: head,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], halign: 'center' },
      columnStyles: colStyles,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 2 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

  // Materi & Rangkaian Tes MPLS Table
  if (data.materiTes) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('MATERI & RANGKAIAN TES MPLS', 20, currentY);
    
    const materiRows = [
      ['1. Materi Utama', data.materiTes.materiUtama?.rincian || '-', data.materiTes.materiUtama?.waktu || '-'],
      ['2. Materi Pilihan', data.materiTes.materiPilihan?.rincian || '-', data.materiTes.materiPilihan?.waktu || '-'],
      ['3. Rangkaian Tes', data.materiTes.rangkianTes?.rincian || '-', data.materiTes.rangkianTes?.waktu || '-']
    ];
    
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Kategori', 'Rincian Kegiatan', 'Waktu Pelaksanaan']],
      body: materiRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      columnStyles: { 
        0: { cellWidth: 40, fontStyle: 'bold' }, 
        1: { cellWidth: 85 }, 
        2: { cellWidth: 45 }
      },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 2.5 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Permasalahan & Solusi Table
  if (data.permasalahanSolusi) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('PERMASALAHAN & SOLUSI', 20, currentY);
    
    const masalahRows = [
      ['Tahap Perencanaan', data.permasalahanSolusi.perencanaan?.rincian || '-', data.permasalahanSolusi.perencanaan?.solusi || '-'],
      ['Tahap Pelaksanaan', data.permasalahanSolusi.pelaksanaan?.rincian || '-', data.permasalahanSolusi.pelaksanaan?.solusi || '-']
    ];
    
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Tahap', 'Permasalahan / Kendala', 'Solusi Penyelesaian']],
      body: masalahRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      columnStyles: { 
        0: { cellWidth: 40, fontStyle: 'bold' }, 
        1: { cellWidth: 65 }, 
        2: { cellWidth: 65 }
      },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 2.5 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Cek ruang untuk kesimpulan
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }

  // Kesimpulan & Rekomendasi
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('KESIMPULAN', 20, currentY);
  currentY += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Tampilkan status final jika diperlukan
  doc.text(`Status Penilaian Sistem: ${data.statusOtomatis}`, 20, currentY);
  currentY += 6;

  if (data.statusFinal && data.statusFinal !== data.statusOtomatis) {
    doc.text(`Penilaian Subjektif Petugas: ${data.statusFinal}`, 20, currentY);
    currentY += 6;
    if (data.alasanOverride) {
      const splitAlasan = doc.splitTextToSize(`Alasan Perubahan: ${data.alasanOverride}`, 170);
      doc.text(splitAlasan, 20, currentY);
      currentY += (splitAlasan.length * 5) + 2;
    }
  } else if (data.alasanOverride) {
    const splitAlasan = doc.splitTextToSize(`Catatan Penilaian: ${data.alasanOverride}`, 170);
    doc.text(splitAlasan, 20, currentY);
    currentY += (splitAlasan.length * 5) + 2;
  }
  
  currentY += 2;

  const splitCatatan = doc.splitTextToSize(data.catatanKritis || '........................................................................', 170);
  doc.text(splitCatatan, 20, currentY);
  currentY += (splitCatatan.length * 5) + 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('REKOMENDASI', 20, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const splitRekomendasi = doc.splitTextToSize(data.rekomendasi || '........................................................................', 170);
  doc.text(splitRekomendasi, 20, currentY);
  
  currentY += (splitRekomendasi.length * 5) + 25;

  // Tanda Tangan
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.text('Mengetahui,', 40, currentY, { align: 'center' });
  doc.text('Kepala Sekolah', 40, currentY + 6, { align: 'center' });
  
  doc.text(`${data.namaPetugas}, ${data.tanggal}`, 160, currentY, { align: 'center' });
  doc.text('Petugas Monev', 160, currentY + 6, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(data.namaKepsek, 40, currentY + 30, { align: 'center' });
  doc.text(data.namaPetugas, 160, currentY + 30, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP: ${data.nipPetugas || '...........................'}`, 160, currentY + 36, { align: 'center' });

  // Simpan
  doc.save(`Monev_MPLS_${data.namaSekolah.replace(/\s+/g, '_')}_${data.tanggal}.pdf`);
}

```


## File: src\lib\supabase.ts
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Jika credentials kosong (belum diisi di .env.local), client tidak terbuat untuk menghindari crash saat build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : createClient('https://placeholder-url.supabase.co', 'placeholder-key');


export type MonevEntryData = {
  id?: string;
  namaSekolah: string;
  npsn: string;
  jenjang: string;
  kabKota: string;
  alamat: string;
  namaPetugas: string;
  nipPetugas?: string;
  tanggal: string; // Hari & tanggal Monev
  namaKepsek: string;
  jawabanUmum: Record<string, { jawaban?: boolean | string, catatan?: string }>;
  jawabanKhusus: Record<string, any>;
  catatanKritis: string;
  rekomendasi: string;
  statusOtomatis: string;
  statusFinal: string;
  alasanOverride: string;
  materiTes: {
    materiUtama: { rincian: string; waktu: string };
    materiPilihan: { rincian: string; waktu: string };
    rangkianTes: { rincian: string; waktu: string };
  };
  permasalahanSolusi: {
    perencanaan: { rincian: string; solusi: string };
    pelaksanaan: { rincian: string; solusi: string };
  };
  createdAt?: string;
};

```


## File: src\lib\types.ts
```ts
export type Role = 'admin' | 'petugas' | 'pimpinan';

export interface User {
  id: string;
  username: string;
  nama_lengkap: string;
  role: Role;
  instansi_wilayah?: string;
  created_at: string;
}

export interface Kegiatan {
  id: string;
  nama_kegiatan: string;
  deskripsi?: string;
  tahun: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
}

export interface Instrumen {
  id: string;
  kegiatan_id: string;
  nama_instrumen: string;
  deskripsi?: string;
  created_at: string;
}

export type TipeFieldMetadata = 'text' | 'date' | 'dropdown' | 'number';

export interface InstrumenMetadataField {
  id: string;
  instrumen_id: string;
  label_field: string;
  tipe_field: TipeFieldMetadata;
  opsi_dropdown?: string[];
  urutan: number;
  wajib_diisi: boolean;
}

export interface InstrumenSection {
  id: string;
  instrumen_id: string;
  nama_section: string;
  urutan: number;
}

export type TipeJawabanItem = 'likert4' | 'likert5' | 'esai' | 'pilihan_ganda';

export interface InstrumenItem {
  id: string;
  section_id: string;
  teks_pertanyaan: string;
  tipe_jawaban: TipeJawabanItem;
  opsi_jawaban?: string[];
  butuh_catatan_bukti: boolean;
  urutan: number;
}

export interface Pengisian {
  id: string;
  instrumen_id: string;
  petugas_id: string | null;
  tanggal_pengisian: string;
  metadata_values: Record<string, string>;
}

export interface Jawaban {
  id: string;
  pengisian_id: string;
  item_id: string;
  nilai_skor?: number;
  nilai_teks?: string;
  catatan_bukti?: string;
}

// Komposit tipe untuk Frontend
export interface InstrumenFull extends Instrumen {
  metadata_fields: InstrumenMetadataField[];
  sections: (InstrumenSection & {
    items: InstrumenItem[];
  })[];
}

```


## File: src\proxy.ts
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-bgtk-sumbar-2026'
);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isAdminPath = path.startsWith('/admin');
  const isDashboardPath = path.startsWith('/dashboard');

  if (isAdminPath || isDashboardPath) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      
      // Admin protection
      if (isAdminPath && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Dashboard protection (Admin & Pimpinan allowed)
      if (isDashboardPath) {
        if (role !== 'admin' && role !== 'pimpinan') {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

```


## File: supabase-generic-setup.sql
```sql
-- Script untuk merancang tabel-tabel Platform Monev BGTK Dinamis
-- CATATAN PENTING: TIdak ada perintah DROP atau ALTER untuk tabel 'monev_entry' (MPLS lama).

-- 1. Tabel User (Untuk Autentikasi Custom & Role Management)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'petugas', 'pimpinan')),
  instansi_wilayah TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Kegiatan (Program Monev)
CREATE TABLE IF NOT EXISTS kegiatan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_kegiatan TEXT NOT NULL,
  deskripsi TEXT,
  tahun TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Instrumen (Form Utama)
CREATE TABLE IF NOT EXISTS instrumen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kegiatan_id UUID REFERENCES kegiatan(id) ON DELETE CASCADE,
  nama_instrumen TEXT NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Metadata Field (Header dinamis seperti Nama Sekolah, Nama Petugas, Tanggal)
CREATE TABLE IF NOT EXISTS instrumen_metadata_field (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrumen_id UUID REFERENCES instrumen(id) ON DELETE CASCADE,
  label_field TEXT NOT NULL,
  tipe_field TEXT NOT NULL CHECK (tipe_field IN ('text', 'date', 'dropdown', 'number')),
  opsi_dropdown JSONB,
  urutan INTEGER NOT NULL DEFAULT 0,
  wajib_diisi BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabel Section (Pengelompokan Pertanyaan)
CREATE TABLE IF NOT EXISTS instrumen_section (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrumen_id UUID REFERENCES instrumen(id) ON DELETE CASCADE,
  nama_section TEXT NOT NULL,
  urutan INTEGER NOT NULL DEFAULT 0
);

-- 6. Tabel Item (Pertanyaan/Aspek yang dinilai)
CREATE TABLE IF NOT EXISTS instrumen_item (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES instrumen_section(id) ON DELETE CASCADE,
  teks_pertanyaan TEXT NOT NULL,
  tipe_jawaban TEXT NOT NULL CHECK (tipe_jawaban IN ('likert4', 'likert5', 'esai', 'pilihan_ganda')),
  opsi_jawaban JSONB,
  butuh_catatan_bukti BOOLEAN NOT NULL DEFAULT false,
  urutan INTEGER NOT NULL DEFAULT 0
);

-- 7. Tabel Pengisian (Header transaksi saat petugas mensubmit form)
CREATE TABLE IF NOT EXISTS pengisian (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrumen_id UUID REFERENCES instrumen(id) ON DELETE CASCADE,
  petugas_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tanggal_pengisian TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata_values JSONB NOT NULL
);

-- 8. Tabel Jawaban (Detail transaksi per item)
CREATE TABLE IF NOT EXISTS jawaban (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengisian_id UUID REFERENCES pengisian(id) ON DELETE CASCADE,
  item_id UUID REFERENCES instrumen_item(id) ON DELETE CASCADE,
  nilai_skor INTEGER,
  nilai_teks TEXT,
  catatan_bukti TEXT
);

-- 9. (Opsional) Mengaktifkan Row Level Security (RLS) jika dibutuhkan nanti.
ALTER TABLE kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen_metadata_field ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumen_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengisian ENABLE ROW LEVEL SECURITY;
ALTER TABLE jawaban ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on kegiatan" ON kegiatan FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen" ON instrumen FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen_metadata_field" ON instrumen_metadata_field FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen_section" ON instrumen_section FOR ALL USING (true);
CREATE POLICY "Allow public all on instrumen_item" ON instrumen_item FOR ALL USING (true);
CREATE POLICY "Allow public all on pengisian" ON pengisian FOR ALL USING (true);
CREATE POLICY "Allow public all on jawaban" ON jawaban FOR ALL USING (true);
CREATE POLICY "Allow public all on users" ON users FOR ALL USING (true);

```


## File: supabase-setup.sql
```sql
-- Script untuk membuat tabel di Supabase SQL Editor

-- 1. Buat Tabel MonevEntry
CREATE TABLE IF NOT EXISTS monev_entry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "namaSekolah" TEXT NOT NULL,
  jenjang TEXT NOT NULL,
  alamat TEXT NOT NULL,
  "namaPetugas" TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  "namaKepsek" TEXT NOT NULL,
  "jawabanUmum" JSONB NOT NULL,
  "jawabanKhusus" JSONB NOT NULL,
  "catatanKritis" TEXT,
  rekomendasi TEXT,
  "statusOtomatis" TEXT NOT NULL,
  "statusFinal" TEXT NOT NULL,
  "alasanOverride" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Atur Policy (Jika Row Level Security diaktifkan)
-- Karena aplikasi ini bersifat open-access (public read/write), kita set RLS ke public allow
ALTER TABLE monev_entry ENABLE ROW LEVEL SECURITY;

-- Allow insert untuk semua (anon)
CREATE POLICY "Allow public insert" ON monev_entry
  FOR INSERT WITH CHECK (true);

-- Allow select untuk semua (anon)
CREATE POLICY "Allow public select" ON monev_entry
  FOR SELECT USING (true);

```


## File: temp.tsx
```tsx

```


## File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```
