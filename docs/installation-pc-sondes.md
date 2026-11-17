# Installation et recette sur le PC de Sondes

Tout se fait sur son PC, avec son accord et en sa présence. Les fenêtres de Windows et du navigateur sont écrites : elle ne peut pas les lire, c'est donc l'accompagnante qui les valide.

## État de la configuration

Confirmé (capture « Informations système » du poste de référence, annoncé identique au PC de Sondes) :

- Windows 11 Professionnel, version 10.0.26200.
- HP EliteBook 735 G6, portable.
- AMD Ryzen 3 PRO 3300U, 4 cœurs, 8 Go de mémoire installée (5,9 Go utilisables).

À vérifier sur son PC lui-même :

- navigateur et version (Chrome est annoncé comme fonctionnel) ;
- microphone et sortie audio, autorisation du micro dans Windows (Paramètres, Confidentialité et sécurité, Microphone) ;
- souris, pavé tactile ou écran tactile ;
- Internet à domicile ;
- espace disque libre ;
- session Windows propre à Sondes ;
- dossier Documents synchronisé ou non avec OneDrive.

## Avant l'installation

1. Décider où l'application est hébergée (voir plus bas). Sans hébergement, l'installation en application n'est pas possible : l'accès au micro exige une adresse sécurisée.
2. Avoir remplacé au moins les messages d'accueil par de vrais enregistrements en derja, et les pictogrammes par de vraies illustrations.

## Installation

1. Ouvrir l'adresse de l'application dans Chrome.
2. Installer l'application (icône d'installation dans la barre d'adresse). Une icône apparaît sur le bureau.
3. Autoriser le micro quand le navigateur le demande, de façon permanente.
4. Dans Windows : Paramètres, Confidentialité et sécurité, Microphone : vérifier que l'accès est activé pour les applications de bureau.
5. Régler le volume du PC. Un casque-micro est conseillé : les haut-parleurs reprennent dans le micro et dégradent la reconnaissance.
6. Ouvrir l'espace accompagnante (porte en bas de l'écran d'accueil, bouton maintenu deux secondes), onglet Sauvegarde : choisir un dossier de sauvegarde sur le PC. Préférer un dossier non synchronisé en ligne, puisque les données doivent rester sur ce PC.
7. Dans Réglages, vérifier le mot écrit en appui et l'état des voix enregistrées.

## Recette sur son PC

À jouer sur son ordinateur et pas ailleurs :

- [ ] L'icône du bureau ouvre l'application en plein écran, sans barre d'adresse.
- [ ] Les boutons sont assez grands, les images lisibles à la distance où elle s'assoit.
- [ ] Le son est clair, le volume convient. Les voix derja sont naturelles et comprises par Sondes.
- [ ] La séance 0 se déroule sans aide.
- [ ] Le micro ne s'allume qu'après un appui. La reconnaissance répond (Internet nécessaire).
- [ ] Elle s'écoute, recommence, avance sans l'accompagnante.
- [ ] Une séance complète crée un fichier de sauvegarde dans le dossier choisi.
- [ ] Après avoir fermé puis rouvert l'application, sa progression est toujours là.
- [ ] La restauration depuis un fichier fonctionne (essayer avec une copie, pas avec les vraies données).
- [ ] La porte de l'espace accompagnante ne s'ouvre pas sur un simple appui.
- [ ] Le bouton « J'ai un problème » joue son explication.

## Hébergement

L'application est un site statique : le contenu de `dist/` après `npm run build`. Elle est publiée sur GitHub Pages (HTTPS, nécessaire pour le micro et l'installation) par le workflow `.github/workflows/deploy-pages.yml`, à chaque envoi sur la branche `main`. Le dépôt est public, avec l'accord de Sondes. Seul le code de l'application et les contenus y sont publiés. Les données de Sondes restent sur son PC.

Mise en route, une seule fois :

1. Créer un dépôt public vide sur GitHub (par exemple `sondes`).
2. Envoyer le code : `git remote add origin <adresse du dépôt>` puis `git push -u origin main`.
3. Dans le dépôt : Settings, Pages, Source : « GitHub Actions ».
4. Attendre la fin de l'action « Publication sur GitHub Pages ». L'adresse apparaît dans Settings, Pages (de la forme `https://<compte>.github.io/sondes/`).

## En cas de panne

- Plus de progression visible : ouvrir l'espace accompagnante, Sauvegarde, restaurer le dernier fichier.
- Micro muet : vérifier l'autorisation dans la barre d'adresse du navigateur, puis dans Windows.
- Pas de reconnaissance : vérifier la connexion Internet. Le parcours continue sans micro.
