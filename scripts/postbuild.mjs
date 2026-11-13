// Standalone output needs public/ and .next/static copied next to server.js
// (Hostinger's own Next.js build does this itself; this keeps VPS / manual
// deployments working with `node .next/standalone/server.js`).
import { cpSync, existsSync } from 'node:fs';

if (existsSync('.next/standalone')) {
  cpSync('public', '.next/standalone/public', { recursive: true });
  cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
  console.log('postbuild: copied public/ and .next/static into .next/standalone');
}
