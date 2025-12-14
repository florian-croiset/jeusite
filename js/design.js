document.addEventListener(
    "click",
    function (e) {
        const btn = e.target.closest("#shareBtn");
        if (!btn) return;

        // Bloque TOUT (y compris secretModal)
        e.preventDefault();
        e.stopImmediatePropagation();

        document.getElementById("privateShareModal").classList.add("active");
    },
    true // ← capture = priorité maximale
);


document.addEventListener("DOMContentLoaded", () => {

    const privateModal = document.getElementById("privateShareModal");
    if (!privateModal) return; // sécurité

    const closePrivateBtn = document.getElementById("closePrivateShare");
    const closePrivateX = privateModal.querySelector(".close-modal");

    // Bouton "Compris"
    closePrivateBtn.addEventListener("click", () => {
        privateModal.classList.remove("active");
    });

    // Croix ×
    closePrivateX.addEventListener("click", () => {
        privateModal.classList.remove("active");
    });

    // Clic hors modale
    privateModal.addEventListener("click", (e) => {
        if (e.target === privateModal) {
            privateModal.classList.remove("active");
        }
    });

    // Touche Échap
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            privateModal.classList.remove("active");
        }
    });

});





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
            title: "Logo E Nv Rond",
            desc: "_",
            img: "assets/pngLogoE.png",
            download: "assets/pngLogoE.png",
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
            title: "Logo G Carré",
            desc: "_",
            img: "assets/pngLogoG.png",
            download: "assets/pngLogoG.png",
            zoomable: true
        },

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
            ? `<a href="${item.download}" download target="_blank" class="lienimage copy-btn" style="margin-top:20px;">Télécharger PNG</a>`
            : `<button class="copy-btn">Télécharger PNG</button>`;

        card.innerHTML = `
      ${visual}
      <h3 style="color:var(--primary-light);margin-bottom:1rem;">${item.title}</h3>
      <p style="color:var(--accent); margin-bottom:30px;">${item.desc}</p>
      ${downloadBtn}
    `;

        container.appendChild(card);
    });
});


function copyColor(color, element) {
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
}

function downloadCharter() {
    alert('Téléchargement du kit complet de la charte graphique Echo...');
}
function downloadPDF() {
    alert('Téléchargement du PDF de la charte graphique...');
}
function downloadAssets() {
    alert('Téléchargement du pack d\'assets Echo...');
}

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

