import { describe, expect, it } from 'vitest';
import { aRevoir, enregistrer, jourDe, nouvelItem, statut } from '../src/domain/progress';

const jour = (n: number) => new Date(2026, 10, 1 + n, 10, 0, 0);

describe('progression', () => {
  it('commence en découverte', () => {
    expect(statut(nouvelItem('bonjour'))).toBe('decouverte');
  });

  it('fait monter la boîte une seule fois par jour', () => {
    let p = nouvelItem('bonjour');
    p = enregistrer(p, 'sens', true, jour(0));
    p = enregistrer(p, 'production', true, jour(0));
    expect(p.boite).toBe(2);
    p = enregistrer(p, 'production', true, jour(1));
    expect(p.boite).toBe(3);
  });

  it('ne fait pas évoluer la boîte pour l’écoute et la répétition', () => {
    let p = nouvelItem('bonjour');
    p = enregistrer(p, 'ecoute', true, jour(0));
    p = enregistrer(p, 'repetition', true, jour(0));
    expect(p.boite).toBe(1);
    expect(p.reussites.repetition).toBe(1);
  });

  it('devient installé après trois jours de réussite orale', () => {
    let p = nouvelItem('merci');
    for (let n = 0; n < 3; n++) p = enregistrer(p, 'production', true, jour(n));
    expect(p.joursProduction).toHaveLength(3);
    expect(statut(p)).toBe('installe');
  });

  it('passe à revoir après des hésitations répétées', () => {
    let p = nouvelItem('merci');
    p = enregistrer(p, 'production', true, jour(0));
    p = enregistrer(p, 'sens', false, jour(1));
    p = enregistrer(p, 'production', false, jour(2));
    expect(p.hesitations).toBe(2);
    expect(statut(p)).toBe('a_revoir');
  });

  it('planifie la révision selon la boîte', () => {
    let p = nouvelItem('merci');
    p = enregistrer(p, 'production', true, jour(0));
    expect(jourDe(new Date(p.prochaineRevision!))).toBe(jourDe(jour(2)));
  });

  it('propose en premier les révisions les plus en retard, uniquement pour les éléments vus', () => {
    const a = { ...nouvelItem('a'), vu: true, prochaineRevision: jour(0).toISOString() };
    const b = { ...nouvelItem('b'), vu: true, prochaineRevision: jour(-3).toISOString() };
    const c = { ...nouvelItem('c'), vu: false, prochaineRevision: jour(-9).toISOString() };
    const d = { ...nouvelItem('d'), vu: true, prochaineRevision: jour(10).toISOString() };
    expect(aRevoir({ a, b, c, d }, jour(1))).toEqual(['b', 'a']);
  });
});
