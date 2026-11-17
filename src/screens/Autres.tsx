import { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { jourDe } from '../domain/progress';
import { audioEntend } from '../domain/seance';
import { jouer } from '../services/audio';
import { atelierSons, intentionDe, itemGlobal, tousLesItems } from '../services/content';
import { ecouterUneFois } from '../services/speech';
import { Illustration } from '../ui/Illustration';
import { BoutonImage } from '../ui/composants';
import { Picto } from '../ui/pictos';
import type { Ecran } from '../App';

export function Collection({ aller }: { aller: (e: Ecran) => void }) {
  const { etat } = useApp();
  const vus = tousLesItems.filter((i) => etat.items[i.id]?.vu);
  const [mot, setMot] = useState<string | undefined>();
  return (
    <main className="ecran collection">
      <div className="grille-collection" data-test="collection-grille">
        {vus.length === 0 ? <Picto nom="calendrier" taille={160} couleur="#9bb5b1" /> : null}
        {vus.map((it) => (
          <div key={it.id} className="carte-collection">
            <button type="button" className="carte-choix" aria-label="Écouter" onClick={() => void jouer(audioEntend(it.id), { texteFr: it.entend })}>
              <Illustration id={it.image} taille={200} />
            </button>
            {etat.profil.motEcrit !== 'masque' ? (
              <button type="button" className="petit-oeil" aria-label="Voir le mot" onClick={() => setMot(mot === it.id ? undefined : it.id)}>
                <Picto nom="oeil" taille={32} />
              </button>
            ) : null}
            {mot === it.id || etat.profil.motEcrit === 'toujours' ? <p className="mot-ecrit">{it.entend}</p> : null}
          </div>
        ))}
      </div>
      <nav className="barre-bas">
        <BoutonImage picto="maison" voix="lib-suivant" nom="Retour à l'accueil" taille="grand" onClick={() => aller({ nom: 'accueil' })} dataTest="accueil" />
      </nav>
    </main>
  );
}

export function Probleme({ aller }: { aller: (e: Ecran) => void }) {
  const [micro, setMicro] = useState<'attente' | 'ecoute' | 'ok' | 'ko'>('attente');
  useEffect(() => {
    void jouer('aeb/probleme-explication', { intention: intentionDe('probleme-explication') });
  }, []);
  const testerMicro = async () => {
    setMicro('ecoute');
    const r = await ecouterUneFois().resultat;
    setMicro(r.ok ? 'ok' : 'ko');
  };
  return (
    <main className="ecran probleme">
      <div className="zone-image">
        <Illustration id="incomprehension" taille={300} />
      </div>
      <div className="zone-actions">
        <BoutonImage picto="hautparleur" voix="lib-ecouter" nom="Tester le son" taille="grand" onClick={() => void jouer('fr/mot-bonjour', { texteFr: 'Bonjour' })} dataTest="test-son" />
        <BoutonImage picto="micro" voix="lib-micro" nom="Tester le micro" taille="grand" actif={micro === 'ecoute'} onClick={() => void testerMicro()} dataTest="test-micro" />
        {micro === 'ok' ? <Picto nom="check" taille={64} couleur="#2f8f4f" /> : null}
        {micro === 'ko' ? <Picto nom="interro" taille={64} couleur="#b4572a" /> : null}
      </div>
      <nav className="barre-bas">
        <BoutonImage picto="maison" voix="lib-suivant" nom="Retour à l'accueil" onClick={() => aller({ nom: 'accueil' })} dataTest="accueil" />
        <BoutonImage picto="porte" voix="lib-porte" nom="Appeler l'accompagnante" variante="discret" onClick={() => aller({ nom: 'accompagnant' })} dataTest="porte" />
      </nav>
    </main>
  );
}

/** Question du lendemain d'une mission : comment ça s'est passé ? Trois images, sans mot. */
export function Ressenti({ aller }: { aller: (e: Ecran) => void }) {
  const { etat, mission } = useApp();
  const aujourdhui = jourDe(new Date());
  const en_attente = etat.missions.find((m) => !m.ressenti && jourDe(new Date(m.proposeeLe)) !== aujourdhui);
  useEffect(() => {
    void jouer('aeb/mission-ressenti', { intention: intentionDe('mission-ressenti') });
  }, []);
  if (!en_attente) return null;
  const choisir = (r: 'facile' | 'moyen' | 'difficile') => {
    mission({ ...en_attente, ressenti: r });
    aller({ nom: 'accueil' });
  };
  const Barres = ({ n }: { n: 1 | 2 | 3 }) => (
    <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
      {[0, 1, 2].map((k) => (
        <rect key={k} x={14 + k * 28} y={80 - (k + 1) * 22} width="20" height={(k + 1) * 22} rx="3" fill={k < n ? '#1f5f5b' : '#d6e2df'} />
      ))}
    </svg>
  );
  return (
    <main className="ecran ressenti">
      <div className="zone-actions">
        {(['facile', 'moyen', 'difficile'] as const).map((r, k) => (
          <button key={r} type="button" className="btn btn-grand btn-neutre" aria-label={r} data-test={`ressenti-${r}`} onClick={() => choisir(r)}>
            <Barres n={(k + 1) as 1 | 2 | 3} />
          </button>
        ))}
        <BoutonImage picto="fleche" voix="lib-suivant" nom="Passer" variante="discret" onClick={() => aller({ nom: 'accueil' })} />
      </div>
    </main>
  );
}

/** Atelier des sons : chaque carte montre une paire de mots qui se ressemblent. */
export function AtelierSons({ aller }: { aller: (e: Ecran) => void }) {
  useEffect(() => {
    void jouer('aeb/sons-consigne', { intention: intentionDe('sons-consigne') });
  }, []);
  return (
    <main className="ecran collection">
      <div className="grille-collection" data-test="sons-grille">
        {(atelierSons?.seances ?? []).map((s) => (
          <button key={s.id} type="button" className="carte-paire" aria-label={s.titreInterne} data-test={`paire-${s.id}`} onClick={() => aller({ nom: 'seance', seanceId: s.id })}>
            {s.items.map((id) => (
              <Illustration key={id} id={itemGlobal(id).image} taille={140} />
            ))}
          </button>
        ))}
      </div>
      <nav className="barre-bas">
        <BoutonImage picto="maison" voix="lib-suivant" nom="Retour à l'accueil" taille="grand" onClick={() => aller({ nom: 'accueil' })} dataTest="accueil" />
      </nav>
    </main>
  );
}
