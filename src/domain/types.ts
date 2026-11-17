// Types du contenu pédagogique (fichiers dans /content) et de l'état de Sondes.

export type Competence = 'ecoute' | 'sens' | 'repetition' | 'production';

export interface Item {
  id: string;
  /** Ce que Sondes entend (modèle de l'interlocuteur). */
  entend: string;
  /** Ce qu'elle doit dire en retour. Souvent identique à `entend`. */
  dit: string;
  /** Variantes normalisées acceptées pour la reconnaissance vocale. */
  acceptees: string[];
  image: string;
  /** Intention du message d'explication en derja, rédigée en français pour la locutrice. */
  sensIntention: string;
}

export interface Distracteur {
  id: string;
  fr: string;
  image: string;
}

export type Tour =
  | { qui: 'autre'; itemId: string }
  | { qui: 'autre'; id: string; texte: string }
  | { qui: 'sondes'; itemId: string }
  | { qui: 'sondes'; choix: string[] };

export interface Seance {
  id: string;
  ordre: number;
  titreInterne: string;
  scene: string;
  items: string[];
  consigneIntention: string;
  bilanIntention: string;
  missionIntention?: string;
  dialogue?: Tour[];
}

export interface Situation {
  id: string;
  /** Ordre dans le parcours. */
  ordre: number;
  /** « parcours » : étapes de vie quotidienne. « sons » : atelier des sons, hors parcours linéaire. */
  type: 'parcours' | 'sons';
  univers?: 'maison' | 'courses' | 'deplacements' | 'services' | 'echanges' | 'sons';
  titreInterne: string;
  /** Contexte, objectif et mission facultative, rédigés pour l'accompagnante. */
  contexte?: string;
  objectif?: string;
  mission?: string;
  dureeIndicativeMinutes?: number;
  items: Item[];
  distracteurs: Distracteur[];
  seances: Seance[];
}

export interface Decouverte {
  association: { id: string; texteFr: string; image: string; distracteurs: string[] }[];
  connait: { id: string; texteFr: string; image: string }[];
  situations: { id: string; image: string }[];
}

export interface IntentionDerja {
  id: string;
  intention: string;
}

// --- État de Sondes (stocké uniquement sur son PC) ---

export interface ProgressionItem {
  id: string;
  rencontres: Record<Competence, number>;
  reussites: Record<Competence, number>;
  /** Boîte de révision espacée, de 1 (nouveau) à 5 (bien installé). */
  boite: number;
  derniereRencontre?: string;
  prochaineRevision?: string;
  hesitations: number;
  dernierEchec: boolean;
  /** Jours (AAAA-MM-JJ) où elle a dit correctement la phrase. */
  joursProduction: string[];
  vu: boolean;
}

export type StatutItem = 'decouverte' | 'en_cours' | 'installe' | 'a_revoir';

export type Issue = 'compris' | 'proche' | 'incertain';
export type NiveauConfiance = 'peu_sur' | 'assez_sur' | 'sur';

export interface Essai {
  itemId: string;
  date: string;
  issue: Issue;
  /** Texte compris par le système, réservé à l'accompagnante. Jamais d'audio. */
  transcription: string;
  confiance: NiveauConfiance;
}

export interface SeanceFaite {
  seanceId: string;
  debut: string;
  dureeSecondes: number;
}

export interface Mission {
  seanceId: string;
  proposeeLe: string;
  ressenti?: 'facile' | 'moyen' | 'difficile';
}

export type ModeMotEcrit = 'a_la_demande' | 'masque' | 'toujours';

export interface Profil {
  decouverteFaite: boolean;
  situationsChoisies: string[];
  reponsesConnait: Record<string, 'oui' | 'pas_encore'>;
  motEcrit: ModeMotEcrit;
  vitesseParDefaut: 'normale' | 'lente';
  sonVerifie?: boolean;
  /** Montre à l'accompagnante ce que dirait une voix en derja qui n'est pas encore enregistrée. */
  afficherBrouillon?: boolean;
  microIndisponible?: boolean;
}

export interface Etat {
  version: 1;
  creeLe: string;
  profil: Profil;
  items: Record<string, ProgressionItem>;
  seances: SeanceFaite[];
  essais: Essai[];
  missions: Mission[];
  derniereSauvegarde?: string;
  derniereSauvegardeEchec?: boolean;
}
