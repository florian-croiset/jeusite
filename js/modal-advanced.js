/* =========================================================
   MODAL-ADVANCED.JS - VERSION CORRIGÉE
   Modale secrète avec sécurité avancée + 2FA + Oscilloscope
   ========================================================= */

class AdvancedSecretModal {
  constructor() {
    this.modal = document.getElementById('secretModal');
    this.input = document.getElementById('secretInput');
    this.confirmBtn = document.getElementById('confirmSecret');
    this.cancelBtn = document.getElementById('cancelSecret');
    this.attemptsCounter = document.getElementById('attemptsCounter');
    this.attemptsText = document.getElementById('attemptsText');
    this.cooldownTimer = document.getElementById('cooldownTimer');
    this.cooldownTime = document.getElementById('cooldownTime');
    this.unlockProgress = document.getElementById('unlockProgress');
    this.progressFill = document.getElementById('progressFill');
    this.modalMessage = document.getElementById('modalMessage');
    this.secretBox = document.querySelector('.secret-box');
    this.devBadge = document.getElementById('devBadge');
    this.adminPanel = document.getElementById('adminPanel');

    // 2FA
    this.twofaSection = document.getElementById('twofaSection');
    this.twofaInput = document.getElementById('twofaInput');

    // État
    this.attemptsLeft = 3;
    this.isLocked = false;
    this.cooldownInterval = null;
    this.currentUser = null;
    this.require2FA = false;
    this.generated2FACode = null;

    // Oscilloscope
    this.canvas = document.getElementById('waveCanvas');
    this.ctx = this.canvas?.getContext('2d');
    this.waveAnimation = null;

    this.init();
  }

  async init() {
    // Vérifier que les éléments essentiels existent
    if (!this.modal || !this.input || !this.confirmBtn) {
      console.warn('❌ Modal-advanced: Éléments HTML manquants');
      return;
    }

    // Charger les tentatives depuis localStorage
    const savedAttempts = localStorage.getItem('modal_attempts');
    const savedLockTime = localStorage.getItem('modal_lock_time');

    if (savedAttempts) this.attemptsLeft = parseInt(savedAttempts);

    // Vérifier si toujours en cooldown
    if (savedLockTime) {
      const lockTime = parseInt(savedLockTime);
      const now = Date.now();
      const remaining = 60000 - (now - lockTime);

      if (remaining > 0) {
        this.startCooldown(Math.ceil(remaining / 1000));
      } else {
        this.resetAttempts();
      }
    }

    this.setupEventListeners();
    this.startOscilloscope();
    this.updateAttemptsDisplay();

    // Vérifier si déjà authentifié
    await this.checkAuthStatus();
  }

  setupEventListeners() {
    // Ouvrir modale
    const versionBtn = document.getElementById('versionAccessBtn');
    if (versionBtn) {
      versionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.isLocked) {
          this.openModal();
        }
      });
    }

    // Fermer modale
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // Valider
    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.validateCode();
      });
    }

    if (this.input) {
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.validateCode();
        }
      });
    }

    // Boutons utilitaires
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.input.value = '';
        this.input.focus();
      });
    }

    const pasteBtn = document.getElementById('pasteBtn');
    if (pasteBtn) {
      pasteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          // Demander la permission explicitement
          const permission = await navigator.permissions.query({ name: 'clipboard-read' });
          if (permission.state === 'granted' || permission.state === 'prompt') {
            const text = await navigator.clipboard.readText();
            this.input.value = text;
            this.showMessage('Code collé !', 'success');
          } else {
            this.showMessage('Permission refusée. Utilisez Ctrl+V', 'error');
          }
        } catch (err) {
          // Fallback silencieux
          this.showMessage('Utilisez Ctrl+V pour coller', 'info');
        }
      });
    }

    const typewriterBtn = document.getElementById('typewriterBtn');
    if (typewriterBtn) {
      typewriterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.typewriterEffect();
      });
    }

    // Copier code secret (dev only)
    const copyLock = document.getElementById('copyLock');
    if (copyLock) {
      copyLock.addEventListener('click', async (e) => {
        e.preventDefault();
        const code = await this.getSecretCode();
        if (code) {
          try {
            await navigator.clipboard.writeText(code);
            this.showMessage('Code copié !', 'success');
          } catch (err) {
            this.showMessage('Erreur de copie', 'error');
          }
        }
      });
    }

    // Admin panel
    const closeAdminBtn = document.getElementById('closeAdminPanel');
    if (closeAdminBtn) {
      closeAdminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.adminPanel) {
          this.adminPanel.classList.add('hidden');
        }
      });
    }
  }

  // ========= OSCILLOSCOPE =========
  startOscilloscope() {
    if (!this.ctx) return;

    const draw = () => {
      const width = this.canvas.width;
      const height = this.canvas.height;
      const centerY = height / 2;

      this.ctx.fillStyle = 'rgba(0, 20, 40, 0.3)';
      this.ctx.fillRect(0, 0, width, height);

      this.ctx.strokeStyle = '#00d0c6';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      const time = Date.now() / 1000;

      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin((x / width) * Math.PI * 4 + time * 2) * 20 +
          Math.sin((x / width) * Math.PI * 2 + time * 3) * 10;

        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }

      this.ctx.stroke();

      this.waveAnimation = requestAnimationFrame(draw);
    };

    draw();
  }

  stopOscilloscope() {
    if (this.waveAnimation) {
      cancelAnimationFrame(this.waveAnimation);
    }
  }

  // ========= TYPEWRITER =========
  async typewriterEffect() {
    const code = await this.getSecretCode();
    if (!code) return;

    this.input.value = '';
    this.input.type = 'text';

    for (let i = 0; i < code.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      this.input.value += code[i];
    }

    setTimeout(() => {
      this.input.type = 'password';
    }, 1000);
  }

  // ========= VALIDATION =========
  async validateCode() {
    if (this.isLocked) {
      this.showMessage('Compte verrouillé. Attendez...', 'error');
      return;
    }

    const enteredCode = this.input.value.trim();

    if (!enteredCode) {
      this.shake();
      this.showMessage('Veuillez entrer un code', 'error');
      if (typeof window.sendDiscordNotification === 'function') {
        window.sendDiscordNotification('secret_code_try', {});
      }
      return;
    }

    // Vérifier le code dans la DB
    const result = await this.checkCode(enteredCode);

    if (result.valid) {
      // Si 2FA requis ET section 2FA visible
      if (result.requires2FA && this.twofaSection && !this.twofaSection.classList.contains('hidden')) {
        await this.verify2FA();
      }
      // Si 2FA requis mais pas encore affiché
      else if (result.requires2FA) {
        await this.initiate2FA(result.user);
      }
      // Pas de 2FA requis
      else {
        await this.unlockSuccess(result.user);
      }
    } else {
      this.handleFailedAttempt();
    }
  }

  async checkCode(code) {
    try {
      if (typeof window.EchoDB === 'undefined') {
        // Fallback : code hardcodé
        return {
          valid: code === 'N1ghtberryV1.2',
          user: { username: 'Admin', permissions: ['all'] },
          requires2FA: false
        };
      }

      const { data, error } = await window.EchoDB.supabase
        .from('admin_access_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          id: data.id,
          username: data.username,
          permissions: data.permissions || [],
          requires2FA: data.require_2fa
        },
        requires2FA: data.require_2fa
      };
    } catch (err) {
      console.error('Code check error:', err);
      return { valid: false };
    }
  }

  async getSecretCode() {
    try {
      if (typeof window.EchoDB === 'undefined') return 'N1ghtberryV1.2';

      const { data } = await window.EchoDB.supabase
        .from('admin_access_codes')
        .select('code')
        .eq('is_active', true)
        .limit(1)
        .single();

      return data?.code || 'N1ghtberryV1.2';
    } catch {
      return 'N1ghtberryV1.2';
    }
  }

  // ========= 2FA =========
  async initiate2FA(user) {
    if (!this.twofaSection) {
      // Si pas de section 2FA, continuer sans
      await this.unlockSuccess(user);
      return;
    }

    this.currentUser = user;

    // Générer code à 6 chiffres
    this.generated2FACode = Math.floor(100000 + Math.random() * 900000).toString();

    // Envoyer sur Discord
    await this.send2FAToDiscord(user.username, this.generated2FACode);

    // Afficher section 2FA
    this.twofaSection.classList.remove('hidden');
    this.input.disabled = true;
    this.showMessage('Code 2FA envoyé sur Discord', 'info');
    if (this.twofaInput) this.twofaInput.focus();

    // Expiration 2FA après 5 min
    setTimeout(() => {
      this.generated2FACode = null;
      if (this.twofaSection) this.twofaSection.classList.add('hidden');
      this.input.disabled = false;
      this.showMessage('Code 2FA expiré', 'error');
    }, 300000);
  }

  async send2FAToDiscord(username, code) {
    try {
      if (typeof window.sendDiscordNotification === 'function') {
        await window.sendDiscordNotification('2fa_code', {
          username: username,
          code: code,
          timestamp: new Date().toLocaleString('fr-FR')
        });
      }
    } catch (err) {
      console.error('2FA Discord error:', err);
    }
  }

  async verify2FA() {
    if (!this.twofaInput) return;

    const enteredCode = this.twofaInput.value.trim();

    if (enteredCode === this.generated2FACode) {
      await this.unlockSuccess(this.currentUser);
    } else {
      this.shake();
      this.showMessage('Code 2FA incorrect', 'error');
      this.twofaInput.value = '';
    }
  }

  // ========= UNLOCK SUCCESS =========
  async unlockSuccess(user) {
    // Vérifier que user n'est pas null
    if (!user) {
      console.error('❌ User is null in unlockSuccess');
      this.showMessage('Erreur d\'authentification', 'error');
      return;
    }

    this.currentUser = user;

    // Progress bar animation
    if (this.unlockProgress && this.progressFill) {
      this.unlockProgress.classList.remove('hidden');
      this.progressFill.style.width = '100%';
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Fermer modale
    this.closeModal();

    // Afficher badge
    if (this.devBadge) {
      this.devBadge.classList.remove('hidden');
      const badgeSpan = this.devBadge.querySelector('span');
      if (badgeSpan) badgeSpan.textContent = user.username || 'Admin';
    }

    // Sauvegarder auth
    localStorage.setItem('admin_auth', JSON.stringify({
      user: user,
      timestamp: Date.now()
    }));

    // Réinitialiser tentatives
    this.resetAttempts();

    // Ouvrir panel admin
    this.openAdminPanel(user);

    // Notification Discord
    if (typeof window.sendDiscordNotification === 'function') {
      await window.sendDiscordNotification('admin_login', {
        username: user.username || 'Admin',
        timestamp: new Date().toLocaleString('fr-FR')
      });
    }
  }

  // ========= FAILED ATTEMPT =========
  handleFailedAttempt() {
    this.attemptsLeft--;
    localStorage.setItem('modal_attempts', this.attemptsLeft);

    this.shake();
    this.updateAttemptsDisplay();

    if (this.attemptsLeft === 0) {
      this.startCooldown(60);
      this.showMessage('Trop de tentatives !', 'error');
    } else {
      if (typeof window.sendDiscordNotification === 'function') {
        window.sendDiscordNotification('secret_code_false', {});
      }
      this.showMessage('Code incorrect', 'error');
    }

    this.input.value = '';
  }

  updateAttemptsDisplay() {
    if (!this.attemptsText) return;

    this.attemptsText.textContent = `${this.attemptsLeft} tentative${this.attemptsLeft > 1 ? 's' : ''} restante${this.attemptsLeft > 1 ? 's' : ''}`;

    if (this.attemptsCounter) {
      if (this.attemptsLeft === 2) {
        this.attemptsCounter.classList.add('warning');
      } else if (this.attemptsLeft === 1) {
        this.attemptsCounter.classList.remove('warning');
        this.attemptsCounter.classList.add('danger');
      }
    }
  }

  startCooldown(seconds) {
    this.isLocked = true;
    if (typeof window.sendDiscordNotification === 'function') {
      window.sendDiscordNotification('code_spam', {});
    }
    if (this.input) this.input.disabled = true;
    if (this.confirmBtn) this.confirmBtn.disabled = true;
    if (this.attemptsCounter) this.attemptsCounter.classList.add('hidden');
    if (this.cooldownTimer) this.cooldownTimer.classList.remove('hidden');

    localStorage.setItem('modal_lock_time', Date.now());

    let remaining = seconds;
    if (this.cooldownTime) this.cooldownTime.textContent = remaining;

    this.cooldownInterval = setInterval(() => {
      remaining--;
      if (this.cooldownTime) this.cooldownTime.textContent = remaining;

      if (remaining <= 0) {
        this.resetAttempts();
      }
    }, 1000);
  }

  resetAttempts() {
    this.attemptsLeft = 3;
    this.isLocked = false;

    localStorage.removeItem('modal_attempts');
    localStorage.removeItem('modal_lock_time');

    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }

    if (this.input) this.input.disabled = false;
    if (this.confirmBtn) this.confirmBtn.disabled = false;
    if (this.attemptsCounter) {
      this.attemptsCounter.classList.remove('hidden', 'warning', 'danger');
    }
    if (this.cooldownTimer) this.cooldownTimer.classList.add('hidden');

    this.updateAttemptsDisplay();
  }

  // ========= UI HELPERS =========
  shake() {
    if (!this.secretBox) return;
    this.secretBox.classList.add('shake');
    setTimeout(() => {
      this.secretBox.classList.remove('shake');
    }, 500);
  }

  showMessage(text, type = 'info') {
    if (!this.modalMessage) return;
    this.modalMessage.textContent = text;
    this.modalMessage.style.color = type === 'error' ? '#ff0055' :
      type === 'success' ? '#00d0c6' : '#b0b0b0';
  }

  openModal() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }
    this.showMessage('Entrez le code d\'accès :', 'info');
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');

    // 🔥 AJOUT : Fermer aussi le panel admin
    if (this.adminPanel) {
      this.adminPanel.classList.add('hidden');
    }

    document.body.style.overflow = '';
    if (this.unlockProgress) this.unlockProgress.classList.add('hidden');
    if (this.progressFill) this.progressFill.style.width = '0%';
    if (this.twofaSection) this.twofaSection.classList.add('hidden');
    if (this.input) this.input.disabled = false;
  }

  // ========= ADMIN PANEL =========
  openAdminPanel(user) {
    if (!this.adminPanel) {
      console.log('✅ Accès accordé - Panel admin non disponible');
      return;
    }

    this.adminPanel.classList.remove('hidden');
    const usernameEl = document.getElementById('adminUsername');
    if (usernameEl) usernameEl.textContent = user.username || 'Admin';

    const sectionsContainer = document.getElementById('adminSections');
    if (!sectionsContainer) return;

    sectionsContainer.innerHTML = '';

    // Générer cards selon permissions
    const availableCards = {
      'test_mode': {
        icon: 'fa-hourglass-half',
        title: 'Mode Test',
        description: 'Activer le compte à rebours de test',
        action: () => this.activateTestMode()
      },
      'site_recap': {
        icon: 'fa-map-signs',
        title: 'Récap du site',
        description: 'Voir toutes les pages et liens',
        action: () => this.showSiteRecap()
      },
      'versions': {
        icon: 'fa-code-branch',
        title: 'Gestion versions',
        description: 'Gérer les versions du jeu',
        action: () => window.open('versions.html', '_blank')
      },
      'analytics': {
        icon: 'fa-chart-line',
        title: 'Analytics',
        description: 'Statistiques du site',
        action: () => this.showAnalytics()
      }
    };

    // Filtrer selon permissions
    const userPerms = user.permissions || [];
    const hasAllPerms = userPerms.includes('all');

    Object.entries(availableCards).forEach(([key, card]) => {
      if (hasAllPerms || userPerms.includes(key)) {
        const cardEl = document.createElement('div');
        cardEl.className = 'admin-card';
        cardEl.innerHTML = `
          <i class="fa-solid ${card.icon}" style="font-size: 2rem; color: var(--debut); margin-bottom: 10px;"></i>
          <h4>${card.title}</h4>
          <p style="color: #888; font-size: 0.9rem;">${card.description}</p>
        `;
        cardEl.addEventListener('click', card.action);
        sectionsContainer.appendChild(cardEl);
      }
    });
  }

  activateTestMode() {
    // Utiliser la fonction existante si elle existe
    if (typeof window.activateTestCountdown === 'function') {
      window.activateTestCountdown();
    } else {
      // Fallback : définir manuellement
      const testDate = new Date(Date.now() + 60000);
      localStorage.setItem('countdown_target_date', testDate.toISOString());

      // Recharger le countdown
      if (typeof window.updateCountdown === 'function') {
        window.updateCountdown();
      }
    }

    this.showMessage('Mode test activé ! Fin dans 1 minute', 'success');

    // Notification Discord
    if (typeof window.sendDiscordNotification === 'function') {
      window.sendDiscordNotification('test_mode', {
        username: this.currentUser?.username || 'Admin',
        timestamp: new Date().toLocaleString('fr-FR')
      });
    }

    // Fermer le panel admin après 2 secondes
    setTimeout(() => {
      if (this.adminPanel) {
        this.adminPanel.classList.add('hidden');
      }
    }, 2000);
  }

  showSiteRecap() {
    // Créer la modale si elle n'existe pas
    let recapModal = document.getElementById('siteRecapModal');
    if (!recapModal) {
      recapModal = document.createElement('div');
      recapModal.id = 'siteRecapModal';
      recapModal.className = 'secret-modal';
      recapModal.innerHTML = `
      <div class="secret-box recap-box" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
        <h3 style="display: flex; align-items: center; gap: 10px; color: var(--debut);">
          <i class="fa-solid fa-map-signs"></i>
          Récapitulatif du site
        </h3>
        
        <div style="margin: 20px 0;">
          <h4 style="color: #00d0c6; margin-bottom: 10px;">
            <i class="fa-solid fa-file-code"></i> Pages principales
          </h4>
          <div class="recap-grid">
            <div class="recap-item">
              <i class="fa-solid fa-home"></i>
              <div>
                <strong>index.html</strong>
                <p>Page d'accueil avec hero, countdown, sections</p>
              </div>
            </div>
            <div class="recap-item">
              <i class="fa-solid fa-code-branch"></i>
              <div>
                <strong>versions.html</strong>
                <p>Historique des versions du jeu</p>
              </div>
            </div>
            <div class="recap-item">
              <i class="fa-solid fa-shield-halved"></i>
              <div>
                <strong>admin.html</strong>
                <p>Panneau d'administration (si existant)</p>
              </div>
            </div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h4 style="color: #00d0c6; margin-bottom: 10px;">
            <i class="fa-solid fa-hashtag"></i> Sections (anchors)
          </h4>
          <div class="recap-grid">
            <div class="recap-item">
              <i class="fa-solid fa-rocket"></i>
              <div>
                <strong>#accueil</strong>
                <p>Hero avec vidéo background et countdown</p>
              </div>
            </div>
            <div class="recap-item">
              <i class="fa-solid fa-users"></i>
              <div>
                <strong>#team</strong>
                <p>Présentation de la Team Nightberry</p>
              </div>
            </div>
            <div class="recap-item">
              <i class="fa-solid fa-download"></i>
              <div>
                <strong>#install</strong>
                <p>Instructions d'installation du jeu</p>
              </div>
            </div>
            <div class="recap-item">
              <i class="fa-solid fa-gamepad"></i>
              <div>
                <strong>#gameplay</strong>
                <p>Contrôles et mécaniques de jeu</p>
              </div>
            </div>
            <div class="recap-item">
              <i class="fa-solid fa-book"></i>
              <div>
                <strong>#lore</strong>
                <p>Histoire et univers du jeu</p>
              </div>
            </div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h4 style="color: #00d0c6; margin-bottom: 10px;">
            <i class="fa-solid fa-link"></i> Liens externes
          </h4>
          <div class="recap-grid">
            <div class="recap-item">
              <i class="fa-solid fa-paper-plane"></i>
              <div>
                <strong>Formulaire feedback</strong>
                <p>Notion pour donner son avis sur le jeu</p>
              </div>
            </div>
            <div class="recap-item">
              <i class="fa-brands fa-discord"></i>
              <div>
                <strong>Discord Webhook</strong>
                <p>Notifications admin + 2FA</p>
              </div>
            </div>
          </div>
        </div>

        <div class="secret-actions">
          <button id="closeRecapModal" class="btn-confirm">Fermer</button>
        </div>
      </div>
    `;
      document.body.appendChild(recapModal);

      // Event listener pour fermer
      document.getElementById('closeRecapModal').addEventListener('click', () => {
        recapModal.classList.remove('active');
        document.body.style.overflow = '';
      });

      recapModal.addEventListener('click', (e) => {
        if (e.target === recapModal) {
          recapModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Ouvrir la modale
    recapModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  showAnalytics() {
    alert('Fonctionnalité Analytics en développement');
  }

  async checkAuthStatus() {
    const auth = localStorage.getItem('admin_auth');
    if (auth) {
      try {
        const { user, timestamp } = JSON.parse(auth);

        // Expiration après 24h
        if (Date.now() - timestamp < 86400000) {
          this.currentUser = user;
          if (this.devBadge) {
            this.devBadge.classList.remove('hidden');
            const badgeSpan = this.devBadge.querySelector('span');
            if (badgeSpan) badgeSpan.textContent = user.username || 'Admin';
          }
        } else {
          localStorage.removeItem('admin_auth');
        }
      } catch (err) {
        localStorage.removeItem('admin_auth');
      }
    }
  }
}

// Initialiser
document.addEventListener('DOMContentLoaded', () => {
  window.advancedModal = new AdvancedSecretModal();
});