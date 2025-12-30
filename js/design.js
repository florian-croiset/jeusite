document.addEventListener("DOMContentLoaded", () => {
    const colors = [
        { name: "Cyan Primaire", hex: "#00d0c6" },
        { name: "Cyan Clair", hex: "#60F4D7" },
        { name: "Turquoise Sombre", hex: "#037778" },
        { name: "Noir Spatial", hex: "#010B19" },
        { name: "Bleu Profond", hex: "#021D27" },
        { name: "Teal Océanique", hex: "#013D46" },
        { name: "Bleu Nuit", hex: "#181B2B" },
        { name: "Turquoise Moyen", hex: "#338A90" },
        { name: "Brun Rouillé", hex: "#4A2D31" }
    ];

    const grid = document.getElementById("colorGrid");
    if (grid) {
        colors.forEach(({ name, hex }) => {
            const card = document.createElement("div");
            card.className = "color-card";

            card.innerHTML = `
      <div class="color-swatch" style="background:${hex}"></div>
      <div class="color-info">
        <div class="color-name">${name}</div>
        <div class="color-hex">${hex}</div>
        <button class="copy-btn">Copier</button>
      </div>
    `;

            card.addEventListener("click", () => copyColor(hex, card));

            grid.appendChild(card);
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const icons = [
        { symbol: "⚡", label: "Énergie" },
        { symbol: "🔫", label: "Arme" },
        { symbol: "🛡️", label: "Bouclier" },
        { symbol: "🗝️", label: "Clé" },
        { symbol: "💊", label: "Soin" },
        { symbol: "🔧", label: "Outils" },
        { symbol: "📡", label: "Scanner" },
        { symbol: "💎", label: "Cristal" }
    ];

    const grid = document.getElementById("iconsGrid");

    icons.forEach(({ symbol, label }) => {
        const item = document.createElement("div");
        item.className = "icon-item";

        item.innerHTML = `
      <div class="icon-placeholder">${symbol}</div>
      <p style="color: var(--primary-light); margin-top:0.5rem; font-size:0.9rem;">${label}</p>
    `;

        grid.appendChild(item);
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const uiAssets = [
        { symbol: "📊", title: "Barre de Vie", desc: "HUD Element" },
        { symbol: "🎮", title: "Boutons Menu", desc: "UI Kit complet" },
        { symbol: "💬", title: "Dialogues", desc: "Text boxes" },
        { symbol: "📦", title: "Inventaire", desc: "Grille UI" }
    ];

    const grid = document.getElementById("uiGrid");

    uiAssets.forEach(({ symbol, title, desc }) => {
        const card = document.createElement("div");
        card.className = "asset-card";

        card.innerHTML = `
      <div class="asset-placeholder">${symbol}</div>
      <div class="asset-title">${title}</div>
      <p style="color: var(--accent); margin-bottom: 1rem;">${desc}</p>
      <button class="copy-btn">Télécharger</button>
    `;

        grid.appendChild(card);
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const sprites = [
        { symbol: "🚀", title: "Vaisseau Principal", desc: "Sprite 32x32 pixels" },
        { symbol: "👾", title: "Ennemi Type A", desc: "Sprite animé 64x64" },
        { symbol: "🤖", title: "Boss Principal", desc: "Sprite 128x128 pixels" },
        { symbol: "🏢", title: "Tileset Station", desc: "16x16 tiles pack" }
    ];

    const grid = document.getElementById("spritesGrid");

    sprites.forEach(({ symbol, title, desc }) => {
        const card = document.createElement("div");
        card.className = "asset-card";

        card.innerHTML = `
      <div class="asset-placeholder">${symbol}</div>
      <div class="asset-title">${title}</div>
      <p style="color: var(--accent); margin-bottom: 1rem;">${desc}</p>
      <button class="copy-btn">Télécharger</button>
    `;

        grid.appendChild(card);
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const sprite = [
        {
            title: "Personnages",
            desc: "_",
            img: "assets/pngSpriteperso.png",
            download: "assets/pngSpriteperso.png",
            zoomable: true
        },
        {
            title: "Torche",
            desc: "_",
            img: "assets/pngTorche.png",
            download: "assets/pngTorche.png",
            zoomable: true
        },
        {
            title: "Cristal",
            desc: "_",
            img: "assets/pngcristal.png",
            download: "assets/pngcristal.png",
            zoomable: true
        }
        /*{
            title: "Logo E An Rond",
            desc: "_",
            img: "assets/pngLogoEP.png",
            download: "assets/pngLogoEP.png",
            zoomable: true
        },
        {
            title: "Logo Team Carré",
            desc: "_",
            img: "assets/pngLogoTeam.png",
            download: "assets/pngLogoTeam.png",
            zoomable: true
        },
        {
            title: "Logo G Carré",
            desc: "_",
            img: "assets/pngLogoG.png",
            download: "assets/pngLogoG.png",
            zoomable: true
        },
        {
            title: "Logo Team Cercle",
            desc: "_",
            img: "assets/pngteamcercle.png",
            download: "assets/pngteamcercle.png",
            zoomable: true
        },
        {
            title: "Logo E nonpixel",
            desc: "_",
            img: "assets/pnglogononpixel.png",
            download: "assets/pnglogononpixel.png",
            zoomable: true
        },
        {
            title: "Logo E cercle blanc",
            desc: "_",
            img: "assets/pnglogoEcercleblanc.png",
            download: "assets/pnglogoEcercleblanc.png",
            zoomable: true
        }
        *//*

        
            {
              title: "Logo Inversé",
              desc: "Pour fonds clairs",
              placeholder: {
                text: "E",
                bg: "white",
                color: "var(--bg-dark)",
                radius: "50%"
              }
            },
            {
              title: "Icône App",
              desc: "Version carrée pour applications",
              placeholder: {
                text: "E",
                bg: "var(--bg-dark)",
                color: "var(--primary)",
                radius: "20px"
              }
            }*/
    ];

    const containes = document.getElementById("spriteShowcase");

    sprite.forEach(item => {
        const card = document.createElement("div");
        card.className = "asset-card";

        let visual = "";

        if (item.img) {
            visual = `
        <img src="${item.img}"
             alt="${item.title}"
             class="${item.zoomable ? "zoomable" : ""} asset-placeholder"
             style="width:200px;height:200px;object-fit:contain;">
      `;
        } else if (item.placeholder) {
            visual = `
        <div class="logo-placeholder"
             style="background:${item.placeholder.bg};
                    color:${item.placeholder.color};
                    border-radius:${item.placeholder.radius};">
          ${item.placeholder.text}
        </div>
      `;
        }

        let downloadBtn = item.download
            ? `<a href="${item.download}" download target="_blank" class="lienimage copy-btn" style="margin-top:20px;">Télécharger l'image</a>`
            : `<button class="copy-btn">Télécharger l'image</button>`;

        card.innerHTML = `
      ${visual}
      <h3 style="color:var(--primary-light);margin-bottom:1rem;">${item.title}</h3>
      <p style="color:var(--accent); margin-bottom:30px;">${item.desc}</p>
      ${downloadBtn}
    `;

        containes.appendChild(card);
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const logos = [
        {
            title: "Favicon",
            desc: "Version carrée 32x32 pixels",
            img: "assets/favicon.ico",
            download: "assets/favicon.ico",
            zoomable: true
        },
        {
            title: "Logo E Nv",
            desc: "_",
            img: "assets/jpgLogoEGA.jpg",
            download: "assets/jpgLogoEGA.jpg",
            zoomable: true
        },
        {
            title: "Logo E An Rond",
            desc: "_",
            img: "assets/pngLogoEP.png",
            download: "assets/pngLogoEP.png",
            zoomable: true
        },
        {
            title: "Logo Team Carré",
            desc: "_",
            img: "assets/pngLogoTeam.png",
            download: "assets/pngLogoTeam.png",
            zoomable: true
        },
        {
            title: "Logo G Carré",
            desc: "_",
            img: "assets/pngLogoG.png",
            download: "assets/pngLogoG.png",
            zoomable: true
        },
        {
            title: "Logo Team Cercle",
            desc: "_",
            img: "assets/pngteamcercle.png",
            download: "assets/pngteamcercle.png",
            zoomable: true
        },
        {
            title: "Logo E nonpixel",
            desc: "_",
            img: "assets/pnglogononpixel.png",
            download: "assets/pnglogononpixel.png",
            zoomable: true
        },
        {
            title: "Logo E cercle",
            desc: "_",
            img: "assets/pnglogoEcercle.png",
            download: "assets/pnglogoEcercle.png",
            zoomable: true
        }
        /*

        
            {
              title: "Logo Inversé",
              desc: "Pour fonds clairs",
              placeholder: {
                text: "E",
                bg: "white",
                color: "var(--bg-dark)",
                radius: "50%"
              }
            },
            {
              title: "Icône App",
              desc: "Version carrée pour applications",
              placeholder: {
                text: "E",
                bg: "var(--bg-dark)",
                color: "var(--primary)",
                radius: "20px"
              }
            }*/
    ];

    const container = document.getElementById("logoShowcase");

    logos.forEach(item => {
        const card = document.createElement("div");
        card.className = "logo-card";

        let visual = "";

        if (item.img) {
            visual = `
        <img src="${item.img}"
             alt="${item.title}"
             class="${item.zoomable ? "zoomable" : ""}"
             style="width:200px;height:200px;object-fit:contain;">
      `;
        } else if (item.placeholder) {
            visual = `
        <div class="logo-placeholder"
             style="background:${item.placeholder.bg};
                    color:${item.placeholder.color};
                    border-radius:${item.placeholder.radius};">
          ${item.placeholder.text}
        </div>
      `;
        }

        let downloadBtn = item.download
            ? `<a href="${item.download}" download target="_blank" class="lienimage copy-btn" style="margin-top:20px;">Télécharger l'image</a>`
            : `<button class="copy-btn">Télécharger l'image</button>`;

        card.innerHTML = `
      ${visual}
      <h3 style="color:var(--primary-light);margin-bottom:1rem;">${item.title}</h3>
      <p style="color:var(--accent); margin-bottom:30px;">${item.desc}</p>
      ${downloadBtn}
    `;

        container.appendChild(card);
    });
});




document.addEventListener("DOMContentLoaded", () => {
    const images = [
        {
            title: "Décor pixel",
            desc: "_",
            img: "assets/pngDecorPixel.png",
            download: "assets/pngDecorPixel.png",
            zoomable: true
        },
        {
            title: "Décor arrière",
            desc: "_",
            img: "assets/pngArriere.png",
            download: "assets/pngArriere.png",
            zoomable: true
        },
        {
            title: "Décor arrière transparent",
            desc: "_",
            img: "assets/pngarrieretrans.png",
            download: "assets/pngarrieretrans.png",
            zoomable: true
        }
        /*{
            title: "Logo E An Rond",
            desc: "_",
            img: "assets/pngLogoEP.png",
            download: "assets/pngLogoEP.png",
            zoomable: true
        },
        {
            title: "Logo Team Carré",
            desc: "_",
            img: "assets/pngLogoTeam.png",
            download: "assets/pngLogoTeam.png",
            zoomable: true
        },
        {
            title: "Logo G Carré",
            desc: "_",
            img: "assets/pngLogoG.png",
            download: "assets/pngLogoG.png",
            zoomable: true
        },
        {
            title: "Logo G Carré",
            desc: "_",
            img: "assets/pngLogoG.png",
            download: "assets/pngLogoG.png",
            zoomable: true
        },*/
    ];

    const containeri = document.getElementById("imageShowcase");

    images.forEach(item => {
        const card = document.createElement("div");
        card.className = "logo-card";

        let visual = "";

        if (item.img) {
            visual = `
        <img src="${item.img}"
             alt="${item.title}"
             class="${item.zoomable ? "zoomable" : ""}"
             style="width:200px;height:200px;object-fit:contain;">
      `;
        } else if (item.placeholder) {
            visual = `
        <div class="logo-placeholder"
             style="background:${item.placeholder.bg};
                    color:${item.placeholder.color};
                    border-radius:${item.placeholder.radius};">
          ${item.placeholder.text}
        </div>
      `;
        }

        let downloadBtn = item.download
            ? `<a href="${item.download}" download target="_blank" class="lienimage copy-btn" style="margin-top:20px;">Télécharger l'image</a>`
            : `<button class="copy-btn">Télécharger l'image</button>`;

        card.innerHTML = `
      ${visual}
      <h3 style="color:var(--primary-light);margin-bottom:1rem;">${item.title}</h3>
      <p style="color:var(--accent); margin-bottom:30px;">${item.desc}</p>
      ${downloadBtn}
    `;

        containeri.appendChild(card);
    });
});





//MEDIAS
document.addEventListener("DOMContentLoaded", () => {

    const medias = [
        {
            type: "image",
            title: "Arrière",
            desc: "_",
            src: "assets/arriere.png",
            download: "assets/arriere.png",
            zoomable: true
        },
        {
            type: "video",
            title: "Arrière Vidéo",
            desc: "Vidéo arrière flamme",
            src: "assets/anim.mp4",
            poster: "assets/arriere.png",
            download: "assets/anim.mp4"
        },
        {
            type: "audio",
            title: "Musique du jeu",
            desc: "Musique principale",
            src: "assets/musique.mp3",
            download: "assets/musique.mp3"
        }
    ];


    const containerm = document.getElementById("mediasShowcase");

    medias.forEach(item => {
        const card = document.createElement("div");
        card.className = "logo-card";

        let visual = "";

        // IMAGE
        if (item.type === "image") {
            visual = `
                <img src="${item.src}"
                     alt="${item.title}"
                     class="${item.zoomable ? "zoomable" : ""}"
                     style="width:200px;height:200px;object-fit:contain;">
            `;
        }

        // VIDEO
        else if (item.type === "video") {
            visual = `
                <video controls
                       poster="${item.poster || ""}"
                       style="width:200px;height:200px;object-fit:contain;">
                    <source src="${item.src}" type="video/mp4">
                    Votre navigateur ne supporte pas la vidéo.
                </video>
            `;
        }

        // AUDIO
        else if (item.type === "audio") {
            visual = `
                <audio controls style="width:200px; margin-top: 70px; margin-bottom: 90px;">
                    <source src="${item.src}" type="audio/mpeg">
                    Votre navigateur ne supporte pas l'audio.
                </audio>
            `;
        }

        const downloadBtn = item.download
            ? `<a href="${item.download}" download class="lienimage copy-btn" style="margin-top:20px;">Télécharger</a>`
            : "";

        card.innerHTML = `
            ${visual}
            <h3 style="color:var(--primary-light);margin-bottom:1rem;">${item.title}</h3>
            <p style="color:var(--accent); margin-bottom:30px;">${item.desc}</p>
            ${downloadBtn}
        `;

        containerm.appendChild(card);
    });
});








window.copyColor = function (color, element) {
    navigator.clipboard.writeText(color).then(() => {
        const btn = element.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copié !';
        btn.style.background = 'var(--primary-light)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'var(--primary)';
        }, 2000);
    });
};

window.downloadPDF = async function () {
    try {
        // Vérifier si jsPDF est disponible
        if (typeof window.jspdf === 'undefined') {
            alert('Erreur : Bibliothèque jsPDF non chargée. Veuillez actualiser la page.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        // Fonction pour ajouter le copyright sur chaque page
        function addCopyright() {
            const copyrightText = "© Team Nightberry";
            const pageHeight = doc.internal.pageSize.height; // Hauteur de la page
            const marginLeft = 10; // Marge à gauche
            const marginBottom = 10; // Marge en bas

            // Définir la taille de la police et la couleur
            doc.setFontSize(8);
            doc.setTextColor(100); // Couleur grise (par exemple)

            // Ajouter le texte de copyright en bas au centre de la page
            const textWidth = doc.getStringUnitWidth(copyrightText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            const startX = (doc.internal.pageSize.width - textWidth) / 2; // Centrer horizontalement

            doc.text(copyrightText, startX, pageHeight - marginBottom);
        }
        doc.setProperties({
            title: 'Echo - Charte graphique',           // Le titre du PDF
            author: 'Florian Croiset',          // L'auteur du PDF
            subject: 'Charte graphique de Echo',        // Sujet du document
            keywords: 'Charte graphique'  // Mots-clés séparés par des virgules
        });
        // Configuration des couleurs Echo
        const colors = {
            primary: [0, 208, 198],
            primaryLight: [96, 244, 215],
            secondary: [3, 119, 120],
            bgDark: [1, 11, 25],
            bgAccent: [1, 61, 70],
            accent: [51, 138, 144]
        };

        let yPos = 20;
        const pageWidth = 210;
        const marginLeft = 20;
        const marginRight = 190;

        // Message de chargement
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(1, 11, 25, 0.95);
            border: 2px solid var(--primary);
            padding: 2rem;
            border-radius: 15px;
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;
        loadingMsg.innerHTML = `
            <h3 style="color: var(--primary); margin-bottom: 1rem;">
                <i class="fa-solid fa-file-pdf fa-beat"></i> Génération du PDF...
            </h3>
            <p style="color: var(--primary-light);">Veuillez patienter</p>
        `;
        document.body.appendChild(loadingMsg);

        // ===== PAGE DE COUVERTURE =====
        // Fond dégradé simulé avec rectangles
        doc.setFillColor(...colors.bgDark);
        doc.rect(0, 0, pageWidth, 297, 'F');

        // Bordure décorative cyan
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        doc.setDrawColor(...colors.primaryLight);
        doc.setLineWidth(0.3);
        doc.rect(12, 12, 186, 273);

        // Logo Echo (grand titre stylisé)
        doc.setFontSize(72);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('ECHO', pageWidth / 2, 80, { align: 'center' });

        // Sous-titre
        doc.setFontSize(24);
        doc.setTextColor(...colors.primaryLight);
        doc.text('CHARTE GRAPHIQUE', pageWidth / 2, 100, { align: 'center' });

        // Ligne décorative
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(60, 110, 150, 110);

        // Description
        doc.setFontSize(14);
        doc.setTextColor(...colors.accent);
        doc.text('Guide complet de l\'identité visuelle du jeu', pageWidth / 2, 125, { align: 'center' });

        // Version et date
        doc.setFontSize(12);
        doc.setTextColor(...colors.primaryLight);
        doc.text('Version 1.5 Beta', pageWidth / 2, 250, { align: 'center' });
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 260, { align: 'center' });

        // Crédit
        // Crédit
        doc.setFontSize(10);
        doc.setTextColor(...colors.accent);
        const text = 'Par la Team Nightberry'; // Texte complet
        const teamText = 'Team Nightberry';   // Partie avec le lien
        const linkUrlTeam = "https://www.nightberry.com"; // Lien du texte "Team Nightberry"

        // Calculer la largeur du texte
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const teamTextWidth = doc.getStringUnitWidth(teamText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startXTeam = (pageWidth - textWidth) / 2;  // Calcul de la position horizontale pour centrer le texte
        const startYTeam = 275;  // Position verticale

        // Ajouter le texte "Par la " (avant "Team Nightberry") sans lien
        doc.text('Par la ', startXTeam, startYTeam, { align: 'left' });

        // Calculer la position de "Team Nightberry" pour l'ajouter avec un lien
        const teamTextStartX = startXTeam + doc.getStringUnitWidth('Par la ') * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.textWithLink(teamText, teamTextStartX, startYTeam, { url: linkUrlTeam });



        // ===== PAGE 2: PALETTE DE COULEURS =====
        doc.addPage();
        yPos = 20;

        // En-tête de section
        doc.setFillColor(...colors.primary);
        doc.rect(0, 10, pageWidth, 15, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('PALETTE DE COULEURS', pageWidth / 2, 19, { align: 'center' });

        yPos = 35;

        // Définir les couleurs
        const colorPalette = [
            { name: "Cyan Primaire", hex: "#00d0c6", rgb: [0, 208, 198], usage: "Couleur principale, CTAs, accents importants" },
            { name: "Cyan Clair", hex: "#60F4D7", rgb: [96, 244, 215], usage: "Textes clairs, hover effects, highlights" },
            { name: "Turquoise Sombre", hex: "#037778", rgb: [3, 119, 120], usage: "Bordures, ombres, éléments secondaires" },
            { name: "Noir Spatial", hex: "#010B19", rgb: [1, 11, 25], usage: "Fond principal, arrière-plans" },
            { name: "Bleu Profond", hex: "#021D27", rgb: [2, 29, 39], usage: "Sections alternées, cards" },
            { name: "Teal Océanique", hex: "#013D46", rgb: [1, 61, 70], usage: "Accents de fond, séparateurs" }
        ];

        colorPalette.forEach((color, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Carré de couleur
            doc.setFillColor(...color.rgb);
            doc.rect(marginLeft, yPos, 30, 30, 'F');

            // Bordure du carré
            doc.setDrawColor(...colors.primaryLight);
            doc.setLineWidth(0.3);
            doc.rect(marginLeft, yPos, 30, 30);

            // Informations
            doc.setFontSize(14);
            doc.setTextColor(...colors.primaryLight);
            doc.setFont('helvetica', 'bold');
            doc.text(color.name, marginLeft + 35, yPos + 8);

            doc.setFontSize(10);
            doc.setTextColor(...colors.accent);
            doc.setFont('helvetica', 'normal');
            doc.text(color.hex, marginLeft + 35, yPos + 15);
            doc.text(`RGB(${color.rgb.join(', ')})`, marginLeft + 35, yPos + 20);

            // Usage
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            const usageLines = doc.splitTextToSize(color.usage, 120);
            doc.text(usageLines, marginLeft + 35, yPos + 26);

            yPos += 40;
        });

        addCopyright();

        // ===== PAGE 3: TYPOGRAPHIE =====
        doc.addPage();
        yPos = 20;

        doc.setFillColor(...colors.primary);
        doc.rect(0, 10, pageWidth, 15, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('TYPOGRAPHIE', pageWidth / 2, 19, { align: 'center' });

        yPos = 40;

        const typoExamples = [
            {
                title: "Titres Principaux",
                font: "helvetica",
                style: "bold",
                size: 32,
                example: "ECHO",
                recommendation: "Orbitron, Exo 2, ou équivalent futuriste"
            },
            {
                title: "Sous-titres",
                font: "helvetica",
                style: "bold",
                size: 20,
                example: "Exploration des Profondeurs",
                recommendation: "Rajdhani, Saira, ou sans-serif moderne"
            },
            {
                title: "Corps de texte",
                font: "helvetica",
                style: "normal",
                size: 12,
                example: "Chaque couloir cache des secrets technologiques...",
                recommendation: "Inter, Roboto, Segoe UI"
            },
            {
                title: "Interface/HUD",
                font: "courier",
                style: "normal",
                size: 11,
                example: "HP: 100/100 | ENERGY: 85%",
                recommendation: "Courier New, Consolas, ou monospace"
            }
        ];

        typoExamples.forEach((typo, index) => {
            if (yPos > 240) {
                addCopyright();
                doc.addPage();
                yPos = 20;
            }

            // Titre de la catégorie
            doc.setFontSize(14);
            doc.setTextColor(...colors.primary);
            doc.setFont('helvetica', 'bold');
            doc.text(typo.title, marginLeft, yPos);

            yPos += 15;

            // Exemple
            doc.setFont(typo.font, typo.style);
            doc.setFontSize(typo.size);
            doc.setTextColor(...colors.primaryLight);
            doc.text(typo.example, marginLeft, yPos);

            yPos += typo.size / 2 + 5;

            // Recommandation
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(...colors.accent);
            doc.text(`Police recommandée : ${typo.recommendation}`, marginLeft, yPos);

            // Ligne de séparation
            doc.setDrawColor(...colors.bgAccent);
            doc.setLineWidth(0.2);
            doc.line(marginLeft, yPos + 3, marginRight, yPos + 3);

            yPos += 15;
        });

        addCopyright();

        // ===== PAGE 4: UTILISATION DES COULEURS =====
        doc.addPage();
        yPos = 20;

        doc.setFillColor(...colors.primary);
        doc.rect(0, 10, pageWidth, 15, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('GUIDE D\'UTILISATION', pageWidth / 2, 19, { align: 'center' });

        yPos = 40;

        const usageGuides = [
            {
                title: "Boutons & CTAs",
                rules: [
                    "• Utiliser Cyan Primaire (#00d0c6) pour les boutons principaux",
                    "• Hover : Cyan Clair (#60F4D7) avec glow effect",
                    "• Bordures arrondies : border-radius de 8-12px",
                    "• Ombre portée : 0 5px 20px rgba(0, 208, 198, 0.4)"
                ]
            },
            {
                title: "Arrière-plans",
                rules: [
                    "• Fond principal : Noir Spatial (#010B19)",
                    "• Cards/Sections : Bleu Profond (#021D27) avec opacité 60%",
                    "• Overlays : rgba(1, 11, 25, 0.95)",
                    "• Gradients : linear-gradient(135deg, primary, secondary)"
                ]
            },
            {
                title: "Textes",
                rules: [
                    "• Titres importants : Cyan Primaire (#00d0c6)",
                    "• Texte principal : Cyan Clair (#60F4D7)",
                    "• Texte secondaire : Turquoise Moyen (#338A90)",
                    "• Texte désactivé : opacity: 0.5"
                ]
            },
            {
                title: "Bordures & Séparateurs",
                rules: [
                    "• Bordures principales : 2px solid #00d0c6",
                    "• Bordures subtiles : 1px solid #037778",
                    "• Glow effect : box-shadow: 0 0 20px rgba(0, 208, 198, 0.3)",
                    "• Séparateurs : height: 1px, background: #013D46"
                ]
            }
        ];

        usageGuides.forEach(guide => {
            if (yPos > 240) {
                addCopyright();
                doc.addPage();
                yPos = 20;
            }

            // Titre
            doc.setFontSize(14);
            doc.setTextColor(...colors.primary);
            doc.setFont('helvetica', 'bold');
            doc.text(guide.title, marginLeft, yPos);
            yPos += 8;

            // Règles
            doc.setFontSize(9);
            doc.setTextColor(...colors.primaryLight);
            doc.setFont('helvetica', 'normal');

            guide.rules.forEach(rule => {
                const lines = doc.splitTextToSize(rule, 160);
                doc.text(lines, marginLeft + 5, yPos);
                yPos += lines.length * 4 + 2;
            });

            yPos += 5;
        });

        addCopyright();

        // ===== PAGE 5: ASSETS & RESSOURCES =====
        doc.addPage();
        yPos = 20;

        doc.setFillColor(...colors.primary);
        doc.rect(0, 10, pageWidth, 15, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('ASSETS & RESSOURCES', pageWidth / 2, 19, { align: 'center' });

        yPos = 40;

        const assetsList = [
            { category: "Logos", items: ["Logo E Nv", "Logo E Nv Rond", "Logo E An Rond", "Logo Team Carré", "Favicon"] },
            { category: "Sprites", items: ["Personnages", "Torche", "Cristal"] },
            { category: "Décors", items: ["Décor pixel", "Décor arrière", "Décor arrière transparent"] },
            { category: "Médias", items: ["Arrière-plan image", "Arrière-plan vidéo", "Musique du jeu"] }
        ];

        assetsList.forEach(asset => {
            if (yPos > 250) {
                addCopyright();
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(...colors.primary);
            doc.setFont('helvetica', 'bold');
            doc.text(asset.category, marginLeft, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setTextColor(...colors.primaryLight);
            doc.setFont('helvetica', 'normal');

            asset.items.forEach(item => {
                doc.text(`• ${item}`, marginLeft + 5, yPos);
                yPos += 5;
            });

            yPos += 5;
        });

        // Note de téléchargement
        yPos += 10;
        doc.setFontSize(11);
        doc.setTextColor(...colors.accent);
        doc.setFont('helvetica', 'normal'); // Utilisation de la police normale sans gras

        // URL de la section 'Téléchargement'
        const linkUrl = "https://florian-croiset.github.io/jeusite/design.html#telechargement"; // Remplace cette URL par celle de ta section 'Téléchargement'

        // Le texte de la note (commenté pour éviter la duplication)
        const linkText = "Tous les assets sont disponibles en téléchargement sur le site web dans la section ' ";

        // Ajouter la première partie du texte (avant "Téléchargement")
        doc.text(linkText, marginLeft, yPos);

        // Calculer où placer "Téléchargement"
        const startX = marginLeft + doc.getStringUnitWidth(linkText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startY = yPos;

        // Ajouter "Téléchargement" avec un lien
        const downloadText = "Téléchargement";
        doc.textWithLink(downloadText, startX, startY, { url: linkUrl });

        // Souligner "Téléchargement"
        const linkTextWidth = doc.getStringUnitWidth(downloadText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.line(startX, startY + 1, startX + linkTextWidth, startY + 1); // Tracer une ligne sous le texte "Téléchargement"


        // Ajouter la fin du texte après "Téléchargement" 
        const finalText = " ',";
        const finalTextStartX = startX + doc.getStringUnitWidth(downloadText) * doc.internal.getFontSize() / doc.internal.scaleFactor; doc.text(finalText, finalTextStartX, startY);
        // Souligner "Téléchargement" 
        //const linkTextWidth = doc.getStringUnitWidth(downloadText) * doc.internal.getFontSize() / doc.internal.scaleFactor; doc.line(startX, startY + 1, startX + linkTextWidth, startY + 1); 

        // Ajouter la fin du texte après "Téléchargement"
        const finalTextt = "  en cliquant sur le bouton \"Assets Pack\" ou en les téléchargeant un par un.";

        // Ajuster yPos pour le saut de ligne et l'espacement
        yPos += 6; // Ajouter un espace avant le texte suivant

        // Ajouter le texte après "Téléchargement"
        const finalTextStartXX = startX + doc.getStringUnitWidth(downloadText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.text(finalTextt, marginLeft, yPos);  // Placer le texte avec un espacement ajusté




        addCopyright();

        // ===== PAGE DE FIN =====
        doc.addPage();

        doc.setFillColor(...colors.bgDark);
        doc.rect(0, 0, pageWidth, 297, 'F');

        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        doc.setFontSize(48);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('ECHO', pageWidth / 2, 120, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(...colors.primaryLight);
        doc.text('Merci d\'utiliser notre charte graphique', pageWidth / 2, 140, { align: 'center' });

        // Pour toute question : Team Nightberry
        doc.setFontSize(12);
        doc.setTextColor(...colors.accent);

        // Texte complet avant "Team Nightberry"
        const fullText = 'Pour toute question : ';
        const teamTextQuestion = 'Team Nightberry';   // Partie avec le lien
        const linkUrlQuestion = "https://www.nightberry.com"; // Lien du texte "Team Nightberry"

        // Calculer la largeur du texte
        const fullTextWidthQ = doc.getStringUnitWidth(fullText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const teamTextWidthQ = doc.getStringUnitWidth(teamTextQuestion) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startXQ = (pageWidth - (fullTextWidthQ + teamTextWidthQ)) / 2;  // Calculer la position horizontale pour centrer le texte
        const startYQ = 160;  // Position verticale

        // Ajouter le texte "Pour toute question : " sans lien
        doc.text(fullText, startXQ, startYQ, { align: 'left' });

        // Calculer la position de "Team Nightberry" pour l'ajouter avec un lien
        const teamTextStartXQ = startXQ + fullTextWidthQ;
        doc.textWithLink(teamTextQuestion, teamTextStartXQ, startYQ, { url: linkUrlQuestion });
        // Souligner "Team Nightberry"
        const textWidthQ = doc.getStringUnitWidth(teamText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.setLineWidth(0.2);  // Définir la largeur de la ligne (plus fin)
        doc.line(teamTextStartXQ, startYQ + 1, teamTextStartXQ + textWidthQ, startYQ + 1);  // Tracer une ligne sous le texte

        // Fonction pour ajouter le copyright sur chaque page
        function addCopyrightt() {
            const copyrightText = "© Team Nightberry";
            const pageHeight = doc.internal.pageSize.height; // Hauteur de la page
            const marginLeft = 10; // Marge à gauche
            const marginBottom = 15; // Marge en bas

            // Définir la taille de la police et la couleur
            doc.setFontSize(8);
            doc.setTextColor(100); // Couleur grise (par exemple)

            // Ajouter le texte de copyright en bas au centre de la page
            const textWidth = doc.getStringUnitWidth(copyrightText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            const startX = (doc.internal.pageSize.width - textWidth) / 2; // Centrer horizontalement

            doc.text(copyrightText, startX, pageHeight - marginBottom);
        }
        addCopyrightt();
        // Sauvegarder le PDF
        doc.save('Echo_Charte_Graphique.pdf');

        // Retirer le message de chargement
        document.body.removeChild(loadingMsg);

        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.style.cssText = loadingMsg.style.cssText;
        successMsg.innerHTML = `
            <h3 style="color: var(--primary);">
                <i class="fa-solid fa-check-circle"></i> PDF généré avec succès !
            </h3>
            <p style="color: var(--primary-light); margin-top: 1rem;">
                Charte graphique Echo téléchargée
            </p>
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Une erreur est survenue lors de la génération du PDF. Vérifiez la console pour plus de détails.');
    }
};



// Ajouter cette fonction dans design.js

// Liste de tous vos fichiers assets (à mettre à jour selon votre dossier)
const assetFiles = [
    'assets/favicon.ico',
    'assets/jpgLogoEGA.jpg',
    'assets/mp3musique.mp3',
    'assets/mp4Flamme.mp4',
    'assets/pngArriere.png',
    'assets/pngarrieretrans.png',
    'assets/pngcristal.png',
    'assets/pngDecorPixel.png',
    //'assets/pngLogoE.png',
    'assets/pngLogoEA.png',
    'assets/pngLogoEC.png',
    'assets/pngLogoEP.png',
    'assets/pnglogoEcercle.png',
    'assets/pnglogononpixel.png',
    'assets/pngLogoG.png',
    'assets/pngLogoTeam.png',
    'assets/pngQRCode.png',
    'assets/pngSpriteperso.png',
    'assets/pngLogoTeam.png',
    'assets/pngteamcercle.png',
    'assets/pngTorche.png',
    'assets/svgQRCode.svg'
];

// Exposer la fonction globalement pour l'utiliser avec onclick
window.downloadAssets = async function () {
    try {
        // Vérifier si JSZip est disponible
        if (typeof JSZip === 'undefined') {
            alert('Erreur : Bibliothèque JSZip non chargée. Veuillez actualiser la page.');
            return;
        }

        // Afficher un message de chargement
        const zip = new JSZip();
        let loadedFiles = 0;
        const totalFiles = assetFiles.length;

        // Message de progression
        const progressMsg = document.createElement('div');
        progressMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(1, 11, 25, 0.95);
            border: 2px solid var(--primary);
            padding: 2rem;
            border-radius: 15px;
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;
        progressMsg.innerHTML = `
            <h3 style="color: var(--primary); margin-bottom: 1rem;">
                <i class="fa-solid fa-spinner fa-spin"></i> Préparation du ZIP...
            </h3>
            <p style="color: var(--primary-light);">
                <span id="zipProgress">0</span> / ${totalFiles} fichiers
            </p>
        `;
        document.body.appendChild(progressMsg);

        // Télécharger et ajouter chaque fichier au ZIP
        for (const filePath of assetFiles) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    console.warn(`Fichier non trouvé : ${filePath}`);
                    continue;
                }

                const blob = await response.blob();
                const fileName = filePath.split('/').pop();
                zip.file(fileName, blob);

                loadedFiles++;
                document.getElementById('zipProgress').textContent = loadedFiles;
            } catch (error) {
                console.error(`Erreur lors du chargement de ${filePath}:`, error);
            }
        }

        // Générer le ZIP
        progressMsg.querySelector('h3').innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i> Génération du fichier ZIP...
        `;

        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        // Créer le lien de téléchargement
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Echo_Assets_Pack.zip';
        link.click();

        // Nettoyer
        URL.revokeObjectURL(url);
        document.body.removeChild(progressMsg);

        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.style.cssText = progressMsg.style.cssText;
        successMsg.innerHTML = `
            <h3 style="color: var(--primary);">
                <i class="fa-solid fa-check-circle"></i> Téléchargement réussi !
            </h3>
            <p style="color: var(--primary-light); margin-top: 1rem;">
                ${loadedFiles} fichiers inclus dans le pack
            </p>
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (error) {
        console.error('Erreur lors de la création du ZIP:', error);
        alert('Une erreur est survenue lors de la création du pack Assets. Vérifiez la console pour plus de détails.');
    }
};




// Remplacer l'ancienne fonction downloadAssets
// (elle sera appelée automatiquement via onclick dans le HTML)

// === MODALE IMAGE ===
const modall = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const captionText = document.getElementById('caption');
const closeBtn = document.querySelector('.close-modal');

// Ajouter le comportement SEULEMENT sur certaines images si tu veux
document.querySelectorAll('img.zoomable').forEach(img => {
    img.style.cursor = "zoom-in";
    img.addEventListener('click', (e) => {
        modall.classList.add('active');
        modalImg.src = img.src;
        captionText.textContent = img.alt || "Image agrandie";
    });
});

function closeModal() {
    modall.classList.remove('active');
}

closeBtn.addEventListener('click', closeModal);
modall.addEventListener('click', (e) => { if (e.target === modall) closeModal(); });
window.addEventListener('keydown', (e) => { if (e.key === "Escape") closeModal(); });





document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const captionText = document.getElementById("caption");
    const closeBtn = document.querySelector(".close-modal");

    // écouteurs sur les images (fonctionne aussi si elles arrivent après)
    document.body.addEventListener("click", e => {
        const img = e.target.closest("img.zoomable");
        if (!img) return;
        modal.classList.add("active");
        modalImg.src = img.src;
        captionText.textContent = img.alt || "";
    });

    function closeModal() {
        modal.classList.remove("active");
    }

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    window.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
});
