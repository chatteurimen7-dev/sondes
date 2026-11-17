# Ajouter une situation ou une séance

Tout se passe dans `content/`. Il n'y a pas de code à écrire tant que la situation suit la même forme que la première.

## 1. Les éléments

Dans `content/situations/<situation>/situation.json`, la liste `items` contient chaque phrase à apprendre :

| Champ | Rôle |
|---|---|
| `id` | Identifiant court, sans espace. Il sert aux noms de fichiers audio. |
| `entend` | Ce que Sondes entend de la part de l'interlocuteur. |
| `dit` | Ce qu'elle doit dire en retour. Identique à `entend` quand elle répète la même phrase. |
| `acceptees` | Variantes acceptées par la reconnaissance vocale, en minuscules, sans accents ni ponctuation. Ajoutez les formes plausibles. |
| `image` | Nom de l'illustration (fichier de `public/images` ou pictogramme de travail). |
| `sensIntention` | Intention du message d'explication en derja, rédigée en français pour la locutrice. |

Quand `dit` diffère de `entend` (par exemple « Ça va ? » et « Ça va bien, merci »), deux jeux d'audio sont nécessaires.

## 2. Les séances

La liste `seances` : `id`, `ordre`, `titreInterne`, `scene` (illustration), `items`, `consigneIntention`, `bilanIntention`. Une séance peut avoir une `missionIntention` (mission de vie réelle) et un `dialogue` (tours de la voisine et de Sondes). Chaque séance suit les sept temps automatiquement.

## 3. Les champs de la situation

`id`, `ordre`, `type` (« parcours » ou « sons »), `univers` (maison, courses, deplacements, services, echanges), `titreInterne`, `contexte`, `objectif`, `mission`, `dureeIndicativeMinutes`. Toute situation placée dans `content/situations/<nom>/situation.json` est chargée automatiquement.

Identifiants : ceux des éléments et des séances sont uniques dans toute l'application (préfixez-les par la situation, par exemple `pain-baguette`). Dans un dialogue, le tour d'un interlocuteur peut citer un élément d'une autre situation (par exemple `bonjour`).

Un tour libre de l'interlocuteur s'écrit `{ "qui": "autre", "id": "…", "texte": "…" }`. Il sert aux imprévus, avec une réplique longue ou rapide.

## 4. Vérifier

```bash
npm test               # vérifie que les références existent
npm run audio:fiche    # met à jour la liste des audios à enregistrer
npm run docs:situations # régénère la cartographie et les fiches
```

Il faut aussi une illustration par élément et par scène (voir `docs/images.md`) : les tests le vérifient.

Les tests refusent un élément cité dans une séance qui n'existe pas, et deux audios avec le même identifiant.

## 5. Enregistrer et publier

Voir `enregistrement-audio.md`. Quand de nouveaux fichiers sont en place : `npm run medias:index`, puis `npm run build`.

## Ce qui demande du code

Un nouveau type d'étape (par exemple un exercice de discrimination de sons) s'ajoute dans `src/domain/seance.ts` (construction) et `src/screens/SeanceEcran.tsx` (affichage). Ajouter une deuxième situation au sommaire demande aussi de la charger dans `src/services/content.ts` et de choisir comment l'écran d'accueil l'enchaîne.
