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
