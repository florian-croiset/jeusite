        const markdownInput = document.getElementById('markdownInput');
        const preview = document.getElementById('preview');
        const loadingModal = document.getElementById('loadingModal');
        const loadingText = document.getElementById('loadingText');

        // Configuration de marked
        // On vérifie si marked est disponible via window.marked ou directement
        const markedInstance = window.marked.marked ? window.marked.marked : window.marked;

        markedInstance.setOptions({
            breaks: true,
            gfm: true
        });

        // Et modifie ta fonction de mise à jour :
        function updatePreview() {
            const markdown = markdownInput.value;
            preview.innerHTML = markedInstance.parse(markdown);
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

        /*function insertImage() {
            const url = prompt('URL de l\'image:', 'https://');
            const alt = prompt('Texte alternatif:', 'Image');
            if (url && alt) {
                insertMarkdown(`![${alt}](${url})`, '');
            }
        }*/
        function insertImage() {
            showWarning("FONCTIONNALITÉ NON DISPONIBLE");
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

        // Export DOCX
        async function exportToDOCX() {
            showLoading('Génération du fichier DOCX...');

            try {
                const docxLib = window.docx;
                const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, PageNumber, NumberFormat, Packer } = docxLib;
                const markdown = markdownInput.value;
                const docTitle = document.getElementById('docTitle').value || 'Document Echo';
                const docAuthor = document.getElementById('docAuthor').value || 'Team Nightberry';
                const useTOC = document.getElementById('optTOC').checked;
                const useNumbering = document.getElementById('optNumbering').checked;
                const usePageNumbers = document.getElementById('optPageNumbers').checked;

                //const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, PageNumber, NumberFormat } = docx;

                const children = [];

                // === PAGE DE GARDE ===
                children.push(
                    new Paragraph({
                        text: '',
                        spacing: { after: 3000 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'ECHO',
                                bold: true,
                                size: 72,
                                color: '00d0c6'
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: docTitle.toUpperCase(),
                                bold: true,
                                size: 36,
                                color: '60F4D7'
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 1200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Par ${docAuthor}`,
                                size: 24,
                                color: '338A90'
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: new Date().toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }),
                                size: 20,
                                color: '60F4D7'
                            })
                        ],
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        text: '',
                        pageBreakBefore: true
                    })
                );

                // === TABLE DES MATIÈRES ===
                if (useTOC) {
                    children.push(
                        new Paragraph({
                            text: 'TABLE DES MATIÈRES',
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 }
                        })
                    );

                    const toc = generateTOC(markdown);
                    toc.split('\n').forEach(line => {
                        children.push(
                            new Paragraph({
                                text: line,
                                spacing: { after: 100 }
                            })
                        );
                    });

                    children.push(
                        new Paragraph({
                            text: '',
                            pageBreakBefore: true
                        })
                    );
                }

                // === CONTENU ===
                const lines = markdown.split('\n');
                let sectionNumber = { h1: 0, h2: 0, h3: 0 };

                lines.forEach(line => {
                    const docxElement = convertLineToDocx(line, sectionNumber, useNumbering);
                    if (docxElement) {
                        if (Array.isArray(docxElement)) {
                            children.push(...docxElement);
                        } else {
                            children.push(docxElement);
                        }
                    }
                });

                // Créer le document
                const doc = new Document({
                    sections: [{
                        properties: {
                            page: {
                                margin: {
                                    top: 1440,
                                    right: 1440,
                                    bottom: 1440,
                                    left: 1440
                                },
                                pageNumbers: usePageNumbers ? {
                                    start: 1,
                                    formatType: NumberFormat.DECIMAL
                                } : undefined
                            }
                        },
                        footers: usePageNumbers ? {
                            default: new docx.Footer({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                children: [PageNumber.CURRENT]
                                            })
                                        ]
                                    })
                                ]
                            })
                        } : undefined,
                        children: children
                    }]
                });

                // Générer et télécharger
                const blob = await docx.Packer.toBlob(doc);
                downloadFile(blob, `${docTitle}.docx`);

                hideLoading();
                showSuccess('Document DOCX généré avec succès !');
            } catch (error) {
                console.error('Erreur lors de l\'export DOCX:', error);
                alert('Erreur lors de l\'export DOCX. Vérifiez que la bibliothèque docx est chargée.');
                hideLoading();
            }
        }

        function convertLineToDocx(line, sectionNumber, useNumbering) {
            const { Paragraph, TextRun, HeadingLevel } = docx;

            // Titres avec numérotation
            if (line.startsWith('# ')) {
                sectionNumber.h1++;
                sectionNumber.h2 = 0;
                sectionNumber.h3 = 0;
                const text = line.substring(2);
                const num = useNumbering ? `${sectionNumber.h1}. ` : '';
                return new Paragraph({
                    text: num + text,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 }
                });
            }
            if (line.startsWith('## ')) {
                sectionNumber.h2++;
                sectionNumber.h3 = 0;
                const text = line.substring(3);
                const num = useNumbering ? `${sectionNumber.h1}.${sectionNumber.h2}. ` : '';
                return new Paragraph({
                    text: num + text,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                });
            }
            if (line.startsWith('### ')) {
                sectionNumber.h3++;
                const text = line.substring(4);
                const num = useNumbering ? `${sectionNumber.h1}.${sectionNumber.h2}.${sectionNumber.h3}. ` : '';
                return new Paragraph({
                    text: num + text,
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                });
            }

            // Listes
            if (line.match(/^[-*]\s/)) {
                return new Paragraph({
                    text: line.substring(2),
                    bullet: { level: 0 },
                    spacing: { after: 100 }
                });
            }

            if (line.match(/^\d+\.\s/)) {
                return new Paragraph({
                    text: line.substring(line.indexOf('.') + 2),
                    numbering: { reference: 'default-numbering', level: 0 },
                    spacing: { after: 100 }
                });
            }

            // Code
            if (line.startsWith('```')) {
                return null;
            }

            // Citation
            if (line.startsWith('> ')) {
                return new Paragraph({
                    text: line.substring(2),
                    italics: true,
                    indent: { left: 720 },
                    spacing: { after: 200 }
                });
            }

            // Séparateur
            if (line.trim() === '---') {
                return new Paragraph({
                    text: '___________________________',
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 }
                });
            }

            // Ligne vide
            if (line.trim() === '') {
                return new Paragraph({ text: '' });
            }

            // Paragraphe normal
            return new Paragraph({
                text: line,
                spacing: { after: 200 }
            });
        }

        // Export PDF
        async function exportToPDF() {
            showLoading('Génération du fichier PDF...');

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
const fontUrl = 'Silkscreen-Bold.ttf'; // Ton fichier dans le même dossier
        const fontResp = await fetch(fontUrl);
        const fontBuffer = await fontResp.arrayBuffer();

        // Conversion en base64 à la volée pour le VFS de jsPDF
        const fontBase64 = btoa(
            new Uint8Array(fontBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Ajout au système de fichiers virtuel et enregistrement
        doc.addFileToVFS('Silkscreen-Bold.ttf', fontBase64);
        doc.addFont('Silkscreen-Bold.ttf', 'Silkscreen', 'normal');
                const docTitle = document.getElementById('docTitle').value || 'Document Echo';
                const docAuthor = document.getElementById('docAuthor').value || 'Team Nightberry';
                const useTOC = document.getElementById('optTOC').checked;
                const useNumbering = document.getElementById('optNumbering').checked;
                const usePageNumbers = document.getElementById('optPageNumbers').checked;
                const isEcoMode = document.getElementById('optEcoPrint').checked; // Nouvelle option
                // REMPLISSAGE COMPLET DES MÉTADONNÉES
                doc.setProperties({
                    title: docTitle,
                    author: docAuthor,
                    subject: 'Document généré via Echo Docs',
                    keywords: 'markdown, echo docs, nightberry, pdf',
                    creator: 'Echo Docs',
                    producer: 'Echo Docs 1.0',
                    copyrightStatus: 'Copyrighted',
                    copyrightNotice: `Copyright © ${new Date().getFullYear()} ${docAuthor}. Tous droits réservés.`
                });
                const colors = {
                    primary: [0, 208, 198],
                    primaryLight: [96, 244, 215],
                    secondary: [3, 119, 120],
                    bgDark: [1, 11, 25],
                    accent: [51, 138, 144]
                };

                let pageNumber = 0;

                function addPageNumber() {
                    if (usePageNumbers) {
                        doc.setFontSize(10);
                        doc.setTextColor(...colors.accent);
                        doc.text(`${pageNumber}`, 105, 287, { align: 'center' });
                    }
                }

                // --- PAGE DE GARDE ---
                if (!isEcoMode) {
                    doc.setFillColor(...colors.bgDark);
                    doc.rect(0, 0, 210, 297, 'F');
                }
                //doc.setFillColor(...colors.bgDark);
                //doc.rect(0, 0, 210, 297, 'F');
                        // Bordure décorative cyan
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        doc.setDrawColor(...colors.primaryLight);
        doc.setLineWidth(0.3);
        doc.rect(12, 12, 186, 273);
                /*doc.setDrawColor(...colors.primary);
                doc.setLineWidth(1);
                doc.rect(10, 10, 190, 277);*/

// LOGO (Avec marge)
        const logoUrl = "https://florian-croiset.github.io/jeusite/assets/pnglogoEcercle.png"; 
        try {
            doc.addImage(logoUrl, 'PNG', 70, 120, 70, 70); 
        } catch (e) { console.warn("Logo non chargé"); }

        /*doc.setFont('Silkscreen');
        doc.setFontSize(72);
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('ECHO', 105, 130, { align: 'center' });*/

        // 1. On s'assure que la police est chargée par le navigateur via CSS
await document.fonts.load('1em Silkscreen'); 

// 2. On crée un canvas invisible pour dessiner le texte
const canvass = document.createElement('canvas');
const ctx = canvass.getContext('2d');
canvass.width = 3000; // Largeur pour une bonne qualité
canvass.height = 800;

// 3. Configuration du style sur le canvas
ctx.font = 'bold 700px Silkscreen'; // Utilise le nom déclaré dans ton @font-face
ctx.fillStyle = `rgb(${colors.primary.join(',')})`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// 4. Dessin du texte
ctx.fillText('ECHO', canvass.width / 2, canvass.height / 2);

// 5. Conversion du canvas en image et insertion dans le PDF
const textImg = canvass.toDataURL('image/png');
doc.addImage(canvass.toDataURL('image/png'), 'PNG', 25, 40, 160, 40);

// On remet la police standard pour le reste du document
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        const titleColor = isEcoMode ? colors.accent : colors.primaryLight;
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text(docTitle.toUpperCase(), 105, 90, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text(`Par ${docAuthor}`, 105, 200, { align: 'center' });

        //doc.setFontSize(12);
        //doc.text(new Date().toLocaleDateString('fr-FR'), 105, 210, { align: 'center' });


        doc.setFontSize(10);
        doc.setTextColor(...colors.accent);
        const text = 'Par la Team Nightberry'; // Texte complet
        const teamText = 'Team Nightberry';   // Partie avec le lien
        const linkUrlTeam = "https://florian-croiset.github.io/jeusite/index.html#team"; // Lien du texte "Team Nightberry"
        const pageWidth = 210;
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
                
        // Version et date
        doc.setFontSize(12);
        doc.setTextColor(...colors.primaryLight);
        doc.text(new Date().toLocaleDateString('fr-FR'), 105, 260, { align: 'center' });

        // Ligne décorative
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(60, 100, 150, 100);
        
        // === TABLE DES MATIÈRES ===
                if (useTOC) {
                    doc.addPage();
                    pageNumber++;

                    doc.setFillColor(...colors.primary);
                    doc.rect(0, 10, 210, 15, 'F');
                    doc.setFontSize(20);
                    doc.setTextColor(255, 255, 255);
                    doc.text('TABLE DES MATIÈRES', 105, 19, { align: 'center' });

                    let yPos = 40;
                    const markdown = markdownInput.value;
                    const toc = generateTOC(markdown);

                    doc.setFontSize(11);
                    doc.setTextColor(...colors.primaryLight);
                    doc.setFont('helvetica', 'normal');

                    toc.split('\n').forEach(line => {
                        if (yPos > 270) {
                            addPageNumber();
                            doc.addPage();
                            pageNumber++;
                            yPos = 20;
                        }
                        doc.text(line, 20, yPos);
                        yPos += 7;
                    });

                    addPageNumber();
                }

                // === CONTENU ===
                doc.addPage();
                pageNumber++;

                const previewElement = document.getElementById('preview');
                const canvas = await html2canvas(previewElement, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 190;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const pageHeight = 277;
                let heightLeft = imgHeight;
                let position = 10;

                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                addPageNumber();

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    pageNumber++;
                    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    addPageNumber();
                }

                doc.save(`${docTitle}.pdf`);

                hideLoading();
                showSuccess('Document PDF généré avec succès !');
            } catch (error) {
                console.error('Erreur lors de l\'export PDF:', error);
                alert('Erreur lors de l\'export PDF.');
                hideLoading();
            }
        }

        const text = markdownInput.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        document.getElementById('wordCount').textContent = `${words} mots`;


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

        // Au chargement
        window.onload = () => {
            const saved = localStorage.getItem('echo_content');
            if (saved) {
                markdownInput.value = saved;
                updatePreview();
            }
        };

        // Dans l'event listener input
        markdownInput.addEventListener('input', () => {
            updatePreview();
            localStorage.setItem('echo_content', markdownInput.value);
        });


    function showWarning(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-warning';
    
    // Icône d'alerte simple
    toast.innerHTML = `<span>⚠️</span> ${message}`;
    
    container.appendChild(toast);

    // Supprime la notif après 3 secondes
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// === EXEMPLE D'UTILISATION DANS TON CODE ===
// Quand tu cliques sur le bouton image :
function onImageBtnClick() {
    showWarning("FONCTIONNALITÉ NON DISPONIBLE");
}