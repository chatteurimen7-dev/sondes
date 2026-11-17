import { enregistrer, nouvelItem } from './progress';
import type { Competence, Essai, Etat, Issue, NiveauConfiance } from './types';

export function etatInitial(maintenant: Date = new Date()): Etat {
  return {
    version: 1,
    creeLe: maintenant.toISOString(),
    profil: {
      decouverteFaite: false,
      situationsChoisies: [],
      reponsesConnait: {},
      motEcrit: 'a_la_demande',
      vitesseParDefaut: 'normale',
    },
    items: {},
    seances: [],
    essais: [],
    missions: [],
  };
}

/** Valide et met à niveau un état lu depuis le disque ou depuis une sauvegarde. */
export function migrer(brut: unknown): Etat {
  if (typeof brut !== 'object' || brut === null) throw new Error('etat-invalide');
  const o = brut as Partial<Etat>;
  if (o.version !== 1 || !o.profil || !o.items || !Array.isArray(o.seances) || !Array.isArray(o.essais)) {
    throw new Error('etat-invalide');
  }
  const base = etatInitial(new Date(o.creeLe ?? Date.now()));
  return {
    ...base,
    ...o,
    profil: { ...base.profil, ...o.profil },
    missions: Array.isArray(o.missions) ? o.missions : [],
  } as Etat;
}

export function appliquerResultat(
  etat: Etat,
  itemId: string,
  competence: Competence,
  reussi: boolean,
  maintenant: Date = new Date(),
): Etat {
  const avant = etat.items[itemId] ?? nouvelItem(itemId);
  return { ...etat, items: { ...etat.items, [itemId]: enregistrer(avant, competence, reussi, maintenant) } };
}

export function marquerVu(etat: Etat, itemId: string): Etat {
  const avant = etat.items[itemId] ?? nouvelItem(itemId);
  if (avant.vu) return etat;
  return { ...etat, items: { ...etat.items, [itemId]: { ...avant, vu: true } } };
}

export function confianceDe(score: number): NiveauConfiance {
  return score >= 0.9 ? 'sur' : score >= 0.7 ? 'assez_sur' : 'peu_sur';
}

const MAX_ESSAIS = 300;

export function ajouterEssai(etat: Etat, itemId: string, issue: Issue, transcription: string, score: number, maintenant: Date = new Date()): Etat {
  const essai: Essai = { itemId, date: maintenant.toISOString(), issue, transcription, confiance: confianceDe(score) };
  return { ...etat, essais: [...etat.essais, essai].slice(-MAX_ESSAIS) };
}
