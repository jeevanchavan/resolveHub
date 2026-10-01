import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { once } from 'node:events';

const apiUrl = process.env.API_URL || 'http://127.0.0.1:3000';
const healthUrl = `${apiUrl.replace(/\/$/, '')}/api/health`;
const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(apiUrl);
let serverProcess;

async function isApiReady() {
  try {
    const response = await fetch(healthUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function startLocalServer() {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'test' },
    stdio: 'inherit',
    windowsHide: false,
  });

  serverProcess.once('error', (error) => {
    console.error(`Unable to start test server: ${error.message}`);
  });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await isApiReady()) return;
    if (serverProcess.exitCode !== null) {
      throw new Error(`Test server exited before becoming ready (code ${serverProcess.exitCode}).`);
    }
    await delay(250);
  }

  throw new Error(`Test server did not become ready at ${healthUrl}.`);
}

async function stopLocalServer() {
  if (!serverProcess || serverProcess.exitCode !== null) return;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(serverProcess.pid), '/t', '/f'], { stdio: 'ignore' });
  } else {
    serverProcess.kill('SIGTERM');
  }

  await Promise.race([once(serverProcess, 'exit'), delay(5000)]);
}

try {
  if (!(await isApiReady())) {
    if (!isLocalApi) {
      throw new Error(`API is not reachable at ${apiUrl}. Start the backend or set API_URL to a running API.`);
    }
    console.log(`API is unavailable at ${apiUrl}; starting a local test server.`);
    await startLocalServer();
  }

  const testProcess = spawn(process.execPath, ['tests/suite.test.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: process.env,
    stdio: 'inherit',
    windowsHide: false,
  });

  const [exitCode] = await once(testProcess, 'exit');
  process.exitCode = exitCode ?? 1;
} finally {
  await stopLocalServer();
}
