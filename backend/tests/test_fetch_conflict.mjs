// Test: does loading chromadb break native fetch?

console.log('Test 1: fetch BEFORE loading chromadb');
try {
  const res1 = await fetch('https://example.com', { signal: AbortSignal.timeout(10000) });
  console.log('[OK] fetch works before chromadb, status:', res1.status);
} catch(e) {
  console.log('[FAIL] fetch broken before chromadb:', e.message);
}

console.log('\nLoading chromadb...');
try {
  const { ChromaClient } = require('chromadb');
  console.log('[OK] chromadb loaded');
} catch(e) {
  console.log('[FAIL] chromadb load:', e.message);
}

console.log('\nTest 2: fetch AFTER loading chromadb');
try {
  const res2 = await fetch('https://example.com', { signal: AbortSignal.timeout(10000) });
  console.log('[OK] fetch works after chromadb, status:', res2.status);
} catch(e) {
  console.log('[FAIL] fetch broken after chromadb:', e.message);
  console.log('  Error type:', e.constructor.name);
  if (e.cause) console.log('  Cause:', e.cause.message || e.cause);
}
