import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets');
const targetDir = path.join(assetsDir, 'web');

if (!existsSync(distDir)) {
  console.error('O diretório dist não foi encontrado. Execute "npm run build" antes de sincronizar os assets do Android.');
  process.exit(1);
}

if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

cpSync(distDir, targetDir, { recursive: true });

console.log(`Assets do web app copiados para ${targetDir}`);
