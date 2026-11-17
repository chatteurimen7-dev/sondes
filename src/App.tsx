import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { jourDe } from './domain/progress';
import { Accompagnant } from './screens/Accompagnant';
import { Accueil } from './screens/Accueil';
import { AtelierSons, Collection, Probleme, Ressenti } from './screens/Autres';
import { Decouverte } from './screens/Decouverte';
import { SeanceEcran } from './screens/SeanceEcran';
import { arreter } from './services/audio';
import { BandeauBrouillon } from './ui/composants';
import { Decor } from './ui/Decor';

export type Ecran =
  | { nom: 'accueil' }
  | { nom: 'decouverte' }
  | { nom: 'seance'; seanceId?: string; revision?: boolean }
  | { nom: 'collection' }
  | { nom: 'sons' }
  | { nom: 'probleme' }
  | { nom: 'ressenti' }
  | { nom: 'accompagnant' };

function Racine() {
  const { etat } = useApp();
  const [ecran, setEcran] = useState<Ecran>(() => {
    const aujourdhui = jourDe(new Date());
    const attente = etat.missions.some((m) => !m.ressenti && jourDe(new Date(m.proposeeLe)) !== aujourdhui);
    return attente ? { nom: 'ressenti' } : { nom: 'accueil' };
  });
  const aller = (e: Ecran) => {
    arreter();
    setEcran(e);
  };
  useEffect(() => () => arreter(), []);

  return (
    <>
      <Decor />
      {ecran.nom === 'accueil' ? <Accueil aller={aller} /> : null}
      {ecran.nom === 'decouverte' ? <Decouverte aller={aller} /> : null}
      {ecran.nom === 'seance' ? <SeanceEcran seanceId={ecran.seanceId} revision={ecran.revision} aller={aller} /> : null}
      {ecran.nom === 'collection' ? <Collection aller={aller} /> : null}
      {ecran.nom === 'sons' ? <AtelierSons aller={aller} /> : null}
      {ecran.nom === 'probleme' ? <Probleme aller={aller} /> : null}
      {ecran.nom === 'ressenti' ? <Ressenti aller={aller} /> : null}
      {ecran.nom === 'accompagnant' ? <Accompagnant aller={aller} /> : null}
      <BandeauBrouillon />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Racine />
    </AppProvider>
  );
}
