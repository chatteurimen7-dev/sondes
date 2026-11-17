import { useEffect, useRef, useState } from 'react';
import { evaluer, retrouverElement } from '../domain/matching';
import { jouer, jouerSuite } from '../services/audio';
import { intentionDe } from '../services/content';
import { ecouterUneFois, type Ecoute } from '../services/speech';
import { Illustration } from './Illustration';
import { BoutonImage } from './composants';
import { Picto } from './pictos';

export interface Candidat {
  id: string;
  acceptees: string[];
  image: string;
  audio: string;
  texteFr: string;
}

export type FinReponse = 'compris' | 'abandon' | 'sans-micro';

type Phase = 'attente' | 'ecoute' | 'compris' | 'encore' | 'sans-micro';

const MAX_ESSAIS = 3;

function nombreStable(texte: string): number {
  let h = 0;
  for (const c of texte) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function voixBravo(cle: string): string {
  return `bravo-${(nombreStable(cle) % 3) + 1}`;
}

/**
 * Sondes appuie sur le micro et répond à voix haute.
 * Le système montre ce qu'il a compris par l'image et la voix, jamais par une note.
 */
export function ReponseOrale({
  cible,
  candidats,
  invite,
  onEssai,
  onTermine,
  rassurerSeulement = false,
}: {
  cible: Candidat[];
  /** Tous les éléments que l'on peut reconnaître, pour dire à Sondes ce qui a été compris. */
  candidats: Candidat[];
  /** Phrase de l'interlocuteur à jouer avant la réponse. */
  invite?: { id: string; texteFr: string };
  onEssai: (itemId: string, issue: 'compris' | 'proche' | 'incertain', transcription: string, score: number) => void;
  onTermine: (fin: FinReponse, itemCompris?: string) => void;
  /** Découverte : on ne parle jamais d'« encore » ni d'échec, on remercie simplement. */
  rassurerSeulement?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>('attente');
  const [essais, setEssais] = useState(0);
  const [imageComprise, setImageComprise] = useState<string | undefined>();
  const [itemCompris, setItemCompris] = useState<string | undefined>();
  const ecoute = useRef<Ecoute | undefined>(undefined);
  const actif = useRef(true);

  useEffect(() => {
    actif.current = true;
    if (invite) void jouer(invite.id, { texteFr: invite.texteFr });
    return () => {
      actif.current = false;
      ecoute.current?.arreter();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite?.id]);

  const parler = async () => {
    setImageComprise(undefined);
    setPhase('ecoute');
    ecoute.current = ecouterUneFois();
    const res = await ecoute.current.resultat;
    if (!actif.current) return;
    if (!res.ok) {
      if (res.erreur === 'aucun-son') {
        setPhase('encore');
        void jouer('aeb/ecoute-encore', { intention: intentionDe('ecoute-encore') });
        return;
      }
      setPhase('sans-micro');
      void jouer('aeb/probleme-micro', { intention: intentionDe('probleme-micro') });
      return;
    }
    const ev = evaluer(res.transcriptions, cible.flatMap((c) => c.acceptees));
    const ciblePrincipale = cible[0]!;
    const choisi = ev.issue === 'compris' ? (cible.find((c) => evaluer(res.transcriptions, c.acceptees).issue === 'compris') ?? ciblePrincipale) : ciblePrincipale;
    const trouve = retrouverElement(res.transcriptions, candidats);
    onEssai(choisi.id, ev.issue, ev.transcription, ev.score);
    const n = essais + 1;
    setEssais(n);

    if (ev.issue === 'compris') {
      setItemCompris(choisi.id);
      setImageComprise(choisi.image);
      setPhase('compris');
      await jouerSuite([
        { id: choisi.audio, options: { texteFr: choisi.texteFr } },
        { id: voixBravo(choisi.id), options: { intention: intentionDe('bravo-1') } },
      ]);
      return;
    }

    // Pas reconnu : on dit ce qui a été compris si cela correspond à une autre phrase connue.
    const autre = trouve ? candidats.find((c) => c.id === trouve.id) : undefined;
    if (autre) {
      setImageComprise(autre.image);
      await jouer(autre.audio, { texteFr: autre.texteFr });
      if (!actif.current) return;
    }
    if (n >= MAX_ESSAIS || rassurerSeulement) {
      setPhase('encore');
      await jouer('aeb/suite', { intention: intentionDe('suite') });
      if (actif.current) onTermine('abandon');
      return;
    }
    setPhase('encore');
    await jouer(ev.issue === 'proche' ? 'aeb/presque' : 'aeb/ecoute-encore', { intention: intentionDe(ev.issue === 'proche' ? 'presque' : 'ecoute-encore') });
    if (!actif.current) return;
    await jouer(cible[0]!.audio, { texteFr: cible[0]!.texteFr });
  };

  return (
    <div className="reponse-orale" data-phase={phase}>
      {imageComprise ? (
        <div className={`compris ${phase === 'compris' ? 'ok' : ''}`} data-test="image-comprise">
          <Illustration id={imageComprise} taille={180} />
          {phase === 'compris' ? (
            <span className="coche">
              <Picto nom="check" taille={56} couleur="#fff" epaisseur={9} />
            </span>
          ) : null}
        </div>
      ) : null}

      {phase !== 'compris' && phase !== 'sans-micro' ? (
        <button
          type="button"
          className={`btn btn-grand btn-principal micro${phase === 'ecoute' ? ' pulse' : ''}`}
          aria-label="Parler"
          title="Parler"
          data-test="micro"
          disabled={phase === 'ecoute'}
          onClick={() => void parler()}
        >
          <Picto nom="micro" taille={96} />
        </button>
      ) : null}

      {phase === 'encore' && !rassurerSeulement ? <p className="visuel-seul" aria-hidden="true" /> : null}

      {phase === 'compris' ? (
        <BoutonImage picto="fleche" voix="lib-suivant" nom="Continuer" variante="principal" taille="grand" dataTest="suivant" onClick={() => onTermine('compris', itemCompris)} />
      ) : null}
      {phase === 'sans-micro' ? (
        <BoutonImage picto="fleche" voix="lib-suivant" nom="Continuer" variante="principal" taille="grand" dataTest="suivant" onClick={() => onTermine('sans-micro')} />
      ) : null}
    </div>
  );
}
