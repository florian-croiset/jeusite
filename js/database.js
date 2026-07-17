// Intégration Supabase pour Echo

// Sécurité : échapper les caractères HTML pour éviter les XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

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
      await createFeedbackForm();
      initAuth();
    }
    console.log('✅ Echo Site initialisé avec base de données');
  } catch (error) {
    console.error('❌ Erreur initialisation database:', error);
  }
}

// ===== COMPTE À REBOURS =====

async function loadCountdown() {
  const countdownSection = document.querySelector('.countdown-section');
  if (!countdownSection) {
    console.log('ℹ️ Pas de section countdown sur cette page');
    return;
  }

  try {
    const countdown = await EchoDB.Countdown.getActive();

    if (countdown) {
      const targetDate = new Date(countdown.target_date);
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        console.log('⏰ Compte à rebours déjà terminé, activation immédiate');
        if (window.finishCountdown) {
          await window.finishCountdown(false);
        }
      } else {
        updateCountdownDisplay(targetDate);

        const eventTitle = document.querySelector('.countdown-title');
        if (eventTitle && countdown.event_name) {
          eventTitle.innerHTML = `<i class="fa-solid fa-rocket fa-beat"></i> ${escapeHtml(countdown.event_name)}`;
        }
      }
    }
  } catch (error) {
    console.error('Erreur countdown:', error);
  }
}

function updateCountdownDisplay(targetDate) {
  // Interval stocké globalement pour pouvoir être arrêté depuis buttons.js
  window._countdownInterval = setInterval(async () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(window._countdownInterval);

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

// Exposé pour buttons.js
window.EchoSite = window.EchoSite || {};
window.EchoSite.loadCountdown = loadCountdown;
window.EchoSite.updateCountdownDisplay = updateCountdownDisplay;

// ===== VERSIONS DU JEU =====

async function loadGameVersions() {
  try {
    const latestVersion = await EchoDB.GameVersions.getLatest();

    if (latestVersion) {
      const versionElement = document.querySelector('.version-number');
      if (versionElement) {
        versionElement.textContent = `v${latestVersion.version}`;
      }

      const downloadBtn = document.querySelector('.download-btn, .btn-primary[href*="executable"]');
      if (downloadBtn && latestVersion.download_url) {
        downloadBtn.href = latestVersion.download_url;
        downloadBtn.setAttribute('data-version', latestVersion.version);
      }

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
      <h4>${escapeHtml(v.title)}</h4>
      <p>${escapeHtml(v.description)}</p>
      ${v.changelog ? `
        <ul class="changelog">
          ${v.changelog.map(change => `<li>${escapeHtml(change)}</li>`).join('')}
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

// ===== AUTHENTIFICATION UTILISATEUR =====

function initAuth() {
  EchoDB.Auth.onAuthStateChange(async (event, session) => {
    const userMenu = document.getElementById('user-menu');

    if (!userMenu) return;

    if (session?.user) {
      const profile = await EchoDB.Auth.getUserProfile(session.user.id);

      userMenu.innerHTML = `
        <span>👤 ${profile?.display_name || profile?.username || session.user.email}</span>
        <button onclick="logout()" class="btn-small">Déconnexion</button>
        ${profile?.role === 'admin' || profile?.role === 'collaborator' ? '<a href="/admin.html" class="btn-small">Dashboard</a>' : ''}
      `;
    } else {
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

// ===== FORMULAIRE DE CONTACT =====

async function submitContactForm(formData) {
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

// ===== NOTIFICATIONS =====

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

async function loadSiteVersionFooter() {
    try {
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
    }
}

function updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateFooterYear();
    loadSiteVersionFooter();
});

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

// ===== FORMULAIRE DE FEEDBACK =====

async function createFeedbackForm() {
    const container = document.getElementById('feedback-container');
    if (!container) return;

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
  const stars = starsContainer.querySelectorAll('i');
  const ratingInput = document.getElementById('rating');
  const ratingLabel = document.getElementById('ratingLabel');

  const labels = ["Pas terrible", "Bof", "Moyen", "Bien", "Excellent !"];

  // 1. Étoiles
  stars.forEach(star => {
    star.onmouseover = () => {
        const val = star.dataset.rating;
        stars.forEach(s => {
            s.style.color = s.dataset.rating <= val ? '#ffaa00' : '#444';
        });
    };

    // Remettre l'état sélectionné quand on quitte la zone
    starsContainer.onmouseleave = () => {
        const currentVal = ratingInput.value || 0;
        stars.forEach(s => {
            s.style.color = s.dataset.rating <= currentVal ? '#ffaa00' : '#444';
        });
    };

    star.onclick = () => {
      const val = star.dataset.rating;
      ratingInput.value = val;
      ratingLabel.textContent = labels[val - 1];
      ratingLabel.style.color = '#ffaa00';

      stars.forEach(s => {
          s.style.color = s.dataset.rating <= val ? '#ffaa00' : '#444';
      });
    };
  });

  // 2. Compteurs de caractères
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

  // 3. Soumission du formulaire
  document.getElementById('feedbackForm').onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi...';
    submitBtn.disabled = true;

    const formData = {
      name: document.getElementById('name').value || 'Anonyme',
      email: document.getElementById('email').value || 'Non renseigné',
      rating: ratingInput.value,
      positive: document.getElementById('positive').value,
      negative: document.getElementById('negative').value,
      suggestions: document.getElementById('suggestions').value
    };

    try {
      // Sauvegarde Supabase
      if (window.EchoDB && window.EchoDB.supabase) {
          await window.EchoDB.supabase.from('form_responses').insert([{
            responses: formData,
            submitted_at: new Date().toISOString()
          }]);
      }
      const version = "2.5";
      // Envoi Webhook Discord
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

window.EchoSite = {
  loadCountdown,
  loadGameVersions,
  login,
  signup,
  logout: window.logout,
  submitContactForm,
  showNotification,
  getSiteSetting
};

console.log('✅ Echo Site initialisé avec base de données');
