![Statut](https://img.shields.io/badge/statut-stable-green)

# 🌌 Echo – Site Officiel du Jeu (Team Nightberry)

## 📖 Présentation

**Echo** est un jeu narratif développé par **Team Nightberry**, un collectif de cinq étudiants passionnés par le game design et les univers immersifs.

Ce site web sert de **vitrine officielle** du projet : présentation de l'équipe, téléchargement du jeu, aperçu du gameplay et du lore, historique des versions du jeu, et un dashboard administrateur pour l'équipe.

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
* **Effets dynamiques** : particules, filaments d'énergie, transitions au scroll
* **Navbar adaptative** (réduction et effet de transparence au scroll)
* **Curseur personnalisé** interactif
* **Scroll fluide** et transitions progressives entre sections
* **Logo animé** (gradient + effet holographique)

### Page d'accueil

* **Hero section** avec vidéo d'intro
* **Compte à rebours** interactif vers la sortie du jeu
* **Déblocage automatique du téléchargement** à la fin du compte à rebours
* **Présentation de l'équipe**, du gameplay et du lore (4 actes narratifs)
* **Téléchargement** : bouton dynamique vers l'exécutable, avec compteur de téléchargements
* **Formulaire de feedback** (page dédiée `feedback.html`)
* **Historique des versions** du jeu (page dédiée `versions.html`)

### Administration (`admin.html`)

* Authentification via Supabase (rôle `admin` requis)
* Activation/désactivation des téléchargements, gestion des versions et du countdown
* Gestion des utilisateurs et des rôles
* Configuration des notifications Discord (webhooks)

### Extras et accessibilité

* **Musique de fond** contrôlable (lecture/pause via bouton flottant ou raccourci clavier)
* **Raccourcis clavier** (musique, paramètres, plein écran, retour en haut, partage)
* **Panneau de paramètres** : affichage, performance, langue
* **Partage** via l'API native (copie du lien + QR Code)
* **Menu burger mobile** avec fermeture automatique (scroll, `Échap`, clic extérieur)
* **Blocage du clic droit** pour protéger les visuels
* **Compatibilité mobile complète**

### Notifications Discord

Les événements importants (nouveau feedback, téléchargement, refresh distant, fin de compte à rebours) sont envoyés en direct sur Discord via des webhooks, configurables depuis la section "🔗 Webhooks" de l'admin — voir `js/discord-webhook.js`.

---

## 🧩 Structure et organisation du projet

```
Echo/
│
├── index.html, admin.html, feedback.html, versions.html, 404.html   # pages du site (multi-pages, sans routeur)
├── assets/            # images, vidéos, musique, favicon, polices
├── css/                # une feuille de style par page/module
├── js/
│   ├── main.js            # point d'entrée ES module (UI, curseur, navbar, musique...)
│   ├── config/
│   │   └── supabase.js    # client Supabase + API métier (window.EchoDB)
│   ├── database.js         # couche d'accès Supabase (feedback, versions, countdown, auth UI)
│   ├── discord-webhook.js  # notifications envoyées en direct à Discord (webhooks)
│   ├── remote-refresh.js   # commandes de rafraîchissement distant déclenchées depuis l'admin
│   ├── ui/                 # composants d'interface réutilisables (navbar, curseur, musique...)
│   └── utils/               # utilitaires transverses (partage, paramètres, plein écran...)
├── AGENTS.md
└── README.md
```

---

## 🧠 Technologies utilisées

* **HTML5 / CSS3 / JavaScript (ES6)**, site statique multi-pages, sans framework front
* **Supabase** : authentification, base de données Postgres, back-office admin
* **Font Awesome** (icônes, sous-ensemble auto-hébergé)
* **Intersection Observer API** (apparitions fluides au scroll)
* **Web Share API & Clipboard API** (partage et copie de lien)
* **Discord Webhooks** (notifications en direct, sans bot serveur)

---

## 🪪 Licence

© 2025-2026 Team Nightberry – Tous droits réservés.

Le code source est consultable à des fins pédagogiques. Toute reproduction du design, des visuels ou des assets sans autorisation est interdite.
