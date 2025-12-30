/* =========================================================
   SPLASH SCREEN - CHARGEMENT RÉEL DES RESSOURCES
   ========================================================= */

class SplashLoader {
    constructor() {
        this.splash = document.getElementById('splash-screen');
        this.progressBar = document.getElementById('progressBar');
        this.percentage = document.getElementById('loadingPercentage');
        this.particlesContainer = document.getElementById('splashParticles');
        
        this.totalResources = 0;
        this.loadedResources = 0;
        this.currentProgress = 0;
        
        // Bloquer le scroll et le curseur pendant le splash
        this.lockScroll();
        this.hideCursor();
        
        // Créer les particules
        this.createParticles();
        
        // Démarrer le tracking
        this.init();
    }
    
    /**
     * Cacher le curseur personnalisé pendant le splash
     */
    hideCursor() {
        const customCursor = document.getElementById('customCursor');
        if (customCursor) {
            customCursor.style.display = 'none';
        }
        
        // Forcer le curseur par défaut sur le splash
        if (this.splash) {
            this.splash.style.cursor = 'default';
        }
        
        // Désactiver le curseur personnalisé sur tout le body
        document.body.style.cursor = 'default';
    }
    
    /**
     * Réactiver le curseur personnalisé
     */
    showCursor() {
        const customCursor = document.getElementById('customCursor');
        if (customCursor) {
            customCursor.style.display = '';
        }
        
        // Réactiver le curseur personnalisé sur le body
        document.body.style.cursor = '';
    }
    
    /**
     * Bloquer le scroll pendant le splash screen
     */
    lockScroll() {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Empêcher le scroll sur mobile
        document.addEventListener('touchmove', this.preventScroll, { passive: false });
        
        // Empêcher le scroll avec la molette
        document.addEventListener('wheel', this.preventScroll, { passive: false });
        
        // Empêcher les touches de navigation
        document.addEventListener('keydown', this.preventKeyScroll, { passive: false });
    }
    
    /**
     * Débloquer le scroll
     */
    unlockScroll() {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.removeEventListener('touchmove', this.preventScroll);
        document.removeEventListener('wheel', this.preventScroll);
        document.removeEventListener('keydown', this.preventKeyScroll);
    }
    
    /**
     * Prévenir le scroll (pour mobile et desktop)
     */
    preventScroll(e) {
        if (document.getElementById('splash-screen')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
    
    /**
     * Prévenir le scroll au clavier
     */
    preventKeyScroll(e) {
        if (document.getElementById('splash-screen')) {
            const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
            if (keys.includes(e.key)) {
                e.preventDefault();
                return false;
            }
        }
    }
    
    /**
     * Créer les particules d'arrière-plan
     */
    createParticles() {
        if (!this.particlesContainer) return;
        
        const particleCount = window.innerWidth < 768 ? 10 : 20; // Moins sur mobile
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            const size = Math.random() * 100 + 50;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            this.particlesContainer.appendChild(particle);
        }
    }
    
    /**
     * Initialiser le tracking des ressources
     */
    init() {
        // Liste de toutes les ressources à tracker
        const images = document.querySelectorAll('img');
        const videos = document.querySelectorAll('video');
        const audios = document.querySelectorAll('audio[preload="auto"], audio[preload="metadata"]');
        const styleSheets = document.styleSheets;
        
        // Compter les ressources totales
        this.totalResources = images.length + videos.length + audios.length + styleSheets.length;
        
        // Si aucune ressource, passer directement au minimum
        if (this.totalResources === 0) {
            this.totalResources = 1;
        }
        
        console.log(`📦 Total des ressources à charger : ${this.totalResources}`);
        
        // Tracker les images
        images.forEach(img => this.trackImage(img));
        
        // Tracker les vidéos
        videos.forEach(video => this.trackVideo(video));
        
        // Tracker les audios (si preload activé)
        audios.forEach(audio => this.trackAudio(audio));
        
        // Les CSS sont généralement déjà chargés, mais on les compte
        for (let i = 0; i < styleSheets.length; i++) {
            this.resourceLoaded();
        }
        
        // Attendre que le DOM et toutes les ressources soient chargés
        if (document.readyState === 'complete') {
            this.completeLoading();
        } else {
            window.addEventListener('load', () => this.completeLoading());
        }
        
        // Sécurité : forcer la fin après 10 secondes max
        setTimeout(() => {
            if (this.currentProgress < 100) {
                console.warn('⏱️ Timeout atteint, forçage du chargement...');
                this.forceComplete();
            }
        }, 10000);
    }
    
    /**
     * Tracker le chargement d'une image
     */
    trackImage(img) {
        if (img.complete) {
            this.resourceLoaded();
        } else {
            img.addEventListener('load', () => this.resourceLoaded());
            img.addEventListener('error', () => this.resourceLoaded()); // Compter même en erreur
        }
    }
    
    /**
     * Tracker le chargement d'une vidéo
     */
    trackVideo(video) {
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA ou plus
            this.resourceLoaded();
        } else {
            video.addEventListener('canplay', () => this.resourceLoaded(), { once: true });
            video.addEventListener('error', () => this.resourceLoaded(), { once: true });
        }
    }
    
    /**
     * Tracker le chargement d'un audio
     */
    trackAudio(audio) {
        if (audio.readyState >= 3) {
            this.resourceLoaded();
        } else {
            audio.addEventListener('canplay', () => this.resourceLoaded(), { once: true });
            audio.addEventListener('error', () => this.resourceLoaded(), { once: true });
        }
    }
    
    /**
     * Une ressource a été chargée
     */
    resourceLoaded() {
        this.loadedResources++;
        const progress = Math.min((this.loadedResources / this.totalResources) * 100, 100);
        this.updateProgress(progress);
        
        console.log(`✅ Ressource chargée : ${this.loadedResources}/${this.totalResources} (${Math.round(progress)}%)`);
    }
    
    /**
     * Mettre à jour la barre de progression
     */
    updateProgress(targetProgress) {
        // Animation fluide de la progression
        const animate = () => {
            if (this.currentProgress < targetProgress) {
                this.currentProgress += 2; // Vitesse d'animation
                
                if (this.currentProgress > targetProgress) {
                    this.currentProgress = targetProgress;
                }
                
                if (this.progressBar) {
                    this.progressBar.style.width = this.currentProgress + '%';
                }
                
                if (this.percentage) {
                    this.percentage.textContent = Math.floor(this.currentProgress) + '%';
                }
                
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Chargement complet
     */
    completeLoading() {
        // S'assurer qu'on arrive à 100%
        this.updateProgress(100);
        
        console.log('✨ Chargement terminé !');
        
        // Attendre un peu pour que l'utilisateur voit 100%
        setTimeout(() => {
            this.hideSplash();
        }, 800);
    }
    
    /**
     * Forcer la complétion (en cas de timeout)
     */
    forceComplete() {
        this.updateProgress(100);
        setTimeout(() => this.hideSplash(), 500);
    }
    
    /**
     * Cacher le splash screen avec animation fluide
     */
    hideSplash() {
        if (!this.splash) return;
        
        console.log('🎬 Début de l\'animation de sortie...');
        
        // Désactiver toutes les animations internes pour éviter les conflits
        const logo = this.splash.querySelector('.splash-logo');
        const loader = this.splash.querySelector('.splash-loader');
        const progressContainer = this.splash.querySelector('.progress-bar-container');
        const loadingText = this.splash.querySelector('.loading-text');
        
        if (logo) logo.style.animation = 'none';
        if (loader) loader.style.animation = 'none';
        if (progressContainer) progressContainer.style.opacity = '0';
        if (loadingText) loadingText.style.opacity = '0';
        
        // Forcer un reflow pour que les changements soient appliqués
        void this.splash.offsetHeight;
        
        // Appliquer la classe hidden pour l'animation de sortie
        requestAnimationFrame(() => {
            this.splash.classList.add('hidden');
            
            console.log('✅ Classe hidden appliquée');
            
            // Débloquer le scroll et réactiver le curseur après l'animation
            setTimeout(() => {
                this.unlockScroll();
                this.showCursor();
                
                // Supprimer le splash du DOM
                this.splash.remove();
                
                // Ajouter la classe loaded au body
                document.body.classList.add('loaded');
                
                console.log('🗑️ Splash supprimé du DOM');
                
                // Initialiser le reste de l'application
                this.initApp();
            }, 1000); // Correspondre au temps de transition CSS (0.8s + marge)
        });
    }
    
    /**
     * Initialiser l'application après le splash
     */
    initApp() {
        console.log('🚀 Application initialisée');
        
        // Initialiser le compte à rebours
        if (typeof initMainCountdown === 'function') {
            initMainCountdown();
        }
        
        // Observer les sections au scroll
        const sections = document.querySelectorAll('section:not(.hero)');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
}

/* =========================================================
   INITIALISATION
   ========================================================= */

// Démarrer le loader dès que le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SplashLoader();
    });
} else {
    new SplashLoader();
}

/* =========================================================
   COMPTE À REBOURS (pour compatibilité)
   ========================================================= */

//const targetDate = new Date('2026-05-25T00:00:00').getTime();

/*export function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    const timerWrap = document.querySelector('.countdown-timer');

    if (diff <= 0) {
        if (timerWrap) {
            timerWrap.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-value">🎉</span>
                    <span class="countdown-label">Lancé !</span>
                </div>`;
        }
        if (window._countdownInterval) clearInterval(window._countdownInterval);
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const elD = document.getElementById('days');
    const elH = document.getElementById('hours');
    const elM = document.getElementById('minutes');
    const elS = document.getElementById('seconds');

    if (elD) elD.textContent = d;
    if (elH) elH.textContent = h.toString().padStart(2, '0');
    if (elM) elM.textContent = m.toString().padStart(2, '0');
    if (elS) elS.textContent = s.toString().padStart(2, '0');
}

export function initMainCountdown() {
    if (window._countdownInterval) {
        clearInterval(window._countdownInterval);
    }
    window._countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}*/