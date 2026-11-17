import { useMemo } from 'react';
import { useApp } from '../AppContext';
import { calculerParcours, calculerRythme, type SituationParcours, type StatutAffiche, type Tendance } from '../domain/tableauDeBord';
import { atelierSons, parcours } from '../services/content';
import { Illustration } from '../ui/Illustration';
import { Picto } from '../ui/pictos';

const COULEUR_STATUT: Record<StatutAffiche, string> = {
  installe: '#1e9e6a',
  en_cours: '#f5b63d',
  decouverte: '#cdb8f0',
  a_revoir: '#ff7a66',
  non_vu: '#efe3ea',
};
const LIBELLE_STATUT: Record<StatutAffiche, string> = {
  installe: 'elle sait le dire',
  en_cours: 'en cours',
  decouverte: 'découverte',
  a_revoir: 'on y revient',
  non_vu: 'pas encore rencontrée',
};
const TITRES_UNIVERS: Record<string, string> = {
  maison: 'Maison et voisinage',
  courses: 'Courses',
  deplacements: 'Déplacements',
  services: 'Services et démarches',
  echanges: 'Échanges quotidiens',
};
const ORDRE_UNIVERS = ['maison', 'courses', 'deplacements', 'services', 'echanges'];
const ORDRE_LEGENDE: StatutAffiche[] = ['installe', 'en_cours', 'decouverte', 'a_revoir', 'non_vu'];

const PHRASE_TENDANCE: Record<Tendance, string> = {
  plus_longues: 'Les dernières séances sont un peu plus longues que les précédentes.',
  stables: 'La durée des séances est stable.',
  plus_courtes: 'Les dernières séances sont un peu plus courtes que les précédentes. Cela peut vouloir dire que les phrases deviennent familières.',
  insuffisant: "Il faut au moins six séances pour parler d'une évolution.",
};

function Barres({ valeurs, etiquettes, couleur, titre, unite }: { valeurs: number[]; etiquettes: string[]; couleur: string; titre: string; unite: string }) {
  const max = Math.max(1, ...valeurs);
  const l = 40;
  const h = 120;
  const largeur = valeurs.length * l + 10;
  return (
    <figure className="graphique">
      <svg viewBox={`0 0 ${largeur} ${h + 34}`} width="100%" role="img" aria-label={`${titre} : ${valeurs.map((v, i) => `${etiquettes[i]} ${v} ${unite}`).join(', ')}`}>
        <line x1="0" y1={h} x2={largeur} y2={h} stroke="#f0cfd9" strokeWidth="2" />
        {valeurs.map((v, i) => {
          const hauteur = Math.round((v / max) * (h - 18));
          return (
            <g key={i}>
              <rect x={10 + i * l} y={h - hauteur} width={l - 12} height={hauteur} rx="8" fill={v > 0 ? couleur : '#f6e6ee'} />
              {v > 0 ? (
                <text x={10 + i * l + (l - 12) / 2} y={h - hauteur - 5} fontSize="11" textAnchor="middle" fill="#5c1f50">
                  {v}
                </text>
              ) : null}
              <text x={10 + i * l + (l - 12) / 2} y={h + 16} fontSize="10" textAnchor="middle" fill="#7e5a78">
                {etiquettes[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>{titre}</figcaption>
    </figure>
  );
}

function etiquetteSemaine(debut: string): string {
  const [, m, j] = debut.split('-');
  return `${j}/${m}`;
}

function CarteSituation({ s }: { s: SituationParcours }) {
  return (
    <article className="carte-situation">
      <header>
        <h4>{s.titre}</h4>
        <span className="note">
          {s.seancesFaites} séance(s) sur {s.seancesTotal}, {s.minutes} min passées
          {s.dureeIndicativeMinutes ? ` (environ ${s.dureeIndicativeMinutes} min prévues)` : ''}
          {s.aReviser > 0 ? `, ${s.aReviser} à revoir` : ''}
        </span>
      </header>
      <div className="tuiles">
        {s.elements.map((e) => (
          <figure key={e.id} className="tuile" style={{ borderColor: COULEUR_STATUT[e.statut], opacity: e.statut === 'non_vu' ? 0.55 : 1 }} title={`${e.texte} : ${LIBELLE_STATUT[e.statut]}`}>
            <Illustration id={e.image} taille={72} />
            <figcaption>{e.texte}</figcaption>
          </figure>
        ))}
      </div>
      {s.mission ? <p className="note mission-ligne">Mission facultative dans la vie réelle : {s.mission}</p> : null}
    </article>
  );
}

function Parcours() {
  const { etat } = useApp();
  const p = useMemo(() => calculerParcours(etat, parcours), [etat]);
  const atelier = useMemo(() => (atelierSons ? calculerParcours(etat, [atelierSons]) : undefined), [etat]);
  const c = p.competences;
  return (
    <section aria-labelledby="titre-parcours">
      <h2 id="titre-parcours">Son parcours : ce qu'elle apprend, comprend et dit</h2>
      <div className="chiffres">
        <div className="chiffre">
          <strong>{p.rencontrees}</strong>
          <span>phrases rencontrées sur {p.total}</span>
        </div>
        <div className="chiffre">
          <strong>{p.comprises}</strong>
          <span>comprises</span>
        </div>
        <div className="chiffre">
          <strong>{p.dites}</strong>
          <span>dites au moins une fois</span>
        </div>
        <div className="chiffre">
          <strong>{p.installees}</strong>
          <span>qu'elle sait dire avec assurance</span>
        </div>
      </div>

      <div className="competences compact">
        {[
          { picto: 'oreille' as const, nom: 'Écoute', n: c.ecoute },
          { picto: 'ampoule' as const, nom: 'Compréhension', n: c.sens },
          { picto: 'bouche' as const, nom: 'Répétition', n: c.repetition },
          { picto: 'bulle' as const, nom: 'Réponse orale', n: c.production },
        ].map((x) => (
          <div key={x.nom} className="competence">
            <Picto nom={x.picto} taille={40} />
            <strong>{x.nom}</strong>
            <span>{x.n} phrases</span>
          </div>
        ))}
      </div>

      <ul className="legende" aria-label="Légende des contours">
        {ORDRE_LEGENDE.map((s) => (
          <li key={s}>
            <span className="pastille" style={{ background: COULEUR_STATUT[s] }} /> {LIBELLE_STATUT[s]}
          </li>
        ))}
      </ul>

      {ORDRE_UNIVERS.map((u) => {
        const liste = p.situations.filter((x) => x.univers === u);
        if (liste.length === 0) return null;
        return (
          <div key={u} className="univers">
            <h3 className="titre-univers">{TITRES_UNIVERS[u]}</h3>
            {liste.map((s) => (
              <CarteSituation key={s.id} s={s} />
            ))}
          </div>
        );
      })}
      {atelier ? (
        <div className="univers">
          <h3 className="titre-univers">Atelier des sons</h3>
          {atelier.situations.map((s) => (
            <CarteSituation key={s.id} s={s} />
          ))}
        </div>
      ) : null}

      <Barres
        titre="Phrases dites pour la première fois, par semaine"
        unite="nouvelles phrases"
        valeurs={p.nouvellesDitesParSemaine.map((w) => w.n)}
        etiquettes={p.nouvellesDitesParSemaine.map((w) => etiquetteSemaine(w.debut))}
        couleur="#d6457e"
      />

      <h3>Dans la vie réelle</h3>
      {p.missions.proposees === 0 ? (
        <p className="note">Aucune mission de vie réelle proposée pour l'instant.</p>
      ) : (
        <p>
          {p.missions.proposees} mission(s) proposée(s). Ressenti de Sondes : {p.missions.ressentis.facile} facile(s), {p.missions.ressentis.moyen} moyenne(s), {p.missions.ressentis.difficile} difficile(s). Elle choisit
          elle-même d'en parler ou non.
        </p>
      )}
    </section>
  );
}

function Rythme() {
  const { etat } = useApp();
  const r = useMemo(() => calculerRythme(etat), [etat]);
  const maxMinutes = Math.max(1, ...r.jours28.map((j) => j.minutes));
  return (
    <section aria-labelledby="titre-rythme">
      <h2 id="titre-rythme">Son rythme : le temps, la régularité, l'évolution</h2>
      {r.totalSeances === 0 ? (
        <p className="note">Aucune séance pour l'instant.</p>
      ) : (
        <>
          <div className="chiffres">
            <div className="chiffre">
              <strong>{r.joursActifs28}</strong>
              <span>jours de pratique sur les 28 derniers</span>
            </div>
            <div className="chiffre">
              <strong>{r.dureeMoyenneMinutes} min</strong>
              <span>par séance, en moyenne</span>
            </div>
            <div className="chiffre">
              <strong>{r.totalSeances}</strong>
              <span>séances au total</span>
            </div>
            <div className="chiffre">
              <strong>{r.totalMinutes} min</strong>
              <span>de pratique au total</span>
            </div>
          </div>

          <Barres titre="Séances par semaine" unite="séances" valeurs={r.semaines.map((w) => w.seances)} etiquettes={r.semaines.map((w) => etiquetteSemaine(w.debut))} couleur="#1fb5a7" />
          <Barres titre="Minutes de pratique par semaine" unite="minutes" valeurs={r.semaines.map((w) => w.minutes)} etiquettes={r.semaines.map((w) => etiquetteSemaine(w.debut))} couleur="#9d86e0" />

          <h3>Les 28 derniers jours</h3>
          <div className="calendrier28" role="img" aria-label={`${r.joursActifs28} jours de pratique sur 28`}>
            {r.jours28.map((j) => (
              <span
                key={j.jour}
                className="point-jour"
                title={`${j.jour} : ${j.minutes} min`}
                style={{ background: j.minutes > 0 ? `rgba(214,69,126,${0.35 + 0.65 * (j.minutes / maxMinutes)})` : '#f6e6ee' }}
              />
            ))}
          </div>

          <ul className="lecture-rythme">
            <li>{PHRASE_TENDANCE[r.tendance]}</li>
            <li>
              Sur les 14 derniers jours : {r.joursActifs14} jour(s) de pratique.
              {r.plusLongueInterruption28 >= 4 ? ` Plus longue pause récente : ${r.plusLongueInterruption28} jours. Les pauses font partie de l'apprentissage.` : ''}
            </li>
            <li>
              Moments de la journée : {r.moments.matin} le matin, {r.moments.apresMidi} l'après-midi, {r.moments.soir} le soir.
            </li>
          </ul>
        </>
      )}
      <p className="note">
        Le temps de séance est compté de l'ouverture à la fin de la séance et plafonné à 45 minutes. Il n'y a ni objectif ni série à tenir : un rythme régulier, même court, compte plus que de longues séances.
      </p>
    </section>
  );
}

export function TableauDeBord() {
  return (
    <div className="tableau-de-bord">
      <p className="note">
        Ce tableau regarde deux choses séparées : son parcours et son rythme. Il ne note pas Sondes, ne la compare à personne et n'envoie rien à personne. Pour l'aider, regardez ce qui avance, jamais ce qui manque.
      </p>
      <Parcours />
      <hr />
      <Rythme />
    </div>
  );
}
