import { describe, expect, it } from 'vitest';
import { construireEtapes, construireRevision, prochaineSeance, audioDit, audioEntend } from '../src/domain/seance';
import { inventaireAudio } from '../src/domain/inventaire';
import { decouverte, intentionsInterface, parcours, situations } from '../src/services/content';
import type { Situation } from '../src/domain/types';

const situation = situations.find((s) => s.id === 'saluer') as Situation;

describe('contenu de la situation 1', () => {
  it('référence uniquement des éléments qui existent', () => {
    const ids = new Set(situation.items.map((i) => i.id));
    for (const s of situation.seances) {
      for (const id of s.items) expect(ids.has(id), `${s.id}:${id}`).toBe(true);
      for (const t of s.dialogue ?? []) {
        if ('itemId' in t) expect(ids.has(t.itemId)).toBe(true);
        if ('choix' in t) for (const id of t.choix) expect(ids.has(id)).toBe(true);
      }
    }
  });

  it('a des éléments avec phrase à dire acceptée par la reconnaissance', () => {
    for (const i of situation.items) {
      expect(i.acceptees.length, i.id).toBeGreaterThan(0);
      expect(i.sensIntention.length, i.id).toBeGreaterThan(10);
    }
  });

  it('contient sept séances ordonnées', () => {
    expect(situation.seances.map((s) => s.ordre)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('ne contient aucun identifiant audio en double', () => {
    const inv = inventaireAudio(situations, intentionsInterface, decouverte);
    expect(new Set(inv.map((b) => b.id)).size).toBe(inv.length);
  });
});

describe('construireEtapes', () => {
  const s1 = situation.seances[0]!;
  const etapes = construireEtapes(situation, s1, 7);

  it('suit les sept temps : consigne, scène, phrase, sens, répétition, réponse, retour', () => {
    expect(etapes.slice(0, 7).map((e) => e.type)).toEqual(['consigne', 'scene', 'phrase', 'sens', 'repeter', 'repondre', 'retour']);
    expect(etapes.at(-1)?.type).toBe('fin');
  });

  it('propose trois images dont la bonne pour chaque question de sens', () => {
    for (const e of etapes) {
      if (e.type !== 'sens') continue;
      expect(e.choix).toHaveLength(3);
      expect(e.choix.some((c) => c.id === e.itemId)).toBe(true);
      expect(new Set(e.choix.map((c) => c.image)).size).toBe(3);
    }
  });

  it('est reproductible avec la même graine', () => {
    expect(construireEtapes(situation, s1, 7)).toEqual(etapes);
  });

  it('ajoute la mission à la dernière séance et un dialogue aux séances de simulation', () => {
    const toutes = situation.seances;
    expect(construireEtapes(situation, toutes.at(-1)!).some((e) => e.type === 'mission')).toBe(true);
    expect(construireEtapes(situation, toutes.at(-1)!).some((e) => e.type === 'dialogue')).toBe(true);
    expect(construireEtapes(situation, toutes.at(-2)!).some((e) => e.type === 'dialogue')).toBe(true);
  });
});

describe('révision et enchaînement', () => {
  it('construit une révision sans répétition', () => {
    const e = construireRevision(situations, ['bonjour', 'merci']);
    expect(e.some((x) => x.type === 'repeter')).toBe(false);
    expect(e.filter((x) => x.type === 'repondre')).toHaveLength(2);
  });

  it('propose la première séance non faite', () => {
    expect(prochaineSeance(parcours, [])?.id).toBe('saluer-1');
    expect(prochaineSeance(parcours, [{ seanceId: 'saluer-1' }, { seanceId: 'saluer-2' }])?.id).toBe('saluer-3');
    const toutes = parcours.flatMap((p) => p.seances.map((s) => ({ seanceId: s.id })));
    expect(prochaineSeance(parcours, toutes)).toBeUndefined();
  });
});

describe('identifiants audio', () => {
  it('réutilise l’audio entendu quand la phrase à dire est identique', () => {
    const bonjour = situation.items.find((i) => i.id === 'bonjour')!;
    expect(audioDit(bonjour)).toBe(audioEntend('bonjour'));
    const caVa = situation.items.find((i) => i.id === 'ca-va')!;
    expect(audioDit(caVa)).toBe('fr/ca-va-dit');
  });
});
