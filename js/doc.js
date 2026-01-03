const markdownInput = document.getElementById('markdownInput');
const preview = document.getElementById('preview');
const loadingModal = document.getElementById('loadingModal');
const loadingText = document.getElementById('loadingText');

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
            doc.setTextColor(...colors.primaryLight);
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
        await renderMarkdownToPDF(doc, markdown, useNumbering, usePageNumbers, colors, margin, contentWidth, pageWidth, pageHeight);

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
async function renderMarkdownToPDF(doc, markdown, useNumbering, usePageNumbers, colors, margin, contentWidth, pageWidth, pageHeight) {
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

    /*function truncateText(text, maxWidth, fontSize) {
doc.setFontSize(fontSize);
let truncated = text;
while (doc.getStringUnitWidth(truncated) * fontSize / doc.internal.scaleFactor > maxWidth && truncated.length > 0) {
truncated = truncated.substring(0, truncated.length - 1);
}
return truncated + (truncated.length < text.length ? '...' : '');
}*/

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

    // Cherche cette fonction vers la ligne 331 et remplace-la entièrement
    function renderParagraphWithFormatting(text, fontSize, lineHeight, indentLevel = 0, customStartX = null) {
        const segments = parseInlineFormatting(text);
        const maxWidth = contentWidth - (indentLevel * 10) - 5;
        let currentLine = '';
        let currentLineSegments = [];

        // MODIFICATION ICI : On utilise customStartX s'il existe, sinon on garde le calcul par défaut
        let currentX = customStartX !== null ? customStartX : margin + (indentLevel * 10);

        function flushLine() {
            if (currentLineSegments.length === 0) return;

            checkPageBreak(lineHeight);

            // MODIFICATION ICI AUSSI : Pour le retour à la ligne
            currentX = customStartX !== null ? customStartX : margin + (indentLevel * 10);

            currentLineSegments.forEach(seg => {
                doc.setFontSize(fontSize);

                if (seg.style === 'bold') {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...colors.black);
                } else if (seg.style === 'italic') {
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(...colors.black);
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
                    doc.setTextColor(...colors.black);
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
        let maxRowHeight = 10;

        rows.forEach((row, rowIndex) => {
            // Calculer la hauteur nécessaire pour le texte wrappé
            let maxLines = 1;
            row.forEach(cell => {
                const cellLines = doc.splitTextToSize(cell, colWidth - 4);
                maxLines = Math.max(maxLines, cellLines.length);
            });

            const rowHeight = Math.max(12, maxLines * 5); // +4 pour padding haut/bas
            checkPageBreak(rowHeight);

            if (rowIndex === 0) {
                doc.setFillColor(...colors.primary);
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

                // Gérer le formatage dans les cellules
                const segments = parseInlineFormatting(cell);
                let cellText = '';
                segments.forEach(seg => {
                    cellText += seg.text;
                });

                // Wrapper le texte
                const wrappedText = doc.splitTextToSize(cellText, colWidth - 4);

                let cellY = yPos + 5; // Augmenté de 5 à 6
                const cellPadding = 2; // Nouveau padding
                wrappedText.forEach((line, lineIdx) => {
                    if (lineIdx < 3) { // Limite à 3 lignes par cellule
                        // Déterminer si gras/italique
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
        // Saut de ligne avec <br> ou double espace
        if (line.includes('<br>')) {// || line.endsWith('  ')
            const cleanLine = line.replace(/<br>/g, '').replace(/\s+$/, '');
            if (cleanLine.trim()) {
                checkPageBreak(8);
                renderParagraphWithFormatting(cleanLine, 11, 6);
            }
            yPos += 6; // Saut de ligne effectif
            continue;
        }
        // Ligne vide
        if (line.trim() === '') {
            yPos += 5;
            lastBlockType = 'empty'; // <--- AJOUTER CETTE LIGNE
            continue;
        }

        // NE PLUS TESTER line.match(/\s{2,}$/) ici car déjà géré au-dessus

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
            doc.setTextColor(...colors.primary);
            doc.text(num + text, margin, yPos);
            yPos += 5; // 12

            doc.setDrawColor(...colors.primary);
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
            doc.setTextColor(...colors.accent);
            doc.text(num + text, margin, yPos);
            yPos += 4; // 10

            doc.setDrawColor(...colors.accent);
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
            doc.setTextColor(...colors.secondary);
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
            doc.setTextColor(...colors.secondary);
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

    // INTERLIGNE LÉGER : On ne remonte que de 2 (au lieu de 5) pour laisser un petit espace
    if (lastBlockType === 'paragraph') {
        yPos -= 2; 
    }

    // DÉCALAGE GAUCHE : On utilise "margin + (level * 10)" sans ajout superflu
    // Si c'est encore trop à droite, on peut mettre : margin + (level * 10) - 2
    const bulletX = margin + (level * 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...colors.black);
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

            // CORRECTION VERTICALE : Interligne léger
            if (lastBlockType === 'paragraph') {
                yPos -= 3;
            }

            const numberX = margin + (level * 10);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(...colors.black);
            doc.text(number, numberX, yPos);

            // CORRECTION HORIZONTALE (Dynamique)
            // On calcule la largeur du chiffre (ex: "10.") pour coller le texte juste après
            const numberWidth = doc.getStringUnitWidth(number) * 11 / doc.internal.scaleFactor;
            const textX = numberX + numberWidth + 1.5; // +1.5 pour un espacement serré

            renderParagraphWithFormatting(content, 11, 6, level + 1, textX);
            yPos += 2;
            lastBlockType = 'list'; // On marque qu'on est dans une liste
            continue;
        }

        // Citations
        if (line.startsWith('> ')) {
            checkPageBreak(10);
            const quoteText = line.substring(2);

            doc.setDrawColor(...colors.primary);
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
            lastBlockType = 'paragraph'; // <--- AJOUTER CETTE LIGNE
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

    // Au chargement
    window.onload = () => {
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