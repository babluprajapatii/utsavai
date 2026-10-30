import { spawn } from 'node:child_process';
import http from 'node:http';

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server at ${url} failed to start within ${timeoutMs}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function main() {
  console.log('Starting Next.js dev server for CDP tests...');
  const server = spawn('npx', ['next', 'dev', '-H', '127.0.0.1', '-p', '3000'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3000' }
  });

  try {
    await waitForServer('http://127.0.0.1:3000');
    console.log('Next.js server is up and listening on port 3000.');

    console.log('Launching browser test suite...');
    const testProcess = spawn('node', ['scripts/test-full-browser-suite.mjs'], {
      stdio: 'inherit'
    });

    const exitCode = await new Promise((resolve) => {
      testProcess.on('exit', (code) => resolve(code));
    });

    console.log(`Browser test suite completed with exit code: ${exitCode}`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    console.log('Stopping Next.js server...');
    server.kill();
    // On Windows, kill child tree
    spawn('taskkill', ['/F', '/T', '/PID', server.pid.toString()]);
    process.exit(0);
  }
}

main();
