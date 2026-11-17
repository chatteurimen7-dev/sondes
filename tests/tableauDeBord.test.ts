import { describe, expect, it } from 'vitest';
import { appliquerResultat, etatInitial } from '../src/domain/etat';
import { calculerParcours, calculerRythme } from '../src/domain/tableauDeBord';
import type { Etat, SeanceFaite, Situation } from '../src/domain/types';
import { parcours } from '../src/services/content';

// Mercredi 18 novembre 2026, midi.
const maintenant = new Date(2026, 10, 18, 12, 0, 0);
const jour = (n: number, h = 10) => new Date(2026, 10, 18 + n, h, 0, 0);
const seance = (n: number, minutes: number, id = 'saluer-1', h = 10): SeanceFaite => ({ seanceId: id, debut: jour(n, h).toISOString(), dureeSecondes: minutes * 60 });

function avec(seances: SeanceFaite[]): Etat {
  return { ...etatInitial(jour(-30)), seances };
}

describe('rythme', () => {
  it('compte séances, jours actifs et durée moyenne', () => {
    const r = calculerRythme(avec([seance(0, 10), seance(-1, 20), seance(-3, 12)]), maintenant);
    expect(r.totalSeances).toBe(3);
    expect(r.joursActifs28).toBe(3);
    expect(r.joursActifs14).toBe(3);
    expect(r.totalMinutes).toBe(42);
    expect(r.dureeMoyenneMinutes).toBe(14);
  });

  it('plafonne une séance restée ouverte', () => {
    const r = calculerRythme(avec([seance(0, 600)]), maintenant);
    expect(r.totalMinutes).toBe(45);
  });

  it('range les séances par semaine, du lundi au dimanche', () => {
    // 16/11 est un lundi : les séances des 16, 17 et 18 sont dans la même semaine, celle du 15 dans la précédente.
    const r = calculerRythme(avec([seance(-2, 10), seance(-1, 10), seance(0, 10), seance(-3, 10)]), maintenant);
    const derniere = r.semaines.at(-1)!;
    expect(derniere.debut).toBe('2026-11-16');
    expect(derniere.seances).toBe(3);
    expect(derniere.jours).toBe(3);
    expect(r.semaines.at(-2)!.seances).toBe(1);
    expect(r.semaines).toHaveLength(8);
  });

  it('parle d’évolution seulement à partir de six séances', () => {
    expect(calculerRythme(avec([seance(0, 10)]), maintenant).tendance).toBe('insuffisant');
    const courtes = [10, 10, 10, 10, 10].map((m, k) => seance(-12 + k, m));
    const longues = [20, 20, 20, 20, 20].map((m, k) => seance(-6 + k, m));
    expect(calculerRythme(avec([...courtes, ...longues]), maintenant).tendance).toBe('plus_longues');
    // Mêmes durées, mais les séances longues viennent en premier.
    const longuesAvant = [20, 20, 20, 20, 20].map((m, k) => seance(-12 + k, m));
    const courtesApres = [10, 10, 10, 10, 10].map((m, k) => seance(-6 + k, m));
    expect(calculerRythme(avec([...longuesAvant, ...courtesApres]), maintenant).tendance).toBe('plus_courtes');
    const stables = [10, 11, 10, 11, 10, 11].map((m, k) => seance(-12 + k, m));
    expect(calculerRythme(avec(stables), maintenant).tendance).toBe('stables');
  });

  it('mesure la plus longue pause sur 28 jours', () => {
    const r = calculerRythme(avec([seance(-20, 10), seance(-12, 10), seance(0, 10)]), maintenant);
    expect(r.plusLongueInterruption28).toBe(11); // du 7 au 17 inclus
  });

  it('répartit les séances dans la journée', () => {
    const r = calculerRythme(avec([seance(0, 5, 'saluer-1', 8), seance(-1, 5, 'saluer-1', 15), seance(-2, 5, 'saluer-1', 20)]), maintenant);
    expect(r.moments).toEqual({ matin: 1, apresMidi: 1, soir: 1 });
  });

  it('ne plante pas sans séance', () => {
    const r = calculerRythme(avec([]), maintenant);
    expect(r.totalSeances).toBe(0);
    expect(r.dureeMoyenneMinutes).toBe(0);
    expect(r.premiereSeance).toBeUndefined();
  });
});

describe('parcours', () => {
  const petit: Situation[] = [
    {
      id: 'x',
      ordre: 1,
      type: 'parcours',
      titreInterne: 'Test',
      items: [
        { id: 'a', entend: 'A', dit: 'A', acceptees: ['a'], image: 'pain', sensIntention: '' },
        { id: 'b', entend: 'B', dit: 'B', acceptees: ['b'], image: 'pain', sensIntention: '' },
        { id: 'c', entend: 'C', dit: 'C', acceptees: ['c'], image: 'pain', sensIntention: '' },
      ],
      distracteurs: [],
      seances: [{ id: 'x-1', ordre: 1, titreInterne: 'S', scene: 'pain', items: ['a', 'b', 'c'], consigneIntention: '', bilanIntention: '' }],
    },
  ];

  it('distingue éléments rencontrés, compris et dits', () => {
    let e = etatInitial(jour(-5));
    e = { ...e, items: { a: { ...appliquerResultat(e, 'a', 'sens', true, jour(-1)).items.a!, vu: true }, b: { ...appliquerResultat(e, 'b', 'production', true, jour(-1)).items.b!, vu: true } } };
    const p = calculerParcours(e, petit, maintenant);
    expect(p.total).toBe(3);
    expect(p.rencontrees).toBe(2);
    expect(p.comprises).toBe(1);
    expect(p.dites).toBe(1);
    expect(p.situations[0]!.comptes.non_vu).toBe(1);
  });

  it('place la première réussite orale dans la bonne semaine', () => {
    let e = etatInitial(jour(-30));
    const avecA = appliquerResultat(e, 'a', 'production', true, jour(-9));
    e = { ...e, items: { a: { ...avecA.items.a!, vu: true } } };
    const p = calculerParcours(e, petit, maintenant);
    const semaine = p.nouvellesDitesParSemaine.find((w) => w.n > 0)!;
    expect(semaine.debut).toBe('2026-11-09');
  });

  it('additionne le temps passé par situation', () => {
    const e = { ...etatInitial(jour(-30)), seances: [seance(-1, 10, 'x-1'), seance(0, 12, 'x-1'), seance(0, 30, 'autre')] };
    expect(calculerParcours(e, petit, maintenant).situations[0]!.minutes).toBe(22);
  });

  it('couvre les situations du contenu réel sans erreur', () => {
    const p = calculerParcours(etatInitial(), parcours, maintenant);
    expect(p.situations.length).toBe(parcours.length);
    expect(p.rencontrees).toBe(0);
  });
});
