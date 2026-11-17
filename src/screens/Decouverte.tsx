import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../AppContext';
import { arreter, jouer, jouerSuite } from '../services/audio';
import { decouverte, intentionDe } from '../services/content';
import { Illustration } from '../ui/Illustration';
import { BoutonImage } from '../ui/composants';
import { Picto } from '../ui/pictos';
import { ReponseOrale, voixBravo } from '../ui/ReponseOrale';
import type { Ecran } from '../App';

const dit = (id: string, intention: string) => jouer(`aeb/${id}`, { intention });
const mot = (id: string, texte: string) => jouer(`fr/mot-${id}`, { texteFr: texte });

function melanger<T>(liste: T[], graine: number): T[] {
  const a = [...liste];
  let s = graine || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function Suivant({ onClick }: { onClick: () => void }) {
  return <BoutonImage picto="fleche" voix="lib-suivant" nom="Continuer" variante="principal" taille="grand" onClick={onClick} dataTest="suivant" />;
}

type EtapeD =
  | { t: 'bienvenue' }
  | { t: 'son' }
  | { t: 'association'; n: number }
  | { t: 'connait'; n: number }
  | { t: 'micro' }
  | { t: 'situations' }
  | { t: 'fin' };

function construire(): EtapeD[] {
  return [
    { t: 'bienvenue' },
    { t: 'son' },
    ...decouverte.association.map((_, n) => ({ t: 'association' as const, n })),
    ...decouverte.connait.map((_, n) => ({ t: 'connait' as const, n })),
    { t: 'micro' },
    { t: 'situations' },
    { t: 'fin' },
  ];
}

function Bienvenue({ onSuivant }: { onSuivant: () => void }) {
  useEffect(() => {
    void jouerSuite([
      { id: 'aeb/bienvenue', options: { intention: intentionDe('bienvenue') } },
      { id: 'aeb/rien-n-est-note', options: { intention: intentionDe('rien-n-est-note') } },
    ]);
  }, []);
  return (
    <div className="etape">
      <div className="zone-image">
        <Illustration id="salut-matin" taille={400} />
      </div>
      <div className="zone-actions">
        <BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Écouter" onClick={() => void dit('bienvenue', intentionDe('bienvenue'))} dataTest="ecouter" />
        <Suivant onClick={onSuivant} />
      </div>
    </div>
  );
}

function TestSon({ onSuivant }: { onSuivant: () => void }) {
  const { maj } = useApp();
  const [reponse, setReponse] = useState<'oui' | 'non' | undefined>();
  useEffect(() => {
    void (async () => {
      await dit('test-son', intentionDe('test-son'));
      await mot('bonjour', 'Bonjour');
    })();
  }, []);
  return (
    <div className="etape">
      <div className="zone-image">
        <Picto nom="hautparleur" taille={180} couleur="#1f5f5b" />
      </div>
      <div className="zone-actions">
        <BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Réécouter le son" onClick={() => void mot('bonjour', 'Bonjour')} dataTest="ecouter" />
        <BoutonImage
          picto="oreille"
          voix="lib-j-entends"
          nom="J'entends bien"
          variante="principal"
          taille="grand"
          actif={reponse === 'oui'}
          dataTest="entend"
          onClick={() => {
            setReponse('oui');
            maj((e) => ({ ...e, profil: { ...e.profil, sonVerifie: true } }));
          }}
        />
        <BoutonImage
          picto="interro"
          voix="lib-j-entends-pas"
          nom="Je n'entends pas bien"
          actif={reponse === 'non'}
          dataTest="entend-pas"
          onClick={() => {
            setReponse('non');
            void dit('son-probleme', intentionDe('son-probleme'));
          }}
        />
        {reponse ? <Suivant onClick={onSuivant} /> : null}
      </div>
    </div>
  );
}

function Association({ n, onSuivant }: { n: number; onSuivant: () => void }) {
  const a = decouverte.association[n]!;
  const choix = useMemo(() => melanger([a.image, ...a.distracteurs.map((d) => (d === 'salut-matin' ? 'salut-matin' : d))], n + 3), [a, n]);
  const [fautes, setFautes] = useState(0);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    void (async () => {
      if (n === 0) await dit('association-consigne', intentionDe('association-consigne'));
      await mot(a.id, a.texteFr);
    })();
  }, [a, n]);
  const choisir = (image: string) => {
    if (ok) return;
    if (image === a.image) {
      setOk(true);
      void dit(voixBravo(a.id), intentionDe('bravo-1'));
      return;
    }
    const f = fautes + 1;
    setFautes(f);
    if (f >= 2) setOk(true);
    void jouerSuite([
      { id: 'aeb/ecoute-encore', options: { intention: intentionDe('ecoute-encore') } },
      { id: `fr/mot-${a.id}`, options: { texteFr: a.texteFr } },
    ]);
  };
  return (
    <div className="etape">
      <div className="zone-image choix">
        {choix.map((image) => (
          <button key={image} type="button" className={`carte-choix${ok && image === a.image ? ' bonne' : ''}`} onClick={() => choisir(image)} aria-label="Image">
            <Illustration id={image} taille={220} />
            {ok && image === a.image ? (
              <span className="coche">
                <Picto nom="check" taille={48} couleur="#fff" epaisseur={9} />
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="zone-actions">
        <BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Réécouter" onClick={() => void mot(a.id, a.texteFr)} dataTest="ecouter" />
        {ok ? <Suivant onClick={onSuivant} /> : null}
      </div>
    </div>
  );
}

function Connait({ n, onSuivant }: { n: number; onSuivant: () => void }) {
  const { maj } = useApp();
  const c = decouverte.connait[n]!;
  useEffect(() => {
    void (async () => {
      if (n === 0) await dit('connait-consigne', intentionDe('connait-consigne'));
      await mot(c.id, c.texteFr);
    })();
  }, [c, n]);
  const repondre = (r: 'oui' | 'pas_encore') => {
    maj((e) => ({ ...e, profil: { ...e.profil, reponsesConnait: { ...e.profil.reponsesConnait, [c.id]: r } } }));
    onSuivant();
  };
  return (
    <div className="etape">
      <div className="zone-image">
        <Illustration id={c.image} taille={340} />
      </div>
      <div className="zone-actions">
        <BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Réécouter" onClick={() => void mot(c.id, c.texteFr)} dataTest="ecouter" />
        <BoutonImage picto="check" voix="lib-oui" nom="Oui, je connais" variante="principal" taille="grand" dataTest="oui" onClick={() => repondre('oui')} />
        <BoutonImage picto="sablier" voix="lib-pas-encore" nom="Pas encore" taille="grand" dataTest="pas-encore" onClick={() => repondre('pas_encore')} />
      </div>
    </div>
  );
}

function EssaiMicro({ onSuivant }: { onSuivant: () => void }) {
  const [pret, setPret] = useState(false);
  const { essai } = useApp();
  useEffect(() => {
    void (async () => {
      await dit('micro-explication', intentionDe('micro-explication'));
      await dit('essai-oral', intentionDe('essai-oral'));
    })();
  }, []);
  const cible = useMemo(() => [{ id: 'bonjour', acceptees: ['bonjour'], image: 'salut-matin', audio: 'fr/bonjour-entend', texteFr: 'Bonjour' }], []);
  return (
    <div className="etape">
      <div className="zone-image">
        <Illustration id="salut-matin" taille={340} />
      </div>
      <div className="zone-actions">
        {pret ? (
          <ReponseOrale cible={cible} candidats={cible} rassurerSeulement onEssai={(id, i, t, s) => essai(id, i, t, s)} onTermine={onSuivant} />
        ) : (
          <BoutonImage picto="micro" voix="lib-micro" nom="Essayer avec le micro" variante="principal" taille="grand" dataTest="essayer" onClick={() => setPret(true)} />
        )}
        <BoutonImage picto="fleche" voix="lib-suivant" nom="Passer cette étape" variante="discret" onClick={onSuivant} dataTest="passer" />
      </div>
    </div>
  );
}

function Situations({ onSuivant }: { onSuivant: () => void }) {
  const { etat, maj } = useApp();
  useEffect(() => {
    void dit('situations-consigne', intentionDe('situations-consigne'));
  }, []);
  const choisies = etat.profil.situationsChoisies;
  const basculer = (id: string) =>
    maj((e) => {
      const deja = e.profil.situationsChoisies.includes(id);
      return { ...e, profil: { ...e.profil, situationsChoisies: deja ? e.profil.situationsChoisies.filter((x) => x !== id) : [...e.profil.situationsChoisies, id] } };
    });
  return (
    <div className="etape">
      <div className="zone-image choix">
        {decouverte.situations.map((s) => (
          <button key={s.id} type="button" className={`carte-choix${choisies.includes(s.id) ? ' bonne' : ''}`} onClick={() => basculer(s.id)} aria-pressed={choisies.includes(s.id)} aria-label={s.id} data-test={`situation-${s.id}`}>
            <Illustration id={s.image} taille={180} />
            {choisies.includes(s.id) ? (
              <span className="coche">
                <Picto nom="check" taille={40} couleur="#fff" epaisseur={9} />
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="zone-actions">
        <Suivant onClick={onSuivant} />
      </div>
    </div>
  );
}

function Fin({ aller, debut }: { aller: (e: Ecran) => void; debut: number }) {
  const { maj, seanceTerminee } = useApp();
  const fait = useRef(false);
  useEffect(() => {
    if (fait.current) return;
    fait.current = true;
    maj((e) => ({ ...e, profil: { ...e.profil, decouverteFaite: true } }));
    void seanceTerminee({ seanceId: 's0', debut: new Date(debut).toISOString(), dureeSecondes: Math.round((Date.now() - debut) / 1000) });
    void dit('fin-decouverte', intentionDe('fin-decouverte'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="etape">
      <div className="zone-image">
        <Illustration id="rue-matin" taille={400} />
      </div>
      <div className="zone-actions">
        <BoutonImage picto="check" voix="lib-suivant" nom="Terminer" variante="principal" taille="grand" dataTest="terminer" onClick={() => aller({ nom: 'accueil' })} />
      </div>
    </div>
  );
}

export function Decouverte({ aller }: { aller: (e: Ecran) => void }) {
  const etapes = useMemo(construire, []);
  const debut = useRef(Date.now());
  const [i, setI] = useState(0);
  useEffect(() => {
    arreter();
    return () => arreter();
  }, [i]);
  const e = etapes[i]!;
  const suivant = () => setI((n) => Math.min(n + 1, etapes.length - 1));
  return (
    <main className="ecran seance" data-etape={`decouverte-${e.t}`}>
      <div className="progression" role="progressbar" aria-valuemin={0} aria-valuemax={etapes.length} aria-valuenow={i + 1}>
        <span style={{ width: `${((i + 1) / etapes.length) * 100}%` }} />
      </div>
      <div className="contenu" key={i}>
        {e.t === 'bienvenue' ? <Bienvenue onSuivant={suivant} /> : null}
        {e.t === 'son' ? <TestSon onSuivant={suivant} /> : null}
        {e.t === 'association' ? <Association n={e.n} onSuivant={suivant} /> : null}
        {e.t === 'connait' ? <Connait n={e.n} onSuivant={suivant} /> : null}
        {e.t === 'micro' ? <EssaiMicro onSuivant={suivant} /> : null}
        {e.t === 'situations' ? <Situations onSuivant={suivant} /> : null}
        {e.t === 'fin' ? <Fin aller={aller} debut={debut.current} /> : null}
      </div>
    </main>
  );
}
