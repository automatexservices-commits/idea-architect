const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const port = process.env.PORT || '5175';
console.log(`Starting dev server on port ${port} (from .env)`);

const cmdString = `npx vite dev --port ${port}`;

// Use a shell-based spawn to avoid EINVAL on Windows when resolving executables.
const child = spawn(cmdString, { stdio: 'inherit', shell: true });

child.on('exit', (code) => {
  process.exit(code);
});
