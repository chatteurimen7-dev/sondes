import { useApp } from '../AppContext';
import { aRevoir } from '../domain/progress';
import { prochaineSeance } from '../domain/seance';
import { atelierSons, parcours } from '../services/content';
import { jouer } from '../services/audio';
import { Illustration } from '../ui/Illustration';
import { BoutonImage } from '../ui/composants';
import { Picto } from '../ui/pictos';
import type { Ecran } from '../App';

export function Accueil({ aller }: { aller: (e: Ecran) => void }) {
  const { etat } = useApp();
  const suivante = etat.profil.decouverteFaite ? prochaineSeance(parcours, etat.seances) : undefined;
  const scene = !etat.profil.decouverteFaite ? 'salut-matin' : (suivante?.scene ?? 'palier-voisine');
  const dues = aRevoir(etat.items, new Date());

  const commencer = () => {
    if (!etat.profil.decouverteFaite) aller({ nom: 'decouverte' });
    else if (suivante) aller({ nom: 'seance', seanceId: suivante.id });
    else aller({ nom: 'seance', revision: true });
  };

  return (
    <main className="ecran accueil">
      <button
        type="button"
        className="scene-du-jour"
        aria-label="Commencer la séance du jour"
        data-test="commencer"
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') void jouer('aeb/lib-commencer', { intention: 'Nom du bouton : commencer la séance du jour.' });
        }}
        onClick={commencer}
      >
        <Illustration id={scene} taille={420} />
        <span className="lecture" aria-hidden="true">
          <Picto nom="play" taille={72} couleur="#fbf7f0" epaisseur={4} />
        </span>
      </button>

      <nav className="barre-bas" aria-label="Menu">
        <BoutonImage picto="calendrier" voix="lib-collection" nom="Mes images" onClick={() => aller({ nom: 'collection' })} dataTest="collection" />
        {dues.length > 0 && etat.profil.decouverteFaite ? (
          <BoutonImage picto="repeter" voix="lib-revoir" nom="Revoir" onClick={() => aller({ nom: 'seance', revision: true })} dataTest="revoir" />
        ) : null}
        {etat.profil.decouverteFaite && atelierSons ? <BoutonImage picto="bouche" voix="lib-sons" nom="Atelier des sons" onClick={() => aller({ nom: 'sons' })} dataTest="sons" /> : null}
        <BoutonImage picto="interro" voix="lib-probleme" nom="J'ai un problème" onClick={() => aller({ nom: 'probleme' })} dataTest="probleme" />
        <BoutonImage picto="porte" voix="lib-porte" nom="Montrer mes progrès" variante="discret" onClick={() => aller({ nom: 'accompagnant' })} dataTest="porte" />
      </nav>
    </main>
  );
}
