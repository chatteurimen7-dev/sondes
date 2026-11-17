import type { Competence, ProgressionItem, StatutItem } from './types';

/** Délai, en jours, avant la prochaine révision selon la boîte (index 1 à 5). */
export const INTERVALLES_JOURS = [0, 1, 2, 4, 8, 16] as const;

export function jourDe(date: Date): string {
  const a = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${a}-${m}-${j}`;
}

function ajouterJours(date: Date, jours: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + jours);
  return d;
}

export function nouvelItem(id: string): ProgressionItem {
  const zero = (): Record<Competence, number> => ({ ecoute: 0, sens: 0, repetition: 0, production: 0 });
  return {
    id,
    rencontres: zero(),
    reussites: zero(),
    boite: 1,
    hesitations: 0,
    dernierEchec: false,
    joursProduction: [],
    vu: false,
  };
}

/**
 * Enregistre une rencontre avec un élément. La boîte ne monte qu'une fois par jour
 * pour qu'une séance chargée ne fasse pas « installer » un élément trop vite.
 * Seuls le sens et la production font évoluer la boîte.
 */
export function enregistrer(
  avant: ProgressionItem,
  competence: Competence,
  reussi: boolean,
  maintenant: Date,
): ProgressionItem {
  const p: ProgressionItem = {
    ...avant,
    rencontres: { ...avant.rencontres },
    reussites: { ...avant.reussites },
    joursProduction: [...avant.joursProduction],
  };
  const aujourdhui = jourDe(maintenant);
  const dejaVuAujourdhui = avant.derniereRencontre ? jourDe(new Date(avant.derniereRencontre)) === aujourdhui : false;

  p.rencontres[competence] += 1;
  p.derniereRencontre = maintenant.toISOString();

  const compte = competence === 'sens' || competence === 'production';
  if (reussi) {
    p.reussites[competence] += 1;
    if (competence === 'production' && !p.joursProduction.includes(aujourdhui)) p.joursProduction.push(aujourdhui);
    if (compte) {
      p.dernierEchec = false;
      if (!dejaVuAujourdhui) p.boite = Math.min(5, p.boite + 1);
    }
  } else if (compte) {
    p.hesitations += 1;
    p.dernierEchec = true;
    p.boite = Math.max(1, p.boite - 1);
  }
  p.prochaineRevision = ajouterJours(maintenant, INTERVALLES_JOURS[p.boite]!).toISOString();
  return p;
}

export function statut(p: ProgressionItem): StatutItem {
  if (p.joursProduction.length >= 3 && p.boite >= 3 && !p.dernierEchec) return 'installe';
  if (p.dernierEchec && p.hesitations >= 2) return 'a_revoir';
  if (p.reussites.sens === 0 && p.reussites.production === 0) return 'decouverte';
  return 'en_cours';
}

/** Éléments dont la révision est due, les plus en retard d'abord. */
export function aRevoir(items: Record<string, ProgressionItem>, maintenant: Date, limite = 4): string[] {
  const dus = Object.values(items)
    .filter((p) => p.vu && p.prochaineRevision && new Date(p.prochaineRevision) <= maintenant)
    .sort((a, b) => new Date(a.prochaineRevision!).getTime() - new Date(b.prochaineRevision!).getTime());
  return dus.slice(0, limite).map((p) => p.id);
}
