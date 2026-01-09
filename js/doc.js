const markdownInput = document.getElementById('markdownInput');
const preview = document.getElementById('preview');
const loadingModal = document.getElementById('loadingModal');
const loadingText = document.getElementById('loadingText');

// Palette de couleurs
const colorPalette = [
    { name: "Cyan Primaire", hex: "#00d0c6", rgb: [0, 208, 198] },
    { name: "Cyan Clair", hex: "#60F4D7", rgb: [96, 244, 215] },
    { name: "Turquoise Sombre", hex: "#037778", rgb: [3, 119, 120] },
    { name: "Noir Spatial", hex: "#010B19", rgb: [1, 11, 25] },
    { name: "Bleu Profond", hex: "#021D27", rgb: [2, 29, 39] },
    { name: "Teal Océanique", hex: "#013D46", rgb: [1, 61, 70] },
    { name: "Bleu Nuit", hex: "#181B2B", rgb: [24, 27, 43] },
    { name: "Turquoise Moyen", hex: "#338A90", rgb: [51, 138, 144] },
    { name: "Brun Rouillé", hex: "#4A2D31", rgb: [74, 45, 49] }
];

// Couleurs par défaut
const defaultColors = {
    toc: "Cyan Clair",
    h1: "Cyan Primaire",
    h2: "Turquoise Moyen",
    h3: "Turquoise Sombre",
    h4: "Turquoise Sombre",
    content: "Noir Spatial",
    table: "Cyan Primaire",
    quote: "Cyan Primaire"
};

// Initialiser les sélecteurs de couleur
function initColorSelectors() {
    const selectors = ['colorTOC', 'colorH1', 'colorH2', 'colorH3', 'colorH4', 'colorContent', 'colorTable', 'colorQuote'];
    
    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        colorPalette.forEach(color => {
            const option = document.createElement('option');
            option.value = color.name;
            option.textContent = `${color.name} (${color.hex})`;
            option.style.color = color.hex;
            select.appendChild(option);
        });
    });
    
    // Appliquer les couleurs par défaut
    document.getElementById('colorTOC').value = defaultColors.toc;
    document.getElementById('colorH1').value = defaultColors.h1;
    document.getElementById('colorH2').value = defaultColors.h2;
    document.getElementById('colorH3').value = defaultColors.h3;
    document.getElementById('colorH4').value = defaultColors.h4;
    document.getElementById('colorContent').value = defaultColors.content;
    document.getElementById('colorTable').value = defaultColors.table;
    document.getElementById('colorQuote').value = defaultColors.quote;
}

// Initialiser les sélecteurs de couleur pour la page finale
function initFinalPageColorSelectors() {
    const selectors = ['finalColorTitle', 'finalColorText', 'finalColorAccent'];
    
    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        select.innerHTML = ''; // Vider d'abord
        colorPalette.forEach(color => {
            const option = document.createElement('option');
            option.value = color.name;
            option.textContent = `${color.name} (${color.hex})`;
            option.style.color = color.hex;
            select.appendChild(option);
        });
    });
    
    // Valeurs par défaut
    document.getElementById('finalColorTitle').value = "Cyan Primaire";
    document.getElementById('finalColorText').value = "Noir Spatial";
    document.getElementById('finalColorAccent').value = "Turquoise Moyen";
}

// Basculer la modale
function toggleFinalPageModal() {
    const modal = document.getElementById('finalPageModal');
    modal.classList.toggle('active');
}

// Fermer la modale en cliquant en dehors
function closeFinalPageModal(event) {
    if (event.target.id === 'finalPageModal') {
        toggleFinalPageModal();
    }
}

// Sauvegarder les paramètres
function saveFinalPageSettings() {
    toggleFinalPageModal();
    showSuccess('Paramètres de la page finale enregistrés !');
}

// Fonction pour obtenir la couleur RGB depuis le nom
function getColorRGB(colorName) {
    const color = colorPalette.find(c => c.name === colorName);
    return color ? color.rgb : [0, 0, 0];
}

// Basculer l'affichage du panneau de couleurs
function toggleColorPanel() {
    const panel = document.getElementById('colorPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

// Réinitialiser les couleurs
function resetColors() {
    document.getElementById('colorTOC').value = defaultColors.toc;
    document.getElementById('colorH1').value = defaultColors.h1;
    document.getElementById('colorH2').value = defaultColors.h2;
    document.getElementById('colorH3').value = defaultColors.h3;
    document.getElementById('colorH4').value = defaultColors.h4;
    document.getElementById('colorContent').value = defaultColors.content;
    document.getElementById('colorTable').value = defaultColors.table;
    document.getElementById('colorQuote').value = defaultColors.quote;
    
    showSuccess('Couleurs réinitialisées !');
}

// Configuration de marked
const markedInstance = window.marked.marked ? window.marked.marked : window.marked;

markedInstance.setOptions({
    breaks: true,
    gfm: true
});

function updatePreview() {
    const markdown = markdownInput.value;
    preview.innerHTML = markedInstance.parse(markdown);

    // Mise à jour du compteur de mots
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).length : 0;
    document.getElementById('wordCount').textContent = `${words} mots`;
}

// Mise à jour de l'aperçu en temps réel
markdownInput.addEventListener('input', updatePreview);

// Initialiser l'aperçu
updatePreview();

// Fonctions d'insertion Markdown
function insertMarkdown(before, after) {
    const start = markdownInput.selectionStart;
    const end = markdownInput.selectionEnd;
    const text = markdownInput.value;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    markdownInput.value = newText;

    markdownInput.focus();
    markdownInput.selectionStart = start + before.length;
    markdownInput.selectionEnd = start + before.length + selectedText.length;

    updatePreview();
}

function insertLink() {
    const url = prompt('URL du lien:', 'https://');
    const text = prompt('Texte du lien:', 'Lien');
    if (url && text) {
        insertMarkdown(`[${text}](${url})`, '');
    }
}

function insertImage() {
    const url = prompt('URL de l\'image:', 'https://');
    const alt = prompt('Texte alternatif:', 'Image');
    if (url && alt) {
        insertMarkdown(`![${alt}](${url})`, '');
    }
}

function insertTable() {
    const table = `
| En-tête 1 | En-tête 2 | En-tête 3 |
|-----------|-----------|-----------|
| Cellule 1 | Cellule 2 | Cellule 3 |
| Cellule 4 | Cellule 5 | Cellule 6 |
`;
    insertMarkdown(table, '');
}

// Copier le Markdown
function copyMarkdown() {
    markdownInput.select();
    document.execCommand('copy');

    const btn = event.target.closest('.panel-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copié !';
    setTimeout(() => {
        btn.innerHTML = originalHTML;
    }, 2000);
}

// Télécharger le fichier Markdown
function downloadMarkdown() {
    const markdown = markdownInput.value;
    const docTitle = document.getElementById('docTitle').value || 'document';
    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `${docTitle}.md`);
}

// Générer la table des matières
function generateTOC(markdown) {
    const lines = markdown.split('\n');
    const toc = [];
    let sectionNumber = { h1: 0, h2: 0, h3: 0 };

    const useNumbering = document.getElementById('optNumbering').checked;

    lines.forEach(line => {
        const match = line.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2];

            if (level === 1) {
                sectionNumber.h1++;
                sectionNumber.h2 = 0;
                sectionNumber.h3 = 0;
                const num = useNumbering ? `${sectionNumber.h1}. ` : '';
                toc.push(`${num}${title}`);
            } else if (level === 2) {
                sectionNumber.h2++;
                sectionNumber.h3 = 0;
                const num = useNumbering ? `${sectionNumber.h1}.${sectionNumber.h2}. ` : '';
                toc.push(`  ${num}${title}`);
            } else if (level === 3) {
                sectionNumber.h3++;
                const num = useNumbering ? `${sectionNumber.h1}.${sectionNumber.h2}.${sectionNumber.h3}. ` : '';
                toc.push(`    ${num}${title}`);
            }
        }
    });

    return toc.join('\n');
}

// Export PDF - VERSION COMPLÈTE AVEC TEXTE NATIF
async function exportToPDF() {
    showLoading('Génération du fichier PDF...');

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Chargement de la police Silkscreen
        try {
            const fontUrl = 'Silkscreen-Bold.ttf';
            const fontResp = await fetch(fontUrl);
            const fontBuffer = await fontResp.arrayBuffer();
            const fontBase64 = btoa(
                new Uint8Array(fontBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            doc.addFileToVFS('Silkscreen-Bold.ttf', fontBase64);
            doc.addFont('Silkscreen-Bold.ttf', 'Silkscreen', 'normal');
        } catch (e) {
            console.warn('Police Silkscreen non chargée, utilisation de Helvetica');
        }

        const docTitle = document.getElementById('docTitle').value || 'Document Echo';
        const docAuthor = document.getElementById('docAuthor').value || 'Team Nightberry';
        const useTOC = document.getElementById('optTOC').checked;
        const useNumbering = document.getElementById('optNumbering').checked;
        const usePageNumbers = document.getElementById('optPageNumbers').checked;
        const isEcoMode = document.getElementById('optEcoPrint').checked;

        // Métadonnées du document
        doc.setProperties({
            title: docTitle,
            author: docAuthor,
            subject: 'Document généré via Echo Docs',
            keywords: 'markdown, echo docs, nightberry, pdf',
            creator: 'Echo Docs',
            producer: 'Echo Docs 1.0'
        });

        // Couleurs personnalisées (PAGE DE GARDE INTACTE)
        const customColors = {
            toc: getColorRGB(document.getElementById('colorTOC').value),
            h1: getColorRGB(document.getElementById('colorH1').value),
            h2: getColorRGB(document.getElementById('colorH2').value),
            h3: getColorRGB(document.getElementById('colorH3').value),
            h4: getColorRGB(document.getElementById('colorH4').value),
            content: getColorRGB(document.getElementById('colorContent').value),
            table: getColorRGB(document.getElementById('colorTable').value),
            quote: getColorRGB(document.getElementById('colorQuote').value)
        };

        const colors = {
            primary: [0, 208, 198],
            primaryLight: [96, 244, 215],
            secondary: [3, 119, 120],
            bgDark: [1, 11, 25],
            accent: [51, 138, 144],
            black: [0, 0, 0],
            white: [255, 255, 255],
            gray: [100, 100, 100],
            lightGray: [200, 200, 200],
            codeGray: [244, 244, 244]
        };

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);

        // === PAGE DE GARDE ===
        if (!isEcoMode) {
            doc.setFillColor(...colors.bgDark);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }

        // Bordure décorative
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);
        doc.setDrawColor(...colors.primaryLight);
        doc.setLineWidth(0.3);
        doc.rect(12, 12, 186, 273);

        // Logo
        const logoUrl = "https://florian-croiset.github.io/jeusite/assets/pnglogoEcercle.png";
        try {
            doc.addImage(logoUrl, 'PNG', 70, 120, 70, 70);
        } catch (e) {
            console.warn("Logo non chargé");
        }

        // Titre ECHO en utilisant canvas pour la police Silkscreen
        try {
            await document.fonts.load('1em Silkscreen');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 3000;
            canvas.height = 800;
            ctx.font = 'bold 700px Silkscreen';
            ctx.fillStyle = `rgb(${colors.primary.join(',')})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ECHO', canvas.width / 2, canvas.height / 2);
            const textImg = canvas.toDataURL('image/png');
            doc.addImage(textImg, 'PNG', 25, 40, 160, 40);
        } catch (e) {
            console.warn('Titre ECHO en image non généré');
        }

        // Titre du document
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        const titleColor = isEcoMode ? colors.accent : colors.primaryLight;
        doc.setTextColor(...titleColor);
        doc.text(docTitle.toUpperCase(), pageWidth / 2, 90, { align: 'center' });

        // Auteur
        doc.setFontSize(16);
        doc.setTextColor(...colors.accent);
        doc.text(`Par ${docAuthor}`, pageWidth / 2, 200, { align: 'center' });

        // Lien Team Nightberry
        doc.setFontSize(10);
        doc.setTextColor(...colors.accent);
        const text = 'Par la Team Nightberry';
        const teamText = 'Team Nightberry';
        const linkUrlTeam = "https://florian-croiset.github.io/jeusite/index.html#team";
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const startXTeam = (pageWidth - textWidth) / 2;
        const startYTeam = 275;
        doc.text('Par la ', startXTeam, startYTeam, { align: 'left' });
        const teamTextStartX = startXTeam + doc.getStringUnitWidth('Par la ') * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.textWithLink(teamText, teamTextStartX, startYTeam, { url: linkUrlTeam });

        const useVersion = document.getElementById('optVersion').checked;
if (useVersion) {
    const version = document.getElementById('docVersion').value || 'v1.0';
    doc.setFontSize(11);
    doc.setTextColor(...colors.primaryLight);
    doc.text(`Version ${version}`, pageWidth / 2, 252, { align: 'center' });
}

        // Date
        doc.setFontSize(12);
        doc.setTextColor(...colors.primaryLight);
        doc.text(new Date().toLocaleDateString('fr-FR'), pageWidth / 2, 260, { align: 'center' });

        // Ligne décorative
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(60, 100, 150, 100);

        // === TABLE DES MATIÈRES ===
        if (useTOC) {
            doc.addPage();

            doc.setFillColor(...colors.primary);
            doc.rect(0, 10, pageWidth, 15, 'F');
            doc.setFontSize(20);
            doc.setTextColor(...colors.white);
            doc.text('TABLE DES MATIÈRES', pageWidth / 2, 19, { align: 'center' });

            let yPos = 40;
            const markdown = markdownInput.value;
            const toc = generateTOC(markdown);

            doc.setFontSize(11);
            doc.setTextColor(...customColors.toc);
            doc.setFont('helvetica', 'normal');

            toc.split('\n').forEach(line => {
                if (yPos > 270) {
                    if (usePageNumbers) {
                        doc.setFontSize(10);
                        doc.setTextColor(...colors.accent);
                        doc.text(`${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                    }
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, margin, yPos);
                yPos += 7;
            });

            if (usePageNumbers) {
                doc.setFontSize(10);
                doc.setTextColor(...colors.accent);
                doc.text(`${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        }

        // === CONTENU MARKDOWN ===
        doc.addPage();

        const markdown = markdownInput.value;
        await renderMarkdownToPDF(doc, markdown, useNumbering, usePageNumbers, colors, customColors, margin, contentWidth, pageWidth, pageHeight);

        // === PAGE DE GARDE FINALE ===
const useFinalPage = document.getElementById('optFinalPage').checked;
if (useFinalPage) {
    doc.addPage();
    
    const finalColors = {
        title: getColorRGB(document.getElementById('finalColorTitle').value),
        text: getColorRGB(document.getElementById('finalColorText').value),
        accent: getColorRGB(document.getElementById('finalColorAccent').value)
    };
    
    const showTitle = document.getElementById('finalShowTitle').checked;
    const showVersion = document.getElementById('finalShowVersion').checked;
    const showDate = document.getElementById('finalShowDate').checked;
    const showAuthor = document.getElementById('finalShowAuthor').checked;
    const showAuthors = document.getElementById('finalShowAuthors').checked;
    const showDesc = document.getElementById('finalShowDesc').checked;
    const showCustomText = document.getElementById('finalShowCustomText').checked;
    const showPageNum = document.getElementById('finalShowPageNum').checked;
    
    let yFinal = 40;
    
    // Bordure décorative
    doc.setDrawColor(...finalColors.accent);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    
    // Titre
    if (showTitle) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(...finalColors.title);
        doc.text(docTitle.toUpperCase(), pageWidth / 2, yFinal, { align: 'center' });
        yFinal += 20;
    }
    
    // Version
    if (showVersion && useVersion) {
        const version = document.getElementById('docVersion').value || 'v1.0';
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(...finalColors.accent);
        doc.text(`Version ${version}`, pageWidth / 2, yFinal, { align: 'center' });
        yFinal += 12;
    }
    
    // Date
    if (showDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(...finalColors.text);
        doc.text(new Date().toLocaleDateString('fr-FR'), pageWidth / 2, yFinal, { align: 'center' });
        yFinal += 15;
    }
    
    // Ligne séparatrice
    doc.setDrawColor(...finalColors.accent);
    doc.setLineWidth(0.3);
    doc.line(40, yFinal, pageWidth - 40, yFinal);
    yFinal += 15;
    
    // Auteur principal
    if (showAuthor) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...finalColors.accent);
        doc.text('AUTEUR PRINCIPAL', pageWidth / 2, yFinal, { align: 'center' });
        yFinal += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(...finalColors.text);
        doc.text(docAuthor, pageWidth / 2, yFinal, { align: 'center' });
        yFinal += 15;
    }
    
    // Liste des auteurs
    if (showAuthors) {
        const authorsList = document.getElementById('finalAuthorsList').value;
        if (authorsList.trim()) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...finalColors.accent);
            doc.text('CONTRIBUTEURS', pageWidth / 2, yFinal, { align: 'center' });
            yFinal += 8;
            
            const authors = authorsList.split('\n').filter(a => a.trim());
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...finalColors.text);
            authors.forEach(author => {
                doc.text(`• ${author.trim()}`, pageWidth / 2, yFinal, { align: 'center' });
                yFinal += 6;
            });
            yFinal += 10;
        }
    }
    
    // Description
    if (showDesc) {
        const description = document.getElementById('finalDescription').value;
        if (description.trim()) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...finalColors.accent);
            doc.text('DESCRIPTION', pageWidth / 2, yFinal, { align: 'center' });
            yFinal += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...finalColors.text);
            const descLines = doc.splitTextToSize(description, contentWidth - 40);
            descLines.forEach(line => {
                doc.text(line, pageWidth / 2, yFinal, { align: 'center' });
                yFinal += 6;
            });
            yFinal += 10;
        }
    }
    
    // Texte personnalisé
    if (showCustomText) {
        const customText = document.getElementById('finalCustomText').value;
        if (customText.trim()) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(...finalColors.text);
            const customLines = doc.splitTextToSize(customText, contentWidth - 40);
            customLines.forEach(line => {
                doc.text(line, pageWidth / 2, yFinal, { align: 'center' });
                yFinal += 5;
            });
        }
    }
    
    // Numéro de page personnalisé
    if (showPageNum) {
        const pageNumPos = document.getElementById('finalPageNumPos').value;
        const customPageNum = document.getElementById('finalCustomPageNum').value;
        const pageText = customPageNum || `${doc.internal.getNumberOfPages()}`;
        
        doc.setFontSize(10);
        doc.setTextColor(...finalColors.accent);
        
        let xPos = pageWidth / 2;
        let yPos = pageHeight - 10;
        let align = 'center';
        
        if (pageNumPos.includes('left')) { xPos = 20; align = 'left'; }
        else if (pageNumPos.includes('right')) { xPos = pageWidth - 20; align = 'right'; }
        
        if (pageNumPos.startsWith('top')) yPos = 15;
        
        doc.text(pageText, xPos, yPos, { align: align });
    }
}

        doc.save(`${docTitle}.pdf`);

        hideLoading();
        showSuccess('Document PDF généré avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
        alert('Erreur lors de l\'export PDF: ' + error.message);
        hideLoading();
    }
}

// Fonction principale de rendu Markdown vers PDF
async function renderMarkdownToPDF(doc, markdown, useNumbering, usePageNumbers, colors, customColors, margin, contentWidth, pageWidth, pageHeight) {
    const lines = markdown.split('\n');
    let yPos = margin;
    let sectionNumber = { h1: 0, h2: 0, h3: 0 };
    let lastBlockType = null;
    let inCodeBlock = false;
    let codeBlockContent = [];
    let inTable = false;
    let tableLines = [];

    function checkPageBreak(requiredSpace) {
        if (yPos + requiredSpace > pageHeight - margin - 15) {
            if (usePageNumbers) {
                doc.setFontSize(10);
                doc.setTextColor(...colors.accent);
                doc.text(`${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
            doc.addPage();
            yPos = margin;
            return true;
        }
        return false;
    }

    function wrapText(text, maxWidth, fontSize) {
        doc.setFontSize(fontSize);
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = doc.getStringUnitWidth(testLine) * fontSize / doc.internal.scaleFactor;

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    function renderCodeBlock() {
        if (codeBlockContent.length > 0) {
            const codeLines = codeBlockContent;
            const lineHeight = 5;
            const padding = 5;
            const blockHeight = (codeLines.length * lineHeight) + (2 * padding);

            checkPageBreak(blockHeight + 5);

            // Fond du bloc de code
            doc.setFillColor(...colors.codeGray);
            doc.roundedRect(margin, yPos, contentWidth, blockHeight, 3, 3, 'F');

            // Bordure
            doc.setDrawColor(...colors.lightGray);
            doc.setLineWidth(0.1);
            doc.roundedRect(margin, yPos, contentWidth, blockHeight, 3, 3, 'S');

            // Texte du code
            doc.setFont('courier', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...colors.black);

            let codeY = yPos + padding + 4;
            codeLines.forEach(line => {
                if (codeY + lineHeight > pageHeight - margin - 15) {
                    checkPageBreak(lineHeight + 10);
                    doc.setFillColor(...colors.codeGray);
                    doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
                    codeY = yPos + padding + 4;
                }
                const displayLine = line || ' ';
                doc.text(displayLine.substring(0, 90), margin + padding, codeY);
                codeY += lineHeight;
            });

            yPos += blockHeight + 8;
            codeBlockContent = [];
        }
    }

    function parseInlineFormatting(text) {
        const segments = [];
        let currentPos = 0;

        const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > currentPos) {
                segments.push({
                    text: text.substring(currentPos, match.index),
                    style: 'normal'
                });
            }

            if (match[1]) {
                segments.push({ text: match[2], style: 'bold' });
            } else if (match[3]) {
                segments.push({ text: match[4], style: 'italic' });
            } else if (match[5]) {
                segments.push({ text: match[6], style: 'code' });
            } else if (match[7]) {
                segments.push({ text: match[8], style: 'link', url: match[9] });
            }

            currentPos = match.index + match[0].length;
        }

        if (currentPos < text.length) {
            segments.push({
                text: text.substring(currentPos),
                style: 'normal'
            });
        }

        return segments.length > 0 ? segments : [{ text: text, style: 'normal' }];
    }

    function renderParagraphWithFormatting(text, fontSize, lineHeight, indentLevel = 0, customStartX = null) {
        const segments = parseInlineFormatting(text);
        const maxWidth = contentWidth - (indentLevel * 10) - 5;
        let currentLine = '';
        let currentLineSegments = [];

        let currentX = customStartX !== null ? customStartX : margin + (indentLevel * 10);

        function flushLine() {
            if (currentLineSegments.length === 0) return;

            checkPageBreak(lineHeight);

            currentX = customStartX !== null ? customStartX : margin + (indentLevel * 10);

            currentLineSegments.forEach(seg => {
                doc.setFontSize(fontSize);

                if (seg.style === 'bold') {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...customColors.content);
                } else if (seg.style === 'italic') {
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(...customColors.content);
                } else if (seg.style === 'code') {
                    doc.setFont('courier', 'normal');
                    doc.setFontSize(fontSize - 1);
                    doc.setFillColor(244, 244, 244);
                    const textWidth = doc.getStringUnitWidth(seg.text) * (fontSize - 1) / doc.internal.scaleFactor;
                    doc.roundedRect(currentX - 1, yPos - 3, textWidth + 2, 5, 1, 1, 'F');
                    doc.setTextColor(199, 37, 78);
                } else if (seg.style === 'link') {
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...colors.primary);
                    const linkText = seg.text.substring(0, 50);
                    doc.textWithLink(linkText, currentX, yPos, { url: seg.url });
                    currentX += doc.getStringUnitWidth(linkText) * fontSize / doc.internal.scaleFactor;
                    doc.setFont('helvetica', 'normal');
                    return;
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...customColors.content);
                }

                doc.text(seg.text, currentX, yPos);
                currentX += doc.getStringUnitWidth(seg.text) * fontSize / doc.internal.scaleFactor;

                doc.setFont('helvetica', 'normal');
            });

            yPos += lineHeight;
            currentLineSegments = [];
        }

        segments.forEach(segment => {
            const words = segment.text.split(' ');

            words.forEach((word, idx) => {
                const testText = currentLine + (currentLine ? ' ' : '') + word;
                const testWidth = doc.getStringUnitWidth(testText) * fontSize / doc.internal.scaleFactor;

                if (testWidth > maxWidth && currentLine) {
                    flushLine();
                    currentLine = word;
                    currentLineSegments = [{ ...segment, text: word }];
                } else {
                    if (currentLine) {
                        currentLineSegments.push({ ...segment, text: ' ' + word });
                    } else {
                        currentLineSegments.push({ ...segment, text: word });
                    }
                    currentLine = testText;
                }
            });
        });

        if (currentLineSegments.length > 0) {
            flushLine();
        }
    }

    function renderTable(tableLines) {
        const rows = tableLines.map(line => {
            return line.split('|').slice(1, -1).map(cell => cell.trim());
        });

        const hasHeaderSeparator = rows[1] && rows[1].every(cell => cell.match(/^-+$/));
        if (hasHeaderSeparator) {
            rows.splice(1, 1);
        }

        const numCols = rows[0].length;
        const colWidth = contentWidth / numCols;

        rows.forEach((row, rowIndex) => {
            let maxLines = 1;
            row.forEach(cell => {
                const cellLines = doc.splitTextToSize(cell, colWidth - 4);
                maxLines = Math.max(maxLines, cellLines.length);
            });

            const rowHeight = Math.max(12, maxLines * 5);
            checkPageBreak(rowHeight);

            if (rowIndex === 0) {
                doc.setFillColor(...customColors.table);
                doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...colors.white);
            } else {
                if (rowIndex % 2 === 0) {
                    doc.setFillColor(249, 249, 249);
                    doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
                }
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...colors.black);
            }

            doc.setDrawColor(...colors.lightGray);
            doc.setLineWidth(0.1);

            row.forEach((cell, colIndex) => {
                const cellX = margin + (colIndex * colWidth);
                doc.rect(cellX, yPos, colWidth, rowHeight);

                const segments = parseInlineFormatting(cell);
                let cellText = '';
                segments.forEach(seg => {
                    cellText += seg.text;
                });

                const wrappedText = doc.splitTextToSize(cellText, colWidth - 4);

                let cellY = yPos + 5;
                wrappedText.forEach((line, lineIdx) => {
                    if (lineIdx < 3) {
                        const hasBold = cell.includes('**');
                        const hasItalic = cell.includes('*') && !hasBold;

                        if (hasBold) {
                            doc.setFont('helvetica', 'bold');
                        } else if (hasItalic) {
                            doc.setFont('helvetica', 'italic');
                        }

                        doc.text(line, cellX + 2, cellY);
                        cellY += 4.5;

                        doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
                    }
                });
            });

            yPos += rowHeight;
        });

        yPos += 5;
    }

    // Parcours des lignes
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Gestion des blocs de code
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
            } else {
                inCodeBlock = false;
                renderCodeBlock();
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            continue;
        }

        // Détection de tableau
        if (line.match(/^\|(.+)\|$/)) {
            if (!inTable) {
                inTable = true;
                tableLines = [];
            }
            tableLines.push(line);
            continue;
        } else if (inTable) {
            inTable = false;
            renderTable(tableLines);
            tableLines = [];
        }

        // Saut de ligne avec <br>
        if (line.includes('<br>')) {
            const cleanLine = line.replace(/<br>/g, '').replace(/\s+$/, '');
            if (cleanLine.trim()) {
                checkPageBreak(8);
                renderParagraphWithFormatting(cleanLine, 11, 6);
            }
            yPos += 6;
            continue;
        }

        // Ligne vide
        if (line.trim() === '') {
            yPos += 5;
            lastBlockType = 'empty';
            continue;
        }

        // Titres H1
        if (line.startsWith('# ')) {
            checkPageBreak(20);
            sectionNumber.h1++;
            sectionNumber.h2 = 0;
            sectionNumber.h3 = 0;
            const text = line.substring(2);
            const num = useNumbering ? `${sectionNumber.h1}. ` : '';

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(...customColors.h1);
            doc.text(num + text, margin, yPos);
            yPos += 5;

            doc.setDrawColor(...customColors.h1);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos, margin + contentWidth, yPos);
            yPos += 15;
            continue;
        }

        // Titres H2
        if (line.startsWith('## ')) {
            checkPageBreak(15);
            sectionNumber.h2++;
            sectionNumber.h3 = 0;
            const text = line.substring(3);
            const num = useNumbering ? `${sectionNumber.h1}.${sectionNumber.h2}. ` : '';

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(...customColors.h2);
            doc.text(num + text, margin, yPos);
            yPos += 4;

            doc.setDrawColor(...customColors.h2);
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, margin + contentWidth, yPos);
            yPos += 8;
            continue;
        }

        // Titres H3
        if (line.startsWith('### ')) {
            checkPageBreak(12);
            sectionNumber.h3++;
            const text = line.substring(4);
            const num = useNumbering ? `${sectionNumber.h1}.${sectionNumber.h2}.${sectionNumber.h3}. ` : '';

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(...customColors.h3);
            doc.text(num + text, margin, yPos);
            yPos += 8;
            continue;
        }

        // Titres H4
        if (line.startsWith('#### ')) {
            checkPageBreak(10);
            const text = line.substring(5);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(...customColors.h4);
            doc.text(text, margin, yPos);
            yPos += 7;
            continue;
        }

        // Titres H5
        if (line.startsWith('##### ')) {
            checkPageBreak(8);
            const text = line.substring(6);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...colors.accent);
            doc.text(text, margin, yPos);
            yPos += 6;
            continue;
        }

        // Titres H6
        if (line.startsWith('###### ')) {
            checkPageBreak(8);
            const text = line.substring(7);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...colors.gray);
            doc.text(text, margin, yPos);
            yPos += 6;
            continue;
        }

        // Liste à puces
        if (line.match(/^(\s*)([-*+])\s(.+)$/)) {
            const match = line.match(/^(\s*)([-*+])\s(.+)$/);
            const indent = match[1].length;
            const content = match[3];
            const level = Math.floor(indent / 2);

            checkPageBreak(8);

            if (lastBlockType === 'paragraph') {
                yPos -= 2; 
            }

            const bulletX = margin + (level * 10);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(...customColors.content);
            doc.text('•', bulletX, yPos);

            const textX = bulletX + 4;

            renderParagraphWithFormatting(content, 11, 6, level + 1, textX);

            yPos += 2;
            lastBlockType = 'list';
            continue;
        }

        // Listes numérotées
        if (line.match(/^(\s*)(\d+\.)\s(.+)$/)) {
            const match = line.match(/^(\s*)(\d+\.)\s(.+)$/);
            const indent = match[1].length;
            const number = match[2];
            const content = match[3];
            const level = Math.floor(indent / 2);

            checkPageBreak(8);

            if (lastBlockType === 'paragraph') {
                yPos -= 3;
            }

            const numberX = margin + (level * 10);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(...customColors.content);
            doc.text(number, numberX, yPos);

            const numberWidth = doc.getStringUnitWidth(number) * 11 / doc.internal.scaleFactor;
            const textX = numberX + numberWidth + 1.5;

            renderParagraphWithFormatting(content, 11, 6, level + 1, textX);
            yPos += 2;
            lastBlockType = 'list';
            continue;
        }

        // Citations
        if (line.startsWith('> ')) {
            checkPageBreak(10);
            const quoteText = line.substring(2);

            doc.setDrawColor(...customColors.quote);
            doc.setLineWidth(2);
            doc.line(margin, yPos - 3, margin, yPos + 5);

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(11);
            doc.setTextColor(...colors.gray);

            const wrappedLines = wrapText(quoteText, contentWidth - 10, 11);
            wrappedLines.forEach(wrappedLine => {
                checkPageBreak(6);
                doc.text(wrappedLine, margin + 8, yPos);
                yPos += 6;
            });

            yPos += 4;
            continue;
        }

        // Séparateurs
        if (line.trim() === '---') {
            checkPageBreak(8);
            doc.setDrawColor(...colors.lightGray);
            doc.setLineWidth(0.5);
            doc.line(margin + 20, yPos, margin + contentWidth - 20, yPos);
            yPos += 8;
            continue;
        }

        // Images
        if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
            const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            const alt = match[1];
            const url = match[2];

            checkPageBreak(60);

            try {
                const imgData = await loadImageAsBase64(url);
                const imgWidth = Math.min(contentWidth * 0.7, 100);
                const imgHeight = 50;

                const imgX = margin + (contentWidth - imgWidth) / 2;
                doc.addImage(imgData, 'PNG', imgX, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 5;

                if (alt) {
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(9);
                    doc.setTextColor(...colors.gray);
                    doc.text(alt, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 8;
                }
            } catch (e) {
                console.warn('Image non chargée:', url);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(10);
                doc.setTextColor(...colors.gray);
                doc.text(`[Image: ${alt || url}]`, margin, yPos);
                yPos += 8;
            }
            continue;
        }

        // Paragraphes normaux
        if (line.trim()) {
            checkPageBreak(8);
            renderParagraphWithFormatting(line, 11, 6);
            yPos += 4;
            lastBlockType = 'paragraph';
        }
    }

    // Rendu final des éléments en attente
    if (inTable && tableLines.length > 0) {
        renderTable(tableLines);
    }

    // Dernière page number
    if (usePageNumbers) {
        doc.setFontSize(10);
        doc.setTextColor(...colors.accent);
        doc.text(`${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
}

// Fonction pour charger une image en base64
async function loadImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = url;
    });
}

// Fonctions utilitaires
function showLoading(message) {
    loadingText.textContent = message;
    loadingModal.classList.add('active');
}

function hideLoading() {
    loadingModal.classList.remove('active');
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
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
    `;
    successDiv.innerHTML = `
        <h3 style="color: var(--primary);">
            <i class="fa-solid fa-check-circle"></i> ${message}
        </h3>
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => document.body.removeChild(successDiv), 3000);
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function showWarning(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-warning';

    toast.innerHTML = `<span>⚠️</span> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ========================================
// IMPORT / EXPORT DE CONFIGURATION
// ========================================

// Fonction pour collecter tous les paramètres
function collectSettings() {
    return {
        version: "1.0",
        document: {
            title: document.getElementById('docTitle').value,
            author: document.getElementById('docAuthor').value,
            version: document.getElementById('docVersion').value
        },
        options: {
            toc: document.getElementById('optTOC').checked,
            numbering: document.getElementById('optNumbering').checked,
            pageNumbers: document.getElementById('optPageNumbers').checked,
            ecoPrint: document.getElementById('optEcoPrint').checked,
            showVersion: document.getElementById('optVersion').checked
        },
        colors: {
            toc: document.getElementById('colorTOC').value,
            h1: document.getElementById('colorH1').value,
            h2: document.getElementById('colorH2').value,
            h3: document.getElementById('colorH3').value,
            h4: document.getElementById('colorH4').value,
            content: document.getElementById('colorContent').value,
            table: document.getElementById('colorTable').value,
            quote: document.getElementById('colorQuote').value
        },
        finalPage: {
            enabled: document.getElementById('optFinalPage').checked,
            showTitle: document.getElementById('finalShowTitle').checked,
            showVersion: document.getElementById('finalShowVersion').checked,
            showDate: document.getElementById('finalShowDate').checked,
            showAuthor: document.getElementById('finalShowAuthor').checked,
            showAuthors: document.getElementById('finalShowAuthors').checked,
            showDesc: document.getElementById('finalShowDesc').checked,
            showCustomText: document.getElementById('finalShowCustomText').checked,
            showPageNum: document.getElementById('finalShowPageNum').checked,
            description: document.getElementById('finalDescription').value,
            authorsList: document.getElementById('finalAuthorsList').value,
            customText: document.getElementById('finalCustomText').value,
            colorTitle: document.getElementById('finalColorTitle').value,
            colorText: document.getElementById('finalColorText').value,
            colorAccent: document.getElementById('finalColorAccent').value,
            pageNumPos: document.getElementById('finalPageNumPos').value,
            customPageNum: document.getElementById('finalCustomPageNum').value
        }
    };
}

// Fonction pour appliquer les paramètres
function applySettings(settings) {
    if (!settings || settings.version !== "1.0") {
        showWarning('Format de configuration non reconnu');
        return;
    }

    // Document
    if (settings.document) {
        document.getElementById('docTitle').value = settings.document.title || 'Document Echo';
        document.getElementById('docAuthor').value = settings.document.author || 'Team Nightberry';
        document.getElementById('docVersion').value = settings.document.version || 'v1.0';
    }

    // Options
    if (settings.options) {
        document.getElementById('optTOC').checked = settings.options.toc !== false;
        document.getElementById('optNumbering').checked = settings.options.numbering !== false;
        document.getElementById('optPageNumbers').checked = settings.options.pageNumbers !== false;
        document.getElementById('optEcoPrint').checked = settings.options.ecoPrint || false;
        document.getElementById('optVersion').checked = settings.options.showVersion || false;
    }

    // Couleurs
    if (settings.colors) {
        document.getElementById('colorTOC').value = settings.colors.toc || defaultColors.toc;
        document.getElementById('colorH1').value = settings.colors.h1 || defaultColors.h1;
        document.getElementById('colorH2').value = settings.colors.h2 || defaultColors.h2;
        document.getElementById('colorH3').value = settings.colors.h3 || defaultColors.h3;
        document.getElementById('colorH4').value = settings.colors.h4 || defaultColors.h4;
        document.getElementById('colorContent').value = settings.colors.content || defaultColors.content;
        document.getElementById('colorTable').value = settings.colors.table || defaultColors.table;
        document.getElementById('colorQuote').value = settings.colors.quote || defaultColors.quote;
    }

    // Page finale
    if (settings.finalPage) {
        document.getElementById('optFinalPage').checked = settings.finalPage.enabled || false;
        document.getElementById('finalShowTitle').checked = settings.finalPage.showTitle !== false;
        document.getElementById('finalShowVersion').checked = settings.finalPage.showVersion !== false;
        document.getElementById('finalShowDate').checked = settings.finalPage.showDate !== false;
        document.getElementById('finalShowAuthor').checked = settings.finalPage.showAuthor !== false;
        document.getElementById('finalShowAuthors').checked = settings.finalPage.showAuthors !== false;
        document.getElementById('finalShowDesc').checked = settings.finalPage.showDesc !== false;
        document.getElementById('finalShowCustomText').checked = settings.finalPage.showCustomText !== false;
        document.getElementById('finalShowPageNum').checked = settings.finalPage.showPageNum !== false;
        document.getElementById('finalDescription').value = settings.finalPage.description || '';
        document.getElementById('finalAuthorsList').value = settings.finalPage.authorsList || '';
        document.getElementById('finalCustomText').value = settings.finalPage.customText || '';
        document.getElementById('finalColorTitle').value = settings.finalPage.colorTitle || 'Cyan Primaire';
        document.getElementById('finalColorText').value = settings.finalPage.colorText || 'Noir Spatial';
        document.getElementById('finalColorAccent').value = settings.finalPage.colorAccent || 'Turquoise Moyen';
        document.getElementById('finalPageNumPos').value = settings.finalPage.pageNumPos || 'bottom-center';
        document.getElementById('finalCustomPageNum').value = settings.finalPage.customPageNum || '';
    }

    showSuccess('Configuration importée avec succès !');
}

// Export des paramètres
function exportSettings() {
    const settings = collectSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const docTitle = document.getElementById('docTitle').value || 'document';
    downloadFile(blob, `${docTitle}_config.json`);
    showSuccess('Configuration exportée !');
}

// Import des paramètres
function importSettings() {
    document.getElementById('settingsFileInput').click();
}

function handleSettingsImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const settings = JSON.parse(e.target.result);
            applySettings(settings);
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            showWarning('Erreur : fichier de configuration invalide');
        }
    };
    reader.readAsText(file);
    
    // Reset input pour permettre de réimporter le même fichier
    event.target.value = '';
}

// ========================================
// IMPORT DE FICHIERS MARKDOWN
// ========================================

function importMarkdown() {
    document.getElementById('mdFileInput').click();
}

function handleMdImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        
        // Demander confirmation si l'éditeur contient déjà du texte
        if (markdownInput.value.trim() && markdownInput.value !== markdownInput.defaultValue) {
            if (!confirm('Remplacer le contenu actuel par le fichier importé ?')) {
                event.target.value = '';
                return;
            }
        }
        
        markdownInput.value = content;
        updatePreview();
        localStorage.setItem('echo_content', content);
        showSuccess(`Fichier "${file.name}" importé avec succès !`);
    };
    reader.readAsText(file);
    
    // Reset input pour permettre de réimporter le même fichier
    event.target.value = '';
}

// Au chargement
window.onload = () => {
    initColorSelectors();
    initFinalPageColorSelectors();
    const saved = localStorage.getItem('echo_content');
    if (saved) {
        markdownInput.value = saved;
        updatePreview();
    }
};

// Sauvegarde automatique
markdownInput.addEventListener('input', () => {
    updatePreview();
    localStorage.setItem('echo_content', markdownInput.value);
});