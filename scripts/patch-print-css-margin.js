const fs = require('fs');

const globalsCssPath = 'src/app/globals.css';
let css = fs.readFileSync(globalsCssPath, 'utf8');

css = css.replace(/@page\s*\{\s*size:\s*auto;\s*margin:\s*0mm;\s*\}/g, '@page {\n    size: auto;\n    margin: 1.5cm;\n  }');
css = css.replace(/body\s*\{\s*margin:\s*1\.5cm;\s*\}/g, 'body {\n    margin: 0;\n  }');

fs.writeFileSync(globalsCssPath, css, 'utf8');
console.log('globals.css patched for proper page margins');
