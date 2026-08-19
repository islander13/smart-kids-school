import { describe, it, expect } from 'vitest';
import { PRODUCTS, sourceFromProductKey } from '../netlify/functions/lib/checkoutCatalog.js';

// Le catalogue de prix est la SOURCE DE VÉRITÉ du checkout (Stripe ne les
// calcule pas, on les force) — une régression ici change silencieusement ce
// qu'un client paie réellement. Voir aussi src/pages/tarifs.tsx (Offer JSON-LD)
// qui doit rester cohérent avec ces mêmes montants, à la main.

describe('checkoutCatalog: PRODUCTS', () => {
  const expectedKeys = [
    'solo-m3', 'solo-m6', 'solo-m12',
    'solo-m3-once', 'solo-m6-once', 'solo-m12-once',
    'duo-m3', 'duo-m6', 'duo-m12',
    'duo-m3-once', 'duo-m6-once', 'duo-m12-once',
    'premium-monthly', 'premium-yearly',
    'stage-1child', 'stage-2children',
  ];

  it('contient toutes les clés produit attendues', () => {
    for (const key of expectedKeys) {
      expect(PRODUCTS[key], `PRODUCTS["${key}"] manquant`).toBeDefined();
    }
  });

  it('chaque produit a un prix positif et un nom non vide', () => {
    for (const [key, product] of Object.entries(PRODUCTS)) {
      expect(product.price, `${key}.price`).toBeGreaterThan(0);
      expect(typeof product.name, `${key}.name`).toBe('string');
      expect(product.name.length, `${key}.name non vide`).toBeGreaterThan(0);
      expect(typeof product.recurring, `${key}.recurring`).toBe('boolean');
    }
  });

  it('seuls les abonnements mensuels sont "recurring" (jamais les "-once")', () => {
    for (const [key, product] of Object.entries(PRODUCTS)) {
      if (key.endsWith('-once')) {
        expect(product.recurring, `${key} ne doit pas être récurrent`).toBe(false);
      }
    }
  });

  it('les prix "paiement unique" restent inférieurs à 3× le tarif mensuel équivalent (garde-fou anti-faute de frappe)', () => {
    // Solo-m3 mensuel 299/mois × 3 mois = 897 → le "once" à 799 doit être en-dessous.
    expect(PRODUCTS['solo-m3-once'].price).toBeLessThan(PRODUCTS['solo-m3'].price * 3);
    expect(PRODUCTS['duo-m3-once'].price).toBeLessThan(PRODUCTS['duo-m3'].price * 3);
  });

  it('duo est toujours plus cher que solo à engagement égal (tarif famille, pas un rabais absurde)', () => {
    expect(PRODUCTS['duo-m3'].price).toBeGreaterThan(PRODUCTS['solo-m3'].price);
    expect(PRODUCTS['duo-m6'].price).toBeGreaterThan(PRODUCTS['solo-m6'].price);
    expect(PRODUCTS['duo-m12'].price).toBeGreaterThan(PRODUCTS['solo-m12'].price);
  });

  it('le prix mensuel baisse (ou reste égal) avec un engagement plus long', () => {
    expect(PRODUCTS['solo-m6'].price).toBeLessThanOrEqual(PRODUCTS['solo-m3'].price);
    expect(PRODUCTS['solo-m12'].price).toBeLessThanOrEqual(PRODUCTS['solo-m6'].price);
  });
});

describe('checkoutCatalog: sourceFromProductKey', () => {
  it('reconnaît les stages', () => {
    expect(sourceFromProductKey('stage-1child')).toBe('stages');
    expect(sourceFromProductKey('stage-2children')).toBe('stages');
  });

  it('reconnaît premium', () => {
    expect(sourceFromProductKey('premium-monthly')).toBe('premium');
    expect(sourceFromProductKey('premium-yearly')).toBe('premium');
  });

  it('retombe sur "tarifs" pour solo/duo', () => {
    expect(sourceFromProductKey('solo-m3')).toBe('tarifs');
    expect(sourceFromProductKey('duo-m12-once')).toBe('tarifs');
  });

  it('chaque clé du catalogue a une source cohérente avec son préfixe', () => {
    for (const key of Object.keys(PRODUCTS)) {
      const source = sourceFromProductKey(key);
      if (key.startsWith('stage-')) expect(source).toBe('stages');
      else if (key.startsWith('premium-')) expect(source).toBe('premium');
      else expect(source).toBe('tarifs');
    }
  });
});
