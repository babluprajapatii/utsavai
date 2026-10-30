// Script to probe live server routes, auth protection, and public endpoints
async function probe() {
  const tests = [
    { name: 'Public Root HTML', url: 'http://localhost:3000/', expectedStatus: 200 },
    { name: 'Public API Health', url: 'http://localhost:3000/api', expectedStatus: 200 },
    { name: 'Protected API Events (Unauthorized)', url: 'http://localhost:3000/api/events', expectedStatus: 401 },
    { name: 'Protected API Dashboard (Unauthorized)', url: 'http://localhost:3000/api/dashboard', expectedStatus: 401 },
    { name: 'Protected API AI Generate Plan (Unauthorized)', url: 'http://localhost:3000/api/ai/generate-plan', method: 'POST', expectedStatus: 401 },
    { name: 'Protected API Tasks (Unauthorized)', url: 'http://localhost:3000/api/tasks/any-id', expectedStatus: 401 },
    { name: 'Protected API Vendors (Unauthorized)', url: 'http://localhost:3000/api/vendors/any-id', expectedStatus: 401 },
    { name: 'Protected API Guests (Unauthorized)', url: 'http://localhost:3000/api/guests/any-id', expectedStatus: 401 },
    { name: 'Protected API Notifications (Unauthorized)', url: 'http://localhost:3000/api/notifications', expectedStatus: 401 },
    { name: 'Auth Callback without code', url: 'http://localhost:3000/auth/callback', expectedStatus: 307, redirect: 'manual' },
    { name: 'Non-existent route 404', url: 'http://localhost:3000/random-missing-route-test', expectedStatus: 404 },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const res = await fetch(t.url, {
        method: t.method || 'GET',
        redirect: t.redirect || 'follow',
      });
      const ok = res.status === t.expectedStatus;
      if (ok) {
        passed++;
        console.log(`PASS: ${t.name} -> HTTP ${res.status}`);
      } else {
        failed++;
        console.log(`FAIL: ${t.name} -> HTTP ${res.status} (expected ${t.expectedStatus})`);
      }
    } catch (err) {
      failed++;
      console.log(`ERROR: ${t.name} -> ${err.message}`);
    }
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
}

probe();

