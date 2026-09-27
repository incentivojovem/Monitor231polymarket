import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const assetsDir = path.resolve(rootDir, 'assets');

console.log('🔄 Sincronizando arquivos estáticos para deploy direto no GitHub Pages (pasta raiz)...');

// 1. Ensure assets directory exists in root
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 2. Copy compiled assets from dist/assets to ./assets
const distAssetsDir = path.resolve(distDir, 'assets');
if (fs.existsSync(distAssetsDir)) {
  const files = fs.readdirSync(distAssetsDir);
  for (const file of files) {
    fs.copyFileSync(path.resolve(distAssetsDir, file), path.resolve(assetsDir, file));
    console.log(`  ✓ Copiado: assets/${file}`);
  }
}

// 3. Create .nojekyll at root so GitHub Pages doesn't ignore static assets
fs.writeFileSync(path.resolve(rootDir, '.nojekyll'), '', 'utf-8');
console.log('  ✓ Criado: .nojekyll');

// 4. Copy dist/index.template.html or dist/index.html to root index.html and 404.html
const sourceHtmlPath = fs.existsSync(path.resolve(distDir, 'index.template.html'))
  ? path.resolve(distDir, 'index.template.html')
  : path.resolve(distDir, 'index.html');

if (fs.existsSync(sourceHtmlPath)) {
  const distHtml = fs.readFileSync(sourceHtmlPath, 'utf-8');
  fs.writeFileSync(path.resolve(rootDir, 'index.html'), distHtml, 'utf-8');
  fs.writeFileSync(path.resolve(rootDir, '404.html'), distHtml, 'utf-8');
  console.log('  ✓ Atualizado: index.html');
  console.log('  ✓ Criado: 404.html (Fallback para recarregamento de páginas no GitHub Pages)');
}

console.log('✨ Pronto! O repositório está 100% configurado para rodar direto no GitHub Pages na pasta raiz (/), sem precisar instalar nada.');
