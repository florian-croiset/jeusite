# 🌌 Echo – Site Officiel du Jeu (Team Nightberry)

## 📖 Présentation  
**Echo** est un jeu développé par **Team Nightberry**, une équipe composée de cinq étudiants passionnés d’informatique et de création vidéoludique.  
Le site web a été conçu pour servir de **vitrine officielle** du projet : accès à l’équipe, téléchargements, présentation du gameplay, lore du jeu et journal de versions.

---

## 👥 Équipe – Team Nightberry
- **Amaury Giraud-Laforet** – Game Design / UI  
- **Gaspard Sapin** – Programmation / Gestion Web  
- **Florian Croiset** – Pixel Art / Visuels  
- **Éric Sahakian** – Level Design  
- **Jules Cohen** – Conception Sonore  

---

## 🕹️ Fonctionnalités principales du site

### Interface et navigation
- **Design néon sombre** (cyan/violet)
- **Effets dynamiques** : particules, vidéo de fond, transitions au scroll
- **Navbar adaptative** avec réduction au scroll
- **Système de scroll fluide et progressif**
- **Barre de progression horizontale** indiquant la position dans la page

### Page d’accueil
- **Hero section avec vidéo et compte à rebours** vers le lancement de la beta
- **Boutons CTA dynamiques** (« Télécharger » / « Découvrir le gameplay »)
- **Curseur personnalisé interactif**

### Sections dédiées
- **Team Nightberry** : présentation de l’équipe et visuel animé  
- **Télécharger** : bouton désactivé selon la disponibilité du jeu et la taille d’écran (mobile/desktop)  
- **Installation** : guide prévu (install/désinstall)  
- **Gameplay** / **Lore** : rubriques dédiées au jeu et son univers  

### Extras & accessibilité
- **Musique de fond** (lecture/pause via bouton flottant)  
- **Bouton « Remonter en haut »** avec animation fluide  
- **Blocage du clic droit** pour protéger le contenu visuel  
- **Compatibilité mobile complète** grâce à `mobile.css`  
- **Menu burger** pour écrans ≤ 768 px  

---

## 🧩 Fichiers et structure
<pre>
```text
Echo/
│
├── index.html        → page principale du site
├── versions.html     → historique complet des versions
├── style.css         → thème principal (desktop)
├── mobile.css        → thème adapté au mobile
├── anim.mp4          → vidéo d’intro de la hero section
├── arriere.png       → image de fond de la section Team
├── musique.mp3       → musique de fond
└── README.md         → ce fichier
```
</pre>
---

## 🗓️ Historique des versions

| Version | Date | Changements clés |
|----------|------|------------------|
| **1.3** | 9 décembre 2025 | Responsive complet, menu burger, gestion du téléchargement sur mobile |
| **1.2** | 5 décembre 2025 | Effets visuels, musique, modale secrète |
| **1.1** | 2 décembre 2025 | Compte à rebours, bouton « Remonter en haut » |
| **1.0** | 1er décembre 2025 | Version initiale du site Echo |

---

## 🧠 Technologies utilisées
- **HTML5 / CSS3 / JavaScript (ES6)**  
- **Font Awesome 6** (icônes)  
- **Animations CSS & JS** : transitions, défilement, gradients  
- **Intersection Observer API** (apparition des sections au scroll)  

---

## 🔧 À venir  
- Système de **compte utilisateur / sauvegarde de progression**  
- Téléchargement réel du jeu (lien actif lors du lancement bêta)  
- **Pages Gameplay / Lore** détaillées  
- **Animations sonores synchronisées** avec la musique  

---

## 🪪 Licence
© 2025 Team Nightberry – Tous droits réservés.  
Le code du site peut être consulté à des fins éducatives, mais la redistribution ou la copie du design global sans autorisation est interdite.
