let siteVersion = '2.1 Beta'; // valeur par défaut si la DB est indisponible
try {
    const { data } = await window.EchoDB.supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'site_version')
        .single();

    if (data) siteVersion = data.setting_value;
} catch (error) {
    console.warn('Version par défaut utilisée dans le PDF');
}

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
    if (grid) {
        icons.forEach(({ symbol, label }) => {
            const item = document.createElement("div");
            item.className = "icon-item";

            item.innerHTML = `
      <div class="icon-placeholder">${symbol}</div>
      <p style="color: var(--primary-light); margin-top:0.5rem; font-size:0.9rem;">${label}</p>
    `;

            grid.appendChild(item);
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const uiAssets = [
        { symbol: "📊", title: "Barre de Vie", desc: "HUD Element" },
        { symbol: "🎮", title: "Boutons Menu", desc: "UI Kit complet" },
        { symbol: "💬", title: "Dialogues", desc: "Text boxes" },
        { symbol: "📦", title: "Inventaire", desc: "Grille UI" }
    ];

    const grid = document.getElementById("uiGrid");
    if (grid) {
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
    }
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

        if (item.type === "image") {
            visual = `
                <img src="${item.src}"
                     alt="${item.title}"
                     class="${item.zoomable ? "zoomable" : ""}"
                     style="width:200px;height:200px;object-fit:contain;">
            `;
        }

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


document.addEventListener("DOMContentLoaded", async () => {
    await waitForEchoDB();
    await loadDownloadButtonsState();
});

async function loadDownloadButtonsState() {
    const container = document.getElementById('download-buttons');
    if (!container) return;

    try {
        if (!window.EchoDB || !window.EchoDB.supabase) {
            console.error('EchoDB non disponible');
            container.innerHTML = `
                <button class="download-btn" data-pack="complet" onclick="downloadCharter()">📦 Kit Complet (.zip)</button>
                <button class="download-btn" data-pack="pdf" onclick="downloadPDF()">📄 PDF Charte Graphique</button>
                <button class="download-btn" data-pack="assets" onclick="downloadAssets()">🎨 Assets Pack</button>
            `;
            return;
        }

        const { data, error } = await EchoDB.supabase
            .from('download_packs')
            .select('*')
            .single();

        if (error) {
            console.error('Erreur DB:', error);
            container.innerHTML = `
                <button class="download-btn" data-pack="complet" onclick="downloadCharter()">📦 Kit Complet (.zip)</button>
                <button class="download-btn" data-pack="pdf" onclick="downloadPDF()">📄 PDF Charte Graphique</button>
                <button class="download-btn" data-pack="assets" onclick="downloadAssets()">🎨 Assets Pack</button>
            `;
            return;
        }

        const buttons = [
            {
                id: 'kit',
                enabled: data.complete_kit_enabled,
                icon: '📦',
                text: 'Kit Complet (.zip)',
                onclick: 'downloadCharter()',
                dataPack: 'complet',
                onhover: "filterPack('complet')"
            },
            {
                id: 'pdf',
                enabled: data.pdf_charter_enabled,
                icon: '📄',
                text: 'PDF Charte Graphique',
                onclick: 'downloadPDF()',
                dataPack: 'pdf',
                onhover: "filterPack('pdf')"
            },
            {
                id: 'assets',
                enabled: data.assets_pack_enabled,
                icon: '🎨',
                text: 'Assets Pack',
                onclick: 'downloadAssets()',
                dataPack: 'assets',
                onhover: "filterPack('assets')"
            }
        ];

        container.innerHTML = buttons.map(btn => `
            <button
                class="download-btn"
                onclick="${btn.onclick}"
                data-pack="${btn.dataPack}"
                onmouseenter="${btn.onhover}"
                ${!btn.enabled ? 'disabled' : ''}
            >
                ${btn.icon} ${btn.text}
            </button>
        `).join('');

    } catch (error) {
        console.error('Erreur chargement boutons:', error);
        container.innerHTML = `
            <button class="download-btn" data-pack="complet" onmouseenter="filterPack('complet')" onclick="downloadCharter()">📦 Kit Complet (.zip)</button>
            <button class="download-btn" data-pack="pdf" onmouseenter="filterPack('pdf')" onclick="downloadPDF()">📄 PDF Charte Graphique</button>
            <button class="download-btn" data-pack="assets" onmouseenter="filterPack('assets')" onclick="downloadAssets()">🎨 Assets Pack</button>
        `;
    }
}

function waitForEchoDB() {
    return new Promise((resolve) => {
        if (window.EchoDB && window.EchoDB.supabase) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.EchoDB && window.EchoDB.supabase) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout après 10 secondes pour éviter un blocage indéfini
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('Timeout: EchoDB non chargé après 10s');
                resolve();
            }, 10000);
        }
    });
}

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
        if (typeof window.jspdf === 'undefined') {
            alert('Erreur : Bibliothèque jsPDF non chargée. Veuillez actualiser la page.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        function addCopyright() {
            const copyrightText = "© Team Nightberry";
            const pageHeight = doc.internal.pageSize.height;
            const marginLeft = 10;
            const marginBottom = 10;

            doc.setFontSize(8);
            doc.setTextColor(100);

            const textWidth = doc.getStringUnitWidth(copyrightText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            const startX = (doc.internal.pageSize.width - textWidth) / 2;

            doc.text(copyrightText, startX, pageHeight - marginBottom);
        }
        doc.setProperties({
            title: 'Echo - Charte graphique',
            author: 'Florian Croiset',
            subject: 'Charte graphique de Echo',
            keywords: 'Charte graphique'
        });

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
        doc.setFillColor(...colors.bgDark);
        doc.rect(0, 0, pageWidth, 297, 'F');

        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        doc.setDrawColor(...colors.primaryLight);
        doc.setLineWidth(0.3);
        doc.rect(12, 12, 186, 273);

        doc.setFontSize(72);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('ECHO', pageWidth / 2, 80, { align: 'center' });

        doc.setFontSize(24);
        doc.setTextColor(...colors.primaryLight);
        doc.text('CHARTE GRAPHIQUE', pageWidth / 2, 100, { align: 'center' });

        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(60, 110, 150, 110);

        doc.setFontSize(14);
        doc.setTextColor(...colors.accent);
        doc.text('Guide complet de l\'identité visuelle du jeu', pageWidth / 2, 125, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(...colors.primaryLight);
        doc.text(`Version ${siteVersion}`, pageWidth / 2, 250, { align: 'center' });
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 260, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(...colors.accent);
        const text = 'Par la Team Nightberry';
        const teamText = 'Team Nightberry';
        const linkUrlTeam = "https://www.nightberry.com";

        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const teamTextWidth = doc.getStringUnitWidth(teamText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startXTeam = (pageWidth - textWidth) / 2;
        const startYTeam = 275;

        doc.text('Par la ', startXTeam, startYTeam, { align: 'left' });

        const teamTextStartX = startXTeam + doc.getStringUnitWidth('Par la ') * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.textWithLink(teamText, teamTextStartX, startYTeam, { url: linkUrlTeam });

        // ===== PAGE 2: PALETTE DE COULEURS =====
        doc.addPage();
        yPos = 20;

        doc.setFillColor(...colors.primary);
        doc.rect(0, 10, pageWidth, 15, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('PALETTE DE COULEURS', pageWidth / 2, 19, { align: 'center' });

        yPos = 35;

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

            doc.setFillColor(...color.rgb);
            doc.rect(marginLeft, yPos, 30, 30, 'F');

            doc.setDrawColor(...colors.primaryLight);
            doc.setLineWidth(0.3);
            doc.rect(marginLeft, yPos, 30, 30);

            doc.setFontSize(14);
            doc.setTextColor(...colors.primaryLight);
            doc.setFont('helvetica', 'bold');
            doc.text(color.name, marginLeft + 35, yPos + 8);

            doc.setFontSize(10);
            doc.setTextColor(...colors.accent);
            doc.setFont('helvetica', 'normal');
            doc.text(color.hex, marginLeft + 35, yPos + 15);
            doc.text(`RGB(${color.rgb.join(', ')})`, marginLeft + 35, yPos + 20);

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

            doc.setFontSize(14);
            doc.setTextColor(...colors.primary);
            doc.setFont('helvetica', 'bold');
            doc.text(typo.title, marginLeft, yPos);

            yPos += 15;

            doc.setFont(typo.font, typo.style);
            doc.setFontSize(typo.size);
            doc.setTextColor(...colors.primaryLight);
            doc.text(typo.example, marginLeft, yPos);

            yPos += typo.size / 2 + 5;

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(...colors.accent);
            doc.text(`Police recommandée : ${typo.recommendation}`, marginLeft, yPos);

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

            doc.setFontSize(14);
            doc.setTextColor(...colors.primary);
            doc.setFont('helvetica', 'bold');
            doc.text(guide.title, marginLeft, yPos);
            yPos += 8;

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

        yPos += 10;
        doc.setFontSize(11);
        doc.setTextColor(...colors.accent);
        doc.setFont('helvetica', 'normal');

        const linkUrl = "https://florian-croiset.github.io/jeusite/design.html#telechargement";
        const linkText = "Tous les assets sont disponibles en téléchargement sur le site web dans la section ' ";

        doc.text(linkText, marginLeft, yPos);

        const startX = marginLeft + doc.getStringUnitWidth(linkText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startY = yPos;

        const downloadText = "Téléchargement";
        doc.textWithLink(downloadText, startX, startY, { url: linkUrl });

        const linkTextWidth = doc.getStringUnitWidth(downloadText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.line(startX, startY + 1, startX + linkTextWidth, startY + 1);

        const finalText = " ',";
        const finalTextStartX = startX + doc.getStringUnitWidth(downloadText) * doc.internal.getFontSize() / doc.internal.scaleFactor; doc.text(finalText, finalTextStartX, startY);

        const finalTextt = "  en cliquant sur le bouton \"Assets Pack\" ou en les téléchargeant un par un.";

        yPos += 6;

        doc.text(finalTextt, marginLeft, yPos);

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

        doc.setFontSize(12);
        doc.setTextColor(...colors.accent);

        const fullText = 'Pour toute question : ';
        const teamTextQuestion = 'Team Nightberry';
        const linkUrlQuestion = "https://www.nightberry.com";

        const fullTextWidthQ = doc.getStringUnitWidth(fullText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const teamTextWidthQ = doc.getStringUnitWidth(teamTextQuestion) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startXQ = (pageWidth - (fullTextWidthQ + teamTextWidthQ)) / 2;
        const startYQ = 160;

        doc.text(fullText, startXQ, startYQ, { align: 'left' });

        const teamTextStartXQ = startXQ + fullTextWidthQ;
        doc.textWithLink(teamTextQuestion, teamTextStartXQ, startYQ, { url: linkUrlQuestion });
        const textWidthQ = doc.getStringUnitWidth(teamText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.setLineWidth(0.2);
        doc.line(teamTextStartXQ, startYQ + 1, teamTextStartXQ + textWidthQ, startYQ + 1);

        function addCopyrightt() {
            const copyrightText = "© Team Nightberry";
            const pageHeight = doc.internal.pageSize.height;
            const marginLeft = 10;
            const marginBottom = 15;

            doc.setFontSize(8);
            doc.setTextColor(100);

            const textWidth = doc.getStringUnitWidth(copyrightText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            const startX = (doc.internal.pageSize.width - textWidth) / 2;

            doc.text(copyrightText, startX, pageHeight - marginBottom);
        }
        addCopyrightt();
        doc.save('Echo_Charte_Graphique.pdf');

        document.body.removeChild(loadingMsg);

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

const assetFiles = [
    'assets/favicon.ico',
    'assets/jpgLogoEGA.jpg',
    'assets/mp3musique.mp3',
    'assets/mp4Flamme.mp4',
    'assets/pngArriere.png',
    'assets/pngarrieretrans.png',
    'assets/pngcristal.png',
    'assets/pngDecorPixel.png',
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

window.downloadAssets = async function () {
    try {
        if (typeof JSZip === 'undefined') {
            alert('Erreur : Bibliothèque JSZip non chargée. Veuillez actualiser la page.');
            return;
        }

        const zip = new JSZip();
        let loadedFiles = 0;
        const totalFiles = assetFiles.length;

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

        progressMsg.querySelector('h3').innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i> Génération du fichier ZIP...
        `;

        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Echo_Assets_Pack.zip';
        link.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(progressMsg);

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

// ===== MODALE IMAGE =====
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const captionText = document.getElementById("caption");
    const closeBtn = document.querySelector(".close-modal");

    // Écouteur délégué : fonctionne aussi pour les images ajoutées après coup
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
