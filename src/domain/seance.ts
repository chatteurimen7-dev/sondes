import { memeTexte } from './texte.ts';
import type { Item, Seance, Situation, Tour } from './types';

export interface Choix {
  id: string;
  image: string;
}

export type Etape =
  | { type: 'consigne'; audio: string; intention: string }
  | { type: 'scene'; illustration: string }
  | { type: 'phrase'; itemId: string }
  | { type: 'sens'; itemId: string; choix: Choix[] }
  | { type: 'repeter'; itemId: string }
  | { type: 'repondre'; itemId: string }
  | { type: 'retour'; itemId: string }
  | { type: 'dialogue'; tours: Tour[] }
  | { type: 'mission'; seanceId: string; intention: string }
  | { type: 'fin'; seanceId: string; intention: string };

/** Générateur pseudo-aléatoire déterministe, pour des tests reproductibles. */
export function aleatoire(graine: number): () => number {
  let s = graine >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

function melanger<T>(liste: T[], rnd: () => number): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function trouverItem(sit: Situation, id: string): Item {
  const item = sit.items.find((i) => i.id === id);
  if (!item) throw new Error(`Élément inconnu : ${id}`);
  return item;
}

/** Cherche un élément dans toutes les situations (les identifiants sont uniques). */
export function chercherItem(situations: Situation[], id: string): { item: Item; situation: Situation } {
  for (const situation of situations) {
    const item = situation.items.find((i) => i.id === id);
    if (item) return { item, situation };
  }
  throw new Error(`Élément inconnu : ${id}`);
}

/** Trois images à toucher : la bonne et deux autres, prises d'abord dans la même séance. */
export function construireChoix(sit: Situation, item: Item, voisins: string[], rnd: () => number): Choix[] {
  const memeSeance = sit.items.filter((i) => voisins.includes(i.id) && i.id !== item.id && i.image !== item.image);
  const autres = sit.items.filter((i) => !voisins.includes(i.id) && i.image !== item.image);
  const pool: Choix[] = [
    ...melanger(memeSeance, rnd).map((i) => ({ id: i.id, image: i.image })),
    ...melanger(autres, rnd).map((i) => ({ id: i.id, image: i.image })),
    ...melanger(sit.distracteurs, rnd).map((d) => ({ id: d.id, image: d.image })),
  ];
  const faux = pool.slice(0, 2);
  return melanger([{ id: item.id, image: item.image }, ...faux], rnd);
}

function etapesItem(sit: Situation, item: Item, voisins: string[], rnd: () => number, avecRepeter: boolean): Etape[] {
  const etapes: Etape[] = [
    { type: 'phrase', itemId: item.id },
    { type: 'sens', itemId: item.id, choix: construireChoix(sit, item, voisins, rnd) },
  ];
  if (avecRepeter) etapes.push({ type: 'repeter', itemId: item.id });
  etapes.push({ type: 'repondre', itemId: item.id }, { type: 'retour', itemId: item.id });
  return etapes;
}

/**
 * Séance en sept temps : consigne en derja, situation illustrée, phrase française,
 * sens, répétition, réponse orale, retour rassurant.
 */
export function construireEtapes(sit: Situation, seance: Seance, graine = 1): Etape[] {
  const rnd = aleatoire(graine);
  const etapes: Etape[] = [
    { type: 'consigne', audio: `aeb/consigne-${seance.id}`, intention: seance.consigneIntention },
    { type: 'scene', illustration: seance.scene },
  ];
  for (const id of seance.items) etapes.push(...etapesItem(sit, trouverItem(sit, id), seance.items, rnd, true));
  if (seance.dialogue) etapes.push({ type: 'dialogue', tours: seance.dialogue });
  if (seance.missionIntention) etapes.push({ type: 'mission', seanceId: seance.id, intention: seance.missionIntention });
  etapes.push({ type: 'fin', seanceId: seance.id, intention: seance.bilanIntention });
  return etapes;
}

/** Séance de révision courte, sans nouvelle consigne illustrée. */
export function construireRevision(situations: Situation[], ids: string[], graine = 1): Etape[] {
  const rnd = aleatoire(graine);
  const etapes: Etape[] = [
    { type: 'consigne', audio: 'aeb/consigne-revision', intention: 'Dire qu’on va revoir ensemble quelques phrases déjà rencontrées.' },
  ];
  for (const id of ids) {
    const { item, situation } = chercherItem(situations, id);
    etapes.push(...etapesItem(situation, item, ids, rnd, false));
  }
  etapes.push({ type: 'fin', seanceId: 'revision', intention: 'Conclure la révision.' });
  return etapes;
}

/** Première séance du parcours qui n'a pas encore été faite (l'atelier des sons n'en fait pas partie). */
export function prochaineSeance(situations: Situation[], faites: { seanceId: string }[]): Seance | undefined {
  const terminees = new Set(faites.map((f) => f.seanceId));
  const ordonnees = situations
    .filter((s) => s.type === 'parcours')
    .sort((a, b) => a.ordre - b.ordre)
    .flatMap((s) => [...s.seances].sort((a, b) => a.ordre - b.ordre));
  return ordonnees.find((s) => !terminees.has(s.id));
}

// --- Identifiants des fichiers audio ---

export function audioEntend(itemId: string, lent = false): string {
  return `fr/${itemId}-entend${lent ? '-lent' : ''}`;
}

export function audioDit(item: Item, lent = false): string {
  return memeTexte(item.dit, item.entend) ? audioEntend(item.id, lent) : `fr/${item.id}-dit${lent ? '-lent' : ''}`;
}

export function audioSens(itemId: string): string {
  return `aeb/sens-${itemId}`;
}

export function audioReplique(id: string): string {
  return `fr/replique-${id}`;
}
