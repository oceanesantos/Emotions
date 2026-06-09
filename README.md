# Anima — Paysage Intérieur

> Une expérience numérique émotionnelle, introspective et créative.

---

## À propos du projet

**Anima** est une application web mobile-first conçue comme un espace émotionnel personnel. Elle permet à l'utilisateur d'explorer, ressentir et exprimer ses émotions à travers une approche artistique et sensorielle — sans chercher à les analyser ou les corriger.

Le projet s'inscrit dans une démarche de *slow digital* : offrir une pause contemplative dans un environnement numérique souvent rapide et surstimulant.

**Public cible :** adolescents et jeunes adultes (15–23 ans), personnes ayant des difficultés à verbaliser leurs émotions (alexithymie), sensibles aux expériences immersives et artistiques.

---

## Structure des fichiers

```
anima/
├── index.html      # Structure HTML complète (onboarding + app)
├── style.css       # Design system sombre, variables CSS, animations
└── script.js       # Logique interactive, canvas, état global
```

---

## Fonctionnalités

### Onboarding — Création de son émotion personnelle

L'onboarding guide l'utilisateur en **5 étapes** avant d'accéder à l'application :

| Étape | Contenu |
|-------|---------|
| **0 — Splash** | Écran d'accueil avec orbe animé rotatif, nom *Anima* et CTA d'entrée |
| **1 — Intention** | Choix d'une intention parmi 3 cartes (mieux se comprendre, s'apaiser, explorer) avec feedback contextuel |
| **2 — Créer son émotion** | Nom libre (champ Fraunces italic), description, sélection jusqu'à 3 couleurs depuis une palette ou via un color picker libre, aperçu orbe animé en temps réel |
| **3 — Dessiner** | Canvas de dessin avec 5 outils (Doux, Marker, Glow, Spray, Gomme), slider de taille, couleurs pré-chargées depuis l'étape 2 |
| **4 — Confirmation** | Orbe final animé, nom et description de l'émotion créée, bouton de lancement |

Chaque étape dispose d'un **bouton retour** et d'une **barre de progression** en haut de l'écran.

---

### Application principale

Une fois l'onboarding terminé, l'utilisateur accède à l'application via une navigation en bas de l'écran (4 onglets).

#### Créer
- Canvas de dessin interactif (520×520px)
- **Mode Dessiner** : 5 types de pinceaux (feutre doux, marker, glow, spray, gomme) + slider de taille
- **Mode Moduler** : blob organique animé, déformable en temps réel au pointeur
- **Mode Galerie** : templates prédéfinis (à développer)
- Sélection d'émotion via chips, color picker, slider d'intensité
- Bloc journal texte libre + bouton de sauvegarde

#### Galerie
- Affiche toutes les créations sauvegardées (image du canvas + émotion + notes + date)
- Stockage persistant via `localStorage`
- Indicateur de notification sur le tab lorsqu'une nouvelle entrée est ajoutée

#### Évolution
- Graphique à barres représentant la fluctuation émotionnelle sur 7 jours
- Couleurs des barres associées aux émotions enregistrées

#### Profil
- Affiche l'émotion personnalisée créée à l'onboarding
- Orbe animé généré depuis la palette choisie

---

## Direction artistique

- **Fond** : `#05060A` — noir profond
- **Typographies** : `Fraunces` (serif italic, titres et noms d'émotions) + `Inter` (corps de texte)
- **Couleurs accent** : spectre violet–violet–cyan, `#c026d3` comme primaire
- **Effets** : gradients radiaux flottants en fond, canvas avec `shadowBlur` pour effets lumineux, orbes générées par `conic-gradient` et animation `requestAnimationFrame`
- **Composants** : glassmorphism léger (`rgba(255,255,255,.06)` + `backdrop-filter`), bords arrondis généreux, border `rgba` à faible opacité

---

## Stack technique

| Élément | Détail |
|---------|--------|
| **Langage** | HTML5, CSS3, JavaScript vanilla (ES6+) |
| **Canvas** | API Canvas 2D native (`PointerEvents`, `requestAnimationFrame`) |
| **Polices** | Google Fonts — Fraunces, Inter |
| **Persistance** | `localStorage` (entrées de galerie) |
| **Dépendances** | Aucune — zéro librairie externe |

---

## Lancer le projet

Aucune installation requise. Ouvrir `index.html` dans un navigateur moderne (Chrome, Firefox, Safari).

```bash
# Optionnel : serveur local pour éviter les restrictions CORS
npx serve .
# ou
python -m http.server 8080
```

> L'application est optimisée pour un viewport mobile (max-width : 430px). Sur desktop, elle s'affiche centrée.

---

## État du projet

Ce projet est un **prototype interactif** réalisé dans le cadre du PFE (Projet de Fin d'Études) Bachelor Webdesign — ICAN.

- [x] Onboarding 5 étapes avec création d'émotion personnalisée
- [x] Canvas de dessin multi-outils
- [x] Blob organique modulable
- [x] Galerie persistante
- [x] Graphique d'évolution
- [x] Profil avec orbe dynamique
- [ ] Animations de transition entre views
- [ ] Sons et retours haptiques
- [ ] Bibliothèque d'émotions culturelles (saudade, mono no aware…)
- [ ] Export / partage des créations
- [ ] Synchronisation multi-appareils

---

## Inspirations

- Interfaces immersives minimalistes et *slow digital*
- Objets décoratifs lumineux (lampes-laves, globes de plasma)
- Expériences numériques contemplatives
- Recherches sur l'alexithymie et l'expression émotionnelle non-verbale

---

*Projet personnel — Océane, ICAN Bachelor Webdesign*
