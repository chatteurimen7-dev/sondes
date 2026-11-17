import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../AppContext';
import { aRevoir } from '../domain/progress';
import {
  audioDit,
  audioEntend,
  audioReplique,
  audioSens,
  construireEtapes,
  construireRevision,
  type Etape,
} from '../domain/seance';
import type { Item, Tour } from '../domain/types';
import { arreter, jouer, jouerSuite } from '../services/audio';
import { intentionDe, itemGlobal, seanceGlobale, situations, tousLesItems } from '../services/content';
import { demarrerEnregistrement, enregistrementDisponible, liberer, type Enregistrement } from '../services/recorder';
import { Illustration } from '../ui/Illustration';
import { BoutonImage } from '../ui/composants';
import { Picto } from '../ui/pictos';
import { ReponseOrale, voixBravo, type Candidat } from '../ui/ReponseOrale';
import type { Ecran } from '../App';

const jouerFr = (id: string, texteFr: string, lent = false) => jouer(id, { texteFr, lent });

function candidatDe(item: Item): Candidat {
  return { id: item.id, acceptees: item.acceptees, image: item.image, audio: audioDit(item), texteFr: item.dit };
}

const TOUS_CANDIDATS: Candidat[] = tousLesItems.map(candidatDe);

function Suivant({ onClick, desactive = false }: { onClick: () => void; desactive?: boolean }) {
  return <BoutonImage picto="fleche" voix="lib-suivant" nom="Continuer" variante="principal" taille="grand" desactive={desactive} onClick={onClick} dataTest="suivant" />;
}

function MotEcrit({ texte }: { texte: string }) {
  return <p className="mot-ecrit" data-test="mot-ecrit">{texte}</p>;
}

function EtapeConsigne({ etape, onSuivant }: { etape: Extract<Etape, { type: 'consigne' }>; onSuivant: () => void }) {
  useEffect(() => { void jouer(etape.audio, { intention: etape.intention }); }, [etape.audio, etape.intention]);
  return <div className="etape"><div className="zone-image"><Picto nom="hautparleur" taille={160} couleur="#1f5f5b" /></div><div className="zone-actions"><BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Écouter" taille="grand" onClick={() => void jouer(etape.audio, { intention: etape.intention })} dataTest="ecouter" /><Suivant onClick={onSuivant} /></div></div>;
}

function EtapeScene({ etape, onSuivant }: { etape: Extract<Etape, { type: 'scene' }>; onSuivant: () => void }) {
  return <div className="etape"><div className="zone-image"><Illustration id={etape.illustration} taille={440} /></div><div className="zone-actions"><Suivant onClick={onSuivant} /></div></div>;
}

function EtapePhrase({ item, onSuivant }: { item: Item; onSuivant: () => void }) {
  const { etat, resultat } = useApp();
  const [mot, setMot] = useState(etat.profil.motEcrit === 'toujours');
  const compte = useRef(false);
  useEffect(() => {
    void jouerFr(audioEntend(item.id), item.entend);
    if (!compte.current) { compte.current = true; resultat(item.id, 'ecoute', true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);
  return <div className="etape"><div className="zone-image"><Illustration id={item.image} taille={380} />{mot ? <MotEcrit texte={item.entend} /> : null}</div><div className="zone-actions"><BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Écouter" taille="grand" onClick={() => void jouerFr(audioEntend(item.id), item.entend)} dataTest="ecouter" /><BoutonImage picto="sablier" voix="lib-lent" nom="Écouter lentement" onClick={() => void jouerFr(audioEntend(item.id, true), item.entend, true)} dataTest="lent" />{etat.profil.motEcrit !== 'masque' ? <BoutonImage picto="oeil" voix="lib-voir-mot" nom="Voir le mot" variante="discret" actif={mot} onClick={() => setMot((m) => !m)} dataTest="voir-mot" /> : null}<Suivant onClick={onSuivant} /></div></div>;
}

function EtapeSens({ etape, item, onSuivant }: { etape: Extract<Etape, { type: 'sens' }>; item: Item; onSuivant: () => void }) {
  const { resultat } = useApp();
  const [fautes, setFautes] = useState(0);
  const [reussi, setReussi] = useState(false);
  const [revele, setRevele] = useState(false);
  useEffect(() => { void jouerSuite([{ id: audioSens(item.id), options: { intention: item.sensIntention } }, { id: audioEntend(item.id), options: { texteFr: item.entend } }]); }, [item]);
  const choisir = (id: string) => {
    if (reussi || revele) return;
    if (id === item.id) {
      setReussi(true); resultat(item.id, 'sens', fautes === 0);
      void jouer(`aeb/${voixBravo(item.id)}`, { intention: intentionDe('bravo-1') }); return;
    }
    const n = fautes + 1; setFautes(n);
    if (n >= 2) { setRevele(true); resultat(item.id, 'sens', false); }
    void jouerSuite([{ id: 'aeb/ecoute-encore', options: { intention: intentionDe('ecoute-encore') } }, { id: audioEntend(item.id), options: { texteFr: item.entend } }]);
  };
  return <div className="etape"><div className="zone-image choix" role="group" aria-label="Choisir l'image qui correspond">{etape.choix.map((c) => { const bonne = c.id === item.id; return <button key={c.id} type="button" className={`carte-choix${(reussi || revele) && bonne ? ' bonne' : ''}`} onClick={() => choisir(c.id)} data-test={bonne ? 'bonne-image' : 'autre-image'} aria-label="Image"><Illustration id={c.image} taille={220} />{(reussi || revele) && bonne ? <span className="coche"><Picto nom="check" taille={48} couleur="#fff" epaisseur={9} /></span> : null}</button>; })}</div><div className="zone-actions"><BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Réécouter" onClick={() => void jouerFr(audioEntend(item.id), item.entend)} dataTest="ecouter" />{reussi || revele ? <Suivant onClick={onSuivant} /> : null}</div></div>;
}

function EtapeRepeter({ item, onSuivant }: { item: Item; onSuivant: () => void }) {
  const { resultat, maj } = useApp();
  const [phase, setPhase] = useState<'pret' | 'enregistre' | 'fini' | 'sans-micro'>('pret');
  const [url, setUrl] = useState<string | undefined>();
  const rec = useRef<Enregistrement | undefined>(undefined);
  const urlRef = useRef<string | undefined>(undefined);
  urlRef.current = url;
  useEffect(() => { void jouerFr(audioDit(item), item.dit); return () => { rec.current?.annuler(); liberer(urlRef.current); }; }, [item]);
  const commencer = async () => {
    liberer(url); setUrl(undefined);
    if (!enregistrementDisponible()) { setPhase('sans-micro'); return; }
    try {
      arreter();
      rec.current = await demarrerEnregistrement(6000, (u) => { setUrl(u); setPhase('fini'); });
      setPhase('enregistre');
    } catch {
      setPhase('sans-micro'); maj((e) => ({ ...e, profil: { ...e.profil, microIndisponible: true } }));
      void jouer('aeb/probleme-micro', { intention: intentionDe('probleme-micro') });
    }
  };
  const finir = async () => { const u = await rec.current?.arreter(); setUrl(u); setPhase('fini'); };
  const ecouterMaVoix = () => { if (!url) return; arreter(); void new Audio(url).play(); };
  return (
    <div className="etape">
      <div className="zone-image"><Illustration id={item.image} taille={320} /></div>
      <div className="zone-actions">
        <BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Écouter le modèle" onClick={() => void jouerFr(audioDit(item), item.dit)} dataTest="modele" />
        <BoutonImage picto="sablier" voix="lib-lent" nom="Écouter lentement" onClick={() => void jouerFr(audioDit(item, true), item.dit, true)} dataTest="lent" />
        {phase !== 'sans-micro' ? <button type="button" className={`btn btn-grand btn-principal micro${phase === 'enregistre' ? ' pulse' : ''}`} aria-label={phase === 'enregistre' ? 'Arrêter' : 'Parler'} data-test="micro" onClick={() => (phase === 'enregistre' ? void finir() : void commencer())}><Picto nom="micro" taille={96} /></button> : null}
        {url ? <BoutonImage picto="oreille" voix="lib-s-entendre" nom="Écouter ma voix" onClick={ecouterMaVoix} dataTest="ma-voix" /> : null}
        {phase === 'fini' || phase === 'sans-micro' ? <Suivant onClick={onSuivant} /> : null}
      </div>
    </div>
  );
}

function EtapeRepondre({ item, onSuivant }: { item: Item; onSuivant: () => void }) {
  const { resultat, essai } = useApp();
  const invite = useMemo(() => ({ id: audioEntend(item.id), texteFr: item.entend }), [item]);
  const cible = useMemo(() => [candidatDe(item)], [item]);
  return <div className="etape"><div className="zone-image"><Illustration id={item.image} taille={240} /></div><div className="zone-actions"><ReponseOrale cible={cible} candidats={TOUS_CANDIDATS} invite={invite} onEssai={(id, issue, transcription, score) => essai(id, issue, transcription, score)} onTermine={(fin) => { if (fin === 'compris') resultat(item.id, 'production', true); else if (fin === 'abandon') resultat(item.id, 'production', false); onSuivant(); }} /><BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Réécouter la question" variante="discret" onClick={() => void jouerFr(invite.id, invite.texteFr)} dataTest="ecouter" /></div></div>;
}

function EtapeRetour({ item, onSuivant }: { item: Item; onSuivant: () => void }) {
  const { vu } = useApp();
  useEffect(() => { vu(item.id); void jouer(`aeb/${voixBravo(item.id)}`, { intention: intentionDe('bravo-1') }); }, [item.id]);
  return <div className="etape"><div className="zone-image compris ok"><Illustration id={item.image} taille={320} /><span className="coche"><Picto nom="check" taille={56} couleur="#fff" epaisseur={9} /></span></div><div className="zone-actions"><Suivant onClick={onSuivant} /></div></div>;
}

function EtapeDialogue({ tours, scene, onSuivant }: { tours: Tour[]; scene: string; onSuivant: () => void }) {
  const { resultat, essai } = useApp();
  const [i, setI] = useState(0);
  const tour = tours[i];
  const suivre = () => (i + 1 >= tours.length ? onSuivant() : setI(i + 1));
  useEffect(() => {
    if (!tour || tour.qui !== 'autre') return;
    let annule = false; let minuteur: number | undefined;
    void (async () => {
      if ('itemId' in tour) { const item = itemGlobal(tour.itemId); await jouerFr(audioEntend(item.id), item.entend); }
      else await jouerFr(audioReplique(tour.id), tour.texte);
      if (!annule) minuteur = window.setTimeout(() => { if (!annule) suivre(); }, 400);
    })();
    return () => { annule = true; if (minuteur) window.clearTimeout(minuteur); arreter(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  const cibleSondes = useMemo(() => {
    if (!tour || tour.qui !== 'sondes') return undefined;
    const ids = 'itemId' in tour ? [tour.itemId] : tour.choix;
    return ids.map((id) => candidatDe(itemGlobal(id)));
  }, [tour]);
  if (!tour) return null;
  return <div className="etape"><div className="zone-image"><Illustration id={scene} taille={400} /><div className="qui-parle" aria-hidden="true"><Picto nom={tour.qui === 'autre' ? 'hautparleur' : 'micro'} taille={64} couleur="#1f5f5b" /></div></div><div className="zone-actions">{tour.qui === 'sondes' && cibleSondes ? <ReponseOrale key={i} cible={cibleSondes} candidats={TOUS_CANDIDATS} onEssai={(id, issue, transcription, score) => essai(id, issue, transcription, score)} onTermine={(fin, compris) => { if (compris) resultat(compris, 'production', true); else if (fin === 'abandon') resultat(cibleSondes[0]!.id, 'production', false); suivre(); }} /> : null}</div></div>;
}

function EtapeMission({ etape, scene, onSuivant }: { etape: Extract<Etape, { type: 'mission' }>; scene: string; onSuivant: () => void }) {
  const { mission } = useApp();
  useEffect(() => { mission({ seanceId: etape.seanceId, proposeeLe: new Date().toISOString() }); void jouer(`aeb/mission-${etape.seanceId}`, { intention: etape.intention }); }, [etape.seanceId]);
  return <div className="etape"><div className="zone-image"><Illustration id={scene} taille={400} /></div><div className="zone-actions"><BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Écouter" onClick={() => void jouer(`aeb/mission-${etape.seanceId}`, { intention: etape.intention })} dataTest="ecouter" /><Suivant onClick={onSuivant} /></div></div>;
}

function EtapeFin({ etape, debut, itemsVus, onFin }: { etape: Extract<Etape, { type: 'fin' }>; debut: number; itemsVus: Item[]; onFin: () => void }) {
  const { seanceTerminee } = useApp();
  const fait = useRef(false);
  useEffect(() => {
    if (fait.current) return; fait.current = true;
    void seanceTerminee({ seanceId: etape.seanceId, debut: new Date(debut).toISOString(), dureeSecondes: Math.round((Date.now() - debut) / 1000) });
    void jouerSuite([{ id: `aeb/bilan-${etape.seanceId}`, options: { intention: etape.intention } }, { id: `aeb/fin-seance-${(debut % 3) + 1}`, options: { intention: intentionDe('fin-seance-1') } }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div className="etape"><div className="zone-image collection-mini">{itemsVus.map((it) => <Illustration key={it.id} id={it.image} taille={140} />)}</div><div className="zone-actions"><BoutonImage picto="check" voix="lib-suivant" nom="Terminer" variante="principal" taille="grand" onClick={onFin} dataTest="terminer" /></div></div>;
}

export function SeanceEcran({ seanceId, revision, aller }: { seanceId?: string; revision?: boolean; aller: (e: Ecran) => void }) {
  const { etat } = useApp();
  const debut = useRef(Date.now());
  const trouvee = seanceId ? seanceGlobale(seanceId) : undefined;
  const seance = trouvee?.seance;
  const etapes = useMemo<Etape[]>(() => {
    if (revision || !seance) {
      let ids = aRevoir(etat.items, new Date(), 4);
      if (ids.length === 0) ids = tousLesItems.filter((i) => etat.items[i.id]?.vu).slice(0, 3).map((i) => i.id);
      if (ids.length === 0) ids = tousLesItems.slice(0, 3).map((i) => i.id);
      return construireRevision(situations, ids, Date.now() % 1000);
    }
    return construireEtapes(trouvee!.situation, seance, Date.now() % 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seanceId, revision]);
  const [i, setI] = useState(0);
  useEffect(() => () => arreter(), []);
  useEffect(() => { arreter(); }, [i]);
  const etape = etapes[i];
  if (!etape) return null;
  const suivant = () => setI((n) => Math.min(n + 1, etapes.length - 1));
  const itemDe = (id: string) => itemGlobal(id);
  const idsDeLaSeance = etapes.flatMap((e) => e.type === 'retour' ? [e.itemId] : []);
  return <main className="ecran seance" data-etape={etape.type}><div className="progression" role="progressbar" aria-valuemin={0} aria-valuemax={etapes.length} aria-valuenow={i + 1}><span style={{ width: `${((i + 1) / etapes.length) * 100}%` }} /></div><div className="contenu" key={`${etape.type}-${i}`}>{etape.type === 'consigne' ? <EtapeConsigne etape={etape} onSuivant={suivant} /> : null}{etape.type === 'scene' ? <EtapeScene etape={etape} onSuivant={suivant} /> : null}{etape.type === 'phrase' ? <EtapePhrase item={itemDe(etape.itemId)} onSuivant={suivant} /> : null}{etape.type === 'sens' ? <EtapeSens etape={etape} item={itemDe(etape.itemId)} onSuivant={suivant} /> : null}{etape.type === 'repeter' ? <EtapeRepeter item={itemDe(etape.itemId)} onSuivant={suivant} /> : null}{etape.type === 'repondre' ? <EtapeRepondre item={itemDe(etape.itemId)} onSuivant={suivant} /> : null}{etape.type === 'retour' ? <EtapeRetour item={itemDe(etape.itemId)} onSuivant={suivant} /> : null}{etape.type === 'dialogue' ? <EtapeDialogue tours={etape.tours} scene={seance?.scene ?? 'palier-voisine'} onSuivant={suivant} /> : null}{etape.type === 'mission' ? <EtapeMission etape={etape} scene={seance?.scene ?? 'palier-voisine'} onSuivant={suivant} /> : null}{etape.type === 'fin' ? <EtapeFin etape={etape} debut={debut.current} itemsVus={idsDeLaSeance.map(itemDe)} onFin={() => aller({ nom: 'accueil' })} /> : null}}</div></main>;
}
