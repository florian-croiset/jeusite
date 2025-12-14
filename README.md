# 🌌 Echo – Site Officiel du Jeu (Team Nightberry)

## 📖 Présentation
**Echo** est un jeu narratif développé par **Team Nightberry**, un collectif de cinq étudiants passionnés par le game design et les univers immersifs.  
Ce site web sert de **vitrine officielle** du projet : présentation de l’équipe, téléchargement du jeu, aperçu du gameplay, du lore et suivi des mises à jour.  

* * *

## 👥 Équipe – Team Nightberry
* **Amaury Giraud-Laforet** – Game Design / UI  
* **Gaspard Sapin** – Programmation / Gestion Web  
* **Florian Croiset** – Pixel Art / Visuels  
* **Éric Sahakian** – Level Design  
* **Jules Cohen** – Conception Sonore  

* * *

## 🕹️ Fonctionnalités principales du site

### Interface et navigation
* **Design néon sombre** (cyan/violet) avec reflets animés  
* **Effets dynamiques** : particules, filaments d’énergie, transitions scrollées  
* **Navbar adaptative** (réduction et effet de transparence au scroll)  
* **Curseur personnalisé** interactif  
* **Barre de progression horizontale** indiquant la position dans la page  
* **Scroll fluide** et transitions progressives entre sections  

### Page d’accueil
* **Hero section** avec **vidéo d’intro** (`anim.mp4`)  
* **Compte à rebours interactif** vers la bêta (mode test accéléré)  
* **Icône fusée 🚀** et **bouton sablier 🕒** pour tester la vitesse  
* **Déblocage automatique du téléchargement** à la fin du compte à rebours  
* **CTAs dynamiques** : 「Télécharger」, 「Découvrir le gameplay」  

### Sections dédiées
* **Team Nightberry** : présentation visuelle et liens membres  
* **Télécharger** : gestion dynamique de la disponibilité selon plateforme  
* **Gameplay / Lore** : univers détaillé en plusieurs actes (nouveau contenu ajouté !)  
* **Installation** : tutoriel prévu (install/désinstall du jeu)  
* **Historique des versions** : affichage stylisé des changelogs  

### Extras et accessibilité
* **Musique de fond** contrôlable (`music.js`) – lecture/pause via bouton flottant ou raccourci `P`  
* **Menu burger mobile** avec fermeture automatique après clic  
* **Bouton “Remonter en haut”** fluide  
* **Blocage du clic droit** pour protéger les visuels  
* **Partage intégré** via l’API native (copie du lien + QR Code)  
* **Compatibilité mobile complète** grâce à `responsive.css` & `mobile.css`  

* * *

## 🧩 Structure et organisation du projet
```
Echo/
│
├── index.html             → page principale (accueil)
├── versions.html          → journal de versions
├── diapo.html             → présentation interactive
│
├── assets/                → fichiers multimédia
│    ├── anim.mp4
│    ├── arriere.png
│    ├── musique.mp3
│    └── favicon.ico
│
├── css/                   → styles découpés par composant
│    ├── main.css
│    ├── layout.css
│    ├── hero.css
│    ├── effects.css
│    ├── modals.css
│    ├── cursor.css
│    ├── colours.css
│    ├── components.css
│    └── responsive.css
│
├── js/
│    ├── main.js
│    ├── ui/
│    │    ├── navbar.js
│    │    ├── buttons.js
│    │    ├── cursor.js
│    │    ├── modal.js
│    │    └── music.js
│    └── utils/
│         ├── countdown.js
│         ├── clipboard.js
│         ├── share.js
│         └── scroll.js
│
└── README.md
```
* * *

## 🗓️ Historique des versions

| Version | Date | Changements clés |
| :-- | :-- | :-- |
| **1.4** | 13 décembre 2025 | Favicon ajouté 🪶 ; bouton Téléchargement actif vers `.exe` ; sablier test compte à rebours ; raccourci `P` musique ; modale secrète enrichie (coller/effacer/entrée/échappement) ; bouton de partage (API + QR Code) ; Lore : 4 actes de l’histoire de Kaelen ; burger auto‑fermant ; performances améliorées mobile/desktop. |
| **1.3** | 9 décembre 2025 | Menu burger mobile ; nouvelle feuille `mobile.css` ; boutons de téléchargement dynamiques ; refactor JS ; détection responsive automatique ; optimisations UI. |
| **1.2** | 5 décembre 2025 | Logo animé holographique ; effets visuels étendus ; bouton musique ; footer animé ; modale secrète (v1). |
| **1.1** | 2 décembre 2025 | Compte à rebours (Hero) ; bouton Back‑to‑top ; meilleures animations d’apparition. |
| **1.0** | 1er décembre 2025 | Première version publique du site. |

* * *

## 🧠 Technologies utilisées
* **HTML5 / CSS3 / JavaScript (ES6)**  
* **Font Awesome 6** (icônes et animations)  
* **Intersection Observer API** (apparition fluide des sections)  
* **Web Share API & Clipboard API** (partage et copie de liens)  
* **Gestion modulaire** du code (UI / Utils séparés)  

* * *

## 🚀 À venir
* **Système de comptes utilisateurs** avec sauvegarde de progression  
* **Téléchargement actif** du jeu complet (bêta prévu courant 2026)  
* **Pages gameplay / lore étendues**, avec intégration sonore dynamique  
* **Effets sonores synchronisés** à la musique et aux transitions visuelles  

* * *

## 🪪 Licence
© 2025 Team Nightberry – Tous droits réservés.  
Le code source est consultable à des fins pédagogiques. Toute reproduction ou réutilisation du **design, visuels ou assets sonores** sans autorisation est strictement interdite.
