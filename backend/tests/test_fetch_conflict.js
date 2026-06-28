// Test: does loading chromadb break native fetch?

async function test() {
  console.log('Test 1: fetch BEFORE loading chromadb');
  try {
    const controller1 = new AbortController();
    const t1 = setTimeout(() => controller1.abort(), 10000);
    const res1 = await fetch('https://httpbin.org/get', { signal: controller1.signal });
    clearTimeout(t1);
    console.log('[OK] fetch works before chromadb, status:', res1.status);
  } catch(e) {
    console.log('[FAIL] fetch broken before chromadb:', e.message);
    if (e.cause) console.log('  Cause:', e.cause.message || e.cause);
  }

  console.log('\nLoading chromadb...');
  try {
    const { ChromaClient } = require('chromadb');
    console.log('[OK] chromadb loaded');
    // Try connecting (will fail but loads the network stack)
    try {
      const c = new ChromaClient({ path: 'http://localhost:8000' });
      await c.heartbeat();
    } catch(e) {
      console.log('[INFO] ChromaDB not available (expected):', e.message.substring(0, 80));
    }
  } catch(e) {
    console.log('[FAIL] chromadb load:', e.message);
  }

  console.log('\nTest 2: fetch AFTER loading chromadb');
  try {
    const controller2 = new AbortController();
    const t2 = setTimeout(() => controller2.abort(), 10000);
    const res2 = await fetch('https://httpbin.org/get', { signal: controller2.signal });
    clearTimeout(t2);
    console.log('[OK] fetch works after chromadb, status:', res2.status);
  } catch(e) {
    console.log('[FAIL] fetch broken after chromadb:', e.message);
    if (e.cause) console.log('  Cause:', e.cause.message || e.cause);
  }

  // Also test with https://example.com specifically
  console.log('\nTest 3: fetch https://example.com after chromadb');
  try {
    const controller3 = new AbortController();
    const t3 = setTimeout(() => controller3.abort(), 10000);
    const res3 = await fetch('https://example.com', { signal: controller3.signal });
    clearTimeout(t3);
    const body = await res3.text();
    console.log('[OK] example.com fetch works, body length:', body.length);
  } catch(e) {
    console.log('[FAIL] example.com fetch broken:', e.message);
    if (e.cause) console.log('  Cause:', e.cause.message || e.cause);
  }
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
