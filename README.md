# Sondes

Application personnelle qui aide Sondes à comprendre et à parler français dans la vie de tous les jours. Elle s'installe sur son PC, fonctionne avec la voix et les images, et ne demande jamais de lire ni de taper au clavier.

L'application porte le prénom de Sondes.

## État actuel

L'application contient le parcours complet de vie quotidienne, organisé en cinq univers :

- Maison et voisinage : se présenter et saluer (situation 1, avec séance de découverte), parler avec un voisin, demander un petit service.
- Courses : acheter du pain, demander un prix, acheter des fruits et légumes, payer à la caisse.
- Déplacements : prendre le bus, acheter un ticket, demander son chemin, se repérer à la gare.
- Services et démarches : aller à la pharmacie, prendre un rendez-vous, demander un renseignement, aller à la poste.
- Échanges quotidiens : faire répéter, expliquer qu'on ne comprend pas, comprendre une conversation, répondre au téléphone.

Cela fait 19 situations et 169 phrases, plus un atelier des sons de cinq séances. Chaque situation suit le même modèle : des séances « écouter, comprendre et dire » en sept temps (consigne en derja, scène illustrée, phrase française, sens, répétition, réponse orale, retour rassurant), une simulation orale, une variante avec imprévu et une mission facultative dans la vie réelle.

À côté du parcours :

- une collection d'images pour retrouver ce qu'elle a appris, et des révisions espacées ;
- un espace accompagnante local avec un tableau de bord à deux volets (son parcours par univers et par situation, son rythme : séances par semaine, temps de pratique, régularité, évolution), les mots, les phrases à reprendre, les prochaines activités, la sauvegarde et la restauration, les réglages et l'effacement des données ;
- une sauvegarde automatique après chaque séance dans un dossier du PC.

La cartographie des situations est dans `docs/cartographie-situations.md`, une fiche détaillée par situation dans `docs/situations/`.

Pas encore faits : le résumé oral en derja pour l'accompagnante, l'évaluation de la prononciation, les situations « comprendre une consigne », « échanger avec un professionnel » et « démarche administrative ».

## Ce qui reste provisoire

- Aucune voix en derja n'existe encore. L'application ne la synthétise jamais : elle affiche à l'accompagnante ce que la voix dirait (bandeau « Brouillon »), qui disparaît dès que des enregistrements derja sont en place. Les intentions des messages sont à faire formuler et valider par une locutrice tunisienne.
- Le français est dit par la voix du navigateur en attendant des enregistrements humains.
- Les illustrations sont des dessins vectoriels originaux, libres de droit, générés par `npm run images:generer`. Elles se remplacent une à une (voir `docs/images.md`).
- Les phrases et les dialogues doivent être relus par une personne qui enseigne le français à des adultes.

## Commandes

```bash
npm install          # une fois
npm run dev          # développement, http://localhost:5173
npm run build        # vérification des types puis construction dans dist/
npm run preview      # sert dist/ sur http://localhost:4173
npm test             # tests unitaires et de cohérence des contenus
npm run audio:fiche  # écrit docs/fiche-enregistrement.csv
npm run docs:situations # écrit la cartographie et les fiches de situation
npm run images:generer  # redessine toutes les illustrations
npm run medias:index # met à jour les index des audios et des images
```

## Documentation

- `docs/architecture.md` : organisation du code et choix techniques.
- `docs/ajouter-une-situation.md` : ajouter une situation ou une séance.
- `docs/enregistrement-audio.md` : enregistrer et nommer les voix.
- `docs/images.md` : remplacer les pictogrammes par de vraies illustrations.
- `docs/installation-pc-sondes.md` : installation et recette sur son PC.
- `docs/fiche-enregistrement.csv` : liste des audios à enregistrer, générée depuis les contenus.
- `docs/cartographie-situations.md` et `docs/situations/` : cartographie et fiches pédagogiques, générées depuis les contenus.
- `docs/visuel-application.png` : visuel de l'application.

## Confidentialité

- Le micro ne s'active qu'après un appui sur un bouton.
- Aucun enregistrement n'est conservé. La voix de Sondes reste en mémoire le temps de la séance pour qu'elle puisse s'écouter.
- Avec Chrome, la reconnaissance vocale envoie le son à un service en ligne pendant l'écoute. Sondes doit en être informée par un message audio avant la première utilisation (message `micro-explication`).
- La progression est stockée uniquement dans le navigateur de son PC. Rien n'est envoyé ailleurs.
- La sauvegarde est un fichier JSON local, sans audio. L'effacement des données est possible depuis l'espace accompagnante.
