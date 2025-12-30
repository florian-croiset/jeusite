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
    // Détecter si on est sur la page admin
    const isAdminPage = window.location.pathname.includes('admin.html');
    
    if (!isAdminPage) {
      // 1. Charger le compte à rebours depuis la base (seulement sur la page principale)
      await loadCountdown();
      
      // 2. Charger les versions du jeu
      await loadGameVersions();
      
      // 3. Charger le contenu dynamique des sections
      await loadDynamicContent();
      
      // 4. Gérer l'authentification utilisateur
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

// =============================================
// STATISTIQUES ET ANALYTICS
// =============================================

/*async function trackPageView() {
  try {
    const user = await EchoDB.Auth.getCurrentUser();
    
    const { error } = await EchoDB.supabase.from('analytics').insert({
      page: window.location.pathname,
      user_id: user?.id,
      timestamp: new Date().toISOString()
    });
    
    if (error && !error.message.includes('relation "analytics" does not exist')) {
      console.error('Erreur tracking:', error);
    }
  } catch (error) {
  }
}

if (window.EchoDB && !window.location.pathname.includes('admin.html')) {
  trackPageView().catch(() => {});
}*/

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
  showNotification
};

console.log('✅ Echo Site initialisé avec base de données');