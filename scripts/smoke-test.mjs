#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// Smoke test — vérifie que les routes clés et fonctions répondent, avant ou
// après un déploiement. Ne remplace pas des vrais tests, mais attrape les
// régressions grossières (route cassée, fonction qui répond mal) en quelques
// secondes, sans avoir à cliquer partout à la main.
//
// Usage :
//   npm run smoke-test            → teste https://smartkids-school.ch
//   npm run smoke-test -- --local → teste http://localhost:4173 (après
//                                    `npm run build && npm run preview`)
// ─────────────────────────────────────────────────────────────────────────

const isLocal = process.argv.includes('--local');
const base = isLocal ? 'http://localhost:4173' : 'https://smartkids-school.ch';

const pages = [
  '/', '/tarifs', '/stages', '/premium', '/faq', '/cgv', '/legal',
  '/en', '/en/tarifs', '/de', '/de/stages',
  '/tarifs/inscription', '/stages/inscription', '/premium/inscription',
  '/blog', '/blog/quel-age-programmation-enfant', '/en/blog', '/de/blog/quel-age-programmation-enfant',
  '/blog/scratch-vs-python-difference', '/en/blog/scratch-vs-python-difference',
  '/blog/cours-en-ligne-vs-presentiel', '/en/blog/cours-en-ligne-vs-presentiel',
  '/blog/checklist-stage-code-vacances', '/de/blog/checklist-stage-code-vacances',
];

const functions = [
  { path: '/.netlify/functions/create-checkout-session', method: 'POST', body: '{}', expect: [400] },
  { path: '/.netlify/functions/stripe-webhook', method: 'POST', body: 'test', expect: [400] },
];

let failures = 0;

async function checkPage(path) {
  const url = base + path;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status !== 200) {
      console.error(`✗ ${path} → HTTP ${res.status} (attendu 200)`);
      failures++;
    } else {
      console.log(`✓ ${path}`);
    }
  } catch (err) {
    console.error(`✗ ${path} → erreur réseau: ${err.message}`);
    failures++;
  }
}

async function checkFunction({ path, method, body, expect }) {
  const url = base + path;
  try {
    const res = await fetch(url, { method, body, headers: { 'Content-Type': 'application/json' } });
    if (!expect.includes(res.status)) {
      console.error(`✗ ${path} → HTTP ${res.status} (attendu ${expect.join(' ou ')})`);
      failures++;
    } else {
      console.log(`✓ ${path} (répond, HTTP ${res.status} comme attendu)`);
    }
  } catch (err) {
    console.error(`✗ ${path} → erreur réseau: ${err.message}`);
    failures++;
  }
}

console.log(`Smoke test contre ${base}\n`);
console.log('── Pages ──');
for (const p of pages) await checkPage(p);

if (!isLocal) {
  // Les fonctions Netlify ne tournent pas sous `vite preview` local ;
  // on ne les teste que contre le vrai déploiement.
  console.log('\n── Fonctions ──');
  for (const f of functions) await checkFunction(f);
}

console.log(`\n${failures === 0 ? '✅ Tout est vert' : `❌ ${failures} problème(s) détecté(s)`}`);
process.exit(failures === 0 ? 0 : 1);
