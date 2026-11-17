import { normaliser } from './texte.ts';
import type { Issue } from './types';

export { normaliser };

export function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let precedent = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const courant = [i];
    for (let j = 1; j <= b.length; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      courant[j] = Math.min(precedent[j]! + 1, courant[j - 1]! + 1, precedent[j - 1]! + cout);
    }
    precedent = courant;
  }
  return precedent[b.length]!;
}

export function similarite(a: string, b: string): number {
  const A = normaliser(a);
  const B = normaliser(b);
  if (!A && !B) return 1;
  if (!A || !B) return 0;
  return 1 - distance(A, B) / Math.max(A.length, B.length);
}

function contientMots(transcription: string, attendu: string): boolean {
  const T = ` ${normaliser(transcription)} `;
  const A = normaliser(attendu);
  return A.length > 0 && T.includes(` ${A} `);
}

export const SEUIL_COMPRIS = 0.85;
export const SEUIL_PROCHE = 0.6;

export interface Evaluation {
  issue: Issue;
  score: number;
  /** Variante acceptée la plus proche. */
  meilleure: string;
  /** Transcription retenue (la plus proche de l'attendu). */
  transcription: string;
}

/**
 * Compare ce que le système a compris (une ou plusieurs hypothèses) à ce qui est attendu.
 * Ce n'est PAS une évaluation de la prononciation : c'est seulement la reconnaissance
 * de la phrase. Le résultat ne sert jamais à noter l'accent.
 */
export function evaluer(transcriptions: string[], acceptees: string[]): Evaluation {
  let meilleur: Evaluation = { issue: 'incertain', score: 0, meilleure: acceptees[0] ?? '', transcription: transcriptions[0] ?? '' };
  for (const t of transcriptions) {
    for (const a of acceptees) {
      const score = contientMots(t, a) ? 1 : similarite(t, a);
      if (score > meilleur.score) meilleur = { issue: 'incertain', score, meilleure: a, transcription: t };
    }
  }
  const issue: Issue = meilleur.score >= SEUIL_COMPRIS ? 'compris' : meilleur.score >= SEUIL_PROCHE ? 'proche' : 'incertain';
  return { ...meilleur, issue };
}

/** Cherche, parmi plusieurs éléments, celui que la phrase reconnue ressemble le plus. */
export function retrouverElement(
  transcriptions: string[],
  elements: { id: string; acceptees: string[] }[],
): { id: string; score: number } | undefined {
  let trouve: { id: string; score: number } | undefined;
  for (const el of elements) {
    const e = evaluer(transcriptions, el.acceptees);
    if (e.issue === 'compris' && (!trouve || e.score > trouve.score)) trouve = { id: el.id, score: e.score };
  }
  return trouve;
}
