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
