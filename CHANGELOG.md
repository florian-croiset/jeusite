# Changelog

Toutes les modifications notables du site Echo sont documentées dans ce fichier.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [3.1] - 2026-09-19

Nettoyage post-projet : le développement (et la soutenance EPITA) étant terminés, retrait des pages et outils qui ne servaient qu'à l'équipe pendant le développement.

### Supprimé
- Pages devenues inutiles maintenant que le projet est terminé : `design.html` (kit médias/couleurs/logo), `doc.html` (éditeur Markdown → PDF), `diapo.html` (visionneuse Canva de soutenance), `liens.html` et `links.html` (liens internes équipe / linktree de soutenance), `roadmap.html` (plus de mises à jour prévues, donc plus de vote/suggestions publiques)
- `mentions-legales.html`, jamais liée depuis aucune page du site (orpheline) — retirée avec le reste plutôt que reliée
- JS/CSS/police exclusifs à ces pages : `js/design.js`, `js/doc.js`, `js/liens.js`, `js/zip.js`, `css/design.css`, `css/doc.css`, `Silkscreen-Bold.ttf`
- 19 fichiers `assets/` devenus orphelins (pack médias de `design.html`), ~17 Mo, dont `pngarrieretrans.webp` qui était déjà orphelin avant ce nettoyage
- Entrées mortes correspondantes dans la liste de vérification de fichiers de `test.html`
- Gestion de la Roadmap côté admin (`admin.html`) : sidebar "🗺️ Roadmap"/"💡 Suggestions Roadmap", section, modal, et tout le JS associé — le projet ne recevant plus de mises à jour, plus rien à planifier ni à voter
- Rôle `collaborator` (n'existait que pour l'accès à la Roadmap) : sélecteurs de rôle, badge, logique de connexion dédiée dans `admin.html`, retiré aussi de `js/database.js` (lien "Dashboard" du menu utilisateur public) — vérifié qu'aucun utilisateur n'avait ce rôle avant suppression
- Tables Supabase `roadmap_items`, `roadmap_suggestions`, `roadmap_votes` (14 + 11 + 7 lignes), sauvegardées dans `roadmap-backup-2026-09-19.txt` avant suppression
- CSS mort associé (`.role-collaborator`, `.roadmap-drop-col`, `.roadmap-drag-card`) dans `css/admin.css`
- Modale "code secret" (`js/modal-advanced.js`, 801 lignes) : mécanisme d'accès admin alternatif, désormais inutile
- `js/utils/clipboard.js`, redondant avec `modal-advanced.js`
- Personnalisation des raccourcis clavier (`js/utils/settings.js`) : onglet dédié, capture de touche, persistance — les raccourcis par défaut eux-mêmes restent fonctionnels (demande explicite : garder les raccourcis, retirer seulement leur remapping)
- Résidus CSS de la modale secrète oubliés hors du bloc inline d'`index.html` : `.btn-paste` (`css/components.css`), `#secretInput`/`.input-paste-container` (`css/modals.css`)
- Résidus CSS du remapping de raccourcis clavier : `.shortcuts-desc`, `.shortcuts-list`, `.shortcut-item`, `.shortcut-info`, `.shortcut-input`, `.capturing` + variantes responsive (`css/settings.css`)
- Types de notification `new_version` et `error` dans `js/discord-webhook.js`, jamais appelés par aucun code (code mort préexistant)
- Assets non utilisés (~13 Mo) : versions non compressées de fichiers déjà présents en version optimisée (`anim.mp4`, `arriere.png`, `mp3musique.mp3`, `musique.mp3`, `pngArriere.png`), jamais chargées par aucune page
- Dossier `docs/` (rapports de soutenance EPITA, ~39 Mo), archivé ailleurs, retiré du dépôt
- Section admin "🔧 Gestion des téléchargements" (sidebar "📥 Téléchargements") : pilotait des toggles (Kit Complet, PDF Charte Graphique, Assets Pack) pour les exports de `design.html`, supprimée avec cette page — plus aucune page ne consommait ces réglages. Table Supabase `download_packs` supprimée (aucune FK/trigger externe), CSS mort associé (`.download-controls`, `.control-item`, `.switch-label`, `.control-text`) retiré de `css/admin.css`
- Carte "Refresh" de la vue d'ensemble admin : doublon inerte (un `<p>` affichant du texte brut `await forceRefreshAllClients(...)`, jamais exécuté) de la vraie carte "🔄 Forcer le rechargement des clients" juste en dessous

### Sécurité
- Webhook Discord du formulaire de feedback (`feedback.html`), auparavant codé en dur et exposé publiquement dans `js/database.js`, régénéré et déplacé dans `webhook_settings` (même pattern que `main_webhook`/`twofa_webhook`/`refresh_webhook`)
- Ajout de Subresource Integrity (`integrity`/`crossorigin`) sur toutes les ressources chargées depuis un CDN (Font Awesome, marked.js, SDK Supabase) suite à une alerte CodeQL (`js/functionality-from-untrusted-source`) ; SDK Supabase épinglé à une version exacte (`2.116.0`) au passage, une version flottante (`@2`) étant incompatible avec SRI

### Modifié
- `js/utils/settings.js`, `js/utils/share.js`, `js/ui/music.js` : nettoyage de code, fonctionnalités conservées intactes
- `install.css`, `lore.css`, `gameplay.css` (chargées uniquement par `index.html`, toujours ensemble) fusionnées dans la chaîne `@import` de `css/style.css` au lieu d'être des `<link>` séparés — réduit le nombre de requêtes CSS sans changer l'ordre de cascade (déjà inliné en un seul fichier au build par `minify.js`/clean-css)
- `css/fontawesome-subset.css` fusionné dans la même chaîne `@import` : `index.html` ne charge plus qu'un seul fichier CSS local en prod (contre 5 avant)
- `404.html` : ses 7 `<link>` CSS individuels (URLs absolues) remplacés par un unique `css/error.css`, qui `@import` uniquement le sous-ensemble nécessaire — au passage, `responsive.css` repassé en dernier import (il était chargé en premier, ce qui pouvait faire perdre ses surcharges face aux règles de base à spécificité égale)
- Ordre des `@import` de `css/style.css` : `screen.css` (styles du splash screen, premier écran visible) passé en tête de chaîne au lieu de 10ᵉ/14
- CSS critique du splash screen (fond + positionnement de `#splash-screen`) dupliqué en inline dans le `<head>` d'`index.html`, pour s'appliquer sans attendre le chargement réseau de `style.css` et éviter un flash blanc au premier paint — les règles réelles de `style.css` prennent le relais automatiquement une fois chargées (même sélecteur, définies après)
- README.md et AGENTS.md réécrits pour refléter l'état actuel du projet (sans historique de versions dans le README)
- `minify.js` retire désormais `console.log`/`console.debug`/`console.info` du bundle livré (`console.error`/`console.warn` conservés) — sources non modifiées, dev inchangé
- `assets/favicon.ico` reconstruit en `.ico` multi-résolution (16/32/48, compression PNG) au lieu d'une unique image 256×256 non compressée : 57,1 Ko → 7,8 Ko (-86 %), aucune autre page ne référençant une résolution plus grande

### Notes
- `vercel.json` et `.github/workflows/deploy.yml` conservés tels quels : les deux pipelines de déploiement sont utilisés
- La contrainte `CHECK` sur `profiles.role` autorise encore les valeurs `collaborator` et `team` (jamais vue utilisée) — non modifiée, seule la couche applicative a été nettoyée
- Le bouton "sablier" (test du countdown accéléré) vivait dans la modale secrète supprimée et n'est plus accessible nulle part ; son code dans `js/ui/buttons.js` est laissé tel quel (inerte, protégé par un `if`) pour faciliter une restauration si redemandé

## [3.0] - 2026-07-17

Grand nettoyage et stabilisation du site.

### Ajouté
- Pipeline de build : minification automatique du site (`minify.js`) et déploiement continu de la version minifiée sur GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)

### Supprimé
- Pages et scripts morts : `int.html`, `js/auth.js`, `js/database-complete.js`, `js/utils/countdown.js`, `js/ui/modal.js`
- Système de notifications internes (admin, feedback)
- Bot Discord (`bot/`), devenu inutilisé, et tables Supabase associées
- Module Actualités (News), jamais utilisé sur le site
- Historique des connexions utilisateurs (`user_login_history`), en base et dans l'admin, jamais exploité
- Table `site_content`, jamais utilisée
- Table `role_changes` et son trigger/fonction associés (`on_role_change`, `log_role_change`)
- Dépendances `docx`/`html2canvas` jamais utilisées dans Echo Docs
- Widget de chat tiers Tawk.to / BotPenguin dans `index.html`, jamais activé (code mort commenté)
- Blocs de code morts et commentaires obsolètes (versions superseded, notes d'édition, bannières redondantes) dans l'ensemble des fichiers JS, CSS et HTML

### Modifié
- Unification de `links.html` sur le système de modale avancée (`modal-advanced.js`)
- Fusion des anciennes pages de diagnostic dans le panneau de test admin (`test.html`)
- Transformation de `versions.html` en changelog connecté à la base de données (au lieu d'un historique codé en dur)
- Fusion de `track.html` dans `admin.html` pour plus de cohérence et de sécurité
- Activation de la RLS sur `download_settings` (lecture publique, écriture admin uniquement)
- Ajout d'un onglet « 🐙 Stats GitHub » dans l'admin (releases, dernier commit, contributeurs, graphiques de téléchargements)
- Affichage du compteur de téléchargements dans l'admin (vue d'ensemble + colonne par version)

### Corrigé
- Double exécution des tests et listes de tables obsolètes dans `test.html`
- Bouton « Archives » cassé dans la gestion des versions (admin)
- Matrice Eisenhower de la roadmap (mauvaise colonne de date)
- Incohérence sur la limite de suggestions roadmap par session
- Double chargement de script sur la page feedback
- Fiabilité de la mise à jour live de version sur la page d'accueil
- Fonctions dupliquées (`showError` admin, notification de clic sur lien externe)
- Bouton « Mode Test » du panneau admin secret
- Commentaire CSS mal fermé dans `lore.css` qui désactivait silencieusement le flou et l'overlay dégradé du fond de la section Lore
- Compteur de téléchargements cassé : la RPC `increment_download_count` référençait une table supprimée et la fonction de comptage n'était jamais chargée sur le site public — les téléchargements réels n'étaient pas comptabilisés
- Double points de suspension animés sur les messages « Chargement... » dans l'admin
- Alignement de la navbar sur `links.html` (marges incohérentes entre les liens)

---

## [2.5] - 2026-03-01

### Ajouté
- Audit de sécurité complet : corrections critiques, sérieuses et mineures sur l'ensemble des fichiers JS et HTML

### Corrigé
- Bugs mineurs : initialisation EchoDB, double init webhook manager, double notification plein écran

### Modifié
- Ajout du `.gitignore` et nettoyage des fichiers temporaires

## [2.4] - 2026-01-12

### Ajouté
- Refonte complète de la page Diapo : intégration des diaporamas pour les deux soutenances et inversion méthodologie/technique
- Amélioration majeure du Bot Discord : gestion des utilisateurs inactifs, optimisations pour Chrome
- Système de Feedback : création du module de retour utilisateur et intégration
- Gestion des notifications : possibilité de désactiver les notifications depuis l'admin et ajout des alertes de nouvelle version
- Mise à jour de la documentation (`doc.html`) : personnalisation des couleurs pour l'accessibilité et ajout d'images

### Modifié
- Ajustement des prérequis techniques : modification de la RAM nécessaire pour le jeu
- Amélioration des modales et corrections typographiques dans la section Design

### Corrigé
- Bugs critiques : bouton de téléchargement, affichage de la version sur l'index (section install) et stabilité du formulaire
- Nettoyage de l'interface : suppression des notifications musicales inutiles et correction du bug de sortie (exit)

## [2.3] - 2026-01-05

### Ajouté
- Lancement de la page Roadmap (version bêta) : suivi interactif du développement avec système de vote et d'affichage
- Refonte de la page Versions : ajout des catégories de modifications, outils de comparaison et nouveaux modes d'affichage
- Dashboard Admin : intégration complète de la gestion de la Roadmap (Ajout, Modification, Suppression)

### Modifié
- Optimisation de l'interface utilisateur pour la navigation entre les différentes versions et la roadmap

## [2.2] - 2026-01-04

### Ajouté
- Lancement du Bot Discord en version bêta
- Modification groupée du site (version dans le footer) : mises à jour de l'interface admin et des pages
- Système de notifications (en cours de développement)

### Modifié
- Optimisations globales de l'affichage des pages

## [2.1] - 2026-01-03

### Ajouté
- Compteur de téléchargement et correction du bouton associé
- Refonte complète de la page de test (`test.html`) et modifications du panel admin
- Possibilité de désactiver le téléchargement depuis la section Design (+ ajout de Echo Docs)
- Création de liens spécifiques pour les soutenances

### Modifié
- Amélioration et correction du mode sablier (liens et logique de fonctionnement)
- Mise à jour visuelle des sections : Télécharger, Gameplay et Lore
- Homogénéisation de l'affichage du compteur sablier (« 0 » au lieu de « 00 »)

### Corrigé
- Icône FontAwesome pour les PDF (affichait une icône PNG)
- Corrections générales sur le système de settings et la stabilité du téléchargement

## [2.0] - 2025-12-29

### Ajouté
- Refonte complète du back-end et création de la base de données avec système de comptes
- Dashboard Admin : gestion centralisée (activation téléchargement, versions, countdown, infos)
- Page Settings pour la configuration globale
- Système d'exports sur la page Design : téléchargement du ZIP, PDF charte graphique et pack assets
- Exécutable et fonctions de téléchargement associées
- Préparation des formulaires reliés à la base de données (non implémentés)

### Corrigé
- Bug sur le bouton musique et résolution des problèmes d'import (`design.js`)
- Erreurs et bugs sur le splash screen

### Modifié
- Amélioration visuelle du splash screen et optimisation de la structure `index.html`

## [1.5] - 2025-12-16

### Ajouté
- Page Design avec logos, couleurs, sprites, emojis… (page non terminée)
- Page Liens pour un accès facile aux ressources externes

### Modifié
- Amélioration du menu burger : fermeture au scroll, touche Échap, clic en dehors
- Ajout de la version mobile sur la page Versions du site web

### Corrigé
- Bugs mineurs pour améliorer la stabilité

## [1.4] - 2025-12-13

### Ajouté
- Favicon 🪶
- Bouton « Télécharger » redirigeant vers le fichier exécutable
- Bouton sablier 🕒 pour accélérer le compte à rebours (10 s en mode test)
- Déblocage automatique du téléchargement à la fin du compte à rebours
- Raccourci clavier P pour lecture / pause musique 🎵
- Bouton flottant de partage 🔗 (API native + QR Code + copie du lien)
- Section « Lore » complétée : présentation + 4 actes narratifs (Kaelen : L'Ombre du Soleil)

### Modifié
- Icône fusée 🚀 animée dans le titre du compte à rebours
- Modale d'accès secret améliorée : coller 📋, effacer ❌, Entrée = valider / Échap = fermer
- Fermeture automatique du menu burger après clic sur un lien
- Améliorations visuelles et interface plus fluide sur mobile et desktop

## [1.3] - 2025-12-09

### Ajouté
- Menu burger pour mobile 📱
- Feuille de style mobile (`mobile.css`)
- Détection automatique des appareils (`window.innerWidth <= 768px`)

### Modifié
- Boutons « Télécharger » adaptés au mobile (non cliquables + texte spécifique)
- Texte et icônes du bouton Télécharger améliorés (selon disponibilité)
- Code JS du bouton refactorisé et plus lisible
- Ré-adaptation au redimensionnement de la fenêtre
- Lien « Team Nightberry » plus grand dans l'en-tête
- Structure de navigation simplifiée et plus claire

### Corrigé
- Mise à jour générale du script pour plus de stabilité et compatibilité

## [1.2] - 2025-12-05

### Ajouté
- Bouton musique 🎵 / ⏸️ flottant + lecture automatique après interaction
- Fenêtre modale d'accès secret (stylisée)

### Modifié
- Logo animé (gradient + effet holographique)
- Barre de navigation adoucie au scroll
- Particules et filaments d'énergie dans le fond
- Soulignement liquide des liens
- Texte de version animé dans le footer

## [1.1] - 2025-12-02

### Ajouté
- Système de compte à rebours (Hero)
- Bouton « Remonter en haut » flottant

### Modifié
- Optimisations de scroll et animations des sections

## [1.0] - 2025-12-01

### Ajouté
- Première mise en ligne du site Echo
- Sections Team, Gameplay, Lore, Téléchargement
- Design principal dark / néon cyan-violet
