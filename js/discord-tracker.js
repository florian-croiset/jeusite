class DiscordTracker {
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl;
        this.sessionId = this.generateSessionId();
        this.userIP = null;
        this.startTime = Date.now();
        this.events = [];
        this.eventQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async init() {
        this.userIP = await this.getIP();
        this.setupTracking();
        this.trackPageView();
        
        // Envoyer les événements groupés toutes les 10 secondes
        setInterval(() => this.flushQueue(), 10000);
    }

    async getIP() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch {
            return 'Unknown';
        }
    }

    setupTracking() {
        // Temps passé sur la page
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_exit', {
                duration: Math.round((Date.now() - this.startTime) / 1000),
                totalEvents: this.events.length
            }, true); // Envoyer immédiatement
        });

        // Clics sur les boutons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button, a[href], .btn');
            if (btn) {
                this.trackEvent('click', {
                    element: btn.textContent.trim().substring(0, 30),
                    type: btn.tagName,
                    class: btn.className
                });
            }
        });

        // Scroll depth
        let maxScroll = 0;
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                    maxScroll = scrollPercent;
                    this.trackEvent('scroll', { depth: scrollPercent });
                }
            }, 500);
        });

        // Téléchargements
        document.querySelectorAll('a[download], .download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackEvent('download_click', {
                    file: btn.href || btn.dataset.file || 'unknown'
                }, true); // Envoyer immédiatement
            });
        });

        // Votes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.vote-btn')) {
                this.trackEvent('vote', {
                    item: e.target.closest('[data-id]')?.dataset.id || 'unknown'
                }, true);
            }
        });

        // Formulaires
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                this.trackEvent('form_submit', {
                    formId: form.id || form.className
                }, true);
            });
        });

        // Erreurs JS
        window.addEventListener('error', (e) => {
            this.trackEvent('js_error', {
                message: e.message.substring(0, 100),
                file: e.filename,
                line: e.lineno
            }, true);
        });
    }

    trackPageView() {
        this.sendToDiscord({
            embeds: [{
                title: '👁️ Nouvelle visite',
                color: 0x00d0c6,
                fields: [
                    { name: '🌐 Page', value: window.location.pathname, inline: true },
                    { name: '🔗 IP', value: this.userIP, inline: true },
                    { name: '🕐 Heure', value: new Date().toLocaleString('fr-FR'), inline: true },
                    { name: '📱 Device', value: this.getDeviceInfo(), inline: true },
                    { name: '🌍 Navigateur', value: this.getBrowserInfo(), inline: true },
                    { name: '📍 Source', value: document.referrer ? new URL(document.referrer).hostname : 'Direct', inline: true }
                ],
                footer: { text: `Session: ${this.sessionId}` },
                timestamp: new Date().toISOString()
            }]
        });
    }

    trackEvent(eventName, data = {}, immediate = false) {
        this.events.push({ event: eventName, data, time: Date.now() });

        if (immediate) {
            this.sendEventToDiscord(eventName, data);
        } else {
            this.eventQueue.push({ eventName, data });
        }
    }

    async flushQueue() {
        if (this.eventQueue.length === 0 || this.isProcessing) return;
        
        this.isProcessing = true;
        const events = [...this.eventQueue];
        this.eventQueue = [];

        // Grouper par type d'événement
        const grouped = events.reduce((acc, {eventName, data}) => {
            if (!acc[eventName]) acc[eventName] = [];
            acc[eventName].push(data);
            return acc;
        }, {});

        // Envoyer un résumé
        const fields = Object.entries(grouped).map(([event, items]) => ({
            name: `${this.getEventIcon(event)} ${event.replace(/_/g, ' ')}`,
            value: `${items.length} action(s)`,
            inline: true
        }));

        if (fields.length > 0) {
            await this.sendToDiscord({
                embeds: [{
                    title: '📊 Résumé d\'activité',
                    color: 0x8735b9,
                    fields: fields,
                    footer: { text: `${this.userIP} • ${this.sessionId}` },
                    timestamp: new Date().toISOString()
                }]
            });
        }

        this.isProcessing = false;
    }

    getEventIcon(event) {
        const icons = {
            click: '👆',
            scroll: '📜',
            download_click: '📥',
            vote: '👍',
            form_submit: '📝',
            js_error: '❌',
            page_exit: '👋'
        };
        return icons[event] || '🔔';
    }

    async sendEventToDiscord(eventName, data) {
        await this.sendToDiscord({
            embeds: [{
                title: `${this.getEventIcon(eventName)} ${eventName.replace(/_/g, ' ')}`,
                color: eventName === 'js_error' ? 0xff0055 : 
                       eventName === 'download_click' ? 0x00ff88 : 0x8735b9,
                fields: Object.entries(data).slice(0, 10).map(([key, value]) => ({
                    name: key,
                    value: String(value).substring(0, 100),
                    inline: true
                })),
                footer: { text: `${this.userIP} • ${this.sessionId}` },
                timestamp: new Date().toISOString()
            }]
        });
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
        if (ua.includes('Chrome')) return '🌐 Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return '🧭 Safari';
        if (ua.includes('Edge')) return '🌊 Edge';
        return '❓ Unknown';
    }

    async sendToDiscord(payload) {
        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Discord webhook error:', error);
        }
    }
}

// Export pour utilisation
window.DiscordTracker = DiscordTracker;