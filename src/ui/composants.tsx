import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useApp } from '../AppContext';
import { arreter, evenements, jouer } from '../services/audio';
import { intentionDe } from '../services/content';
import { Picto, type NomPicto } from './pictos';

/**
 * Bouton à image dont la voix en derja dit l'action quand on pose le pointeur dessus.
 * `voix` est l'identifiant d'un libellé (par exemple « lib-ecouter »).
 */
export function BoutonImage({
  picto,
  voix,
  nom,
  onClick,
  taille = 'normal',
  variante = 'neutre',
  desactive = false,
  actif = false,
  enfants,
  dataTest,
}: {
  picto: NomPicto;
  voix: string;
  nom: string;
  onClick: () => void;
  taille?: 'normal' | 'grand' | 'petit';
  variante?: 'neutre' | 'principal' | 'discret' | 'danger';
  desactive?: boolean;
  actif?: boolean;
  enfants?: ReactNode;
  dataTest?: string;
}) {
  const minuteur = useRef<number | undefined>(undefined);
  const survol = () => {
    window.clearTimeout(minuteur.current);
    minuteur.current = window.setTimeout(() => {
      void jouer(`aeb/${voix}`, { intention: intentionDe(voix) });
    }, 650);
  };
  const quitte = () => window.clearTimeout(minuteur.current);
  useEffect(() => quitte, []);
  return (
    <button
      type="button"
      className={`btn btn-${taille} btn-${variante}${actif ? ' actif' : ''}`}
      aria-label={nom}
      title={nom}
      disabled={desactive}
      data-test={dataTest}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') survol();
      }}
      onPointerLeave={quitte}
      onFocus={survol}
      onBlur={quitte}
      onClick={() => {
        quitte();
        onClick();
      }}
    >
      <Picto nom={picto} taille={taille === 'grand' ? 96 : taille === 'petit' ? 40 : 64} />
      {enfants}
    </button>
  );
}

/** Bouton qu'il faut maintenir deux secondes : geste volontaire, sans mot de passe à retenir. */
export function BoutonMaintenu({
  picto,
  nom,
  onValide,
  dureeMs = 2000,
  variante = 'principal',
  dataTest,
}: {
  picto: NomPicto;
  nom: string;
  onValide: () => void;
  dureeMs?: number;
  variante?: 'principal' | 'danger';
  dataTest?: string;
}) {
  const [progres, setProgres] = useState(0);
  const debut = useRef<number | undefined>(undefined);
  const raf = useRef<number | undefined>(undefined);

  const arret = () => {
    debut.current = undefined;
    if (raf.current) cancelAnimationFrame(raf.current);
    setProgres(0);
  };
  const tour = () => {
    if (debut.current === undefined) return;
    const p = Math.min(1, (performance.now() - debut.current) / dureeMs);
    setProgres(p);
    if (p >= 1) {
      arret();
      onValide();
      return;
    }
    raf.current = requestAnimationFrame(tour);
  };
  const depart = () => {
    if (debut.current !== undefined) return;
    debut.current = performance.now();
    raf.current = requestAnimationFrame(tour);
  };
  useEffect(() => arret, []);

  return (
    <button
      type="button"
      className={`btn btn-grand btn-${variante} maintenu`}
      aria-label={`${nom} (maintenir appuyé deux secondes)`}
      title={nom}
      data-test={dataTest}
      onPointerDown={depart}
      onPointerUp={arret}
      onPointerLeave={arret}
      onPointerCancel={arret}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) depart();
      }}
      onKeyUp={arret}
    >
      <span className="jauge" style={{ transform: `scaleX(${progres})` }} aria-hidden="true" />
      <Picto nom={picto} taille={96} />
    </button>
  );
}

/**
 * Bandeau réservé aux testeurs : tant qu'aucune voix derja n'est enregistrée,
 * il montre ce que la voix dirait. Sondes ne le voit pas une fois les voix en place.
 */
export function BandeauBrouillon() {
  const { etat } = useApp();
  const actif = etat.profil.afficherBrouillon !== false;
  const [message, setMessage] = useState<string | undefined>();
  useEffect(() => {
    let t: number | undefined;
    const quand = (e: Event) => {
      if (!actif) return;
      setMessage((e as CustomEvent<{ intention: string }>).detail.intention);
      window.clearTimeout(t);
      t = window.setTimeout(() => setMessage(undefined), 7000);
    };
    evenements.addEventListener('manquant', quand);
    return () => {
      evenements.removeEventListener('manquant', quand);
      window.clearTimeout(t);
    };
  }, [actif]);
  if (!message || !actif) return null;
  return (
    <div className="brouillon" role="status" data-test="brouillon">
      <strong>Voix derja pas encore enregistrée.</strong> {message}
    </div>
  );
}

export function ArreterAuDemontage() {
  useEffect(() => () => arreter(), []);
  return null;
}
