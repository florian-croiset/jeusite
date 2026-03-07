![Version](https://img.shields.io/badge/version-2.5-blue)
![Statut](https://img.shields.io/badge/statut-stable-green)

# 🌌 Echo – Site Officiel du Jeu (Team Nightberry)

## 📖 Présentation

**Echo** est un jeu narratif développé par **Team Nightberry**, un collectif de cinq étudiants passionnés par le game design et les univers immersifs.

Ce site web sert de **vitrine officielle** et de **plateforme de gestion** du projet : présentation de l'équipe, téléchargement du jeu, aperçu du gameplay, du lore, suivi des mises à jour, et désormais une roadmap interactive et un dashboard administrateur.

---

## 👥 Équipe – Team Nightberry

* **Amaury Giraud-Laforet** – Game Design / UI
* **Gaspard Sapin** – Programmation / Gestion Web
* **Florian Croiset** – Pixel Art / Visuels
* **Éric Sahakian** – Level Design
* **Jules Cohen** – Conception Sonore

---

## 🕹️ Fonctionnalités principales du site

### Interface et navigation

* **Design néon sombre** (cyan/violet) avec reflets animés
* **Effets dynamiques** : particules, filaments d'énergie, transitions scrollées
* **Navbar adaptative** (réduction et effet de transparence au scroll)
* **Curseur personnalisé** interactif
* **Barre de progression horizontale** indiquant la position dans la page
* **Scroll fluide** et transitions progressives entre sections
* **Logo animé** (gradient + effet holographique)
* **Soulignement liquide** des liens de navigation

### Page d'accueil (Hero & Interaction)

* **Hero section** avec **vidéo d'intro** (`anim.mp4`)
* **Compte à rebours interactif** vers la bêta avec **icône fusée 🚀** animée
* **Bouton sablier 🕒** pour tester la vitesse (accélération de 10s en mode test)
* **Homogénéisation du compteur** (affichage '0' au lieu de '00' pour plus de clarté)
* **Déblocage automatique du téléchargement** à la fin du compte à rebours
* **CTAs dynamiques** : 「Télécharger」, 「Découvrir le gameplay」
* **Splash screen** : Amélioration visuelle et correction des bugs d'affichage

### Sections dédiées & Contenu

* **Team Nightberry** : présentation visuelle et liens membres (agrandis dans l'en-tête)
* **Télécharger** : gestion dynamique (bouton actif vers `.exe`, redirection ou texte spécifique selon la plateforme/disponibilité) avec **compteur de téléchargements intégré**
* **Gameplay / Lore** : univers détaillé en **4 actes narratifs** (Kaelen : L'Ombre du Soleil)
* **Installation** : tutoriel prévu (install/désinstall du jeu)
* **Historique des versions** : affichage stylisé des changelogs avec **catégories de modifications**, outils de comparaison et modes d'affichage optimisés
* **Roadmap (Nouveau)** : Suivi interactif du développement (version bêta) avec **système de vote** et d'affichage

### Administration et Backend (Nouveau v2.0+)

* **Dashboard Admin** : Gestion complète de la Roadmap (Ajout, Modification, Suppression), activation du téléchargement, gestion des versions et du countdown
* **Système de comptes** : Refonte du back-end avec base de données
* **Page Settings** : Configuration globale du site et du système
* **Bot Discord (Bêta)** : Suivi en temps réel des vues, statistiques, actions et téléchargements
* **Analyse** : Intégration de **Google Tag** pour le suivi d'audience

### Extras et accessibilité

* **Musique de fond** contrôlable (`music.js`) – lecture/pause via bouton flottant ou raccourci clavier `P` (lecture auto après interaction)
* **Menu burger mobile** : fermeture automatique après clic, fermeture au scroll, touche `Échap` ou clic en dehors
* **Bouton "Remonter en haut"** fluide et flottant
* **Blocage du clic droit** pour protéger les visuels
* **Partage intégré** via l'API native (copie du lien + QR Code)
* **Page Design** : Système d'exports (ZIP du projet, PDF de la charte graphique, pack assets), logos, couleurs, sprites, et accès à **Echo Docs**
* **Compatibilité mobile complète** grâce à `responsive.css` & `mobile.css`

---

## 🧩 Structure et organisation du projet

```
Echo/
│
├── index.html
├── executable/
├── assets/
├── css/
├── js/
└── README.md
```

---

## 🗓️ Historique des versions (Complet)

| Version | Date | Changements clés |
| --- | --- | --- |
| **2.5** | 1 mars 2026 | Corrections de sécurité. Corrections bugs mineurs. Amélioration détection IP. Ajout `.gitignore`. Sécurisation formulaires. |
| **2.4** | 12 janv. 2026 | **Refonte page Diapo** (soutenances). Amélioration Bot Discord (stats/inactifs). **Système Feedback**. Accessibilité doc. **Correction bug téléchargement** & RAM. |
| **2.3** | 05 janv. 2026 | **Lancement Roadmap (bêta)** : suivi interactif + vote. Refonte page Versions (catégories/comparaison). **Dashboard Admin**. |
| **2.2** | 04 janv. 2026 | **Bot Discord bêta** (stats/logs). Refonte des sections lore, gameplay et install. Modification groupée (footer). Système de notifications. |
| **2.1** | 03 janv. 2026 | Compteur téléchargement. Refonte `test.html`. Désactivation téléchargement via admin. **Echo Docs**. Liens soutenances. Correction sablier & icônes PDF. |
| **2.0** | 29 déc. 2025 | **Refonte Back-end & BDD**. Dashboard Admin centralisé. Page Settings. Exports ZIP/PDF/Assets. Google Tag. Correction bug musique et splash screen. |
| **1.5** | 16 déc. 2025 | Amélioration menu burger (Échap/Scroll). Ajout pages **Design** et **Liens**. Version mobile de la page versions. |
| **1.4** | 13 déc. 2025 | Favicon 🪶. Bouton Téléchargement vers `.exe`. Sablier test. Raccourci `P`. Modale secrète enrichie. Bouton partage (API/QR). Lore : 4 actes. |
| **1.3** | 09 déc. 2025 | Menu burger mobile. `mobile.css`. Détection auto responsive. Refactor JS. UI optimisée. |
| **1.2** | 05 déc. 2025 | Logo holographique. Effets particules/filaments. Bouton musique. Footer animé. Modale secrète v1. |
| **1.1** | 02 déc. 2025 | Compte à rebours Hero. Bouton Back-to-top. Animations d'apparition. |
| **1.0** | 01 déc. 2025 | Première version publique du site. |

---

## 🧠 Technologies utilisées

* **HTML5 / CSS3 / JavaScript (ES6)**
* **Backend & BDD** : Supabase pour les comptes et la roadmap
* **Font Awesome 6** (icônes et animations)
* **Intersection Observer API** (apparition fluide)
* **Web Share API & Clipboard API** (partage et copie)
* **Google Tag Manager** (Analytique)
* **Discord API** (Bot de tracking)

---

## 🚀 À venir

* **Système de notifications** en temps réel pour les mises à jour
* **Finalisation de la page Design** (sprites et emojis manquants)
* **Amélioration du bot discord**

---

## 🪪 Licence

© 2025-2026 Team Nightberry – Tous droits réservés.

Le code source est consultable à des fins pédagogiques. Toute reproduction du design, des visuels ou des assets sans autorisation est interdite.
