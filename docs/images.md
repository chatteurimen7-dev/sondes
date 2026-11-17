# Images

Les illustrations actuelles sont des dessins vectoriels originaux et libres de droit, générés par `npm run images:generer` (script `scripts/generer-illustrations.mjs`). Personnages adultes, style plat, aucun texte dans les images. Si un fichier manque, l'application retombe sur un pictogramme de travail.

## Remplacer un pictogramme

Déposer un fichier dans `public/images` avec le nom exact de l'illustration : `salut-matin.png`, `rue-matin.webp`, etc. Formats acceptés : svg, png, jpg, webp. Puis :

```bash
npm run medias:index
npm run build
```

## Comment les illustrations sont produites

- `scripts/generer-illustrations.mjs` dessine les premières illustrations de la situation 1 et fournit les personnages et les objets de base.
- `scripts/generer-scenes.mjs` dessine toutes les autres à partir de `scripts/scenes.json` : un décor, un ou deux personnages adultes, quelques objets (une centaine sont disponibles). Chaque image porte l'identifiant de l'élément ou de la scène qu'elle illustre.
- `npm run images:generer` régénère tout, puis met à jour l'index.

Chaque élément du parcours a sa propre image, et les tests refusent un élément sans illustration. La liste des fichiers est dans `public/images`.

Limite connue : beaucoup d'images partagent la même composition (deux personnages et une bulle). Ce qui les distingue est l'objet dans la bulle. Un illustrateur ferait mieux, et ses images remplaceraient celles-ci une par une.

## Qualités attendues

- Réalistes et sobres, personnages adultes, sans mascotte ni décor enfantin.
- Chaque image doit se distinguer nettement des autres à l'écran : bonjour et bonsoir doivent différer par la lumière, au revoir par la porte ou le départ, merci par l'objet donné.
- Format carré, au moins 600 pixels de côté.
- Style unique pour toute la série.

## Sources possibles

Photos personnelles (avec l'accord des personnes), images libres de droit, ou illustrations créées pour le projet. Le choix et son coût éventuel vous sont présentés avant décision.
