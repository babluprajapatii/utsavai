import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testBrowser() {
  console.log('Starting Chrome in headless mode with remote debugging...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000',
  ]);

  // Give Chrome 2 seconds to bind to port 9222
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await versionRes.json();
    console.log('Connected to browser:', versionData.Browser);

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    console.log(`Discovered ${pages.length} page target(s).`);

    const page = pages.find((p) => p.type === 'page');
    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('No page target with WebSocket debugger URL found');
    }

    console.log('Connecting WebSocket to page:', page.title);
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let messageId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const pageErrors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
        consoleLogs.push(`[${msg.params.type}] ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails.text || msg.params.exceptionDetails.exception?.description);
      } else if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = messageId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Navigating to http://localhost:3000...');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise((r) => setTimeout(r, 2500));

    // Evaluate title and check page elements
    const titleEval = await send('Runtime.evaluate', {
      expression: 'document.title',
      returnByValue: true,
    });
    console.log('Page Title:', titleEval.result?.result?.value);

    // Evaluate headings
    const headingsEval = await send('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll("h1, h2")).map(h => h.textContent.trim()).filter(Boolean)',
      returnByValue: true,
    });
    console.log('Headings found:', headingsEval.result?.result?.value);

    // Check for any JavaScript errors
    console.log(`Console logs recorded: ${consoleLogs.length}`);
    console.log(`Runtime exceptions: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      console.log('Page Errors:', pageErrors);
    }

    ws.close();
  } catch (err) {
    console.error('Browser automation test error:', err.message);
  } finally {
    chrome.kill();
    console.log('Chrome process stopped.');
  }
}

testBrowser();

