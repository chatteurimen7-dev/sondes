import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { appliquerResultat, etatInitial, migrer } from '../src/domain/etat';
import {
  creerSauvegarde,
  ecrireCopieSecurite,
  ecrireSauvegarde,
  lireSauvegarde,
  lireSauvegardeDuDossier,
  listerSauvegardes,
  nomFichier,
  PREFIXE_SECURITE,
  type DossierLike,
} from '../src/services/backup';
import { chargerEtat, ecrire, sauverEtat, toutEffacer } from '../src/services/storage';

function faussDossier(): DossierLike & { fichiers: Map<string, string> } {
  const fichiers = new Map<string, string>();
  return {
    fichiers,
    async getFileHandle(nom, options) {
      if (!fichiers.has(nom)) {
        if (!options?.create) throw new Error('absent');
        fichiers.set(nom, '');
      }
      return {
        async createWritable() {
          let contenu = '';
          return {
            async write(d: string) {
              contenu = d;
            },
            async close() {
              fichiers.set(nom, contenu);
            },
          };
        },
        async getFile() {
          return { text: async () => fichiers.get(nom) ?? '' };
        },
      };
    },
    async removeEntry(nom) {
      fichiers.delete(nom);
    },
    values() {
      const noms = [...fichiers.keys()];
      return (async function* () {
        for (const name of noms) yield { kind: 'file', name };
      })();
    },
  };
}

const date = (n: number) => new Date(2026, 10, 1, 8, 0, n);

describe('sauvegarde dans un dossier', () => {
  it('écrit un fichier daté lisible, sans audio', async () => {
    const d = faussDossier();
    const etat = appliquerResultat(etatInitial(date(0)), 'bonjour', 'production', true, date(1));
    const nom = await ecrireSauvegarde(d, etat, date(2));
    expect(nom).toBe('sondes-sauvegarde-2026-11-01-080002.json');
    const brut = d.fichiers.get(nom)!;
    expect(brut).not.toMatch(/data:audio|blob:/);
    expect(lireSauvegarde(brut).items.bonjour?.reussites.production).toBe(1);
  });

  it('ne garde que les dix plus récentes', async () => {
    const d = faussDossier();
    for (let n = 0; n < 13; n++) await ecrireSauvegarde(d, etatInitial(), date(n));
    const noms = await listerSauvegardes(d);
    expect(noms).toHaveLength(10);
    expect(noms[0]).toBe(nomFichier(date(12)));
    expect(noms.at(-1)).toBe(nomFichier(date(3)));
  });

  it('crée une copie de sécurité qui n’est jamais supprimée par l’élagage', async () => {
    const d = faussDossier();
    await ecrireCopieSecurite(d, etatInitial(), date(0));
    for (let n = 1; n < 14; n++) await ecrireSauvegarde(d, etatInitial(), date(n));
    expect([...d.fichiers.keys()].some((k) => k.startsWith(PREFIXE_SECURITE))).toBe(true);
  });

  it('restaure l’état depuis un fichier du dossier', async () => {
    const d = faussDossier();
    const etat = appliquerResultat(etatInitial(date(0)), 'merci', 'sens', true, date(1));
    const nom = await ecrireSauvegarde(d, etat, date(2));
    const relu = await lireSauvegardeDuDossier(d, nom);
    expect(relu.items.merci?.reussites.sens).toBe(1);
  });

  it('refuse un fichier qui n’est pas une sauvegarde', () => {
    expect(() => lireSauvegarde('pas du json')).toThrow('fichier-illisible');
    expect(() => lireSauvegarde('{"format":"autre"}')).toThrow('fichier-invalide');
    expect(() => migrer({ version: 2 })).toThrow('etat-invalide');
  });

  it('refait un aller-retour complet', () => {
    const etat = appliquerResultat(etatInitial(date(0)), 'bonjour', 'production', true, date(1));
    expect(lireSauvegarde(JSON.stringify(creerSauvegarde(etat, date(2))))).toEqual(migrer(etat));
  });
});

describe('stockage local', () => {
  it('conserve et recharge l’état, puis efface tout sur demande', async () => {
    const etat = appliquerResultat(etatInitial(), 'bonjour', 'production', true);
    await sauverEtat(etat);
    expect((await chargerEtat()).items.bonjour?.reussites.production).toBe(1);
    await toutEffacer();
    expect(Object.keys((await chargerEtat()).items)).toHaveLength(0);
  });

  it('met de côté des données illisibles au lieu de les perdre en silence', async () => {
    await ecrire('etat', { version: 99 });
    const etat = await chargerEtat();
    expect(Object.keys(etat.items)).toHaveLength(0);
  });
});
