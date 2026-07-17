class SplashLoader {
    constructor() {
        this.splash = document.getElementById('splash-screen');
        this.progressBar = document.getElementById('progressBar');
        this.percentage = document.getElementById('loadingPercentage');
        this.particlesContainer = document.getElementById('splashParticles');

        this.totalResources = 0;
        this.loadedResources = 0;
        this.currentProgress = 0;

        this.lockScroll();
        this.hideCursor();
        this.createParticles();
        this.init();
    }

    hideCursor() {
        const customCursor = document.getElementById('customCursor');
        if (customCursor) {
            customCursor.style.display = 'none';
        }
        if (this.splash) {
            this.splash.style.cursor = 'default';
        }
        document.body.style.cursor = 'default';
    }

    showCursor() {
        const customCursor = document.getElementById('customCursor');
        if (customCursor) {
            customCursor.style.display = '';
        }
        document.body.style.cursor = '';
    }

    lockScroll() {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.addEventListener('touchmove', this.preventScroll, { passive: false });
        document.addEventListener('wheel', this.preventScroll, { passive: false });
        document.addEventListener('keydown', this.preventKeyScroll, { passive: false });
    }

    unlockScroll() {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.removeEventListener('touchmove', this.preventScroll);
        document.removeEventListener('wheel', this.preventScroll);
        document.removeEventListener('keydown', this.preventKeyScroll);
    }

    preventScroll(e) {
        if (document.getElementById('splash-screen')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    preventKeyScroll(e) {
        if (document.getElementById('splash-screen')) {
            const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
            if (keys.includes(e.key)) {
                e.preventDefault();
                return false;
            }
        }
    }

    createParticles() {
        if (!this.particlesContainer) return;

        const particleCount = window.innerWidth < 768 ? 10 : 20;

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

    init() {
        const images = document.querySelectorAll('img');
        const videos = document.querySelectorAll('video');
        const audios = document.querySelectorAll('audio[preload="auto"], audio[preload="metadata"]');
        const styleSheets = document.styleSheets;

        this.totalResources = images.length + videos.length + audios.length + styleSheets.length;

        if (this.totalResources === 0) {
            this.totalResources = 1;
        }

        console.log(`📦 Total des ressources à charger : ${this.totalResources}`);

        images.forEach(img => this.trackImage(img));
        videos.forEach(video => this.trackVideo(video));
        audios.forEach(audio => this.trackAudio(audio));

        for (let i = 0; i < styleSheets.length; i++) {
            this.resourceLoaded();
        }

        // On ne bloque PLUS sur window.load (qui attend TOUTES les ressources :
        // vidéo, polices, images, analytics...). Le splash se termine dès que le DOM
        // est prêt — le hero est alors affichable (il a sa propre transition d'apparition,
        // la vidéo démarre en autoplay quand elle est prête).
        const finish = () => this.completeLoading();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', finish, { once: true });
        } else {
            finish();
        }

        // Filet de sécurité : évite un splash bloqué si quelque chose plante
        setTimeout(() => {
            if (this.currentProgress < 100) {
                console.warn('⏱️ Timeout atteint, forçage du chargement...');
                this.forceComplete();
            }
        }, 5000);
    }

    trackImage(img) {
        if (img.complete) {
            this.resourceLoaded();
        } else {
            img.addEventListener('load', () => this.resourceLoaded());
            img.addEventListener('error', () => this.resourceLoaded());
        }
    }

    trackVideo(video) {
        if (video.readyState >= 3) {
            this.resourceLoaded();
        } else {
            video.addEventListener('canplay', () => this.resourceLoaded(), { once: true });
            video.addEventListener('error', () => this.resourceLoaded(), { once: true });
        }
    }

    trackAudio(audio) {
        if (audio.readyState >= 3) {
            this.resourceLoaded();
        } else {
            audio.addEventListener('canplay', () => this.resourceLoaded(), { once: true });
            audio.addEventListener('error', () => this.resourceLoaded(), { once: true });
        }
    }

    resourceLoaded() {
        this.loadedResources++;
        const progress = Math.min((this.loadedResources / this.totalResources) * 100, 100);
        this.updateProgress(progress);

        console.log(`✅ Ressource chargée : ${this.loadedResources}/${this.totalResources} (${Math.round(progress)}%)`);
    }

    updateProgress(targetProgress) {
        const animate = () => {
            if (this.currentProgress < targetProgress) {
                this.currentProgress += 5;

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

    completeLoading() {
        this.updateProgress(100);

        console.log('✨ Chargement terminé !');

        setTimeout(() => {
            this.hideSplash();
        }, 350);
    }

    forceComplete() {
        this.updateProgress(100);
        setTimeout(() => this.hideSplash(), 500);
    }

    hideSplash() {
        if (!this.splash) return;

        const logo = this.splash.querySelector('.splash-logo');
        const loader = this.splash.querySelector('.splash-loader');
        const progressContainer = this.splash.querySelector('.progress-bar-container');
        const loadingText = this.splash.querySelector('.loading-text');

        if (logo) logo.style.animation = 'none';
        if (loader) loader.style.animation = 'none';
        if (progressContainer) progressContainer.style.opacity = '0';
        if (loadingText) loadingText.style.opacity = '0';

        // Forcer un reflow pour que le changement d'animation soit bien pris en compte
        void this.splash.offsetHeight;

        requestAnimationFrame(() => {
            this.splash.classList.add('hidden');

            setTimeout(() => {
                this.unlockScroll();
                this.showCursor();
                this.splash.remove();
                document.body.classList.add('loaded');
                this.initApp();
            }, 500); // Doit correspondre au temps de transition CSS (0.5s)
        });
    }

    initApp() {
        if (typeof initMainCountdown === 'function') {
            initMainCountdown();
        }

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

        // Met la vidéo du hero en pause quand elle n'est plus visible (économie GPU :
        // plus de décodage vidéo permanent quand on lit les autres sections).
        const heroVideo = document.querySelector('.hero video.background-video');
        if (heroVideo && 'IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        heroVideo.play().catch(() => {});
                    } else {
                        heroVideo.pause();
                    }
                });
            }, { threshold: 0.1 });
            videoObserver.observe(heroVideo);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SplashLoader();
    });
} else {
    new SplashLoader();
}
