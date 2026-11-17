import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { appliquerResultat, ajouterEssai, marquerVu } from './domain/etat';
import type { Competence, Etat, Issue, Mission, SeanceFaite } from './domain/types';
import { chargerIndexMedias } from './services/audio';
import { autorisationDossier, ecrireSauvegarde, type DossierLike } from './services/backup';
import { chargerEtat, demanderStockagePersistant, lireDossier, sauverEtat } from './services/storage';

interface Contexte {
  etat: Etat;
  /** Applique une transformation à l'état puis l'enregistre sur le PC. */
  maj: (f: (e: Etat) => Etat) => void;
  resultat: (itemId: string, c: Competence, reussi: boolean) => void;
  essai: (itemId: string, issue: Issue, transcription: string, score: number) => void;
  vu: (itemId: string) => void;
  seanceTerminee: (s: SeanceFaite) => Promise<void>;
  mission: (m: Mission) => void;
  sauvegarderMaintenant: () => Promise<boolean>;
  remplacerEtat: (e: Etat) => void;
}

const Ctx = createContext<Contexte | null>(null);

export function useApp(): Contexte {
  const c = useContext(Ctx);
  if (!c) throw new Error('AppProvider manquant');
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<Etat | null>(null);
  const ref = useRef<Etat | null>(null);

  useEffect(() => {
    void (async () => {
      await chargerIndexMedias();
      const e = await chargerEtat();
      ref.current = e;
      setEtat(e);
      void demanderStockagePersistant();
    })();
  }, []);

  const maj = useCallback((f: (e: Etat) => Etat) => {
    if (!ref.current) return;
    const suivant = f(ref.current);
    ref.current = suivant;
    setEtat(suivant);
    void sauverEtat(suivant);
  }, []);

  const sauvegarderMaintenant = useCallback(async (): Promise<boolean> => {
    if (!ref.current) return false;
    try {
      const dossier = await lireDossier();
      if (!dossier || !(await autorisationDossier(dossier, false))) throw new Error('dossier');
      await ecrireSauvegarde(dossier as unknown as DossierLike, ref.current);
      maj((e) => ({ ...e, derniereSauvegarde: new Date().toISOString(), derniereSauvegardeEchec: false }));
      return true;
    } catch {
      maj((e) => ({ ...e, derniereSauvegardeEchec: true }));
      return false;
    }
  }, [maj]);

  const valeur = useMemo<Contexte | null>(() => {
    if (!etat) return null;
    return {
      etat,
      maj,
      resultat: (itemId, c, reussi) => maj((e) => appliquerResultat(e, itemId, c, reussi)),
      essai: (itemId, issue, transcription, score) => maj((e) => ajouterEssai(e, itemId, issue, transcription, score)),
      vu: (itemId) => maj((e) => marquerVu(e, itemId)),
      seanceTerminee: async (s) => {
        maj((e) => ({ ...e, seances: [...e.seances, s] }));
        await sauvegarderMaintenant();
      },
      mission: (m) => maj((e) => ({ ...e, missions: [...e.missions.filter((x) => x.seanceId !== m.seanceId), m] })),
      sauvegarderMaintenant,
      remplacerEtat: (nouveau) => {
        ref.current = nouveau;
        setEtat(nouveau);
        void sauverEtat(nouveau);
      },
    };
  }, [etat, maj, sauvegarderMaintenant]);

  if (!valeur) return <div className="ecran centre" aria-busy="true" />;
  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}
