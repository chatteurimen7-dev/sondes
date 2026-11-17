import { describe, expect, it } from 'vitest';
import { evaluer, normaliser, retrouverElement, similarite } from '../src/domain/matching';

describe('normaliser', () => {
  it('retire accents, ponctuation et majuscules', () => {
    expect(normaliser("S'il vous plaît !")).toBe('s il vous plait');
    expect(normaliser('  Ça   va ? ')).toBe('ca va');
  });
});

describe('evaluer', () => {
  it('reconnaît une phrase exacte', () => {
    expect(evaluer(['Bonjour'], ['bonjour']).issue).toBe('compris');
  });
  it('accepte la phrase contenue dans une phrase plus longue', () => {
    expect(evaluer(['je m appelle Sondes'], ['je m appelle sondes', 'je m appelle']).issue).toBe('compris');
  });
  it('accepte une petite variation de transcription', () => {
    expect(evaluer(['bon jour'], ['bonjour']).issue).toBe('compris');
  });
  it('signale « proche » pour un mot voisin et « incertain » pour autre chose', () => {
    expect(evaluer(['bonsoir'], ['bonjour']).issue).toBe('proche');
    expect(evaluer(['voiture'], ['bonjour']).issue).toBe('incertain');
  });
  it('prend la meilleure hypothèse parmi plusieurs', () => {
    expect(evaluer(['bon soir', 'bonjour'], ['bonjour']).issue).toBe('compris');
  });
  it('ne plante pas sans transcription', () => {
    expect(evaluer([], ['bonjour']).issue).toBe('incertain');
  });
});

describe('retrouverElement', () => {
  const elements = [
    { id: 'bonjour', acceptees: ['bonjour'] },
    { id: 'merci', acceptees: ['merci'] },
  ];
  it('retrouve l’élément dit', () => {
    expect(retrouverElement(['merci'], elements)?.id).toBe('merci');
  });
  it('ne devine rien si rien ne correspond', () => {
    expect(retrouverElement(['voiture'], elements)).toBeUndefined();
  });
});

describe('similarite', () => {
  it('vaut 1 pour deux textes identiques une fois normalisés', () => {
    expect(similarite('Ça va', 'ca va')).toBe(1);
  });
});
