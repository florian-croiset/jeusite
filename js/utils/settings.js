const translations = {
    fr: {
        settings: "Paramètres",
        display: "Affichage",
        performance: "Performance",
        accessibility: "Accessibilité",
        language: "Langue",
        
        // Display
        splashScreen: "Écran de chargement",
        splashScreenDesc: "Afficher l'animation au démarrage",
        particles: "Particules animées",
        particlesDesc: "Effets visuels d'arrière-plan",
        animations: "Animations avancées",
        animationsDesc: "Transitions et effets de scroll",
        darkMode: "Mode sombre",
        darkModeDesc: "Interface sombre (recommandé)",
        
        // Performance
        performanceMode: "Mode performance",
        performanceModeDesc: "Désactive les effets gourmands",
        sound: "Effets sonores",
        soundDesc: "Sons au clic et interactions",
        autoPlay: "Lecture automatique vidéo",
        autoPlayDesc: "Démarrer la vidéo d'arrière-plan",
        
        // Buttons
        reset: "Réinitialiser",
        close: "Fermer",
        save: "Enregistrer",

        // Notifications
        splashEnabled: "Splash activé",
        splashDisabled: "Splash désactivé",
        particlesEnabled: "Particules activées",
        particlesDisabled: "Particules désactivées",
        animationsEnabled: "Animations activées",
        animationsDisabled: "Animations désactivées",
        darkModeEnabled: "Mode sombre activé",
        lightModeEnabled: "Mode clair activé",
        performanceEnabled: "Mode performance activé",
        performanceDisabled: "Mode performance désactivé",
        soundEnabled: "Son activé",
        soundDisabled: "Son désactivé",
        autoPlayEnabled: "Lecture auto activée",
        autoPlayDisabled: "Lecture auto désactivée",
        settingsReset: "Paramètres réinitialisés",
        languageChanged: "Langue modifiée"
    },
    en: {
        settings: "Settings",
        display: "Display",
        performance: "Performance",
        accessibility: "Accessibility",
        language: "Language",
        
        splashScreen: "Loading Screen",
        splashScreenDesc: "Show startup animation",
        particles: "Animated Particles",
        particlesDesc: "Background visual effects",
        animations: "Advanced Animations",
        animationsDesc: "Scroll transitions and effects",
        darkMode: "Dark Mode",
        darkModeDesc: "Dark interface (recommended)",
        
        performanceMode: "Performance Mode",
        performanceModeDesc: "Disable heavy effects",
        sound: "Sound Effects",
        soundDesc: "Click and interaction sounds",
        autoPlay: "Video Autoplay",
        autoPlayDesc: "Start background video",
        
        reset: "Reset",
        close: "Close",
        save: "Save",
        
        splashEnabled: "Splash enabled",
        splashDisabled: "Splash disabled",
        particlesEnabled: "Particles enabled",
        particlesDisabled: "Particles disabled",
        animationsEnabled: "Animations enabled",
        animationsDisabled: "Animations disabled",
        darkModeEnabled: "Dark mode enabled",
        lightModeEnabled: "Light mode enabled",
        performanceEnabled: "Performance mode enabled",
        performanceDisabled: "Performance mode disabled",
        soundEnabled: "Sound enabled",
        soundDisabled: "Sound disabled",
        autoPlayEnabled: "Autoplay enabled",
        autoPlayDisabled: "Autoplay disabled",
        settingsReset: "Settings reset",
        languageChanged: "Language changed"
    }
};

class SettingsManager {
    constructor() {
        this.settings = {
            splashEnabled: true,
            particlesEnabled: true,
            animationsEnabled: true,
            soundEnabled: true,
            autoPlayVideo: true,
            darkMode: true,
            performanceMode: false,
            language: 'fr'
        };
        
        this.shortcuts = {
            toggleMusic: 'm',
            openSettings: 's',
            closeModal: 'Escape',
            scrollTop: 't',
            toggleFullscreen: 'f',
            shareWebsite: 'p'
        };
        
        this.modalStack = []; // Pile des modales ouvertes
        this.currentLang = 'fr';
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.applyLanguage();
        this.createSettingsModal();
        this.attachEventListeners();
        this.applySplashSetting();
        this.applyDarkMode();
        this.applyPerformanceMode();
        this.initGlobalShortcuts();
    }
    
    t(key) {
        return translations[this.currentLang][key] || key;
    }
    
    applyLanguage() {
        this.currentLang = this.settings.language || 'fr';
    }
    
    /**
     * Charger les paramètres
     */
    loadSettings() {
        const saved = localStorage.getItem('echoSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Erreur chargement paramètres:', e);
            }
        }
    }
    
    saveSettings() {
        localStorage.setItem('echoSettings', JSON.stringify(this.settings));
    }

    /**
     * Créer la modale de paramètres
     */
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = 'secret-modal';
        modal.innerHTML = `
            <div class="secret-box settings-box">
                <h3><i class="fa-solid fa-gear"></i> <span data-i18n="settings">${this.t('settings')}</span></h3>
                
                <div class="settings-tabs">
                    <button class="tab-btn active" data-tab="display"><i class="fa-solid fa-palette"></i> <span data-i18n="display">${this.t('display')}</span></button>
                    <button class="tab-btn" data-tab="performance"><i class="fa-solid fa-gauge-high"></i> <span data-i18n="performance">${this.t('performance')}</span></button>
                    <button class="tab-btn" data-tab="language"><i class="fa-solid fa-globe"></i> <span data-i18n="language">${this.t('language')}</span></button>
                </div>
                
                <div class="settings-content">
                    <!-- ONGLET AFFICHAGE -->
                    <div class="tab-content active" data-content="display">
                        <div class="settings-list">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <i class="fa-solid fa-spinner"></i>
                                    <div>
                                        <strong data-i18n="splashScreen">${this.t('splashScreen')}</strong>
                                        <p data-i18n="splashScreenDesc">${this.t('splashScreenDesc')}</p>
                                    </div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggleSplash" aria-label="${this.t('splashScreen')}" ${this.settings.splashEnabled ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <i class="fa-solid fa-sparkles"></i>
                                    <div>
                                        <strong data-i18n="particles">${this.t('particles')}</strong>
                                        <p data-i18n="particlesDesc">${this.t('particlesDesc')}</p>
                                    </div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggleParticles" aria-label="${this.t('particles')}" ${this.settings.particlesEnabled ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                                    <div>
                                        <strong data-i18n="animations">${this.t('animations')}</strong>
                                        <p data-i18n="animationsDesc">${this.t('animationsDesc')}</p>
                                    </div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggleAnimations" aria-label="${this.t('animations')}" ${this.settings.animationsEnabled ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <i class="fa-solid fa-moon"></i>
                                    <div>
                                        <strong data-i18n="darkMode">${this.t('darkMode')}</strong>
                                        <p data-i18n="darkModeDesc">${this.t('darkModeDesc')}</p>
                                    </div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggleDarkMode" aria-label="${this.t('darkMode')}" ${this.settings.darkMode ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ONGLET PERFORMANCE -->
                    <div class="tab-content" data-content="performance">
                        <div class="performance-info">
                            <i class="fa-solid fa-bolt"></i>
                            <p>Le mode performance désactive automatiquement les effets gourmands en ressources pour améliorer la fluidité du site.</p>
                        </div>
                        
                        <div class="settings-list">
                            <div class="setting-item highlighted">
                                <div class="setting-info">
                                    <i class="fa-solid fa-gauge-high"></i>
                                    <div>
                                        <strong data-i18n="performanceMode">${this.t('performanceMode')}</strong>
                                        <p data-i18n="performanceModeDesc">${this.t('performanceModeDesc')}</p>
                                    </div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="togglePerformance" aria-label="${this.t('performanceMode')}" ${this.settings.performanceMode ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <i class="fa-solid fa-volume-high"></i>
                                    <div>
                                        <strong data-i18n="sound">${this.t('sound')}</strong>
                                        <p data-i18n="soundDesc">${this.t('soundDesc')}</p>
                                    </div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggleSound" aria-label="${this.t('sound')}" ${this.settings.soundEnabled ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <i class="fa-solid fa-play-circle"></i>
                                    <div>
                                        <strong data-i18n="autoPlay">${this.t('autoPlay')}</strong>
                                        <p data-i18n="autoPlayDesc">${this.t('autoPlayDesc')}</p>
                                    </div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggleAutoPlay" aria-label="${this.t('autoPlay')}" ${this.settings.autoPlayVideo ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ONGLET LANGUE -->
                    <div class="tab-content" data-content="language">
                        <div class="language-selector">
                            <div class="language-option ${this.settings.language === 'fr' ? 'active' : ''}" data-lang="fr">
                                <div class="flag">🇫🇷</div>
                                <div class="lang-name">Français</div>
                            </div>
                            <div class="language-option ${this.settings.language === 'en' ? 'active' : ''}" data-lang="en">
                                <div class="flag">🇬🇧</div>
                                <div class="lang-name">English</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="settings-footer">
                    <button id="resetSettings" class="btn-reset">
                        <i class="fa-solid fa-rotate-left"></i> <span data-i18n="reset">${this.t('reset')}</span>
                    </button>
                    <button id="closeSettings" class="btn-confirm" data-i18n="close">${this.t('close')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * Gestion des onglets
     */
    initTabs() {
        // Scoped à .settings-tabs pour ne pas interférer avec d'autres systèmes d'onglets de la page
        const tabs = document.querySelectorAll('.settings-tabs .tab-btn');
        const contents = document.querySelectorAll('.settings-content .tab-content');

        if (tabs.length === 0) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');

                const targetContent = document.querySelector(`.settings-content .tab-content[data-content="${target}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Attacher les événements
     */
    attachEventListeners() {
        this.initTabs();
        this.initLanguageSelector();
        
        // Toggles
        document.getElementById('toggleSplash')?.addEventListener('change', (e) => {
            this.settings.splashEnabled = e.target.checked;
            this.saveSettings();
            this.showNotification(e.target.checked ? this.t('splashEnabled') : this.t('splashDisabled'));
        });
        
        document.getElementById('toggleParticles')?.addEventListener('change', (e) => {
            this.settings.particlesEnabled = e.target.checked;
            this.saveSettings();
            this.toggleParticles(e.target.checked);
        });
        
        document.getElementById('toggleAnimations')?.addEventListener('change', (e) => {
            this.settings.animationsEnabled = e.target.checked;
            this.saveSettings();
            this.toggleAnimations(e.target.checked);
        });
        
        document.getElementById('toggleDarkMode')?.addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.saveSettings();
            this.applyDarkMode();
            this.showNotification(e.target.checked ? this.t('darkModeEnabled') : this.t('lightModeEnabled'));
        });
        
        document.getElementById('togglePerformance')?.addEventListener('change', (e) => {
            this.settings.performanceMode = e.target.checked;
            this.saveSettings();
            this.applyPerformanceMode();
            this.showNotification(e.target.checked ? this.t('performanceEnabled') : this.t('performanceDisabled'));
        });
        
        document.getElementById('toggleSound')?.addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            this.saveSettings();
            this.showNotification(e.target.checked ? this.t('soundEnabled') : this.t('soundDisabled'));
        });
        
        document.getElementById('toggleAutoPlay')?.addEventListener('change', (e) => {
            this.settings.autoPlayVideo = e.target.checked;
            this.saveSettings();
            this.toggleVideoAutoPlay(e.target.checked);
        });
        
        document.getElementById('resetSettings')?.addEventListener('click', () => {
            if (confirm('Réinitialiser tous les paramètres ?')) {
                this.resetSettings();
            }
        });
        
        document.getElementById('closeSettings')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('settingsModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeModal();
            }
        });
    }
    
    /**
     * Sélecteur de langue
     */
    initLanguageSelector() {
        const options = document.querySelectorAll('.language-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const lang = opt.dataset.lang;
                this.changeLanguage(lang);
                
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });
    }
    
    changeLanguage(lang) {
        this.settings.language = lang;
        this.currentLang = lang;
        this.saveSettings();

        // Mettre à jour tous les textes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = this.t(key);
        });
        
        this.showNotification(this.t('languageChanged'));
    }
    
    /**
     * Raccourcis clavier globaux
     */
    initGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ne pas déclencher si on est dans un input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key;
            
            // Échap ferme la dernière modale ouverte
            if (key === 'Escape') {
                this.closeTopModal();
                return;
            }
            
            // Autres raccourcis
            Object.entries(this.shortcuts).forEach(([action, shortcutKey]) => {
                if (key === shortcutKey) {
                    e.preventDefault();
                    this.executeShortcut(action);
                }
            });
        });
    }
    
    executeShortcut(action) {
        switch(action) {
            case 'openSettings':
                this.openModal();
                break;
            case 'closeModal':
                this.closeTopModal();
                break;
            case 'scrollTop':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'toggleFullscreen':
                this.toggleFullscreen();
                break;
            case 'shareWebsite':
                document.getElementById('shareBtn')?.click();
                break;
        }
    }
    
    toggleFullscreen() {
        const isFullscreen = !!document.fullscreenElement;
        if (isFullscreen) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
    
    /**
     * Gestion de la pile de modales
     */
    openModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            this.modalStack.push('settingsModal');
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }
    
    closeModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            // Retirer de la pile
            const index = this.modalStack.indexOf('settingsModal');
            if (index > -1) {
                this.modalStack.splice(index, 1);
            }
        }
    }
    
    closeTopModal() {
        if (this.modalStack.length === 0) return;
        
        const topModalId = this.modalStack[this.modalStack.length - 1];
        const modal = document.getElementById(topModalId);
        
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            this.modalStack.pop();
        }
    }
    
    /**
     * Mode performance
     */
    applyPerformanceMode() {
        if (this.settings.performanceMode) {
            // Désactiver les effets gourmands
            this.settings.particlesEnabled = false;
            this.settings.animationsEnabled = false;
            this.settings.autoPlayVideo = false;
            
            // Mettre à jour les toggles
            const particlesToggle = document.getElementById('toggleParticles');
            const animationsToggle = document.getElementById('toggleAnimations');
            const autoPlayToggle = document.getElementById('toggleAutoPlay');
            
            if (particlesToggle) {
                particlesToggle.checked = false;
                particlesToggle.disabled = true;
            }
            if (animationsToggle) {
                animationsToggle.checked = false;
                animationsToggle.disabled = true;
            }
            if (autoPlayToggle) {
                autoPlayToggle.checked = false;
                autoPlayToggle.disabled = true;
            }
            
            this.toggleParticles(false);
            this.toggleAnimations(false);
            this.toggleVideoAutoPlay(false);
            
            document.body.classList.add('performance-mode');
        } else {
            // Réactiver les toggles
            const particlesToggle = document.getElementById('toggleParticles');
            const animationsToggle = document.getElementById('toggleAnimations');
            const autoPlayToggle = document.getElementById('toggleAutoPlay');
            
            if (particlesToggle) particlesToggle.disabled = false;
            if (animationsToggle) animationsToggle.disabled = false;
            if (autoPlayToggle) autoPlayToggle.disabled = false;
            
            document.body.classList.remove('performance-mode');
        }
    }
    
    /**
     * Mode sombre/clair
     */
    applyDarkMode() {
        if (this.settings.darkMode) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
    }
    
    applySplashSetting() {
        if (!this.settings.splashEnabled) {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.style.display = 'none';
                document.body.classList.add('loaded');
                
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                
                const customCursor = document.getElementById('customCursor');
                if (customCursor) {
                    customCursor.style.display = '';
                }
            }
        }
    }
    
    toggleParticles(enabled) {
        const particles = document.querySelector('.particles');
        if (particles) {
            particles.style.display = enabled ? '' : 'none';
        }
        this.showNotification(enabled ? this.t('particlesEnabled') : this.t('particlesDisabled'));
    }
    
    toggleAnimations(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
        this.showNotification(enabled ? this.t('animationsEnabled') : this.t('animationsDisabled'));
    }
    
    toggleVideoAutoPlay(enabled) {
        const video = document.querySelector('.background-video');
        if (video) {
            if (enabled) {
                video.play().catch(e => console.log('Autoplay bloqué:', e));
            } else {
                video.pause();
            }
        }
        this.showNotification(enabled ? this.t('autoPlayEnabled') : this.t('autoPlayDisabled'));
    }
    
    resetSettings() {
        localStorage.removeItem('echoSettings');
        localStorage.removeItem('echoShortcuts');
        location.reload();
    }
    
    showNotification(message) {
        let notif = document.getElementById('settingsNotification');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'settingsNotification';
            notif.className = 'settings-notification';
            document.body.appendChild(notif);
        }
        
        notif.textContent = message;
        notif.classList.add('show');
        
        setTimeout(() => {
            notif.classList.remove('show');
        }, 2000);
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager = new SettingsManager();
    });
} else {
    window.settingsManager = new SettingsManager();
}