import { jourDe, statut } from './progress.ts';
import type { Etat, Situation, StatutItem } from './types.ts';

// Deux regards distincts, sans note ni pourcentage :
//  - le parcours : ce qu'elle rencontre, comprend et arrive à dire ;
//  - le rythme : le temps de chaque séance, la régularité, l'évolution.

/** Une séance restée ouverte longtemps ne gonfle pas le temps de pratique. */
export const PLAFOND_SECONDES = 45 * 60;
const SEMAINES = 8;
const JOUR_MS = 24 * 3600 * 1000;

function debutSemaine(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const decalage = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - decalage);
  return d;
}

export interface SemaineRythme {
  debut: string;
  seances: number;
  minutes: number;
  jours: number;
}

export type Tendance = 'plus_longues' | 'stables' | 'plus_courtes' | 'insuffisant';

export interface Rythme {
  semaines: SemaineRythme[];
  /** Les 28 derniers jours, du plus ancien au plus récent. */
  jours28: { jour: string; minutes: number }[];
  joursActifs14: number;
  joursActifs28: number;
  totalSeances: number;
  totalMinutes: number;
  dureeMoyenneMinutes: number;
  tendance: Tendance;
  plusLongueInterruption28: number;
  moments: { matin: number; apresMidi: number; soir: number };
  premiereSeance?: string;
}

export function calculerRythme(etat: Etat, maintenant: Date = new Date()): Rythme {
  const seances = [...etat.seances].sort((a, b) => a.debut.localeCompare(b.debut));
  const minutesDe = (s: { dureeSecondes: number }) => Math.min(s.dureeSecondes, PLAFOND_SECONDES) / 60;

  // Semaines (lundi à dimanche), les huit dernières.
  const lundiCourant = debutSemaine(maintenant);
  const semaines: SemaineRythme[] = Array.from({ length: SEMAINES }, (_, k) => {
    const d = new Date(lundiCourant);
    d.setDate(d.getDate() - 7 * (SEMAINES - 1 - k));
    return { debut: jourDe(d), seances: 0, minutes: 0, jours: 0 };
  });
  const joursParSemaine = semaines.map(() => new Set<string>());
  for (const s of seances) {
    const d = new Date(s.debut);
    const debut = jourDe(debutSemaine(d));
    const i = semaines.findIndex((w) => w.debut === debut);
    if (i >= 0) {
      semaines[i]!.seances += 1;
      semaines[i]!.minutes += minutesDe(s);
      joursParSemaine[i]!.add(jourDe(d));
    }
  }
  semaines.forEach((w, i) => {
    w.jours = joursParSemaine[i]!.size;
    w.minutes = Math.round(w.minutes);
  });

  // Les 28 derniers jours.
  const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const minutesParJour = new Map<string, number>();
  for (const s of seances) {
    const j = jourDe(new Date(s.debut));
    minutesParJour.set(j, (minutesParJour.get(j) ?? 0) + minutesDe(s));
  }
  const jours28 = Array.from({ length: 28 }, (_, k) => {
    const d = new Date(aujourdhui.getTime() - (27 - k) * JOUR_MS);
    const jour = jourDe(d);
    return { jour, minutes: Math.round(minutesParJour.get(jour) ?? 0) };
  });
  const actifs = (liste: { minutes: number; jour: string }[]) => liste.filter((j) => (minutesParJour.get(j.jour) ?? 0) > 0).length;
  const joursActifs28 = actifs(jours28);
  const joursActifs14 = actifs(jours28.slice(14));

  let plusLongue = 0;
  let courante = 0;
  for (const j of jours28) {
    if ((minutesParJour.get(j.jour) ?? 0) > 0) courante = 0;
    else plusLongue = Math.max(plusLongue, ++courante);
  }

  // Durée moyenne et tendance (cinq dernières séances contre les cinq précédentes).
  const durees = seances.map(minutesDe);
  const moyenne = (l: number[]) => (l.length ? l.reduce((t, x) => t + x, 0) / l.length : 0);
  let tendance: Tendance = 'insuffisant';
  if (durees.length >= 6) {
    const recentes = durees.slice(-5);
    const avant = durees.slice(Math.max(0, durees.length - 10), -5);
    const r = moyenne(recentes);
    const a = moyenne(avant);
    tendance = a === 0 ? 'insuffisant' : r > a * 1.15 ? 'plus_longues' : r < a * 0.85 ? 'plus_courtes' : 'stables';
  }

  const moments = { matin: 0, apresMidi: 0, soir: 0 };
  for (const s of seances) {
    const h = new Date(s.debut).getHours();
    if (h < 12) moments.matin += 1;
    else if (h < 18) moments.apresMidi += 1;
    else moments.soir += 1;
  }

  return {
    semaines,
    jours28,
    joursActifs14,
    joursActifs28,
    totalSeances: seances.length,
    totalMinutes: Math.round(durees.reduce((t, x) => t + x, 0)),
    dureeMoyenneMinutes: Math.round(moyenne(durees)),
    tendance,
    plusLongueInterruption28: plusLongue,
    moments,
    premiereSeance: seances[0]?.debut,
  };
}

// --- Parcours ---

export type StatutAffiche = StatutItem | 'non_vu';

export interface ElementParcours {
  id: string;
  image: string;
  texte: string;
  statut: StatutAffiche;
}

export interface SituationParcours {
  id: string;
  titre: string;
  elements: ElementParcours[];
  comptes: Record<StatutAffiche, number>;
  seancesFaites: number;
  seancesTotal: number;
  /** Temps réel passé sur les séances de cette situation (plafonné par séance). */
  minutes: number;
  univers?: string;
  mission?: string;
  dureeIndicativeMinutes?: number;
  /** Éléments dont la révision est due ou sur lesquels on revient. */
  aReviser: number;
}

export interface Parcours {
  situations: SituationParcours[];
  rencontrees: number;
  comprises: number;
  dites: number;
  installees: number;
  total: number;
  nouvellesDitesParSemaine: { debut: string; n: number }[];
  missions: { proposees: number; ressentis: { facile: number; moyen: number; difficile: number } };
  competences: { ecoute: number; sens: number; repetition: number; production: number };
}

export function calculerParcours(etat: Etat, situations: Situation[], maintenant: Date = new Date()): Parcours {
  const faites = new Set(etat.seances.map((s) => s.seanceId));
  const liste: SituationParcours[] = situations.map((sit) => {
    const elements: ElementParcours[] = sit.items.map((it) => {
      const p = etat.items[it.id];
      return { id: it.id, image: it.image, texte: it.entend, statut: p && p.vu ? statut(p) : 'non_vu' };
    });
    const comptes: Record<StatutAffiche, number> = { non_vu: 0, decouverte: 0, en_cours: 0, installe: 0, a_revoir: 0 };
    for (const e of elements) comptes[e.statut] += 1;
    return {
      id: sit.id,
      titre: sit.titreInterne,
      univers: sit.univers,
      mission: sit.mission,
      dureeIndicativeMinutes: sit.dureeIndicativeMinutes,
      aReviser: sit.items.filter((it) => {
        const p = etat.items[it.id];
        return !!p && p.vu && (statut(p) === 'a_revoir' || (!!p.prochaineRevision && new Date(p.prochaineRevision) <= maintenant));
      }).length,
      elements,
      comptes,
      seancesFaites: sit.seances.filter((s) => faites.has(s.id)).length,
      seancesTotal: sit.seances.length,
      minutes: Math.round(
        etat.seances
          .filter((f) => sit.seances.some((x) => x.id === f.seanceId))
          .reduce((t, f) => t + Math.min(f.dureeSecondes, PLAFOND_SECONDES) / 60, 0),
      ),
    };
  });

  const ids = new Set(situations.flatMap((s) => s.items.map((i) => i.id)));
  const suivis = Object.values(etat.items).filter((p) => ids.has(p.id));
  const vus = suivis.filter((p) => p.vu);

  const lundi = debutSemaine(maintenant);
  const semaines = Array.from({ length: SEMAINES }, (_, k) => {
    const d = new Date(lundi);
    d.setDate(d.getDate() - 7 * (SEMAINES - 1 - k));
    return { debut: jourDe(d), n: 0 };
  });
  for (const p of suivis) {
    const premier = [...p.joursProduction].sort()[0];
    if (!premier) continue;
    const [a, m, j] = premier.split('-').map(Number);
    const debut = jourDe(debutSemaine(new Date(a!, m! - 1, j!)));
    const w = semaines.find((x) => x.debut === debut);
    if (w) w.n += 1;
  }

  const ressentis = { facile: 0, moyen: 0, difficile: 0 };
  for (const m of etat.missions) if (m.ressenti) ressentis[m.ressenti] += 1;

  const total = situations.reduce((t, s) => t + s.items.length, 0);
  const comp = (c: 'ecoute' | 'sens' | 'repetition' | 'production') => vus.filter((p) => p.reussites[c] >= 1).length;
  return {
    situations: liste,
    rencontrees: vus.length,
    comprises: comp('sens'),
    dites: comp('production'),
    installees: vus.filter((p) => statut(p) === 'installe').length,
    total,
    nouvellesDitesParSemaine: semaines,
    missions: { proposees: etat.missions.length, ressentis },
    competences: { ecoute: comp('ecoute'), sens: comp('sens'), repetition: comp('repetition'), production: comp('production') },
  };
}
