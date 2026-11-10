import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { relative, join } from 'node:path';
await mkdir('dist', { recursive: true });
await mkdir('dist/assets', { recursive: true });
const publicFiles = ['index.html', 'app.js', 'app.css', 'assets/sira-logo.png', 'assets/5mimu-logo.png'];
for (const name of publicFiles) await copyFile(name, `dist/${name}`);
const files = await readdir('dist', { recursive: true, withFileTypes: true });
for (const file of files.filter(entry => entry.isFile())) {
  const name = relative('dist', join(file.parentPath, file.name)).replaceAll('\\', '/');
  if (!publicFiles.includes(name)) throw Error('Unexpected public asset');
}
