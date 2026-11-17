import decouverteJson from '../../content/situations/saluer/decouverte.json';
import interfaceJson from '../../content/interface/interface.json';
import { inventaireAudio as construireInventaire, type BesoinAudio } from '../domain/inventaire';
import type { Decouverte, IntentionDerja, Item, Seance, Situation } from '../domain/types';

// Les contenus pédagogiques vivent dans /content, séparés du code.
// Toute situation ajoutée dans content/situations/<nom>/situation.json est chargée automatiquement.
const modules = import.meta.glob('../../content/situations/*/situation.json', { eager: true, import: 'default' });

export const situations: Situation[] = (Object.values(modules) as Situation[]).sort((a, b) => a.ordre - b.ordre);
export const parcours: Situation[] = situations.filter((s) => s.type === 'parcours');
export const atelierSons: Situation | undefined = situations.find((s) => s.type === 'sons');

export const decouverte = decouverteJson as unknown as Decouverte;
export const intentionsInterface = (interfaceJson as { derja: IntentionDerja[] }).derja;

export const tousLesItems: Item[] = situations.flatMap((s) => s.items);

export function itemGlobal(id: string): Item {
  const item = tousLesItems.find((i) => i.id === id);
  if (!item) throw new Error(`Élément inconnu : ${id}`);
  return item;
}

export function situationDeItem(id: string): Situation | undefined {
  return situations.find((s) => s.items.some((i) => i.id === id));
}

export function seanceGlobale(seanceId: string): { seance: Seance; situation: Situation } | undefined {
  for (const situation of situations) {
    const seance = situation.seances.find((s) => s.id === seanceId);
    if (seance) return { seance, situation };
  }
  return undefined;
}

export function intentionDe(id: string): string {
  return intentionsInterface.find((i) => i.id === id)?.intention ?? id;
}

export type { BesoinAudio };

export function inventaireAudio(): BesoinAudio[] {
  return construireInventaire(situations, intentionsInterface, decouverte);
}
