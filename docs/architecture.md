# Architecture

Application web installable (PWA), sans serveur de données. Tout tourne dans le navigateur du PC de Sondes.

## Piles techniques

React 19, TypeScript, Vite. Tests avec Vitest. Un service worker écrit à la main met en cache ce qui a déjà été chargé, pour que les leçons fonctionnent sans connexion. Pas de dépendance à un service payant.

## Organisation

```
content/                      Contenus pédagogiques, séparés du code
  situations/<nom>/           situation.json (éléments, séances, dialogues, mission) : 19 situations et l'atelier des sons
  situations/saluer/          decouverte.json (séance de découverte)
  interface/interface.json    Messages et libellés d'interface en derja (intentions)
public/
  audio/{fr,aeb}/             Enregistrements (fr : français, aeb : derja tunisien)
  images/                     Illustrations qui remplacent les pictogrammes
  manifest.webmanifest, sw.js
src/
  domain/                     Logique pure, sans navigateur : testable
    types.ts, matching.ts, progress.ts, seance.ts, etat.ts, inventaire.ts, texte.ts, tableauDeBord.ts
  services/                   Accès au navigateur
    storage.ts (IndexedDB), backup.ts, audio.ts, speech.ts, recorder.ts, content.ts
  ui/                         Pictogrammes, boutons, réponse orale
  screens/                    Accueil, Découverte, Séance, Collection, Accompagnant
tests/                        Tests unitaires
scripts/                      Index des médias, fiche d'enregistrement
```

## Principes

- Les contenus ne contiennent pas de code. Ajouter une situation ne demande pas de toucher à `src/` (voir `ajouter-une-situation.md`).
- La logique pédagogique (progression, construction des séances, comparaison de la reconnaissance) est dans `domain/`, sans dépendance au navigateur.
- Les voix sont identifiées par un identifiant qui donne le nom du fichier : `aeb/sens-bonjour` devient `public/audio/aeb/sens-bonjour.mp3`. Si le fichier manque : le français passe par la voix du navigateur, le derja n'est jamais synthétisé.
- Les illustrations suivent la même règle : `public/images/salut-matin.png` remplace le pictogramme du même nom.

## Données de Sondes

Stockées dans IndexedDB sous la clé `etat` (profil, progression par élément, séances, essais, missions). Un essai garde la transcription reconnue et un niveau de confiance, jamais d'audio. L'état porte un numéro de version et `migrer()` le valide à la lecture. Des données illisibles ne sont pas écrasées : elles sont gardées sous une autre clé.

### Progression

Chaque élément suit quatre compétences (écouter, comprendre, répéter, répondre). La boîte de révision espacée (1 à 5) ne bouge que sur le sens et la réponse orale, au plus une fois par jour. Un élément est « installé » après trois jours différents de réussite orale. Les niveaux affichés à l'accompagnante sont : découverte, en cours, installé, à revoir. Aucun score n'est montré à Sondes.

## Reconnaissance vocale

`speech.ts` utilise la reconnaissance du navigateur (Chrome). Elle transcrit. Elle ne mesure pas la prononciation. `matching.ts` compare la transcription aux variantes acceptées et renvoie : compris, proche ou incertain. Le coach montre ce qui a été compris (image et voix du modèle), ne note jamais l'accent. L'évaluation de la prononciation reste à étudier par essais comparatifs, avec l'avis d'une enseignante de FLE, avant tout conseil présenté comme fiable.

## Sauvegarde

`backup.ts` écrit après chaque séance un fichier `sondes-sauvegarde-AAAA-MM-JJ-HHMMSS.json` dans un dossier choisi une fois (File System Access API de Chrome et Edge), et garde les dix derniers. Avant toute restauration, une copie `sondes-avant-restauration-…` de l'état courant est écrite. Si le dossier n'est pas disponible, un téléchargement sert de plan B.

## Tests

`npm test` couvre la comparaison de la reconnaissance, la progression, la construction des séances, la cohérence des contenus, la sauvegarde, la restauration et le stockage. Un parcours complet dans le navigateur (découverte, séance 1, collection, espace accompagnante, sauvegarde) a été joué avec un micro simulé. La recette finale se fait sur le PC de Sondes (voir `installation-pc-sondes.md`).
