import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testLogin() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000',
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let messageId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
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

    await new Promise((resolve) => { ws.onopen = resolve; });
    await send('Runtime.enable');
    await send('Page.enable');

    // 1. Navigate to login
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise((r) => setTimeout(r, 2000));

    // Click Sign in
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('a, button')).find(b => b.textContent.trim().toLowerCase() === 'sign in');
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1000));

    // 2. Submit empty form using requestSubmit()
    console.log('Submitting empty form...');
    const submitRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
            return true;
          }
          return false;
        })()
      `,
      returnByValue: true,
    });
    console.log('requestSubmit executed:', submitRes.result?.result?.value);
    await new Promise((r) => setTimeout(r, 500));

    // Check errors
    const errors = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailErr = document.getElementById('email-error')?.textContent;
          const passErr = document.getElementById('password-error')?.textContent;
          return { emailErr, passErr };
        })()
      `,
      returnByValue: true,
    });
    console.log('Validation errors on empty submit:', errors.result?.result?.value);

    // 3. Fill valid email and password and submit
    console.log('Filling form and submitting to test Supabase unconfigured alert...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.getElementById('email');
          const passInput = document.getElementById('password');
          const form = document.querySelector('form');

          // Use native value setter for React inputs
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(emailInput, 'test@example.com');
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));

          nativeInputValueSetter.call(passInput, 'Password123');
          passInput.dispatchEvent(new Event('input', { bubbles: true }));

          form.requestSubmit();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1500));

    const alert = await send('Runtime.evaluate', {
      expression: `document.querySelector('[role="alert"]')?.textContent`,
      returnByValue: true,
    });
    console.log('Alert text displayed on submit:', alert.result?.result?.value);

    // 4. Click 'Create an account'
    console.log('Clicking "Create an account"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create an account'));
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1000));

    const registerHeader = await send('Runtime.evaluate', {
      expression: `document.querySelector('h1')?.textContent`,
      returnByValue: true,
    });
    console.log('Page header after clicking "Create an account":', registerHeader.result?.result?.value);

    // 5. Submit empty registration form
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const form = document.querySelector('form');
          if (form) form.requestSubmit();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 500));

    const regErrors = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const ids = ['name-error', 'email-error', 'password-error', 'confirm-error', 'terms-error'];
          return ids.map(id => ({ id, text: document.getElementById(id)?.textContent })).filter(e => e.text);
        })()
      `,
      returnByValue: true,
    });
    console.log('Registration validation errors:', regErrors.result?.result?.value);

    ws.close();
  } finally {
    chrome.kill();
  }
}

testLogin();

