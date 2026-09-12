const fs = require('fs');
let code = fs.readFileSync('src/app/portal-panitia/absen/[id]/rekap/page.tsx', 'utf-8');
code = code.replace(/if \(isLoading\) return <div className=" container\/g, 'if (error) return <div style={{ padding: \4rem\, textAlign: \center\, color: \red\ }}><h2>Error</h2><p>{error}</p></div>;\n if (isLoading) return <div className=\container\');
fs.writeFileSync('src/app/portal-panitia/absen/[id]/rekap/page.tsx', code);
