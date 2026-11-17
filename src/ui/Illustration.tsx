import { useEffect, useState } from 'react';
import { TRACES, type NomPicto } from './pictos';

// Une illustration = un fichier dans public/images si présent, sinon une composition de pictogrammes.

interface Element {
  n: NomPicto;
  x: number;
  y: number;
  s: number;
}
interface Composition {
  fond: string;
  couleur: string;
  elements: Element[];
}

const MATIN = '#fdecc8';
const SOIR = '#d6dcef';
const NEUTRE = '#e6efe9';
const CHAUD = '#f6dfd2';

const COMPOSITIONS: Record<string, Composition> = {
  'salut-matin': { fond: MATIN, couleur: '#8a5a12', elements: [{ n: 'soleil', x: 18, y: 8, s: 34 }, { n: 'main', x: 32, y: 28, s: 56 }] },
  'salut-soir': { fond: SOIR, couleur: '#2e3a6b', elements: [{ n: 'lune', x: 18, y: 8, s: 34 }, { n: 'main', x: 32, y: 28, s: 56 }] },
  'au-revoir': { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'porte', x: 8, y: 14, s: 52 }, { n: 'main', x: 46, y: 28, s: 48 }] },
  merci: { fond: CHAUD, couleur: '#9b3d1c', elements: [{ n: 'coeur', x: 14, y: 22, s: 44 }, { n: 'main', x: 46, y: 30, s: 48 }] },
  's-il-vous-plait': { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'main', x: 14, y: 26, s: 50 }, { n: 'bulle', x: 50, y: 20, s: 40 }] },
  'je-m-appelle': { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'personne', x: 12, y: 22, s: 50 }, { n: 'bulle', x: 52, y: 14, s: 40 }] },
  'nom-question': { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'personne', x: 12, y: 22, s: 50 }, { n: 'interro', x: 54, y: 20, s: 40 }] },
  enchantee: { fond: CHAUD, couleur: '#9b3d1c', elements: [{ n: 'personne', x: 4, y: 24, s: 42 }, { n: 'personne', x: 54, y: 24, s: 42 }, { n: 'coeur', x: 37, y: 6, s: 26 }] },
  'ca-va': { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'personne', x: 10, y: 24, s: 46 }, { n: 'bulle', x: 54, y: 10, s: 38 }, { n: 'interro', x: 58, y: 54, s: 26 }] },
  tunisie: { fond: CHAUD, couleur: '#9b3d1c', elements: [{ n: 'epingle', x: 8, y: 14, s: 52 }, { n: 'personne', x: 52, y: 26, s: 44 }] },
  incomprehension: { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'personne', x: 12, y: 24, s: 48 }, { n: 'interro', x: 54, y: 16, s: 44 }] },
  repeter: { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'repeter', x: 8, y: 20, s: 50 }, { n: 'hautparleur', x: 50, y: 24, s: 44 }] },
  lentement: { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'sablier', x: 8, y: 16, s: 50 }, { n: 'hautparleur', x: 50, y: 24, s: 44 }] },
  pain: { fond: MATIN, couleur: '#8a5a12', elements: [{ n: 'pain', x: 20, y: 20, s: 60 }] },
  voiture: { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'voiture', x: 18, y: 20, s: 64 }] },
  bus: { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'bus', x: 18, y: 20, s: 64 }] },
  pharmacie: { fond: '#dff0e4', couleur: '#1f6b3a', elements: [{ n: 'croix', x: 20, y: 18, s: 62 }] },
  medecin: { fond: '#dff0e4', couleur: '#1f6b3a', elements: [{ n: 'croix', x: 6, y: 20, s: 46 }, { n: 'personne', x: 50, y: 24, s: 44 }] },
  'rue-matin': { fond: MATIN, couleur: '#8a5a12', elements: [{ n: 'soleil', x: 6, y: 6, s: 30 }, { n: 'maison', x: 6, y: 36, s: 46 }, { n: 'personne', x: 54, y: 30, s: 38 }, { n: 'personne', x: 74, y: 30, s: 38 }] },
  'palier-voisine': { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'porte', x: 4, y: 14, s: 46 }, { n: 'personne', x: 46, y: 26, s: 42 }, { n: 'personne', x: 72, y: 26, s: 42 }] },
};

let indexImages: Promise<Record<string, string>> | undefined;

/** La liste des fichiers d'illustration est lue une seule fois pour toute l'application. */
function chargerIndexImages(): Promise<Record<string, string>> {
  indexImages ??= fetch(`${import.meta.env.BASE_URL}images/index.json`, { cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<{ fichiers?: Record<string, string> }>) : { fichiers: {} }))
    .then((j) => j.fichiers ?? {})
    .catch(() => ({}));
  return indexImages;
}

export function Illustration({ id, taille = 280, classe = '' }: { id: string; taille?: number; classe?: string }) {
  const [fichier, setFichier] = useState<string | undefined>();
  useEffect(() => {
    let annule = false;
    void chargerIndexImages().then((fichiers) => {
      if (!annule) setFichier(fichiers[id]);
    });
    return () => {
      annule = true;
    };
  }, [id]);

  if (fichier) {
    return <img className={`illustration ${classe}`} src={`${import.meta.env.BASE_URL}${fichier}`} alt="" width={taille} height={taille} />;
  }
  const comp = COMPOSITIONS[id] ?? { fond: NEUTRE, couleur: '#1f5f5b', elements: [{ n: 'bulle' as NomPicto, x: 20, y: 20, s: 60 }] };
  return (
    <svg className={`illustration ${classe}`} viewBox="0 0 100 100" width={taille} height={taille} aria-hidden="true" focusable="false">
      <rect width="100" height="100" rx="8" fill={comp.fond} />
      {comp.elements.map((e, i) => (
        <g
          key={i}
          transform={`translate(${e.x} ${e.y}) scale(${e.s / 100})`}
          stroke={comp.couleur}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {TRACES[e.n]}
        </g>
      ))}
    </svg>
  );
}
