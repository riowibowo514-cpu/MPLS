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
