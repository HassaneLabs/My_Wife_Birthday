# Pour DANTOU — 7 novembre 2026
Un cadeau de HASSANE : nuit prune, papier ivoire et or doux.
HTML, CSS et JavaScript purs. Aucun framework, npm, compilation ou accès internet.

## Lancer
1. Extraire **tout** le ZIP.
2. Ouvrir le dossier `dantou-anniversaire` dans VS Code.
3. Double-cliquer sur `index.html` pour l'ouvrir dans un navigateur moderne,
   ou clic droit → **Open with Live Server** avec l'extension VS Code Live Server.
Le site fonctionne aussi directement en `file://`. Il n'est pas verrouillé par la date.

## Utiliser
- **Arc** : maintenir et glisser vers la gauche, ajuster la hauteur, relâcher.
  Variante simple : maintenir le bouton environ une seconde puis relâcher.
  Un tir trop faible ou mal orienté peut rater : réessayer.
- **Clavier** : Tab jusqu'à l'arc, maintenir Espace/Entrée et relâcher ;
  flèches haut/bas pour viser. « Ouvrir sans jouer » est également disponible.
- **Lettres** : chaque bouton ouvre/ferme ses 8 musiques. Un seul morceau
  joue à la fois ; fermer sa playlist ou masquer l'onglet le met en pause.
- **Cœurs** : clic, toucher ou Tab puis Entrée/Espace. Le message s'efface
  après environ 5 secondes et un nouveau cœur revient. Bouton pause disponible.

## Modifier
| Élément | Où |
|---|---|
| Prénoms, date, accueil | Les 3 fichiers HTML ; chercher DANTOU / HASSANE et Dantou / Hassane |
| 4 lettres : tendre, drôle, nostalgique, avenir | `lettres.html`, articles `lettre-1` à `lettre-4` |
| 36 pensées des cœurs | Tableau `MESSAGES_AMOUR` en haut de `js/coeurs.js` |
| Couleurs, mise en page | Variables au début de `css/style.css` |
| Titres, artistes, chemins des musiques | **Tableau unique** `window.MUSIQUES` dans `js/musiques.js` |
| Illustration d'Amber | `assets/img/amber.svg` et son `src` dans `index.html` |

### Musiques
Garder exactement **8 entrées** dans `js/musiques.js` : les 4 lettres réutilisent
ce tableau. Les titres fournis sont des emplacements personnalisables.
Ajouter les MP3 dans `assets/audio/` avec les noms indiqués dans
`assets/audio/AJOUTER-LES-MP3.txt`, ou modifier leurs chemins dans le tableau.
Les chemins sont relatifs à `lettres.html`, pas au dossier `js/`.
Recharger après ajout. Un fichier absent ou illisible produit un message explicite.
**Aucun MP3 n'est inclus**, et la lecture n'est jamais automatique.

### Images et polices
Amber est un dessin SVG original et stylisé, inspiré du personnage, non officiel.
Aucune image n'est nécessaire. Pour la remplacer, fournir un SVG/PNG/WebP
transparent, de préférence avec le même cadrage et le bras vers la droite.
Sinon ajuster `.amber-wrap` et `.bow-control` dans le CSS.
Les polices locales sont incluses sous SIL OFL, avec leurs licences dans
`assets/fonts/` : aucun appel à Google Fonts.

## Ce que HASSANE doit fournir
- **8 MP3 utilisables légalement**, avec leurs véritables titres et artistes.
- **Aucune image obligatoire** ; une image personnelle d'Amber est facultative.
Ne publier que des images et musiques dont tu possèdes les droits.

## Arborescence
```text
dantou-anniversaire/
├── index.html, lettres.html, coeurs.html, README.md
├── css/ → style.css, fonts.css
├── js/ → common.js, index.js, lettres.js, musiques.js, coeurs.js
└── assets/
    ├── img/ → amber.svg, constellation.svg, favicon.svg
    ├── audio/ → guide des noms + tes futurs MP3
    └── fonts/ → polices locales + licences
```

## Technique et accessibilité
Pointer Events pour souris/toucher, physique rAF, collisions balayées,
animations CSS, 18/28/38 cœurs selon l'écran et réutilisation des boutons.
Boucles suspendues en onglet masqué ; préférence de mouvements réduits respectée.
Navigation clavier, annonces des messages et focus visibles. Sans suivi ni collecte.
Animations optimisées pour la fluidité ; 60 fps dépend de l'appareil et de sa charge.
Chrome, Edge, Firefox ou Safari récents recommandés.