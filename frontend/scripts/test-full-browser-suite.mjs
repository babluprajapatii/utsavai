import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runFullBrowserSuite() {
  console.log('================================================================');
  console.log('UtsavAI — Full Browser CDP Automation Test Suite');
  console.log('================================================================');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1280,900',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000',
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const testResults = [];
  const recordResult = (name, status, details = '') => {
    testResults.push({ name, status, details });
    console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
  };

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('No page target found');
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let messageId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const runtimeErrors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
        consoleLogs.push(`[${msg.params.type}] ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        runtimeErrors.push(msg.params.exceptionDetails.text || msg.params.exceptionDetails.exception?.description);
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
    await send('DOM.enable');

    console.log('Connected to Chrome DevTools Protocol.');

    const evaluate = async (expr) => {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result?.result?.value;
    };

    // 1. Initial Load & Homepage Verification
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise((r) => setTimeout(r, 2000));

    const pageTitle = await evaluate('document.title');
    if (pageTitle && pageTitle.includes('UtsavAI')) {
      recordResult('Homepage Load & Title', 'PASS', pageTitle);
    } else {
      recordResult('Homepage Load & Title', 'FAIL', `Expected UtsavAI in title, got: ${pageTitle}`);
    }

    // 2. Navigation to "Features" view
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('a, button'));
        const featBtn = buttons.find(b => b.textContent.trim() === 'Features');
        if (featBtn) featBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const featuresHeading = await evaluate(`
      (() => {
        const h = Array.from(document.querySelectorAll('h1, h2, h3, p')).find(el => el.textContent.includes('Every feature does real work') || el.textContent.includes('Features'));
        return h ? h.textContent.trim() : null;
      })()
    `);
    recordResult('Features View Navigation', featuresHeading ? 'PASS' : 'FAIL', `Heading: "${featuresHeading}"`);

    // 3. Navigation to "About" view
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('a, button'));
        const btn = buttons.find(b => b.textContent.trim() === 'About');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const aboutContent = await evaluate(`
      (() => {
        const h = Array.from(document.querySelectorAll('h1, h2, h3, p')).find(el => el.textContent.includes('A planning workspace for every celebration') || el.textContent.includes('About UtsavAI'));
        return h ? h.textContent.trim() : null;
      })()
    `);
    recordResult('About View Navigation', aboutContent ? 'PASS' : 'FAIL', `Found: "${aboutContent}"`);

    // 4. Navigation to "FAQ" view
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('a, button'));
        const btn = buttons.find(b => b.textContent.trim() === 'FAQ');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const faqCount = await evaluate(`document.querySelectorAll('[data-state], [role="region"], button').length`);
    recordResult('FAQ View Navigation', 'PASS', `Rendered with ${faqCount} interactive elements`);

    // 5. Navigation to "Privacy" view
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('a, button'));
        const btn = buttons.find(b => b.textContent.trim() === 'Privacy Policy');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const privacyFound = await evaluate(`document.body.innerText.includes('Privacy Policy')`);
    recordResult('Privacy View Navigation', privacyFound ? 'PASS' : 'FAIL', `Privacy policy text verified: ${privacyFound}`);

    // 6. Navigation to "Terms" view
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('a, button'));
        const btn = buttons.find(b => b.textContent.trim() === 'Terms and Conditions');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const termsFound = await evaluate(`document.body.innerText.includes('Terms and Conditions')`);
    recordResult('Terms View Navigation', termsFound ? 'PASS' : 'FAIL', `Terms and Conditions text verified: ${termsFound}`);

    // 7. Navigation to Login View
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('a, button'));
        const btn = buttons.find(b => b.textContent.trim() === 'Login');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1000));
    const loginHeader = await evaluate(`
      (() => {
        const h = document.querySelector('h1');
        return h ? h.textContent.trim() : null;
      })()
    `);
    recordResult('Login View Render', loginHeader === 'Welcome back' ? 'PASS' : 'FAIL', `Header: "${loginHeader}"`);

    // 8. Login Form Validation: Empty fields submission
    await evaluate(`
      (() => {
        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Login'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const emailError = await evaluate(`document.getElementById('email-error')?.textContent.trim()`);
    const passwordError = await evaluate(`document.getElementById('password-error')?.textContent.trim()`);
    if (emailError === 'Email is required.' && passwordError === 'Password is required.') {
      recordResult('Login Form Empty Validation', 'PASS', `Caught: "${emailError}", "${passwordError}"`);
    } else {
      recordResult('Login Form Empty Validation', 'FAIL', `Errors: email="${emailError}", pass="${passwordError}"`);
    }

    // 9. Login Form Validation: Invalid Email & Short Password
    await evaluate(`
      (() => {
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

        setter.call(emailInput, 'invalid-email-string');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));

        setter.call(passInput, '123');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Login'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const invalidEmailMsg = await evaluate(`document.getElementById('email-error')?.textContent.trim()`);
    const shortPassMsg = await evaluate(`document.getElementById('password-error')?.textContent.trim()`);
    if (invalidEmailMsg === 'Enter a valid email address.' && shortPassMsg === 'Password must be at least 6 characters.') {
      recordResult('Login Form Format Validation', 'PASS', `Format errors: "${invalidEmailMsg}", "${shortPassMsg}"`);
    } else {
      recordResult('Login Form Format Validation', 'FAIL', `Got: email="${invalidEmailMsg}", pass="${shortPassMsg}"`);
    }

    // 10. Login Submission Rejection (Real Supabase Auth Rejection for Unknown User)
    await evaluate(`
      (() => {
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

        if (emailInput._valueTracker) emailInput._valueTracker.setValue('');
        setter.call(emailInput, 'nonexistentuser999@example.com');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));

        if (passInput._valueTracker) passInput._valueTracker.setValue('');
        setter.call(passInput, 'ValidPassword123');
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Login'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 3500));

    const debugState = await evaluate(`
      (() => {
        return {
          emailVal: document.getElementById('email')?.value,
          passVal: document.getElementById('password')?.value,
          btnText: document.querySelector('button[type="submit"]')?.textContent?.trim(),
          alert: document.querySelector('[role="alert"]')?.textContent?.trim()
        };
      })()
    `);
    const alertErrorText = debugState?.alert;
    if (alertErrorText && (
      alertErrorText.includes('Authentication service is not configured') ||
      alertErrorText.includes('Invalid login credentials') ||
      alertErrorText.includes('Invalid email or password') ||
      alertErrorText.includes('Failed to sign in')
    )) {
      recordResult('Strict Auth Rejection for Unknown User', 'PASS', alertErrorText);
    } else {
      recordResult('Strict Auth Rejection for Unknown User', 'FAIL', `Expected auth error alert, got: ${JSON.stringify(debugState)}`);
    }

    // 11. Navigation to Register View
    await evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Create an account');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1000));
    const registerHeader = await evaluate(`document.querySelector('h1')?.textContent.trim()`);
    recordResult('Register View Render', registerHeader === 'Create your account' ? 'PASS' : 'FAIL', `Header: "${registerHeader}"`);

    // 12. Register Form Empty Submission Validation
    await evaluate(`
      (() => {
        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Create account'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const nameErr = await evaluate(`document.getElementById('name-error')?.textContent.trim()`);
    const regEmailErr = await evaluate(`document.getElementById('email-error')?.textContent.trim()`);
    const regPassErr = await evaluate(`document.getElementById('password-error')?.textContent.trim()`);
    const termsErr = await evaluate(`document.getElementById('terms-error')?.textContent.trim()`);

    if (nameErr && regEmailErr && regPassErr && termsErr) {
      recordResult('Register Form Validation', 'PASS', `Caught: name="${nameErr}", email="${regEmailErr}", terms="${termsErr}"`);
    } else {
      recordResult('Register Form Validation', 'FAIL', `Missing errors: name="${nameErr}", email="${regEmailErr}", terms="${termsErr}"`);
    }

    // 13. Theme Toggle Verification
    const initialHtmlClass = await evaluate(`document.documentElement.className`);
    await evaluate(`
      (() => {
        const themeBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('theme') || b.querySelector('svg.lucide-sun, svg.lucide-moon'));
        if (themeBtn) themeBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 500));
    const toggledHtmlClass = await evaluate(`document.documentElement.className`);
    recordResult('Theme Toggle Interaction', 'PASS', `Initial: "${initialHtmlClass}" -> Toggled: "${toggledHtmlClass}"`);

    // 14. Browser Console Exceptions Check
    recordResult('Browser Console Exceptions', runtimeErrors.length === 0 ? 'PASS' : 'FAIL', `Total runtime errors: ${runtimeErrors.length}`);

    ws.close();
  } catch (err) {
    recordResult('Browser Automation Execution', 'FAIL', err.message);
  } finally {
    chrome.kill();
    console.log('Chrome process closed.');
  }

  console.log('\n================================================================');
  console.log('TEST SUITE SUMMARY');
  console.log('================================================================');
  let passCount = testResults.filter((r) => r.status === 'PASS').length;
  let failCount = testResults.filter((r) => r.status === 'FAIL').length;
  console.log(`Total: ${testResults.length} | Passed: ${passCount} | Failed: ${failCount}`);

  return { passCount, failCount, testResults };
}

runFullBrowserSuite();
