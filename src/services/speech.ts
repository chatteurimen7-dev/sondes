// Reconnaissance vocale du navigateur (Chrome). Elle transcrit ce qui a été dit.
// Elle n'évalue PAS la prononciation. Le micro ne s'active qu'après un appui explicite.
// Avec Chrome, le son est envoyé à un service de reconnaissance en ligne pendant l'écoute.

interface Alternative {
  transcript: string;
  confidence: number;
}
interface ResultatReco {
  [i: number]: Alternative;
  length: number;
}
interface EvenementReco {
  results: { [i: number]: ResultatReco; length: number };
}
interface Reco {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: EvenementReco) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type ConstructeurReco = new () => Reco;

function constructeur(): ConstructeurReco | undefined {
  const w = window as unknown as { SpeechRecognition?: ConstructeurReco; webkitSpeechRecognition?: ConstructeurReco };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function reconnaissanceDisponible(): boolean {
  return constructeur() !== undefined;
}

export type ErreurReconnaissance = 'refuse' | 'aucun-son' | 'reseau' | 'micro' | 'indisponible' | 'autre';

export type ResultatEcoute =
  | { ok: true; transcriptions: string[]; confiances: number[] }
  | { ok: false; erreur: ErreurReconnaissance };

export interface Ecoute {
  resultat: Promise<ResultatEcoute>;
  arreter(): void;
}

const DUREE_MAX_MS = 8000;

export function ecouterUneFois(): Ecoute {
  const C = constructeur();
  if (!C) return { resultat: Promise.resolve({ ok: false, erreur: 'indisponible' }), arreter() {} };
  const reco = new C();
  reco.lang = 'fr-FR';
  reco.continuous = false;
  reco.interimResults = false;
  reco.maxAlternatives = 3;
  let fini = false;
  const resultat = new Promise<ResultatEcoute>((resolve) => {
    const terminer = (r: ResultatEcoute) => {
      if (fini) return;
      fini = true;
      clearTimeout(minuteur);
      resolve(r);
    };
    const minuteur = setTimeout(() => {
      try {
        reco.stop();
      } catch {
        /* déjà arrêté */
      }
    }, DUREE_MAX_MS);
    reco.onresult = (e) => {
      const r = e.results[0];
      const transcriptions: string[] = [];
      const confiances: number[] = [];
      if (r) {
        for (let i = 0; i < r.length; i++) {
          transcriptions.push(r[i]!.transcript);
          confiances.push(r[i]!.confidence);
        }
      }
      terminer({ ok: true, transcriptions, confiances });
    };
    reco.onerror = (e) => {
      const map: Record<string, ErreurReconnaissance> = {
        'not-allowed': 'refuse',
        'service-not-allowed': 'refuse',
        'no-speech': 'aucun-son',
        network: 'reseau',
        'audio-capture': 'micro',
      };
      terminer({ ok: false, erreur: map[e.error] ?? 'autre' });
    };
    reco.onend = () => terminer({ ok: false, erreur: 'aucun-son' });
    try {
      reco.start();
    } catch {
      terminer({ ok: false, erreur: 'autre' });
    }
  });
  return {
    resultat,
    arreter() {
      try {
        reco.stop();
      } catch {
        /* déjà arrêté */
      }
    },
  };
}
