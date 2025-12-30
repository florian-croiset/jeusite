// =============================================
// INTÉGRATION SUPABASE COMPLÈTE POUR ECHO
// Fichier : js/database-complete.js
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

// =============================================
// 1. MODIFIER LE TEXTE DE LA PAGE D'ACCUEIL
// =============================================

async function updateHomeContent(sectionName, title, content) {
  try {
    // Récupérer le contenu existant
    const { data: existing } = await EchoDB.supabase
      .from('site_content')
      .select('*')
      .eq('section', sectionName)
      .single();

    if (existing) {
      // Mettre à jour
      const { data, error } = await EchoDB.supabase
        .from('site_content')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } else {
      // Créer nouveau
      const { data, error } = await EchoDB.supabase
        .from('site_content')
        .insert({
          section: sectionName,
          title,
          content,
          is_published: true
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }
  } catch (error) {
    console.error('Erreur mise à jour contenu:', error);
    return { success: false, error: error.message };
  }
}

// Exemple d'utilisation
async function initHomeContent() {
  // Charger le texte hero
  const heroContent = await EchoDB.Content.getSection('hero');
  if (heroContent && heroContent.length > 0) {
    const heroText = document.querySelector('.hero-content h1');
    const heroSubtitle = document.querySelector('.hero-content p');
    
    if (heroText && heroContent[0].title) {
      heroText.innerHTML = `<span></span>${heroContent[0].title}`;
    }
    if (heroSubtitle && heroContent[0].content) {
      heroSubtitle.textContent = heroContent[0].content;
    }
  }
}

// =============================================
// 2. AJOUTER UNE NOUVELLE VERSION DU JEU
// =============================================

async function addGameVersion(versionData) {
  try {
    const user = await EchoDB.Auth.getCurrentUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await EchoDB.supabase
      .from('game_versions')
      .insert({
        version: versionData.version,
        title: versionData.title,
        description: versionData.description,
        changelog: versionData.changelog, // Array de strings
        release_date: versionData.releaseDate,
        download_url: versionData.downloadUrl,
        file_size: versionData.fileSize,
        is_beta: versionData.isBeta || false,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    showNotification('✅ Version ajoutée avec succès!', 'success');
    return { success: true, data };
  } catch (error) {
    console.error('Erreur ajout version:', error);
    showNotification('❌ Erreur lors de l\'ajout', 'error');
    return { success: false, error: error.message };
  }
}

// Interface admin pour ajouter une version
function openVersionModal() {
  const modal = createModal('Nouvelle version', `
    <form id="version-form">
      <div class="form-group">
        <label>Numéro de version *</label>
        <input type="text" id="version-number" placeholder="1.5.0" required>
      </div>
      <div class="form-group">
        <label>Titre *</label>
        <input type="text" id="version-title" placeholder="Mise à jour majeure" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="version-description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Changelog (un par ligne)</label>
        <textarea id="version-changelog" rows="5" placeholder="Ajout du mode multijoueur
Correction de bugs
Nouvelles animations"></textarea>
      </div>
      <div class="form-group">
        <label>URL de téléchargement</label>
        <input type="url" id="version-url" placeholder="https://...">
      </div>
      <div class="form-group">
        <label>Taille du fichier</label>
        <input type="text" id="version-size" placeholder="150 MB">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="version-beta">
          Version bêta
        </label>
      </div>
      <div class="form-group">
        <label>Date de sortie</label>
        <input type="datetime-local" id="version-date" required>
      </div>
      <button type="submit" class="btn btn-primary">Créer la version</button>
    </form>
  `);

  document.getElementById('version-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const changelog = document.getElementById('version-changelog').value
      .split('\n')
      .filter(line => line.trim());

    await addGameVersion({
      version: document.getElementById('version-number').value,
      title: document.getElementById('version-title').value,
      description: document.getElementById('version-description').value,
      changelog,
      releaseDate: document.getElementById('version-date').value,
      downloadUrl: document.getElementById('version-url').value,
      fileSize: document.getElementById('version-size').value,
      isBeta: document.getElementById('version-beta').checked
    });

    modal.remove();
    loadVersions();
  });
}

// =============================================
// 3. GÉRER LE COMPTE À REBOURS
// =============================================

async function createCountdown(eventName, targetDate, description) {
  try {
    const user = await EchoDB.Auth.getCurrentUser();
    if (!user) throw new Error('Non authentifié');

    // Désactiver les anciens countdowns
    await EchoDB.supabase
      .from('countdown')
      .update({ is_active: false })
      .eq('is_active', true);

    // Créer le nouveau
    const { data, error } = await EchoDB.supabase
      .from('countdown')
      .insert({
        event_name: eventName,
        target_date: targetDate,
        description,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    showNotification('⏰ Compte à rebours créé!', 'success');
    return { success: true, data };
  } catch (error) {
    console.error('Erreur création countdown:', error);
    return { success: false, error: error.message };
  }
}

async function loadCountdown() {
  const countdown = await EchoDB.Countdown.getActive();
  
  if (countdown) {
    const targetDate = new Date(countdown.target_date);
    updateCountdownDisplay(targetDate);
    
    const eventTitle = document.querySelector('.countdown-title');
    if (eventTitle && countdown.event_name) {
      eventTitle.innerHTML = `<i class="fa-solid fa-rocket fa-beat"></i> ${countdown.event_name}`;
    }
  }
}

function updateCountdownDisplay(targetDate) {
  const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
      clearInterval(countdownInterval);
      enableDownloadButton();
      document.querySelector('.countdown-section')?.classList.add('expired');
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
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

/*function enableDownloadButton() {
  const downloadBtn = document.querySelector('.btn-primary[href*="executable"]');
  if (downloadBtn) {
    downloadBtn.classList.add('enabled');
    downloadBtn.removeAttribute('disabled');
  }
}*/

// =============================================
// 4. UPLOAD ET AFFICHAGE D'IMAGES
// =============================================

async function uploadImage(file, folder = 'gallery') {
  try {
    const result = await EchoDB.Media.uploadFile(file, folder);
    
    if (result.success) {
      showNotification(`✅ ${file.name} uploadé!`, 'success');
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Erreur upload:', error);
    showNotification('❌ Erreur upload', 'error');
    return null;
  }
}

// Interface admin d'upload
function initMediaUpload() {
  const fileInput = document.getElementById('file-input');
  
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        await uploadImage(file);
      }
      
      loadGallery();
      e.target.value = ''; // Reset input
    });
  }
}

// Afficher une galerie d'images
async function loadGallery() {
  const images = await EchoDB.Media.getMedia('image', 50);
  const galleryContainer = document.getElementById('media-grid') || document.getElementById('gallery');
  
  if (!galleryContainer) return;
  
  if (images.length === 0) {
    galleryContainer.innerHTML = '<p class="loading">Aucune image disponible</p>';
    return;
  }
  
  galleryContainer.innerHTML = images.map(img => `
    <div class="media-item" onclick="openLightbox('${img.url}', '${img.name}')">
      <img src="${img.url}" alt="${img.name}" loading="lazy">
      <div class="media-overlay">
        <span>${img.name}</span>
      </div>
    </div>
  `).join('');
}

function openLightbox(imageUrl, imageName) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <img src="${imageUrl}" alt="${imageName}">
      <p class="lightbox-caption">${imageName}</p>
    </div>
  `;
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.remove();
  });
  
  document.body.appendChild(lightbox);
}

// =============================================
// 5. CRÉER UN FORMULAIRE DE FEEDBACK
// =============================================

async function createFeedbackForm() {
  const formHTML = `
    <div class="feedback-form">
      <h3>💬 Donnez votre avis sur Echo</h3>
      <form id="feedback-form">
        <div class="form-group">
          <label>Votre nom (optionnel)</label>
          <input type="text" id="feedback-name" placeholder="Votre pseudo">
        </div>
        
        <div class="form-group">
          <label>Email (optionnel)</label>
          <input type="email" id="feedback-email" placeholder="votre@email.com">
        </div>
        
        <div class="form-group">
          <label>Note globale *</label>
          <div class="rating-stars" id="rating-stars">
            ${[1,2,3,4,5].map(n => `<span class="star" data-rating="${n}">⭐</span>`).join('')}
          </div>
          <input type="hidden" id="feedback-rating" required>
        </div>
        
        <div class="form-group">
          <label>Qu'avez-vous aimé ? *</label>
          <textarea id="feedback-positive" rows="3" required></textarea>
        </div>
        
        <div class="form-group">
          <label>Points à améliorer</label>
          <textarea id="feedback-negative" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <label>Suggestions</label>
          <textarea id="feedback-suggestions" rows="3"></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary">Envoyer mon avis</button>
      </form>
    </div>
  `;
  
  const container = document.getElementById('feedback-container');
  if (container) {
    container.innerHTML = formHTML;
    initFeedbackForm();
  }
}

function initFeedbackForm() {
  // Gestion des étoiles
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('feedback-rating');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = star.dataset.rating;
      ratingInput.value = rating;
      
      stars.forEach((s, i) => {
        if (i < rating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });
  
  // Soumission du formulaire
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
    
    // Créer le formulaire s'il n'existe pas
    let formId = await getOrCreateFeedbackForm();
    
    const { data, error } = await EchoDB.supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        user_id: user?.id,
        responses: formData,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    showNotification('✅ Merci pour votre feedback!', 'success');
    document.getElementById('feedback-form').reset();
    
    return { success: true, data };
  } catch (error) {
    console.error('Erreur soumission feedback:', error);
    showNotification('❌ Erreur lors de l\'envoi', 'error');
    return { success: false, error: error.message };
  }
}

async function getOrCreateFeedbackForm() {
  // Vérifier si le formulaire existe
  const { data: existing } = await EchoDB.supabase
    .from('forms')
    .select('id')
    .eq('name', 'feedback_echo')
    .single();
  
  if (existing) return existing.id;
  
  // Créer le formulaire
  const { data: newForm } = await EchoDB.supabase
    .from('forms')
    .insert({
      name: 'feedback_echo',
      title: 'Feedback Echo',
      description: 'Formulaire de retour sur le jeu Echo',
      is_active: true
    })
    .select('id')
    .single();
  
  return newForm.id;
}

// Afficher les réponses (admin)
async function loadFeedbackResponses() {
  const { data, error } = await EchoDB.supabase
    .from('form_responses')
    .select(`
      *,
      user:profiles(username, display_name)
    `)
    .order('submitted_at', { ascending: false });
  
  if (error) {
    console.error('Erreur chargement feedback:', error);
    return;
  }
  
  const container = document.getElementById('forms-list');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Utilisateur</th>
          <th>Note</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(response => `
          <tr>
            <td>${new Date(response.submitted_at).toLocaleDateString('fr-FR')}</td>
            <td>${response.responses.name || response.user?.display_name || 'Anonyme'}</td>
            <td>${'⭐'.repeat(response.responses.rating || 0)}</td>
            <td>
              <button class="action-btn edit" onclick="viewFeedback('${response.id}')">👁️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

window.viewFeedback = async function(id) {
  const { data } = await EchoDB.supabase
    .from('form_responses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!data) return;
  
  const modal = createModal('Détails du feedback', `
    <div class="feedback-details">
      <p><strong>Nom:</strong> ${data.responses.name}</p>
      <p><strong>Email:</strong> ${data.responses.email || 'Non fourni'}</p>
      <p><strong>Note:</strong> ${'⭐'.repeat(data.responses.rating)}</p>
      <p><strong>Points positifs:</strong></p>
      <p>${data.responses.positive}</p>
      <p><strong>À améliorer:</strong></p>
      <p>${data.responses.negative || 'Rien'}</p>
      <p><strong>Suggestions:</strong></p>
      <p>${data.responses.suggestions || 'Aucune'}</p>
    </div>
  `);
};

// =============================================
// 6. SYSTÈME DE CONNEXION/INSCRIPTION
// =============================================

function createAuthModals() {
  // Modal de connexion
  const loginModal = `
    <div id="login-modal" class="auth-modal" style="display: none;">
      <div class="auth-modal-content">
        <span class="close" onclick="closeAuthModal('login')">&times;</span>
        <h2>🔐 Connexion</h2>
        <form id="login-form-main">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="login-email" required>
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" id="login-password" required>
          </div>
          <button type="submit" class="btn btn-primary">Se connecter</button>
          <p class="switch-auth">
            Pas de compte ? <a href="#" onclick="switchToSignup()">S'inscrire</a>
          </p>
        </form>
      </div>
    </div>
  `;
  
  // Modal d'inscription
  const signupModal = `
    <div id="signup-modal" class="auth-modal" style="display: none;">
      <div class="auth-modal-content">
        <span class="close" onclick="closeAuthModal('signup')">&times;</span>
        <h2>✨ Inscription</h2>
        <form id="signup-form-main">
          <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" id="signup-username" required minlength="3">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="signup-email" required>
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" id="signup-password" required minlength="6">
          </div>
          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" id="signup-password-confirm" required>
          </div>
          <button type="submit" class="btn btn-primary">S'inscrire</button>
          <p class="switch-auth">
            Déjà un compte ? <a href="#" onclick="switchToLogin()">Se connecter</a>
          </p>
        </form>
      </div>
    </div>
  `;
  
  // Ajouter au body
  document.body.insertAdjacentHTML('beforeend', loginModal + signupModal);
  
  // Initialiser les événements
  initAuthForms();
}

function initAuthForms() {
  // Connexion
  document.getElementById('login-form-main')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const result = await EchoDB.Auth.signIn(email, password);
    
    if (result.success) {
      closeAuthModal('login');
      showNotification('✅ Connexion réussie!', 'success');
      updateUserUI(result.user);
    } else {
      showNotification('❌ ' + result.error, 'error');
    }
  });
  
  // Inscription
  document.getElementById('signup-form-main')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-password-confirm').value;
    
    if (password !== confirm) {
      showNotification('❌ Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    const result = await EchoDB.Auth.signUp(email, password, username);
    
    if (result.success) {
      closeAuthModal('signup');
      showNotification('✅ Inscription réussie! Vérifiez votre email.', 'success');
    } else {
      showNotification('❌ ' + result.error, 'error');
    }
  });
}

window.openLoginModal = function() {
  document.getElementById('login-modal').style.display = 'flex';
};

window.openSignupModal = function() {
  document.getElementById('signup-modal').style.display = 'flex';
};

window.closeAuthModal = function(type) {
  document.getElementById(`${type}-modal`).style.display = 'none';
};

window.switchToSignup = function() {
  closeAuthModal('login');
  openSignupModal();
};

window.switchToLogin = function() {
  closeAuthModal('signup');
  openLoginModal();
};

async function updateUserUI(user) {
  const profile = await EchoDB.Auth.getUserProfile(user.id);
  const userMenu = document.getElementById('user-menu');
  
  if (userMenu) {
    userMenu.innerHTML = `
      <div class="user-info">
        <span>👤 ${profile?.display_name || profile?.username || user.email}</span>
        <button onclick="logout()" class="btn-small">Déconnexion</button>
        ${profile?.role === 'admin' ? '<a href="/admin.html" class="btn-small">Admin</a>' : ''}
      </div>
    `;
  }
}

window.logout = async function() {
  await EchoDB.Auth.signOut();
  showNotification('👋 À bientôt!', 'info');
  setTimeout(() => location.reload(), 1000);
};

// =============================================
// 7. AFFICHER LES DERNIÈRES ACTUALITÉS
// =============================================

async function loadNews(limit = 5) {
  const news = await EchoDB.News.getPublished(limit);
  const newsContainer = document.getElementById('news-container');
  
  if (!newsContainer) return;
  
  if (news.length === 0) {
    newsContainer.innerHTML = '<p class="loading">Aucune actualité pour le moment</p>';
    return;
  }
  
  newsContainer.innerHTML = news.map(article => `
    <article class="news-card" onclick="openNewsDetail('${article.slug}')">
      ${article.cover?.url ? `
        <div class="news-image">
          <img src="${article.cover.url}" alt="${article.title}" loading="lazy">
        </div>
      ` : ''}
      <div class="news-content">
        <h3>${article.title}</h3>
        <p class="news-excerpt">${article.excerpt}</p>
        <div class="news-meta">
          <span class="author">✍️ ${article.author?.display_name || 'Team Nightberry'}</span>
          <span class="date">📅 ${new Date(article.published_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </article>
  `).join('');
}

window.openNewsDetail = async function(slug) {
  const article = await EchoDB.News.getBySlug(slug);
  
  if (!article) {
    showNotification('❌ Article introuvable', 'error');
    return;
  }
  
  const modal = createModal(article.title, `
    ${article.cover?.url ? `<img src="${article.cover.url}" alt="${article.title}" style="width:100%; border-radius:8px; margin-bottom:20px;">` : ''}
    <div class="news-full-content">
      ${article.content}
    </div>
    <div class="news-meta" style="margin-top:20px; padding-top:20px; border-top:1px solid var(--purple);">
      <span>Par ${article.author?.display_name || 'Team Nightberry'}</span>
      <span>${new Date(article.published_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span>
    </div>
  `);
};

// =============================================
// 8. STATISTIQUES EN TEMPS RÉEL
// =============================================

async function loadDashboardStats() {
  try {
    const [usersCount, mediaCount, contentCount, responsesCount, downloadsCount] = await Promise.all([
      EchoDB.supabase.from('profiles').select('id', { count: 'exact', head: true }),
      EchoDB.supabase.from('media').select('id', { count: 'exact', head: true }),
      EchoDB.supabase.from('site_content').select('id', { count: 'exact', head: true }),
      EchoDB.supabase.from('form_responses').select('id', { count: 'exact', head: true }),
      EchoDB.supabase.from('downloads').select('id', { count: 'exact', head: true })
    ]);

    updateStatDisplay('stats-users', usersCount.count || 0);
    updateStatDisplay('stats-media', mediaCount.count || 0);
    updateStatDisplay('stats-content', contentCount.count || 0);
    updateStatDisplay('stats-responses', responsesCount.count || 0);
    updateStatDisplay('stats-downloads', downloadsCount.count || 0);
  } catch (error) {
    console.error('Erreur chargement stats:', error);
  }
}

function updateStatDisplay(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) {
    // Animation du compteur
    const current = parseInt(el.textContent) || 0;
    const increment = Math.ceil((value - current) / 20);
    
    let counter = current;
    const timer = setInterval(() => {
      counter += increment;
      if (counter >= value) {
        el.textContent = value;
        clearInterval(timer);
      } else {
        el.textContent = counter;
      }
    }, 50);
  }
}

// =============================================
// 9. SAUVEGARDER LES TÉLÉCHARGEMENTS
// =============================================

async function trackDownload(version, downloadUrl) {
  try {
    const user = await EchoDB.Auth.getCurrentUser();
    
    // Enregistrer le téléchargement
    const { data, error } = await EchoDB.supabase
      .from('downloads')
      .insert({
        version,
        user_id: user?.id,
        download_url: downloadUrl,
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        downloaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Téléchargement enregistré:', version);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur tracking download:', error);
    return { success: false, error: error.message };
  }
}

// Intercepter les clics sur les boutons de téléchargement
function initDownloadTracking() {
  document.querySelectorAll('a[href*="executable"], a[href*=".exe"], .download-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const version = btn.dataset.version || 'latest';
      const url = btn.href;
      
      await trackDownload(version, url);
    });
  });
}

// Afficher les stats de téléchargement (admin)
async function loadDownloadStats() {
  const { data, error } = await EchoDB.supabase
    .from('downloads')
    .select(`
      *,
      user:profiles(username, display_name)
    `)
    .order('downloaded_at', { ascending: false })
    .limit(100);
  
  if (error) {
    console.error('Erreur stats téléchargement:', error);
    return;
  }
  
  const container = document.getElementById('downloads-stats');
  if (!container) return;
  
  // Grouper par version
  const byVersion = data.reduce((acc, dl) => {
    acc[dl.version] = (acc[dl.version] || 0) + 1;
    return acc;
  }, {});
  
  container.innerHTML = `
    <div class="stats-summary">
      <h3>Téléchargements par version</h3>
      ${Object.entries(byVersion).map(([version, count]) => `
        <div class="stat-row">
          <span>${version}</span>
          <span class="stat-value">${count}</span>
        </div>
      `).join('')}
    </div>
    
    <h3>Derniers téléchargements</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Version</th>
          <th>Utilisateur</th>
          <th>Plateforme</th>
        </tr>
      </thead>
      <tbody>
        ${data.slice(0, 20).map(dl => `
          <tr>
            <td>${new Date(dl.downloaded_at).toLocaleString('fr-FR')}</td>
            <td>${dl.version}</td>
            <td>${dl.user?.display_name || 'Anonyme'}</td>
            <td>${dl.platform}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// =============================================
// 10. RECHERCHE DANS LE CONTENU
// =============================================

async function searchContent(query) {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await EchoDB.supabase
      .from('site_content')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('is_published', true)
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur recherche:', error);
    return [];
  }
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput || !searchResults) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value;
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      const results = await searchContent(query);
      
      if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">Aucun résultat</div>';
        searchResults.style.display = 'block';
        return;
      }
      
      searchResults.innerHTML = results.map(item => `
        <div class="search-result-item" onclick="scrollToSection('${item.section}')">
          <h4>${highlightQuery(item.title, query)}</h4>
          <p>${highlightQuery(item.content.substring(0, 100), query)}...</p>
        </div>
      `).join('');
      searchResults.style.display = 'block';
    }, 300);
  });
  
  // Fermer en cliquant ailleurs
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

function highlightQuery(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

window.scrollToSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('search-results').style.display = 'none';
  }
};

// =============================================
// 11. NOTIFICATIONS EN TEMPS RÉEL
// =============================================

function initRealtimeNotifications() {
  // S'abonner aux changements sur la table notifications
  const subscription = EchoDB.supabase
    .channel('notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, 
      (payload) => {
        showRealtimeNotification(payload.new);
      }
    )
    .subscribe();
  
  console.log('✅ Notifications en temps réel activées');
}

function showRealtimeNotification(notification) {
  // Créer une notification toast
  const toast = document.createElement('div');
  toast.className = 'realtime-notification';
  toast.innerHTML = `
    <div class="notification-icon">${notification.icon || '🔔'}</div>
    <div class="notification-content">
      <h4>${notification.title}</h4>
      <p>${notification.message}</p>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animation d'entrée
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Retirer après 5 secondes
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Envoyer une notification (admin)
async function sendNotification(title, message, icon = '🔔') {
  try {
    const user = await EchoDB.Auth.getCurrentUser();
    if (!user) throw new Error('Non authentifié');
    
    const { data, error } = await EchoDB.supabase
      .from('notifications')
      .insert({
        title,
        message,
        icon,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// UTILITAIRES
// =============================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification toast-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function createModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <span class="close" onclick="this.closest('.custom-modal').remove()">&times;</span>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
  return modal;
}

// =============================================
// INITIALISATION PRINCIPALE
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
  await waitForEchoDB();
  
  try {
    // Initialiser les composants
    await initHomeContent();
    await loadCountdown();
    //await loadGameVersions();
    await loadGallery();
    await loadNews();
    await createFeedbackForm();
    
    // Auth
    createAuthModals();
    EchoDB.Auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await updateUserUI(session.user);
      }
    });
    
    // Fonctionnalités interactives
    initSearch();
    initDownloadTracking();
    initMediaUpload();
    initRealtimeNotifications();
    
    // Stats (si sur la page admin)
    if (window.location.pathname.includes('admin')) {
      await loadDashboardStats();
      await loadDownloadStats();
      await loadFeedbackResponses();
    }
    
    console.log('✅ Echo Site complètement initialisé!');
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
  }
});

// Exporter les fonctions globales
window.EchoComplete = {
  updateHomeContent,
  addGameVersion,
  createCountdown,
  uploadImage,
  submitFeedback,
  trackDownload,
  searchContent,
  sendNotification,
  openVersionModal,
  loadGallery,
  loadNews,
  loadDashboardStats
};