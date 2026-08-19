import { describe, it, expect, beforeAll } from 'vitest';
import { createDownloadToken, verifyDownloadToken } from '../netlify/functions/lib/downloadToken.js';
import { computeLinkCode, codeMatches, normalizeCode } from '../netlify/functions/lib/linkCode.js';

// getSecret() dans downloadToken.js (et l'équivalent dans linkCode.js) lit
// process.env au moment de l'APPEL, pas à l'import du module — l'ordre entre
// cet import statique et beforeAll ci-dessous n'a donc pas d'importance.
beforeAll(() => {
  process.env.SHOP_DOWNLOAD_SECRET = 'test-secret-download-32-chars-min';
  process.env.LINK_CODE_SECRET = 'test-secret-linkcode-32-chars-min';
});

describe('downloadToken', () => {
  it('un jeton fraîchement créé se vérifie correctement', () => {
    const { token, expiresAt } = createDownloadToken('sess_123', 'ebook-python');
    expect(verifyDownloadToken('sess_123', 'ebook-python', expiresAt, token)).toBe(true);
  });

  it('rejette un jeton pour un autre sessionId (ne peut pas être réutilisé sur une autre commande)', () => {
    const { token, expiresAt } = createDownloadToken('sess_123', 'ebook-python');
    expect(verifyDownloadToken('sess_999', 'ebook-python', expiresAt, token)).toBe(false);
  });

  it('rejette un jeton pour un autre productKey', () => {
    const { token, expiresAt } = createDownloadToken('sess_123', 'ebook-python');
    expect(verifyDownloadToken('sess_123', 'ebook-scratch', expiresAt, token)).toBe(false);
  });

  it('rejette un jeton expiré', () => {
    const { token } = createDownloadToken('sess_123', 'ebook-python', -1000); // déjà expiré
    const pastExpiry = new Date(Date.now() - 1000);
    expect(verifyDownloadToken('sess_123', 'ebook-python', pastExpiry, token)).toBe(false);
  });

  it('rejette une date d\'expiration invalide (NaN) plutôt que de la traiter comme "jamais expiré"', () => {
    expect(verifyDownloadToken('sess_123', 'ebook-python', 'not-a-date', 'whatever-token')).toBe(false);
  });

  it('rejette un jeton vide ou absent', () => {
    const { expiresAt } = createDownloadToken('sess_123', 'ebook-python');
    expect(verifyDownloadToken('sess_123', 'ebook-python', expiresAt, '')).toBe(false);
    expect(verifyDownloadToken('sess_123', 'ebook-python', expiresAt, null)).toBe(false);
  });

  it('rejette un jeton fabriqué au hasard (pas juste un autre jeton valide)', () => {
    const { expiresAt } = createDownloadToken('sess_123', 'ebook-python');
    expect(verifyDownloadToken('sess_123', 'ebook-python', expiresAt, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')).toBe(false);
  });
});

describe('linkCode', () => {
  it('est déterministe : le même userId donne toujours le même code', () => {
    expect(computeLinkCode('user-abc')).toBe(computeLinkCode('user-abc'));
  });

  it('deux comptes différents ont des codes différents', () => {
    expect(computeLinkCode('user-abc')).not.toBe(computeLinkCode('user-xyz'));
  });

  it('a le format ABCD-1234 (4 + tiret + 4, majuscules/chiffres)', () => {
    expect(computeLinkCode('user-abc')).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('codeMatches accepte le code exact', () => {
    const code = computeLinkCode('user-abc');
    expect(codeMatches(code, code)).toBe(true);
  });

  it('codeMatches tolère l\'absence de tiret ou des espaces (saisie manuelle)', () => {
    const code = computeLinkCode('user-abc'); // ex: "ABCD-1234"
    const withoutDash = code.replace('-', '');
    const withSpace = code.replace('-', ' ');
    const lowercase = code.toLowerCase();
    expect(codeMatches(code, withoutDash)).toBe(true);
    expect(codeMatches(code, withSpace)).toBe(true);
    expect(codeMatches(code, lowercase)).toBe(true);
  });

  it('codeMatches rejette un code incorrect', () => {
    const code = computeLinkCode('user-abc');
    expect(codeMatches(code, 'ZZZZ-0000')).toBe(false);
  });

  it('codeMatches rejette deux codes vides (pas de faux positif sur chaîne vide)', () => {
    expect(codeMatches('', '')).toBe(false);
  });

  it('normalizeCode retire tout ce qui n\'est pas alphanumérique et met en majuscule', () => {
    expect(normalizeCode('abcd-1234')).toBe('ABCD1234');
    expect(normalizeCode('ABCD 1234')).toBe('ABCD1234');
    expect(normalizeCode('  abcd--1234  ')).toBe('ABCD1234');
  });
});
