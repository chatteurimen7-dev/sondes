// Lecture des voix. Les fichiers enregistrés sont toujours prioritaires.
// Brouillon : le français peut être dit par la voix du navigateur. Le derja n'est JAMAIS synthétisé.

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

export function modeBrouillon(): boolean {
  return !Object.keys(fichiers).some((k) => k.startsWith('aeb/'));
}

export interface OptionsLecture {
  texteFr?: string;
  lent?: boolean;
  intention?: string;
}

export type ResultatLecture = 'fichier' | 'synthese' | 'manquant';

let courant: HTMLAudioElement | undefined;
let finirCourant: (() => void) | undefined;
let jetonLecture = 0;

export function arreter(): void {
  jetonLecture += 1;
  courant?.pause();
  courant = undefined;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const f = finirCourant;
  finirCourant = undefined;
  f?.();
}

export function jouer(id: string, options: OptionsLecture = {}): Promise<ResultatLecture> {
  // Une nouvelle lecture remplace systématiquement l'ancienne, quel que soit son support.
  arreter();
  const jeton = jetonLecture;
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
        if (jeton === jetonLecture) finirCourant = undefined;
        resolve(r);
      };
      finirCourant = fin('manquant');
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
        if (jeton === jetonLecture) finirCourant = undefined;
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

export async function jouerSuite(elements: { id: string; options?: OptionsLecture }[]): Promise<void> {
  for (const e of elements) {
    const resultat = await jouer(e.id, e.options);
    if (resultat === 'manquant') break;
  }
}
