// =============================================
// INTÉGRATION SUPABASE CORRIGÉE POUR ECHO
// Fichier : js/database.js
// =============================================

// Attendre que EchoDB soit défini
function waitForEchoDB() {
  return new Promise((resolve) => {
    if (window.EchoDB) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.EchoDB) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  await waitForEchoDB();
  initDatabase();
});

async function initDatabase() {
  try {
    const isAdminPage = window.location.pathname.includes('admin.html');
    
    if (!isAdminPage) {
      await loadCountdown();
      await loadGameVersions();
      await loadDynamicContent();
      
      // AJOUTE CETTE LIGNE :
      await createFeedbackForm(); 
      
      initAuth();
    }
    console.log('✅ Echo Site initialisé avec base de données');
  } catch (error) {
    console.error('❌ Erreur initialisation database:', error);
  }
}

// =============================================
// COMPTE À REBOURS DYNAMIQUE
// =============================================

// =============================================
// CORRECTION DU COMPTE À REBOURS
// Ajouter cette fonction corrigée dans database.js
// =============================================

async function loadCountdown() {
  // Vérifier que les éléments existent
  const countdownSection = document.querySelector('.countdown-section');
  if (!countdownSection) {
    console.log('ℹ️ Pas de section countdown sur cette page');
    return;
  }

  try {
    const countdown = await EchoDB.Countdown.getActive();
    
    if (countdown) {
      const targetDate = new Date(countdown.target_date);
      
      // Vérifier si le compte à rebours est déjà terminé
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        // ✅ COMPTE À REBOURS DÉJÀ TERMINÉ
        console.log('⏰ Compte à rebours déjà terminé, activation immédiate');
        if (window.finishCountdown) {
          await window.finishCountdown(false);
        }
      } else {
        // 🕐 COMPTE À REBOURS EN COURS
        updateCountdownDisplay(targetDate);
        
        // Mettre à jour le titre de l'événement
        const eventTitle = document.querySelector('.countdown-title');
        if (eventTitle && countdown.event_name) {
          eventTitle.innerHTML = `<i class="fa-solid fa-rocket fa-beat"></i> ${countdown.event_name}`;
        }
      }
    }
  } catch (error) {
    console.error('Erreur countdown:', error);
  }
}

function updateCountdownDisplay(targetDate) {
  // Stocker l'interval globalement pour pouvoir l'arrêter depuis buttons.js
  window._countdownInterval = setInterval(async () => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
      clearInterval(window._countdownInterval);
      
      // ✅ APPELER LA FONCTION DE FIN DU COMPTE À REBOURS
      console.log('🎉 Compte à rebours terminé, appel de finishCountdown()');
      if (window.finishCountdown) {
        await window.finishCountdown(false);
      } else {
        console.error('❌ finishCountdown() non disponible');
      }
      
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Mettre à jour l'affichage seulement si les éléments existent
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
  }, 1000);
}

// Exporter pour être accessible depuis buttons.js
window.EchoSite = window.EchoSite || {};
window.EchoSite.loadCountdown = loadCountdown;
window.EchoSite.updateCountdownDisplay = updateCountdownDisplay;

function enableDownloadButton() {
  const downloadBtn = document.querySelector('.btn-primary[href*="executable"]');
  if (downloadBtn) {
    downloadBtn.classList.add('enabled');
    downloadBtn.removeAttribute('disabled');
  }
}

// =============================================
// VERSIONS DU JEU
// =============================================

async function loadGameVersions() {
  try {
    const latestVersion = await EchoDB.GameVersions.getLatest();
    
    if (latestVersion) {
      // Mettre à jour le numéro de version affiché
      const versionElement = document.querySelector('.version-number');
      if (versionElement) {
        versionElement.textContent = `v${latestVersion.version}`;
      }
      
      // Mettre à jour le lien de téléchargement
      const downloadBtn = document.querySelector('.download-btn, .btn-primary[href*="executable"]');
      if (downloadBtn && latestVersion.download_url) {
        downloadBtn.href = latestVersion.download_url;
        downloadBtn.setAttribute('data-version', latestVersion.version);
      }
      
      // Charger le changelog pour la page versions.html si elle existe
      if (window.location.pathname.includes('versions.html')) {
        await loadAllVersions();
      }
    }
  } catch (error) {
    console.error('Erreur versions:', error);
  }
}

async function loadAllVersions() {
  const versions = await EchoDB.GameVersions.getAll();
  const container = document.getElementById('versions-container');
  
  if (!container) return;
  
  container.innerHTML = versions.map(v => `
    <div class="version-card">
      <div class="version-header">
        <h3>Version ${v.version}</h3>
        <span class="version-date">${new Date(v.release_date).toLocaleDateString('fr-FR')}</span>
        ${v.is_beta ? '<span class="beta-badge">BETA</span>' : ''}
      </div>
      <h4>${v.title}</h4>
      <p>${v.description}</p>
      ${v.changelog ? `
        <ul class="changelog">
          ${v.changelog.map(change => `<li>${change}</li>`).join('')}
        </ul>
      ` : ''}
      ${v.download_url ? `
        <a href="${v.download_url}" class="version-download-btn">
          Télécharger v${v.version} (${v.file_size || 'Windows'})
        </a>
      ` : ''}
    </div>
  `).join('');
}

// =============================================
// CONTENU DYNAMIQUE DES SECTIONS
// =============================================

async function loadDynamicContent() {
  // Charger seulement si les conteneurs existent
  const sections = [
    { name: 'hero', selector: '#hero-text' },
    { name: 'gameplay', selector: '#gameplay-content' },
    { name: 'lore', selector: '#lore-content' }
  ];

  for (const section of sections) {
    const element = document.querySelector(section.selector);
    if (element) {
      await loadSectionContent(section.name, section.selector);
    }
  }
  
  // Charger la présentation de l'équipe si le conteneur existe
  if (document.getElementById('team-members')) {
    await loadTeamContent();
  }
}

async function loadSectionContent(sectionName, selector) {
  try {
    const content = await EchoDB.Content.getSection(sectionName);
    const element = document.querySelector(selector);
    
    if (!element || !content.length) return;
    
    // Injecter le contenu
    element.innerHTML = content.map(item => `
      <div class="content-block">
        ${item.title ? `<h3>${item.title}</h3>` : ''}
        <p>${item.content}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error(`Erreur chargement section ${sectionName}:`, error);
  }
}

async function loadTeamContent() {
  try {
    // Récupérer les profils de l'équipe
    const { data: teamMembers } = await EchoDB.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'team')
      .order('created_at');
    
    const teamContainer = document.getElementById('team-members');
    if (!teamContainer || !teamMembers) return;
    
    teamContainer.innerHTML = teamMembers.map(member => `
      <div class="team-member">
        ${member.avatar_url ? `
          <img src="${member.avatar_url}" alt="${member.display_name}">
        ` : `
          <div class="avatar-placeholder">${member.display_name[0]}</div>
        `}
        <h4>${member.display_name}</h4>
        <p class="role">${member.bio || ''}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur team:', error);
  }
}

// =============================================
// MÉDIAS DYNAMIQUES
// =============================================

async function loadGallery() {
  const galleryContainer = document.getElementById('gallery');
  if (!galleryContainer) return;
  
  try {
    const images = await EchoDB.Media.getMedia('image', 20);
    
    if (images.length === 0) {
      galleryContainer.innerHTML = '<p style="text-align: center; color: #9d00ff;">Aucune image disponible</p>';
      return;
    }
    
    galleryContainer.innerHTML = images.map(img => `
      <div class="gallery-item" onclick="openLightbox('${img.url}')">
        <img src="${img.url}" alt="${img.name}" loading="lazy">
        ${img.description ? `<p class="caption">${img.description}</p>` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur galerie:', error);
    galleryContainer.innerHTML = '<p style="color: #ff0055;">Erreur de chargement</p>';
  }
}

function openLightbox(imageUrl) {
  // Créer une lightbox pour afficher l'image en grand
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <img src="${imageUrl}" alt="Image">
    </div>
  `;
  document.body.appendChild(lightbox);
}

// =============================================
// AUTHENTIFICATION UTILISATEUR
// =============================================

function initAuth() {
  // Vérifier si l'utilisateur est connecté
  EchoDB.Auth.onAuthStateChange(async (event, session) => {
    const userMenu = document.getElementById('user-menu');
    
    if (!userMenu) return; // Pas de menu utilisateur sur cette page
    
    if (session?.user) {
      // Utilisateur connecté
      const profile = await EchoDB.Auth.getUserProfile(session.user.id);
      
      userMenu.innerHTML = `
        <span>👤 ${profile?.display_name || profile?.username || session.user.email}</span>
        <button onclick="logout()" class="btn-small">Déconnexion</button>
        ${profile?.role === 'admin' || profile?.role === 'collaborator' ? '<a href="/admin.html" class="btn-small">Dashboard</a>' : ''}
      `;
    } else {
      // Utilisateur non connecté
      userMenu.innerHTML = `
        <button onclick="openLoginModal()" class="btn-small">Connexion</button>
        <button onclick="openSignupModal()" class="btn-small">Inscription</button>
      `;
    }
  });
}

async function login(email, password) {
  const result = await EchoDB.Auth.signIn(email, password);
  
  if (result.success) {
    if (window.closeModal) closeModal();
    showNotification('✅ Connexion réussie !', 'success');
  } else {
    showNotification('❌ ' + result.error, 'error');
  }
}

async function signup(email, password, username) {
  const result = await EchoDB.Auth.signUp(email, password, username);
  
  if (result.success) {
    showNotification('✅ Inscription réussie ! Vérifiez votre email.', 'success');
    if (window.closeModal) closeModal();
  } else {
    showNotification('❌ ' + result.error, 'error');
  }
}

window.logout = async function() {
  await EchoDB.Auth.signOut();
  showNotification('👋 À bientôt !', 'info');
  setTimeout(() => location.reload(), 1000);
};

// =============================================
// FORMULAIRE DE CONTACT / FEEDBACK
// =============================================

async function submitContactForm(formData) {
  // ID du formulaire de contact
  const CONTACT_FORM_ID = await getOrCreateContactForm();
  
  const result = await EchoDB.Forms.submitResponse(CONTACT_FORM_ID, formData);
  
  if (result.success) {
    showNotification('✅ Message envoyé avec succès !', 'success');
    const form = document.getElementById('contact-form');
    if (form) form.reset();
  } else {
    showNotification('❌ Erreur lors de l\'envoi', 'error');
  }
}

async function getOrCreateContactForm() {
  try {
    const { data: existing } = await EchoDB.supabase
      .from('forms')
      .select('id')
      .eq('name', 'contact_form')
      .single();
    
    if (existing) return existing.id;
    
    const { data: newForm } = await EchoDB.supabase
      .from('forms')
      .insert({
        name: 'contact_form',
        title: 'Formulaire de contact',
        description: 'Contactez la Team Nightberry',
        is_active: true
      })
      .select('id')
      .single();
    
    return newForm.id;
  } catch (error) {
    console.error('Erreur formulaire:', error);
    return null;
  }
}

// Exemple d'utilisation du formulaire
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name')?.value,
      email: document.getElementById('email')?.value,
      message: document.getElementById('message')?.value
    };
    
    await submitContactForm(formData);
  });
}

// =============================================
// NOTIFICATIONS
// =============================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification toast-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// =============================================
// ACTUALITÉS / BLOG
// =============================================

async function loadNews(limit = 5) {
  const newsContainer = document.getElementById('news-container');
  if (!newsContainer) return;
  
  try {
    const news = await EchoDB.News.getPublished(limit);
    
    if (news.length === 0) {
      newsContainer.innerHTML = '<p style="text-align: center; color: #9d00ff;">Aucune actualité disponible</p>';
      return;
    }
    
    newsContainer.innerHTML = news.map(article => `
      <article class="news-card">
        ${article.cover?.url ? `
          <img src="${article.cover.url}" alt="${article.title}">
        ` : ''}
        <h3><a href="/news/${article.slug}">${article.title}</a></h3>
        <p class="excerpt">${article.excerpt}</p>
        <div class="meta">
          <span class="author">Par ${article.author?.display_name || 'Team Nightberry'}</span>
          <span class="date">${new Date(article.published_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </article>
    `).join('');
  } catch (error) {
    console.error('Erreur actualités:', error);
    newsContainer.innerHTML = '<p style="color: #ff0055;">Erreur de chargement</p>';
  }
}

// AJOUTER au début du fichier (après les imports)

// Charger et afficher la version du site
async function loadSiteVersionFooter() {
    try {
        // Attendre que EchoDB soit disponible
        if (!window.EchoDB) {
            await waitForEchoDB();
        }
        
        const { data, error } = await window.EchoDB.supabase
            .from('site_settings')
            .select('setting_value')
            .eq('setting_key', 'site_version')
            .single();
        
        if (error) throw error;
        
        const versionElement = document.getElementById('site-version-footer');
        if (versionElement && data) {
            versionElement.textContent = `Version ${data.setting_value}`;
        }
    } catch (error) {
        console.error('Erreur chargement version footer:', error);
        // Garder la version par défaut en cas d'erreur
    }
}

// Mettre à jour l'année automatiquement
function updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
    }
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    updateFooterYear();
    loadSiteVersionFooter();
});

// AJOUTER cette fonction dans database.js (export dans window.EchoSite)

async function getSiteSetting(key, defaultValue = null) {
    try {
        const { data, error } = await EchoDB.supabase
            .from('site_settings')
            .select('setting_value')
            .eq('setting_key', key)
            .single();
        
        if (error) throw error;
        return data.setting_value;
    } catch (error) {
        console.warn(`Setting "${key}" non trouvé, valeur par défaut utilisée`);
        return defaultValue;
    }
}


// =============================================
// GESTION DES FEEDBACKS (DESIGN & LOGIC MERGED)
// =============================================

async function createFeedbackForm() {
    const container = document.getElementById('feedback-container');
    if (!container) return;

    // Insertion du HTML "Design-Rich"
    container.innerHTML = `
    <div class="feedback-form-wrapper">
        <form id="feedbackForm" class="styled-feedback-form">
            <div class="form-section">
                <h3>
                    <i class="fa-solid fa-star"></i>
                    Note Générale <span class="required" style="color:#ff0055;">*</span>
                </h3>
                <div class="rating-stars" id="ratingStars" style="font-size: 1.5rem; margin: 10px 0; color: #444;">
                    <i class="fa-solid fa-star" data-rating="1"></i>
                    <i class="fa-solid fa-star" data-rating="2"></i>
                    <i class="fa-solid fa-star" data-rating="3"></i>
                    <i class="fa-solid fa-star" data-rating="4"></i>
                    <i class="fa-solid fa-star" data-rating="5"></i>
                </div>
                <div class="rating-label" id="ratingLabel" style="font-size: 0.9rem; color: #b0b0b0;">Sélectionnez une note</div>
                <input type="hidden" id="rating" name="rating" required>
            </div>

            <div class="form-section">
                <h3>
                    <i class="fa-solid fa-user"></i>
                    Vos Informations
                </h3>
                
                <div class="form-group">
                    <label for="name">Nom / Pseudo <span class="required" style="color:#ff0055;">*</span></label>
                    <input type="text" id="name" name="name" class="form-input" placeholder="Comment souhaitez-vous être appelé ?" required>
                </div>

                <div class="form-group">
                    <label for="email">Email (optionnel)</label>
                    <input type="email" id="email" name="email" class="form-input" placeholder="votre@email.com">
                </div>
            </div>

            <div class="form-section">
                <h3>
                    <i class="fa-solid fa-thumbs-up"></i>
                    Ce qui vous a plu
                </h3>
                
                <div class="form-group">
                    <label for="positive">Points positifs</label>
                    <textarea id="positive" name="positive" class="form-textarea" placeholder="Qu'avez-vous particulièrement apprécié dans Echo ?" maxlength="1000"></textarea>
                    <div class="char-count" id="positiveCount" style="text-align: right; font-size: 0.8rem; color: #666;">0 / 1000</div>
                </div>
            </div>

            <div class="form-section">
                <h3>
                    <i class="fa-solid fa-thumbs-down"></i>
                    À améliorer
                </h3>
                
                <div class="form-group">
                    <label for="negative">Points à améliorer</label>
                    <textarea id="negative" name="negative" class="form-textarea" placeholder="Qu'est-ce qui pourrait être amélioré selon vous ?" maxlength="1000"></textarea>
                    <div class="char-count" id="negativeCount" style="text-align: right; font-size: 0.8rem; color: #666;">0 / 1000</div>
                </div>
            </div>

            <div class="form-section">
                <h3>
                    <i class="fa-solid fa-lightbulb"></i>
                    Suggestions
                </h3>
                
                <div class="form-group">
                    <label for="suggestions">Vos idées</label>
                    <textarea id="suggestions" name="suggestions" class="form-textarea" placeholder="Avez-vous des suggestions pour améliorer le jeu ?" maxlength="1000"></textarea>
                    <div class="char-count" id="suggestionsCount" style="text-align: right; font-size: 0.8rem; color: #666;">0 / 1000</div>
                </div>
            </div>

            <button type="submit" class="submit-btn btn btn-primary" id="submitBtn" style="width: 100%; margin-top: 20px;">
                <span>
                    <i class="fa-solid fa-paper-plane"></i>
                    Envoyer mon avis
                </span>
            </button>
        </form>
    </div>`;

    initFeedbackFormLogic();
}

async function initFeedbackFormLogic() {
  const starsContainer = document.getElementById('ratingStars');
  const stars = starsContainer.querySelectorAll('i'); // Cible les icônes FontAwesome
  const ratingInput = document.getElementById('rating');
  const ratingLabel = document.getElementById('ratingLabel');
  
  const labels = ["Pas terrible", "Bof", "Moyen", "Bien", "Excellent !"];

  // 1. Logique des étoiles (Mise à jour pour FontAwesome)
  stars.forEach(star => {
    // Effet au survol (optionnel, mais sympa)
    star.onmouseover = () => {
        const val = star.dataset.rating;
        stars.forEach(s => {
            s.style.color = s.dataset.rating <= val ? '#ffaa00' : '#444'; // Or vs Gris foncé
        });
    };

    // Remettre l'état sélectionné quand on quitte la zone
    starsContainer.onmouseleave = () => {
        const currentVal = ratingInput.value || 0;
        stars.forEach(s => {
            s.style.color = s.dataset.rating <= currentVal ? '#ffaa00' : '#444';
        });
    };

    // Clic pour valider
    star.onclick = () => {
      const val = star.dataset.rating;
      ratingInput.value = val;
      ratingLabel.textContent = labels[val - 1];
      ratingLabel.style.color = '#ffaa00';
      
      // Fixer la couleur
      stars.forEach(s => {
          s.style.color = s.dataset.rating <= val ? '#ffaa00' : '#444';
      });
    };
  });

  // 2. Logique des compteurs de caractères (Nouveau design)
  ['positive', 'negative', 'suggestions'].forEach(id => {
      const input = document.getElementById(id);
      const counter = document.getElementById(id + 'Count');
      if(input && counter) {
          input.addEventListener('input', () => {
              counter.textContent = `${input.value.length} / 1000`;
              counter.style.color = input.value.length >= 900 ? '#ff0055' : '#666';
          });
      }
  });

  // 3. Soumission du formulaire (Logique Supabase + Discord conservée)
  document.getElementById('feedbackForm').onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi...';
    submitBtn.disabled = true;

    // Récupération des valeurs avec les NOUVEAUX ID
    const formData = {
      name: document.getElementById('name').value || 'Anonyme',
      email: document.getElementById('email').value || 'Non renseigné',
      rating: ratingInput.value,
      positive: document.getElementById('positive').value,
      negative: document.getElementById('negative').value,
      suggestions: document.getElementById('suggestions').value
    };

    try {
      // A. Sauvegarde Supabase
      if (window.EchoDB && window.EchoDB.supabase) {
          await window.EchoDB.supabase.from('form_responses').insert([{ 
            responses: formData, 
            submitted_at: new Date().toISOString() 
          }]);
      }
      const version = "2.4";
      // B. Envoi Webhook Discord
      const feedbackWebhook = "https://discord.com/api/webhooks/1457453565256663113/vFnITSyWP9-3Z4v4GoxnjPh4ZhYa6U7cpTieh7IqK3UCb4sAmI5GtcQ3qLeE9omiYWOw";
      const discordPayload = {
        
        username: "Echo Feedback Manager",
        avatar_url: "https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png",
        embeds: [{
          title: `🌟 Nouveau Feedback : ${formData.rating}/5`,
          color: 0x00FF88,
          fields: [
            { name: "👤 Utilisateur", value: formData.name, inline: true },
            { name: "📧 Email", value: formData.email, inline: true },
            { name: "✅ Ce qu'il a aimé", value: formData.positive || "Rien précisé" },
            { name: "❌ À améliorer", value: formData.negative || "Rien précisé" },
            { name: "💡 Suggestions", value: formData.suggestions || "Aucune" }
          ],
          footer: {
                        text: `v${version}`
                    },
          timestamp: new Date().toISOString()
        }]
      };

      const response = await fetch(feedbackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      if (response.ok) {
        document.getElementById('feedback-container').innerHTML = `
          <div style="text-align:center; padding: 40px; background: rgba(0, 255, 136, 0.1); border: 1px solid #00ff88; border-radius: 12px;">
            <h3 style="color: #00ff88; font-size: 2rem; margin-bottom: 10px;"><i class="fa-solid fa-check-circle"></i> Merci !</h3>
            <p style="color: #b0b0b0;">Votre avis est précieux pour la Team Nightberry.</p>
          </div>`;
      } else {
        throw new Error("Erreur Webhook");
      }

    } catch (err) {
      console.error('Erreur envoi feedback:', err);
      alert("Désolé, l'envoi a échoué. Vérifiez votre connexion.");
      submitBtn.innerHTML = originalBtnContent;
      submitBtn.disabled = false;
    }
  };
}


function initFeedbackForm() {
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('feedback-rating');
  
  // Gestion des étoiles
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = star.dataset.rating;
      ratingInput.value = rating;
      stars.forEach((s, i) => {
        if (i < rating) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });
  
  // Soumission
  document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('feedback-name').value || 'Anonyme',
      email: document.getElementById('feedback-email').value,
      rating: parseInt(document.getElementById('feedback-rating').value),
      positive: document.getElementById('feedback-positive').value,
      negative: document.getElementById('feedback-negative').value,
      suggestions: document.getElementById('feedback-suggestions').value
    };
    await submitFeedback(formData);
  });
}

async function submitFeedback(formData) {
  try {
    const user = await EchoDB.Auth.getCurrentUser();
    
    // Récupérer ou créer l'ID du formulaire
    let formId;
    const { data: existing } = await EchoDB.supabase.from('forms').select('id').eq('name', 'feedback_echo').single();
    if (existing) formId = existing.id;
    else {
        const { data: newForm } = await EchoDB.supabase.from('forms').insert({ name: 'feedback_echo', title: 'Feedback Echo', is_active: true }).select('id').single();
        formId = newForm.id;
    }

    // Insérer la réponse
    const { error } = await EchoDB.supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        user_id: user?.id,
        responses: formData,
        submitted_at: new Date().toISOString()
      });

    if (error) throw error;
    
    showNotification('✅ Merci pour votre feedback!', 'success');
    document.getElementById('feedback-form').reset();

    // Envoi Discord
    if (window.sendDiscordNotification) {
      await window.sendDiscordNotification('new_feedback', formData);
    }
    
  } catch (error) {
    console.error('Erreur feedback:', error);
    showNotification('❌ Erreur lors de l\'envoi', 'error');
  }
}


// =============================================
// EXPORT DES FONCTIONS
// =============================================

window.EchoSite = {
  loadCountdown,
  loadGameVersions,
  loadDynamicContent,
  loadGallery,
  login,
  signup,
  logout: window.logout,
  submitContactForm,
  loadNews,
  showNotification,
  getSiteSetting
};

console.log('✅ Echo Site initialisé avec base de données');