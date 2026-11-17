import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { statut } from '../domain/progress';
import { prochaineSeance } from '../domain/seance';
import type { ModeMotEcrit, StatutItem } from '../domain/types';
import { aAudio, jouer } from '../services/audio';
import {
  autorisationDossier,
  choisirDossier,
  ecrireCopieSecurite,
  lireSauvegarde,
  lireSauvegardeDuDossier,
  listerSauvegardes,
  selecteurDeDossierDisponible,
  telecharger,
  type DossierLike,
} from '../services/backup';
import { intentionDe, inventaireAudio, parcours, tousLesItems } from '../services/content';
import { lireDossier, memoriserDossier, toutEffacer } from '../services/storage';
import { Illustration } from '../ui/Illustration';
import { BoutonImage, BoutonMaintenu } from '../ui/composants';
import { Picto, type NomPicto } from '../ui/pictos';
import { TableauDeBord } from './TableauDeBord';
import type { Ecran } from '../App';

type Onglet = 'tableau' | 'mots' | 'difficultes' | 'suite' | 'sauvegarde' | 'reglages' | 'donnees';

const ONGLETS: { id: Onglet; picto: NomPicto; libelle: string }[] = [
  { id: 'tableau', picto: 'calendrier', libelle: 'Tableau de bord' },
  { id: 'mots', picto: 'bulle', libelle: 'Mots et phrases' },
  { id: 'difficultes', picto: 'interro', libelle: 'À reprendre' },
  { id: 'suite', picto: 'fleche', libelle: 'Prochaines activités' },
  { id: 'sauvegarde', picto: 'disque', libelle: 'Sauvegarde' },
  { id: 'reglages', picto: 'ampoule', libelle: 'Réglages' },
  { id: 'donnees', picto: 'poubelle', libelle: 'Mes données' },
];

const LIBELLE_STATUT: Record<StatutItem, string> = {
  decouverte: 'découverte',
  en_cours: 'en cours',
  installe: 'installé',
  a_revoir: 'à revoir',
};
const LIBELLE_CONFIANCE = { peu_sur: 'peu sûr', assez_sur: 'assez sûr', sur: 'sûr' } as const;

/** Sondes décide d'ouvrir cet espace : un geste maintenu deux secondes. */
function Porte({ onOuvre, aller }: { onOuvre: () => void; aller: (e: Ecran) => void }) {
  useEffect(() => {
    void jouer('aeb/porte-confirmer', { intention: intentionDe('porte-confirmer') });
  }, []);
  return (
    <main className="ecran porte">
      <div className="zone-image">
        <Illustration id="palier-voisine" taille={300} />
      </div>
      <div className="zone-actions">
        <BoutonMaintenu picto="check" nom="Oui, montrer mes progrès" onValide={onOuvre} dataTest="porte-oui" />
        <BoutonImage picto="fleche" voix="lib-non" nom="Non, retour" taille="grand" onClick={() => aller({ nom: 'accueil' })} dataTest="porte-non" />
      </div>
    </main>
  );
}

function Mots() {
  const { etat } = useApp();
  const vus = tousLesItems.filter((i) => etat.items[i.id]?.vu);
  return (
    <section>
      <h2>Mots et phrases rencontrés</h2>
      {vus.length === 0 ? <p>Aucune phrase rencontrée pour l'instant.</p> : null}
      <div className="grille-mots">
        {vus.map((it) => {
          const s = statut(etat.items[it.id]!);
          return (
            <figure key={it.id} className={`mot statut-${s}`}>
              <Illustration id={it.image} taille={120} />
              <figcaption>
                {it.entend}
                <br />
                <small>{LIBELLE_STATUT[s]}</small>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function Difficultes() {
  const { etat } = useApp();
  const liste = tousLesItems.filter((i) => {
    const p = etat.items[i.id];
    return p && p.vu && (statut(p) === 'a_revoir' || p.hesitations >= 2);
  });
  return (
    <section>
      <h2>Phrases à reprendre</h2>
      <p className="note">
        Le système a eu du mal à reconnaître ces phrases ou Sondes a hésité sur leur sens. La reconnaissance vocale transcrit ce qui est dit. Elle ne mesure pas la prononciation et ne permet pas de juger l'accent.
      </p>
      {liste.length === 0 ? <p>Rien à signaler.</p> : null}
      {liste.map((it) => {
        const essais = etat.essais.filter((e) => e.itemId === it.id).slice(-3);
        return (
          <article key={it.id} className="difficulte">
            <h3>{it.entend}</h3>
            <p>Hésitations : {etat.items[it.id]!.hesitations}.</p>
            <ul>
              {essais.map((e) => (
                <li key={e.date}>
                  Compris par le système : « {e.transcription || 'rien'} » (niveau de confiance : {LIBELLE_CONFIANCE[e.confiance]}).
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}

function Suite() {
  const { etat } = useApp();
  const s = etat.profil.decouverteFaite ? prochaineSeance(parcours, etat.seances) : undefined;
  const mission = [...etat.missions].reverse().find((m) => m.ressenti);
  return (
    <section>
      <h2>Prochaines activités conseillées</h2>
      <p>{!etat.profil.decouverteFaite ? 'Faire la séance de découverte.' : s ? `Séance suivante : « ${s.titreInterne} ».` : 'Toutes les séances du parcours sont faites. Revoir les phrases proposées.'}</p>
      <h3>Comment aider sans mettre de pression</h3>
      <ul>
        <li>Rejouer la scène ensemble à voix haute, sans corriger, en laissant Sondes répondre à sa manière.</li>
        <li>Féliciter l'effort plutôt que le résultat, et la laisser recommencer autant qu'elle le souhaite.</li>
        <li>Ne pas poser de questions sur ses scores : l'application n'en affiche pas.</li>
        {mission ? <li>Dernière mission de vie réelle : « {mission.ressenti} » selon Sondes. Proposer d'en reparler seulement si elle en a envie.</li> : null}
      </ul>
    </section>
  );
}

function Sauvegarde() {
  const { etat, remplacerEtat, sauvegarderMaintenant } = useApp();
  const [dossier, setDossier] = useState<FileSystemDirectoryHandle | undefined>();
  const [autorise, setAutorise] = useState(false);
  const [fichiers, setFichiers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [aRestaurer, setARestaurer] = useState<string | undefined>();

  const rafraichir = useCallback(async () => {
    const d = await lireDossier();
    setDossier(d);
    if (d) {
      const ok = await autorisationDossier(d, false);
      setAutorise(ok);
      setFichiers(ok ? await listerSauvegardes(d as unknown as DossierLike) : []);
    }
  }, []);
  useEffect(() => {
    void rafraichir();
  }, [rafraichir]);

  const choisir = async () => {
    const d = await choisirDossier();
    if (!d) return;
    await memoriserDossier(d);
    await autorisationDossier(d, true);
    await rafraichir();
    setMessage(`Dossier choisi : ${d.name}`);
  };
  const reautoriser = async () => {
    if (dossier && (await autorisationDossier(dossier, true))) await rafraichir();
  };
  const sauver = async () => {
    if (dossier && autorise) {
      const ok = await sauvegarderMaintenant();
      await rafraichir();
      setMessage(ok ? 'Sauvegarde écrite dans le dossier.' : 'La sauvegarde dans le dossier a échoué.');
    } else {
      telecharger(etat);
      setMessage('Fichier de sauvegarde téléchargé (dossier non disponible).');
    }
  };
  const restaurer = async (nom: string) => {
    if (!dossier) return;
    try {
      const d = dossier as unknown as DossierLike;
      const nouveau = await lireSauvegardeDuDossier(d, nom);
      await ecrireCopieSecurite(d, etat);
      remplacerEtat(nouveau);
      setARestaurer(undefined);
      setMessage(`Progression restaurée depuis ${nom}. Une copie de l'état précédent a été gardée dans le dossier.`);
      void jouer('aeb/sauvegarde-restauree', { intention: intentionDe('sauvegarde-restauree') });
    } catch {
      setMessage('Ce fichier ne peut pas être lu comme une sauvegarde.');
    }
  };
  const depuisFichier = async (f: File | undefined) => {
    if (!f) return;
    try {
      const nouveau = lireSauvegarde(await f.text());
      if (dossier && autorise) await ecrireCopieSecurite(dossier as unknown as DossierLike, etat);
      else telecharger(etat);
      remplacerEtat(nouveau);
      setMessage('Progression restaurée depuis le fichier choisi.');
      void jouer('aeb/sauvegarde-restauree', { intention: intentionDe('sauvegarde-restauree') });
    } catch {
      setMessage('Ce fichier ne peut pas être lu comme une sauvegarde.');
    }
  };

  return (
    <section>
      <h2>Sauvegarde et restauration</h2>
      <p>
        Les progrès sont enregistrés uniquement sur ce PC. Une sauvegarde est écrite dans le dossier choisi après chaque séance (les dix dernières sont gardées). Aucun enregistrement vocal n'en fait partie.
      </p>
      <p>
        Dernière sauvegarde : {etat.derniereSauvegarde ? new Date(etat.derniereSauvegarde).toLocaleString('fr-FR') : 'aucune'}.
        {etat.derniereSauvegardeEchec ? " La dernière tentative a échoué : autorisez à nouveau l'accès au dossier." : ''}
      </p>
      <p>
        Dossier : {dossier ? dossier.name : 'non choisi'}
        {dossier && !autorise ? ' (accès à autoriser à nouveau)' : ''}
      </p>
      <div className="rangee">
        {selecteurDeDossierDisponible() ? (
          <button type="button" className="btn-texte" onClick={() => void choisir()} data-test="choisir-dossier">
            <Picto nom="dossier" taille={28} /> Choisir le dossier de sauvegarde
          </button>
        ) : (
          <p className="note">Ce navigateur ne permet pas de choisir un dossier. La sauvegarde passera par un téléchargement.</p>
        )}
        {dossier && !autorise ? (
          <button type="button" className="btn-texte" onClick={() => void reautoriser()}>
            Autoriser à nouveau l'accès
          </button>
        ) : null}
        <button type="button" className="btn-texte" onClick={() => void sauver()} data-test="sauver">
          <Picto nom="disque" taille={28} /> Sauvegarder maintenant
        </button>
      </div>

      <h3>Restaurer</h3>
      {fichiers.length > 0 ? (
        <ul className="liste-sauvegardes">
          {fichiers.map((nom) => (
            <li key={nom}>
              {nom}{' '}
              {aRestaurer === nom ? (
                <>
                  <button type="button" className="btn-texte danger" onClick={() => void restaurer(nom)} data-test="confirmer-restauration">
                    Confirmer le remplacement
                  </button>{' '}
                  <button type="button" className="btn-texte" onClick={() => setARestaurer(undefined)}>
                    Annuler
                  </button>
                </>
              ) : (
                <button type="button" className="btn-texte" onClick={() => setARestaurer(nom)}>
                  Restaurer
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="note">Aucune sauvegarde dans le dossier.</p>
      )}
      <label className="btn-texte">
        Restaurer depuis un fichier…
        <input type="file" accept="application/json,.json" hidden onChange={(e) => void depuisFichier(e.target.files?.[0])} data-test="fichier-restauration" />
      </label>
      <p className="note">Avant toute restauration, l'état actuel est copié dans le dossier (fichier « avant-restauration »), puis remplacé.</p>
      {message ? (
        <p role="status" className="message" data-test="message">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function Reglages() {
  const { etat, maj } = useApp();
  const inventaire = inventaireAudio();
  const derja = inventaire.filter((b) => b.langue === 'aeb');
  const fr = inventaire.filter((b) => b.langue === 'fr');
  const manquantsDerja = derja.filter((b) => !aAudio(b.id)).length;
  const manquantsFr = fr.filter((b) => !aAudio(b.id)).length;
  return (
    <section>
      <h2>Réglages</h2>
      <label>
        Mot écrit en appui :{' '}
        <select value={etat.profil.motEcrit} onChange={(e) => maj((s) => ({ ...s, profil: { ...s.profil, motEcrit: e.target.value as ModeMotEcrit } }))} data-test="mot-ecrit-reglage">
          <option value="a_la_demande">à la demande (bouton « voir le mot »)</option>
          <option value="masque">masqué</option>
          <option value="toujours">toujours affiché</option>
        </select>
      </label>
      <p className="note">Le mot écrit n'est jamais nécessaire pour réussir une activité.</p>
      <h3>Voix enregistrées</h3>
      <p>
        Derja : {derja.length - manquantsDerja} sur {derja.length} enregistrements en place. Français : {fr.length - manquantsFr} sur {fr.length}.
      </p>
      <label>
        <input
          type="checkbox"
          checked={etat.profil.afficherBrouillon !== false}
          onChange={(e) => maj((s) => ({ ...s, profil: { ...s.profil, afficherBrouillon: e.target.checked } }))}
          data-test="afficher-brouillon"
        />{' '}
        Afficher ce que dirait une voix en derja qui n'est pas encore enregistrée (à décocher quand Sondes utilise l'application seule)
      </label>
      <p className="note">Tant qu'une voix manque, rien ne se dit à sa place : le derja n'est jamais synthétisé à la volée. Le français passe par la voix du navigateur en attendant.</p>
      <p className="note">Micro : {etat.profil.microIndisponible ? 'un problème a été signalé pendant une séance' : 'aucun problème signalé'}.</p>
    </section>
  );
}

function Donnees() {
  const { etat } = useApp();
  const [fait, setFait] = useState(false);
  return (
    <section>
      <h2>Mes données</h2>
      <p>Les données de Sondes sont stockées uniquement sur ce PC. Rien n'est envoyé à un tiers.</p>
      <button type="button" className="btn-texte" onClick={() => telecharger(etat)} data-test="exporter">
        Exporter une copie (fichier)
      </button>
      <h3>Effacer toutes les données</h3>
      <p className="note">Cette action efface la progression, les réglages et le dossier mémorisé. Elle ne supprime pas les fichiers de sauvegarde déjà présents dans le dossier.</p>
      <p>Maintenir le bouton enfoncé deux secondes, avec Sondes.</p>
      <BoutonMaintenu
        picto="poubelle"
        nom="Effacer toutes les données"
        variante="danger"
        dataTest="effacer"
        onValide={() => {
          void toutEffacer().then(() => {
            setFait(true);
            void jouer('aeb/donnees-effacees', { intention: intentionDe('donnees-effacees') });
            setTimeout(() => window.location.reload(), 1200);
          });
        }}
      />
      {fait ? <p role="status">Données effacées.</p> : null}
    </section>
  );
}

export function Accompagnant({ aller }: { aller: (e: Ecran) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const [onglet, setOnglet] = useState<Onglet>('tableau');
  if (!ouvert) return <Porte onOuvre={() => setOuvert(true)} aller={aller} />;
  return (
    <main className="ecran accompagnant" data-test="espace-accompagnant">
      <header>
        <h1>Espace accompagnante</h1>
        <p className="note">Cet espace reste sur ce PC. Il ne transmet rien à personne et ne sert pas à évaluer Sondes.</p>
        <button type="button" className="btn-texte" onClick={() => aller({ nom: 'accueil' })} data-test="fermer-accompagnant">
          Fermer cet espace
        </button>
      </header>
      <nav className="onglets" aria-label="Rubriques">
        {ONGLETS.map((o) => (
          <button key={o.id} type="button" className={`onglet${o.id === onglet ? ' actif' : ''}`} aria-current={o.id === onglet} onClick={() => setOnglet(o.id)} data-test={`onglet-${o.id}`}>
            <Picto nom={o.picto} taille={28} /> {o.libelle}
          </button>
        ))}
      </nav>
      <div className="panneau">
        {onglet === 'tableau' ? <TableauDeBord /> : null}
        {onglet === 'mots' ? <Mots /> : null}
        {onglet === 'difficultes' ? <Difficultes /> : null}
        {onglet === 'suite' ? <Suite /> : null}
        {onglet === 'sauvegarde' ? <Sauvegarde /> : null}
        {onglet === 'reglages' ? <Reglages /> : null}
        {onglet === 'donnees' ? <Donnees /> : null}
      </div>
    </main>
  );
}

