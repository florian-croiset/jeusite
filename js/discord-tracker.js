// =============================================
// DISCORD TRACKER AVANCÉ - Version 2.4
// Tracking complet des interactions utilisateur
// =============================================

class AdvancedDiscordTracker {
    constructor() {
        this.version = "2.4";
        this.sessionId = this.generateSessionId();
        this.userIP = null;
        this.webhookUrl = null;
        this.userName = null;
        this.isKnownUser = false;
        this.startTime = Date.now();
        this.eventQueue = [];
        this.isProcessing = false;
        this.exitHandled = false;
        this.exitSent = false;

        // Paramètres de tracking configurables
        this.trackingSettings = {
            enabled: true,
            interval: 30,
            threshold: 5,
            events: {
                clicks: true,
                scroll: true,
                sections: true,
                hover: true,
                inactive: true
            }
        };

        // Tracking des sections
        this.availableSections = [];
        this.sectionsViewed = new Set();
        this.sectionTimes = {};
        this.currentSection = null;
        this.sectionStartTime = null;

        // Tracking du curseur
        this.cursorPositions = [];
        this.lastCursorSample = 0;
        this.cursorSampleInterval = 2000;

        // Statistiques de scroll
        this.maxScrollDepth = 0;
        this.scrollDepths = [];

        // Éléments cliqués
        this.clickedElements = [];

        // Temps d'inactivité
        this.lastActivityTime = Date.now();
        this.inactivityThreshold = 60000;
        this.inactivityNotificationSent = false;

        this.init();
    }

    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async init() {
        try {
            //console.log('📡 Initialisation du tracker...');

            await this.getIPAndLocation();
            this.networkInfo = await this.getNetworkType();
            await this.loadWebhook();
            await this.loadTrackingSettings();
            this.detectAvailableSections();
            this.setupTracking();
            await this.trackPageView();
            
            if (this.trackingSettings.enabled) {
                this.startDynamicFlush();
            }
            
            setInterval(() => this.checkInactivity(), 5000);

            //console.log('✅ Advanced Discord Tracker initialized');
        } catch (error) {
            //console.error('❌ Tracker init error:', error);
        }
    }

    async loadTrackingSettings() {
        try {
            if (typeof window.EchoDB === 'undefined') {
                await this.waitForEchoDB();
            }

            const { data, error } = await window.EchoDB.supabase
                .from('site_settings')
                .select('setting_value')
                .eq('setting_key', 'tracking_settings')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.setting_value) {
                const settings = typeof data.setting_value === 'string' 
                    ? JSON.parse(data.setting_value) 
                    : data.setting_value;
                
                this.trackingSettings = settings;
                console.log('📊 Paramètres de tracking chargés:', this.trackingSettings);
            }
        } catch (error) {
            console.warn('⚠️ Impossible de charger les paramètres de tracking, utilisation des valeurs par défaut');
        }
    }

    startDynamicFlush() {
        if (!this.trackingSettings.enabled) {
            console.log('📊 Tracking d\'activité désactivé');
            return;
        }

        const intelligentFlush = () => {
            const queueSize = this.eventQueue.length;
            const nextFlushDelay = this.trackingSettings.interval * 60 * 1000;
            
            if (queueSize < this.trackingSettings.threshold) {
                console.log(`📊 Seuil non atteint (${queueSize}/${this.trackingSettings.threshold})`);
            } else {
                this.flushQueue();
            }
            
            setTimeout(intelligentFlush, nextFlushDelay);
        };
        
        intelligentFlush();
    }

    async getIPAndLocation() {
        try {
            //console.log('🔍 Récupération IP et localisation...');

            if (!window.ipDetector) {
                //console.log('⏳ Attente chargement ipDetector...');
                await this.waitForIPDetector();
            }

            let data = window.ipDetector.getData();
            if (!data || !data.ip) {
                //console.log('🔄 Lancement détection IP...');
                data = await window.ipDetector.detect();
            }

            //console.log('⏳ Attente enrichissement des données...');
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                data = window.ipDetector.getData();

                if (data && data.city && data.city !== 'Unknown' && data.isp && data.isp !== 'Unknown') {
                    //console.log('✅ Données complètes récupérées !');
                    break;
                }

                //console.log(`⏳ Tentative ${attempts + 1}/${maxAttempts}...`);
                await this.wait(500);
                attempts++;
            }

            data = window.ipDetector.getData();

            this.userIP = data.ip;
            this.locationData = {
                ip: data.ip,
                city: data.city || 'Unknown',
                region: data.region || '',
                country: data.country || 'Unknown',
                emoji: data.country_emoji || '',
                timezone: data.timezone || 'Unknown',
                isp: data.isp || 'Unknown'
            };

        } catch (error) {
            //console.error('❌ Erreur récupération IP:', error);
            this.userIP = 'Unknown';
            this.locationData = {
                ip: 'Unknown',
                city: 'Unknown',
                country: 'Unknown',
                timezone: 'Unknown',
                isp: 'Unknown',
                emoji: ''
            };
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    waitForIPDetector() {
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (window.ipDetector) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(check);
                resolve();
            }, 5000);
        });
    }

    async loadWebhook() {
        try {
            if (typeof window.EchoDB === 'undefined') {
                await this.waitForEchoDB();
            }

            const { data, error } = await window.EchoDB.supabase
                .rpc('get_webhook_for_ip', { user_ip: this.userIP });

            if (error) throw error;

            this.webhookUrl = data;

            const { data: trackedUser } = await window.EchoDB.supabase
                .from('tracked_users')
                .select('first_name, ip_address')
                .eq('ip_address', this.userIP)
                .eq('is_active', true)
                .single();

            if (trackedUser) {
                this.isKnownUser = true;
                this.userName = trackedUser.first_name;
            }

        } catch (error) {
            console.error('Webhook load error:', error);
            this.webhookUrl = 'https://discord.com/api/webhooks/1457369075196891243/TygiLitT7JfnJclpe9xThN7ckoxgXwxLtXemKP30AA-qyZ_z7FOttncTcclprWb3RE4c';
        }
    }

    waitForEchoDB() {
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (window.EchoDB) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        });
    }

    async getNetworkType() {
        try {
            if ('connection' in navigator) {
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                
                if (conn) {
                    const effectiveType = conn.effectiveType;
                    const downlink = conn.downlink;
                    const rtt = conn.rtt;
                    
                    const icons = {
                        'slow-2g': '🌐',
                        '2g': '📶',
                        '3g': '📶📶',
                        '4g': '📶📶📶'
                    };
                    
                    return {
                        type: effectiveType,
                        display: `${icons[effectiveType] || '📡'} ${effectiveType.toUpperCase()}`,
                        speed: `${downlink} Mbps`,
                        latency: `${rtt}ms`
                    };
                }
            }
            
            if (window.performance && window.performance.timing) {
                const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                
                if (loadTime < 1000) return { display: '⚡ Fast', type: 'fast' };
                if (loadTime < 3000) return { display: '📶 Normal', type: 'normal' };
                return { display: '🌐 Slow', type: 'slow' };
            }
            
            return { display: '❓ Unknown', type: 'unknown' };
        } catch {
            return { display: '❓ Unknown', type: 'unknown' };
        }
    }

    setupTracking() {
        let exitInProgress = false;

        const exitHandler = (source) => {
            if (exitInProgress || this.exitSent) {
                return;
            }

            exitInProgress = true;
            this.exitSent = true;

            console.log(`🚪 EXIT via ${source}`);

            const duration = Math.round((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;

            if (this.currentSection && this.sectionStartTime) {
                const timeSpent = Date.now() - this.sectionStartTime;
                if (!this.sectionTimes[this.currentSection]) {
                    this.sectionTimes[this.currentSection] = 0;
                }
                this.sectionTimes[this.currentSection] += timeSpent;
            }

            const sectionStats = Object.entries(this.sectionTimes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([section, time]) => {
                    const secs = Math.round(time / 1000);
                    return `${section}: ${secs}s`;
                })
                .join('\n');

            const exitData = {
                username: this.isKnownUser ? `Echo Tracker - ${this.userName}` : 'Echo Analytics',
                avatar_url: 'https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png',
                embeds: [{
                    title: this.isKnownUser ? `👋 ${this.userName} quitte le site` : '🚪 Fin de session',
                    description: `Session terminée après **${minutes}m ${seconds}s**`,
                    color: this.isKnownUser ? 0xffa500 : 0x5865f2,
                    fields: [
                        { name: '⏱️ Durée totale', value: `${minutes}m ${seconds}s`, inline: true },
                        { name: '📊 Actions totales', value: `${this.clickedElements.length} clics`, inline: true },
                        { name: '📜 Scroll max', value: `${this.maxScrollDepth}%`, inline: true },
                        { name: '🗺️ Sections visitées', value: Array.from(this.sectionsViewed).join(', ') || 'Aucune', inline: false },
                        { name: '⏳ Temps par section', value: sectionStats || 'N/A', inline: false }
                    ],
                    footer: {
                        text: `${this.locationData.ip} • Session ${this.sessionId.substr(-8)} • v${this.version}`
                    },
                    timestamp: new Date().toISOString()
                }]
            };

            const blob = new Blob([JSON.stringify(exitData)], { type: 'application/json' });
            navigator.sendBeacon(this.webhookUrl, blob);
        };

        window.addEventListener('beforeunload', () => exitHandler('beforeunload'));

        window.addEventListener('pagehide', () => {
            setTimeout(() => {
                if (!exitInProgress) {
                    exitHandler('pagehide');
                }
            }, 10);
        });

        document.addEventListener('click', (e) => this.handleClick(e));

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
                this.detectCurrentSection();
            }, 300);
            this.updateActivity();
        });

        document.addEventListener('mousemove', (e) => this.sampleCursor(e));
        this.trackImportantElements();

        window.addEventListener('focus', () => this.trackEvent('window_focus', { timestamp: Date.now() }));
        window.addEventListener('blur', () => this.trackEvent('window_blur', { duration: Date.now() - this.lastActivityTime }));

        document.querySelectorAll('a[download], a[href*="executable"], a[href*=".exe"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('download_attempt', {
                    file: link.href.split('/').pop(),
                    url: link.href
                }, true);
            });
        });

        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                this.trackEvent('form_submit', {
                    formId: form.id || form.className,
                    page: window.location.pathname
                }, true);
            });
        });

        window.addEventListener('error', (e) => {
            this.trackEvent('js_error', {
                message: e.message.substring(0, 100),
                file: e.filename,
                line: e.lineno
            }, true);
        });

        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            if (selection.length > 0) {
                this.trackEvent('text_copied', {
                    length: selection.length,
                    preview: selection.substring(0, 50)
                });
            }
        });

        document.querySelectorAll('video').forEach(video => {
            video.addEventListener('play', () => this.trackEvent('video_play', { src: video.src }));
            video.addEventListener('pause', () => this.trackEvent('video_pause', { src: video.src }));
        });

        document.addEventListener('visibilitychange', () => {
            this.trackEvent('visibility_change', {
                hidden: document.hidden,
                state: document.visibilityState
            });
        });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const currentHost = window.location.hostname;
                const linkHost = new URL(link.href).hostname;

                if (linkHost !== currentHost && linkHost !== '') {
                    this.trackEvent('external_link_click', {
                        url: link.href,
                        text: link.textContent.trim().substring(0, 50),
                        section: this.currentSection
                    }, true);
                }
            }
        }, true);

        //console.log('✅ All trackers initialized');
    }

    trackImportantElements() {
        if (!this.trackingSettings.events.hover) return;
        
        const selectors = [
            '.btn',
            '.cta-buttons a',
            '.nav-links a',
            '.countdown-section',
            '#gameplay',
            '#lore',
            '#team'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                let hoverStart = null;

                el.addEventListener('mouseenter', () => {
                    hoverStart = Date.now();
                });

                el.addEventListener('mouseleave', () => {
                    if (hoverStart) {
                        const duration = Date.now() - hoverStart;
                        if (duration > 500) {
                            this.trackEvent('element_hover', {
                                element: this.getElementDescription(el),
                                duration: duration,
                                selector: selector
                            });
                        }
                        hoverStart = null;
                    }
                });
            });
        });
    }

    detectCurrentSection() {
        if (!this.trackingSettings.events.sections) return;
        
        if (this.availableSections.length === 0 ||
            (this.availableSections.length === 1 && this.availableSections[0] === 'page')) {
            return;
        }

        const sections = document.querySelectorAll('section[id]');
        if (sections.length === 0) return;

        const scrollPos = window.scrollY + window.innerHeight / 2;
        let newSection = null;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = window.scrollY + rect.top;
            const sectionBottom = sectionTop + rect.height;

            if (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
                newSection = section.id;
            }
        });

        if (newSection && newSection !== this.currentSection) {
            if (this.currentSection) {
                const timeSpent = Date.now() - this.sectionStartTime;
                if (!this.sectionTimes[this.currentSection]) {
                    this.sectionTimes[this.currentSection] = 0;
                }
                this.sectionTimes[this.currentSection] += timeSpent;
            }

            this.currentSection = newSection;
            this.sectionStartTime = Date.now();
            this.sectionsViewed.add(newSection);

            this.trackEvent('section_view', {
                section: newSection,
                timestamp: Date.now()
            });
        }
    }

    detectAvailableSections() {
        const sections = document.querySelectorAll('section[id]');
        this.availableSections = Array.from(sections).map(s => s.id);

        if (this.availableSections.length === 0) {
            this.availableSections = ['page'];
            this.currentSection = 'page';
        }
    }

    handleClick(e) {
        if (!this.trackingSettings.events.clicks) return;
        
        this.updateActivity();

        const target = e.target.closest('button, a, .clickable, [onclick]');
        if (target) {
            const clickInfo = {
                element: this.getElementDescription(target),
                tag: target.tagName,
                classes: target.className,
                text: target.textContent.trim().substring(0, 50),
                href: target.href || null,
                section: this.currentSection
            };

            this.clickedElements.push(clickInfo);
            this.trackEvent('click', clickInfo);
        }
    }

    handleScroll() {
        if (!this.trackingSettings.events.scroll) return;
        
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        if (scrollPercent > this.maxScrollDepth) {
            this.maxScrollDepth = scrollPercent;

            const milestone = Math.floor(scrollPercent / 25) * 25;
            if (milestone > 0 && !this.scrollDepths.includes(milestone)) {
                this.scrollDepths.push(milestone);
                this.trackEvent('scroll_milestone', {
                    depth: milestone,
                    section: this.currentSection
                });
            }
        }
    }

    sampleCursor(e) {
        const now = Date.now();
        if (now - this.lastCursorSample >= this.cursorSampleInterval) {
            this.cursorPositions.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: now,
                section: this.currentSection
            });

            this.lastCursorSample = now;

            if (this.cursorPositions.length > 100) {
                this.cursorPositions.shift();
            }
        }

        this.updateActivity();
    }

    updateActivity() {
        this.lastActivityTime = Date.now();
        this.inactivityNotificationSent = false;
    }

    checkInactivity() {
        if (!this.trackingSettings.events.inactive) return;
        
        const inactiveTime = Date.now() - this.lastActivityTime;

        if (inactiveTime >= this.inactivityThreshold && !this.inactivityNotificationSent) {
            this.trackEvent('user_inactive', {
                duration: inactiveTime,
                section: this.currentSection
            });
            this.inactivityNotificationSent = true;
        }
    }

    getElementDescription(el) {
        let desc = el.tagName.toLowerCase();
        if (el.id) desc += `#${el.id}`;
        if (el.className) desc += `.${el.className.split(' ')[0]}`;
        return desc;
    }

    trackEvent(eventName, data = {}, immediate = false) {
        const event = {
            event: eventName,
            data,
            time: Date.now(),
            section: this.currentSection
        };

        if (immediate) {
            this.sendEventToDiscord(eventName, data);
        } else {
            this.eventQueue.push(event);
        }
    }

    async flushQueue() {
        if (this.eventQueue.length === 0 || this.isProcessing) return;

        this.isProcessing = true;
        const events = [...this.eventQueue];
        this.eventQueue = [];

        const grouped = events.reduce((acc, evt) => {
            if (!acc[evt.event]) acc[evt.event] = [];
            acc[evt.event].push(evt.data);
            return acc;
        }, {});

        const fields = Object.entries(grouped).map(([event, items]) => ({
            name: `${this.getEventIcon(event)} ${event.replace(/_/g, ' ')}`,
            value: `${items.length}x`,
            inline: true
        }));

        if (this.currentSection) {
            fields.push({
                name: '📍 Section actuelle',
                value: this.currentSection,
                inline: true
            });
        }

        if (fields.length > 0) {
            await this.sendToDiscord({
                embeds: [{
                    title: `📊 Activité ${this.isKnownUser ? `de ${this.userName}` : 'détectée'}`,
                    color: this.isKnownUser ? 0x00ff00 : 0x8735b9,
                    fields: fields.slice(0, 25),
                    footer: {
                        text: `${this.locationData.ip} • Session ${this.sessionId.substr(-8)} • v${this.version}`
                    },
                    timestamp: new Date().toISOString()
                }]
            });
        }

        this.isProcessing = false;
    }

    async trackPageView() {
        await this.sendToDiscord({
            embeds: [{
                title: this.isKnownUser
                    ? `👋 ${this.userName} est sur le site !`
                    : '🌐 Nouvelle visite',
                description: this.isKnownUser
                    ? `Session de ${this.userName} commencée`
                    : 'Un nouveau visiteur découvre Echo',
                color: this.isKnownUser ? 0x00ff00 : 0x00d0c6,
                fields: [
                    { name: '📄 Page', value: window.location.pathname, inline: true },
                    { name: '🔗 IP', value: this.locationData.ip, inline: true },
                    { name: '🕐 Heure', value: new Date().toLocaleString('fr-FR'), inline: true },
                    { name: '📍 Localisation', value: `${this.locationData.city}, ${this.locationData.country} ${this.locationData.emoji}`, inline: true },
                    { name: '📱 Device', value: this.getDeviceInfo(), inline: true },
                    { name: '🌐 Navigateur', value: this.getBrowserInfo(), inline: true },
                    { name: '📍 Source', value: this.getSource(), inline: true },
                    { name: '🌐 ISP', value: this.locationData.isp, inline: true },
                    { name: '⏱️ Fuseau', value: this.locationData.timezone, inline: true },
                    { name: '📡 Connexion', value: this.networkInfo.display, inline: true }
                ],
                footer: {
                    text: `${this.locationData.ip} • Session ${this.sessionId.substr(-8)} • v${this.version}`
                },
                timestamp: new Date().toISOString()
            }]
        });

        await this.saveSessionToDB();
    }

    async saveSessionToDB() {
        try {
            if (typeof window.EchoDB === 'undefined') return;

            let trackedUserId = null;
            if (this.isKnownUser) {
                const { data } = await window.EchoDB.supabase
                    .from('tracked_users')
                    .select('id')
                    .eq('ip_address', this.userIP)
                    .single();
                trackedUserId = data?.id;
            }

            const { data, error } = await window.EchoDB.supabase
                .from('user_sessions')
                .insert({
                    tracked_user_id: trackedUserId,
                    ip_address: this.userIP,
                    session_id: this.sessionId,
                    page: window.location.pathname,
                    user_agent: navigator.userAgent,
                    device: this.getDeviceInfo(),
                    browser: this.getBrowserInfo(),
                    location: `${this.locationData.city}, ${this.locationData.country}`,
                    referrer: this.getSource()
                })
                .select('id')
                .single();

            if (error) throw error;

            this.dbSessionId = data.id;
        } catch (error) {
            console.error('DB session save error:', error);
        }
    }

    async sendEventToDiscord(eventName, data) {
        await this.sendToDiscord({
            embeds: [{
                title: `${this.getEventIcon(eventName)} ${eventName.replace(/_/g, ' ')}`,
                color: this.getEventColor(eventName),
                fields: Object.entries(data).slice(0, 10).map(([key, value]) => ({
                    name: key,
                    value: String(value).substring(0, 100),
                    inline: true
                })),
                footer: {
                    text: `${this.locationData.ip} • Session ${this.sessionId.substr(-8)} • v${this.version}`
                },
                timestamp: new Date().toISOString()
            }]
        });
    }

    getEventIcon(event) {
        const icons = {
            click: '👆',
            scroll: '📜',
            scroll_milestone: '🎯',
            section_view: '📍',
            element_hover: '🖱️',
            download_attempt: '📥',
            external_link_click: '🔗',
            form_submit: '📝',
            js_error: '❌',
            text_copied: '📋',
            video_play: '▶️',
            video_pause: '⏸️',
            window_focus: '👁️',
            window_blur: '🌑',
            visibility_change: '👀',
            user_inactive: '😴'
        };
        return icons[event] || '📌';
    }

    getEventColor(event) {
        if (event === 'js_error') return 0xff0055;
        if (event === 'download_attempt') return 0x00ff88;
        if (event === 'external_link_click') return 0x00d0c6;
        if (event === 'section_view') return 0x00d0c6;
        return 0x8735b9;
    }

    getDeviceInfo() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return '📱 Mobile';
        if (/tablet/i.test(ua)) return '📱 Tablet';
        return '💻 Desktop';
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox')) return '🦊 Firefox';
        if (ua.includes('Chrome') && !ua.includes('Edge')) return '🌐 Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return '🧭 Safari';
        if (ua.includes('Edge')) return '🌊 Edge';
        return '❓ Unknown';
    }

    getSource() {
        if (!document.referrer) return 'Direct';
        try {
            return new URL(document.referrer).hostname;
        } catch {
            return 'Unknown';
        }
    }

    async sendToDiscord(payload) {
        if (!this.webhookUrl) return;

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.isKnownUser ? `Echo Tracker - ${this.userName}` : 'Echo Analytics',
                    avatar_url: 'https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png',
                    ...payload
                })
            });
        } catch (error) {
            console.error('Discord webhook error:', error);
        }
    }
}

window.advancedTracker = new AdvancedDiscordTracker();