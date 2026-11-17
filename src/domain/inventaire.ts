import { memeTexte } from './texte.ts';
import type { Decouverte, IntentionDerja, Situation } from './types';

// Les imports d'exécution portent l'extension .ts : ce module est aussi lu directement par les scripts Node.

/** Un audio dont l'application a besoin, avec ce qu'il faut enregistrer. */
export interface BesoinAudio {
  id: string;
  langue: 'aeb' | 'fr';
  type: string;
  texteOuIntention: string;
}

export function inventaireAudio(situations: Situation[], intentionsInterface: IntentionDerja[], decouverte: Decouverte): BesoinAudio[] {
  const liste: BesoinAudio[] = [];
  for (const i of intentionsInterface) {
    liste.push({ id: `aeb/${i.id}`, langue: 'aeb', type: i.id.startsWith('lib-') ? 'libellé de bouton' : 'interface', texteOuIntention: i.intention });
  }
  for (const situation of situations) {
    for (const s of situation.seances) {
      liste.push({ id: `aeb/consigne-${s.id}`, langue: 'aeb', type: 'consigne de séance', texteOuIntention: s.consigneIntention });
      liste.push({ id: `aeb/bilan-${s.id}`, langue: 'aeb', type: 'bilan de séance', texteOuIntention: s.bilanIntention });
      if (s.missionIntention) liste.push({ id: `aeb/mission-${s.id}`, langue: 'aeb', type: 'mission de vie réelle', texteOuIntention: s.missionIntention });
      for (const t of s.dialogue ?? []) {
        if (t.qui === 'autre' && 'id' in t) {
          liste.push({ id: `fr/replique-${t.id}`, langue: 'fr', type: 'réplique hors niveau, vitesse naturelle', texteOuIntention: t.texte });
        }
      }
    }
    for (const it of situation.items) {
      liste.push({ id: `aeb/sens-${it.id}`, langue: 'aeb', type: 'explication du sens', texteOuIntention: it.sensIntention });
      liste.push({ id: `fr/${it.id}-entend`, langue: 'fr', type: 'phrase entendue, vitesse normale', texteOuIntention: it.entend });
      liste.push({ id: `fr/${it.id}-entend-lent`, langue: 'fr', type: 'phrase entendue, dite lentement', texteOuIntention: it.entend });
      if (!memeTexte(it.dit, it.entend)) {
        liste.push({ id: `fr/${it.id}-dit`, langue: 'fr', type: 'phrase à dire, vitesse normale', texteOuIntention: it.dit });
        liste.push({ id: `fr/${it.id}-dit-lent`, langue: 'fr', type: 'phrase à dire, dite lentement', texteOuIntention: it.dit });
      }
    }
    for (const d of situation.distracteurs) {
      liste.push({ id: `fr/mot-${d.id}`, langue: 'fr', type: "mot d'appui", texteOuIntention: d.fr });
    }
  }
  for (const a of decouverte.association) {
    liste.push({ id: `fr/mot-${a.id}`, langue: 'fr', type: "mot d'appui", texteOuIntention: a.texteFr });
  }
  const vus = new Set<string>();
  return liste.filter((b) => (vus.has(b.id) ? false : (vus.add(b.id), true)));
}
