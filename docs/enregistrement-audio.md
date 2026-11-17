# Enregistrer les voix

La liste complète est dans `docs/fiche-enregistrement.csv` (ouvrable avec un tableur). Elle est générée depuis les contenus : `npm run audio:fiche`.

Pour tout le parcours, la liste compte environ 460 messages en derja et 630 enregistrements en français (chaque phrase est enregistrée à vitesse normale et lentement). C'est beaucoup : enregistrez situation par situation, dans l'ordre du parcours. L'application fonctionne avec ce qui existe déjà. Un message qui manque est simplement signalé à l'accompagnante.

Ordre conseillé : l'interface et la séance de découverte, puis la situation 1 (« saluer »), puis le pain, les prix, et ainsi de suite. La fiche liste les audios dans l'ordre de l'application. Le résumé oral pour l'accompagnante (environ 30 phrases fixes en derja) s'y ajoutera plus tard.

## Option : voix tunisienne de synthèse (Microsoft Azure, ar-TN-ReemNeural)

Faute de locutrice, les messages en derja peuvent être générés avec la voix `ar-TN-ReemNeural` du service Azure AI Speech. Principe :

- Les messages sont synthétisés une seule fois, hors de l'application, puis stockés comme des fichiers audio. L'application n'appelle jamais le service pendant que Sondes l'utilise : aucun coût récurrent, aucun envoi de données.
- Le texte donné à la voix est en écriture arabe, dans `content/derja/textes.json`. Tous les textes sont des brouillons tant qu'une personne qui parle tunisien ne les a pas écoutés.
- La voix est étiquetée tunisienne, mais une voix de synthèse peut mal prononcer un mot de dialecte ou donner un rythme peu naturel. Il faut l'écouter avant de s'y fier.
- `npm run voix:generer` (clé `AZURE_SPEECH_KEY` et région `AZURE_SPEECH_REGION` en variables d'environnement) génère les fichiers manquants. `npm run voix:revue` écrit `docs/revue-voix-derja.html`, une page pour écouter chaque message avec son texte.
- Un premier lot pilote de 19 messages permet de juger la qualité avant de produire le reste.
- Un message jugé peu naturel passe au statut `a_refaire` dans `textes.json` et reste muet en attendant.

## Les deux voix

**Derja tunisien.** Une seule locutrice tunisienne, la même pour tous les messages. Pour chaque ligne, la colonne « intention » dit ce qu'il faut exprimer en français. La locutrice formule la phrase à sa façon, naturellement, et l'enregistre. Elle n'a rien à écrire. Les formulations et le parcours sont relus par elle. Aucune voix de synthèse ne doit remplacer le derja, et une voix d'arabe standard ne doit pas passer pour du tunisien.

Chaque message dure de 5 à 15 secondes et ne porte qu'une idée. Le ton est celui d'une adulte qui parle à une adulte : chaleureux, jamais enfantin.

**Français.** Des voix humaines naturelles. Pour chaque phrase entendue, deux fichiers : vitesse normale et vitesse lente. La version lente est enregistrée lentement, pas ralentie après coup. Deux voix (une femme, un homme) seraient idéales, avec une seule voix pour commencer.

## Prise de son

- Pièce calme, sans ventilateur ni appareil bruyant.
- Téléphone à environ 20 centimètres de la bouche.
- Un fichier par ligne de la fiche, avec une demi-seconde de silence avant et après.
- Format : mp3, wav, ogg ou m4a. Le plus simple est de garder le format du téléphone.

## Nommer les fichiers

Le nom du fichier est l'identifiant de la fiche, avec `/` remplacé par un dossier :

| Identifiant | Fichier |
|---|---|
| `aeb/bienvenue` | `public/audio/aeb/bienvenue.mp3` |
| `aeb/sens-bonjour` | `public/audio/aeb/sens-bonjour.mp3` |
| `fr/bonjour-entend` | `public/audio/fr/bonjour-entend.mp3` |
| `fr/bonjour-entend-lent` | `public/audio/fr/bonjour-entend-lent.mp3` |

Ensuite :

```bash
npm run medias:index   # l'application ne connaît que les fichiers listés dans l'index
npm run audio:fiche    # la colonne « Statut » passe à « enregistré »
npm run build
```

## Ordre conseillé

1. Les messages d'accueil et de la séance 0 (`aeb/bienvenue`, `aeb/rien-n-est-note`, `aeb/test-son`, `aeb/micro-explication`…).
2. Les boutons (`aeb/lib-*`).
3. Les retours rassurants (`aeb/bravo-*`, `aeb/presque`, `aeb/ecoute-encore`).
4. Les séances une à une.

Aucune dépense n'est engagée pour un studio ou une comédienne sans présentation préalable du besoin et du budget. L'enregistrement avec un téléphone par une proche reste l'option gratuite.
