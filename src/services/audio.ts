// Lecture des voix. Les fichiers enregistrés sont toujours prioritaires.
// Brouillon : le français peut être dit par la voix du navigateur. Le derja n'est JAMAIS synthétisé :
// s'il manque, on le signale seulement à l'accompagnante.

const base = import.meta.env.BASE_URL;
let fichiers: Record<string, string> = {};

export const evenements = new EventTarget();

export async function chargerIndexMedias(): Promise<void> {
  try {
    const rep = await fetch(`${base}audio/index.json`, { cache: 'no-store' });
    if (rep.ok) fichiers = ((await rep.json()) as { fichiers?: Record<string, string> }).fichiers ?? {};
  } catch {
    fichiers = {};
  }
}

export function aAudio(id: string): boolean {
  return id in fichiers;
}

/** Vrai tant qu'aucune voix derja n'a été enregistrée : l'application est alors en mode brouillon. */
export function modeBrouillon(): boolean {
  return !Object.keys(fichiers).some((k) => k.startsWith('aeb/'));
}

export interface OptionsLecture {
  /** Texte français pour la voix de secours (brouillon). */
  texteFr?: string;
  lent?: boolean;
  /** Intention en français, affichée à l'accompagnante si la voix derja manque. */
  intention?: string;
}

export type ResultatLecture = 'fichier' | 'synthese' | 'manquant';

let courant: HTMLAudioElement | undefined;
let finirCourant: (() => void) | undefined;
let generationLecture = 0;

export function arreter(): void {
  generationLecture += 1;
  courant?.pause();
  courant = undefined;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const f = finirCourant;
  finirCourant = undefined;
  f?.();
}

export function jouer(id: string, options: OptionsLecture = {}): Promise<ResultatLecture> {
  // Une nouvelle lecture interrompt proprement toute lecture précédente.
  arreter();
  const generation = generationLecture;
  const chemin = fichiers[id];
  if (chemin) {
    return new Promise((resolve) => {
      const a = new Audio(`${base}${chemin}`);
      courant = a;
      let termine = false;
      const fin = (r: ResultatLecture) => () => {
        if (termine) return;
        termine = true;
        if (courant === a) courant = undefined;
        if (generation === generationLecture) finirCourant = undefined;
        resolve(r);
      };
      finirCourant = fin('fichier');
      a.onended = fin('fichier');
      a.onerror = fin('manquant');
      a.play().catch(fin('manquant'));
    });
  }
  if (id.startsWith('fr/') && options.texteFr && 'speechSynthesis' in window) {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(options.texteFr);
      u.lang = 'fr-FR';
      u.rate = options.lent ? 0.6 : 0.95;
      let termine = false;
      const fin = () => {
        if (termine) return;
        termine = true;
        if (generation === generationLecture) finirCourant = undefined;
        resolve('synthese');
      };
      finirCourant = fin;
      u.onend = fin;
      u.onerror = fin;
      window.speechSynthesis.speak(u);
    });
  }
  evenements.dispatchEvent(new CustomEvent('manquant', { detail: { id, intention: options.intention ?? id } }));
  return Promise.resolve('manquant');
}

/** Joue plusieurs voix l'une après l'autre. S'arrête si la lecture est interrompue. */
export async function jouerSuite(elements: { id: string; options?: OptionsLecture }[]): Promise<void> {
  for (const e of elements) {
    await jouer(e.id, e.options);
  }
}
