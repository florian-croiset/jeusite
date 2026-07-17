# Changelog

Toutes les modifications notables du site Echo sont documentées dans ce fichier.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [3.0] - 2026-07-17

Grand nettoyage et stabilisation du site.

### Ajouté
- Pipeline de build : minification automatique du site (`minify.js`) et déploiement continu de la version minifiée sur GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)

### Supprimé
- Pages et scripts morts : `int.html`, `js/auth.js`, `js/database-complete.js`, `js/utils/countdown.js`, `js/ui/modal.js`
- Système de notifications internes (admin, feedback)
- Tracking individuel (adresse IP, prénom, webhook Discord personnel) — le tracking global est conservé
- Bot Discord (`bot/`), devenu inutilisé, et tables Supabase associées
- Module Actualités (News), jamais utilisé sur le site
- Historique des connexions utilisateurs (`user_login_history`), en base et dans l'admin, jamais exploité
- Table `site_content`, jamais utilisée
- Table `role_changes` et son trigger/fonction associés (`on_role_change`, `log_role_change`)
- Table `tracking_events`, redondante avec `user_sessions`
- Stockage de l'adresse IP dans `user_sessions`, remplacé par un compteur de vues par page (`page_views`)
- Dépendances `docx`/`html2canvas` jamais utilisées dans Echo Docs
- Widget de chat tiers Tawk.to / BotPenguin dans `index.html`, jamais activé (code mort commenté)
- Blocs de code morts et commentaires obsolètes (versions superseded, notes d'édition, bannières redondantes) dans l'ensemble des fichiers JS, CSS et HTML

### Modifié
- Unification de `links.html` sur le système de modale avancée (`modal-advanced.js`)
- Fusion de `ip.html` et `profile.html` dans le panneau de test admin (`test.html`)
- Transformation de `versions.html` en changelog connecté à la base de données (au lieu d'un historique codé en dur)
- Fusion de `track.html` dans `admin.html` (nouvelle section « 📊 Tracking ») pour plus de cohérence et de sécurité
- Activation de la RLS sur `download_settings` (lecture publique, écriture admin uniquement)
- Ajout d'un onglet « 🐙 Stats GitHub » dans l'admin (releases, dernier commit, contributeurs, graphiques de téléchargements)
- Affichage du compteur de téléchargements dans l'admin (vue d'ensemble + colonne par version)

### Corrigé
- Double exécution des tests et listes de tables obsolètes dans `test.html`
- Bug de session admin 2FA qui ne persistait jamais 24h
- Bouton « Archives » cassé dans la gestion des versions (admin)
- Matrice Eisenhower de la roadmap (mauvaise colonne de date)
- Incohérence sur la limite de suggestions roadmap par session
- Double chargement de script sur la page feedback
- Fiabilité de la mise à jour live de version sur la page d'accueil
- Fonctions dupliquées (`showError` admin, notification de clic sur lien externe)
- Bouton « Mode Test » du panneau admin secret
- Commentaire CSS mal fermé dans `lore.css` qui désactivait silencieusement le flou et l'overlay dégradé du fond de la section Lore
- Compteur de téléchargements cassé : la RPC `increment_download_count` référençait une table supprimée et la fonction de tracking n'était jamais chargée sur le site public — les téléchargements réels n'étaient pas comptabilisés
- Double points de suspension animés sur les messages « Chargement... » dans l'admin
- Alignement de la navbar sur `links.html` (marges incohérentes entre les liens)

---

## [2.5] - 2026-03-01

### Ajouté
- Audit de sécurité complet : corrections critiques, sérieuses et mineures sur l'ensemble des fichiers JS et HTML

### Corrigé
- Détection IP : remplacement des services incompatibles HTTPS/CORS par des alternatives fiables
- Bugs mineurs : initialisation EchoDB, double init webhook manager, double notification plein écran

### Modifié
- Ajout du `.gitignore` et nettoyage des fichiers temporaires

## [2.4] - 2026-01-12

### Ajouté
- Refonte complète de la page Diapo : intégration des diaporamas pour les deux soutenances et inversion méthodologie/technique
- Amélioration majeure du Bot Discord : gestion des utilisateurs inactifs, optimisations pour Chrome et amélioration du tracker
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
- Lancement du Bot Discord en version bêta (suivi des vues, stats, actions et téléchargements)
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
- Intégration de Google Tag pour l'analyse d'audience
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
