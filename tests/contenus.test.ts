import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { inventaireAudio } from '../src/domain/inventaire';
import { construireEtapes } from '../src/domain/seance';
import { decouverte, intentionsInterface, parcours, situations, tousLesItems } from '../src/services/content';

const images = new Set<string>(Object.keys((JSON.parse(readFileSync(join(__dirname, '../public/images/index.json'), 'utf-8')) as { fichiers: Record<string, string> }).fichiers));
const ids = new Set(tousLesItems.map((i) => i.id));

describe('bibliothèque de situations', () => {
  it('contient les 19 situations du parcours et l’atelier des sons', () => {
    expect(parcours).toHaveLength(19);
    expect(situations.filter((s) => s.type === 'sons')).toHaveLength(1);
  });

  it('couvre les cinq univers', () => {
    expect(new Set(parcours.map((s) => s.univers))).toEqual(new Set(['maison', 'courses', 'deplacements', 'services', 'echanges']));
  });

  it('a des identifiants d’éléments et de séances uniques', () => {
    expect(ids.size).toBe(tousLesItems.length);
    const seances = situations.flatMap((s) => s.seances.map((x) => x.id));
    expect(new Set(seances).size).toBe(seances.length);
  });

  it('range les situations dans un ordre sans doublon', () => {
    const ordres = parcours.map((s) => s.ordre);
    expect(new Set(ordres).size).toBe(ordres.length);
    expect(parcours[0]!.id).toBe('saluer');
    expect(parcours[1]!.id).toBe('pain');
  });

  for (const sit of parcours) {
    describe(sit.titreInterne, () => {
      it('suit le modèle commun : apprentissage, simulation, variante avec imprévu, mission', () => {
        const dialogues = sit.seances.filter((s) => s.dialogue);
        expect(dialogues.length).toBeGreaterThanOrEqual(2);
        expect(sit.seances.some((s) => s.items.length > 0)).toBe(true);
        expect(sit.seances.some((s) => s.missionIntention)).toBe(true);
        expect(sit.contexte && sit.objectif && sit.mission).toBeTruthy();
        expect(sit.dureeIndicativeMinutes).toBeGreaterThan(0);
      });

      it('ne cite que des éléments qui existent', () => {
        for (const s of sit.seances) {
          for (const id of s.items) expect(ids.has(id), `${s.id}:${id}`).toBe(true);
          for (const t of s.dialogue ?? []) {
            if ('itemId' in t) expect(ids.has(t.itemId), `${s.id}:${t.itemId}`).toBe(true);
            if ('choix' in t) for (const c of t.choix) expect(ids.has(c), `${s.id}:${c}`).toBe(true);
          }
        }
      });

      it('propose, avec un tour de parole de Sondes, chaque phrase de la situation', () => {
        for (const it of sit.items) {
          expect(it.acceptees.length, it.id).toBeGreaterThan(0);
          expect(it.sensIntention.length, it.id).toBeGreaterThan(10);
          expect(sit.seances.some((s) => s.items.includes(it.id)), `${it.id} jamais travaillé`).toBe(true);
        }
      });

      it('construit des séances jouables avec trois images distinctes par question de sens', () => {
        for (const s of sit.seances) {
          const etapes = construireEtapes(sit, s, 3);
          expect(etapes[0]!.type).toBe('consigne');
          expect(etapes.at(-1)!.type).toBe('fin');
          for (const e of etapes) {
            if (e.type !== 'sens') continue;
            expect(e.choix).toHaveLength(3);
            expect(new Set(e.choix.map((c) => c.image)).size, `${s.id}`).toBe(3);
          }
        }
      });
    });
  }

  it('a une illustration pour chaque image et chaque scène utilisée', () => {
    const manquantes: string[] = [];
    for (const sit of situations) {
      for (const it of sit.items) if (!images.has(it.image)) manquantes.push(it.image);
      for (const s of sit.seances) if (!images.has(s.scene)) manquantes.push(s.scene);
    }
    for (const d of decouverte.association) if (!images.has(d.image)) manquantes.push(d.image);
    expect([...new Set(manquantes)]).toEqual([]);
  });

  it('a des fichiers d’illustration réellement présents', () => {
    for (const nom of images) expect(existsSync(join(__dirname, '../public/images', `${nom}.svg`)), nom).toBe(true);
  });

  it('ne contient aucun identifiant audio en double', () => {
    const inv = inventaireAudio(situations, intentionsInterface, decouverte);
    expect(new Set(inv.map((b) => b.id)).size).toBe(inv.length);
  });

  it('atelier des sons : chaque séance oppose deux mots', () => {
    const sons = situations.find((s) => s.type === 'sons')!;
    for (const s of sons.seances) expect(s.items).toHaveLength(2);
  });
});
