// =============================================
// DISCORD WEBHOOK HANDLER - Version 2.0
// Gestion intelligente des webhooks avec DB
// =============================================

class DiscordWebhookManager {
  constructor() {
    this.mainWebhook = null;
    this.userWebhook = null;
    this.userIP = null;
    this.isKnownUser = false;
    this.userName = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Récupérer l'IP
      await this.fetchIP();

      // Charger les webhooks depuis la DB
      await this.loadWebhooks();

      this.initialized = true;
      console.log('✅ Discord Webhook Manager initialized');
    } catch (error) {
      console.error('❌ Webhook manager init error:', error);
      // Fallback sur webhook hardcodé en cas d'erreur
      this.mainWebhook = 'https://discord.com/api/webhooks/1457161042294734890/J2LL5UUthHqsjh9lKv2vmvpTeIVAqPgN0KEP55CNoBuZnIka_Hsq0Kyy6Dk9KcCvWAFC';
    }
  }

  async fetchIP() {
    try {
      // Utiliser le service de détection IP robuste
      if (!window.ipDetector) {
        console.warn('⚠️ ipDetector not loaded, trying direct fetch...');
        // Fallback direct sur ipify
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        this.userIP = data.ip;
        this.geoData = { ip: data.ip };
        return;
      }

      const data = await window.ipDetector.detect();
      this.userIP = data.ip;
      this.geoData = data;

      console.log('✅ IP détectée:', this.userIP);
    } catch (error) {
      console.error('IP fetch error:', error);
      this.userIP = 'Unknown';
      this.geoData = { ip: 'Unknown' };
    }
  }

  async loadWebhooks() {
    try {
      // Attendre que EchoDB soit disponible
      if (typeof window.EchoDB === 'undefined') {
        await this.waitForEchoDB();
      }

      // 1. Charger le webhook principal
      const { data: mainWebhookData } = await window.EchoDB.supabase
        .from('webhook_settings')
        .select('webhook_url')
        .eq('setting_key', 'main_webhook')
        .eq('is_active', true)
        .single();

      if (mainWebhookData) {
        this.mainWebhook = mainWebhookData.webhook_url;
      }

      // 2. Vérifier si l'utilisateur est connu
      const { data: trackedUser } = await window.EchoDB.supabase
        .from('tracked_users')
        .select('*')
        .eq('ip_address', this.userIP)
        .eq('is_active', true)
        .single();

      if (trackedUser) {
        this.isKnownUser = true;
        this.userName = trackedUser.first_name;
        this.userWebhook = trackedUser.webhook_url;
        console.log(`👤 Known user: ${this.userName} (${this.userIP})`);
      }

    } catch (error) {
      console.error('Webhook load error:', error);
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

  getWebhook() {
    // Utiliser le webhook personnalisé si l'utilisateur est connu
    return this.userWebhook || this.mainWebhook;
  }

  async sendNotification(type, data) {
    if (!this.initialized) {
      await this.init();
    }

    const webhook = this.getWebhook();
    if (!webhook) {
      console.error('No webhook available');
      return;
    }

    const embed = this.createEmbed(type, data);
    if (!embed) {
      console.error('Unknown notification type:', type);
      return;
    }

    const payload = {
      username: this.isKnownUser ? `Echo - ${this.userName}` : 'Echo Analytics',
      avatar_url: 'https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png',
      embeds: [embed]
    };

    // Ajouter un ping pour les événements critiques d'utilisateurs connus
    if (this.isKnownUser && this.shouldPing(type)) {
      payload.content = `<@&1457164285162684516>`; // ID du rôle à pinger
    }

    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Discord notification error:', error);
    }
  }

  shouldPing(type) {
    // Types qui déclenchent un ping pour les utilisateurs connus
    const pingTypes = [
      'new_download',
      'new_feedback',
      'form_submit',
      'js_error'
    ];
    return pingTypes.includes(type);
  }

  createEmbed(type, data) {
    const embeds = {
      'new_version': {
        title: '🎮 Nouvelle version disponible !',
        description: `Version **${data.version}** vient d'être publiée`,
        color: 0x9d00ff,
        fields: [
          { name: '📝 Titre', value: data.title || 'Sans titre', inline: false },
          { name: '🔗 Télécharger', value: data.download_url || 'Bientôt disponible', inline: false }
        ],
        timestamp: new Date().toISOString()
      },
      'new_feedback': {
        title: this.isKnownUser
          ? `💬 ${this.userName} a donné son avis`
          : '💬 Nouveau feedback reçu',
        description: `Note : ${'⭐'.repeat(data.rating || 0)}`,
        color: this.isKnownUser ? 0x00ff00 : 0x00d0c6,
        fields: [
          { name: '👤 De', value: data.name || 'Anonyme', inline: true },
          { name: '📧 Email', value: data.email || 'Non renseigné', inline: true },
          { name: '🔗 IP', value: this.userIP, inline: true },
          { name: '👍 Avis', value: (data.positive || 'Pas de commentaire').substring(0, 1000), inline: false },
          { name: '👎 A améliorer', value: (data.negative || '_').substring(0, 1000), inline: false },
          { name: '💡 Suggestions', value: (data.suggestions || '_').substring(0, 1000), inline: false }
        ],
        timestamp: new Date().toISOString()
      },
'external_link_click': {
    title: this.isKnownUser 
        ? `🔗 ${this.userName} clique sur un lien externe` 
        : '🔗 Clic sur un lien externe',
    description: `Sortie vers : **${data.url || 'Inconnue'}**`,
    color: 0x00d0c6,
    fields: [
        // Correction ici : on ajoute (data.url || '') pour éviter le crash si url est undefined
        { name: '🌐 URL', value: (data.url || '').substring(0, 100), inline: false },
        { name: '📝 Texte du lien', value: (data.text || 'Sans texte').substring(0, 100), inline: true }, // Sécurisé aussi
        { name: '📍 Section', value: data.section || 'Inconnue', inline: true },
        { name: '🔗 IP', value: this.userIP, inline: true }
    ],
    timestamp: new Date().toISOString()
},
      'new_download': {
        title: this.isKnownUser
          ? `🎮 ${this.userName} télécharge Echo !`
          : '🎮 Nouveau joueur télécharge Echo !',
        description: this.isKnownUser
          ? `**${this.userName}** vient de télécharger la version **${data.version}** du jeu ! 🎉`
          : `Un nouveau joueur découvre Echo avec la version **${data.version}** ! 🚀`,
        color: this.isKnownUser ? 0x00ff00 : 0xFFD700, // Or pour les nouveaux
        fields: [
          {
            name: '📦 Version téléchargée',
            value: `\`${data.version}\``,
            inline: true
          },
          {
            name: '🔗 Adresse IP',
            value: this.userIP,
            inline: true
          },
          {
            name: '🕐 Heure',
            value: new Date().toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            inline: true
          },
          {
            name: '📍 Localisation',
            value: `${this.geoData.city || 'Inconnue'}, ${this.geoData.country || 'Inconnu'} ${this.geoData.country_emoji || ''}`,
            inline: true
          },
          {
            name: '🌐 Fournisseur Internet',
            value: this.geoData.isp || 'Inconnu',
            inline: true
          }
        ],
        thumbnail: {
          url: 'https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png'
        },
        footer: {
          text: `Session ${this.sessionId?.substr(-8) || 'N/A'} • Que la partie commence !`,
          icon_url: 'https://florian-croiset.github.io/jeusite/assets/favicon.ico'
        },
        timestamp: new Date().toISOString()
      },
      'exit_site': {
        title: '🚪 Clic vers un lien externe',
        description: `Sortie vers : **${data.version}**`,
        color: 0x00ff88,
        fields: [
          { name: '🆔 IP', value: data.ip || 'Masquée', inline: true },
          { name: '📄 Page', value: data.page || '/', inline: true }
        ],
        timestamp: new Date().toISOString()
      },
      'countdown_finished': {
        title: '🎉 Compte à rebours terminé !',
        description: 'Le jeu est maintenant disponible !',
        color: 0xff0055,
        timestamp: new Date().toISOString()
      },
      'download_enabled': {
        title: '✅ Téléchargements activés',
        description: 'Les téléchargements sont maintenant autorisés',
        color: 0x00ff88,
        timestamp: new Date().toISOString()
      },
      'download_disabled': {
        title: '🚫 Téléchargements désactivés',
        description: 'Les téléchargements ont été bloqués',
        color: 0xff0055,
        timestamp: new Date().toISOString()
      },
      'error': {
        title: '❌ Erreur critique',
        description: `**Erreur:** ${data.message}\n**Page:** ${data.page}`,
        color: 0xff0000,
        timestamp: new Date().toISOString()
      },
      'share_modal_opened': {
        title: '📤 Modale de partage ouverte',
        color: 0x00d0c6,
        timestamp: new Date().toISOString()
      },
      'share_link_copied': {
        title: '📋 Lien copié',
        description: 'L\'utilisateur a copié le lien du site',
        color: 0x00ff88,
        timestamp: new Date().toISOString()
      },
      'secret_code_pasted': {
        title: '📝 Code collé dans la modale secrète',
        color: 0xffa500,
        fields: [
          { name: 'Longueur', value: String(data.length || 0), inline: true }
        ],
        timestamp: new Date().toISOString()
      },
      'settings_opened': {
        title: '⚙️ Paramètres ouverts',
        color: 0x8735b9,
        timestamp: new Date().toISOString()
      },
      'language_changed': {
        title: '🌐 Langue modifiée',
        fields: [
          { name: 'De', value: data.from || '?', inline: true },
          { name: 'Vers', value: data.to || '?', inline: true }
        ],
        color: 0x00d0c6,
        timestamp: new Date().toISOString()
      },
      'settings_reset': {
        title: '🔄 Paramètres réinitialisés',
        color: 0xff0055,
        timestamp: new Date().toISOString()
      },
      'test_mode_activated': {
        title: '🧪 Mode test activé',
        description: 'Le compte à rebours de test a été lancé',
        color: 0xffaa00,
        timestamp: new Date().toISOString()
      },
      'music_toggled': {
        title: data.playing ? '🎵 Musique lancée' : '⏸️ Musique en pause',
        color: data.playing ? 0x00ff88 : 0x888888,
        timestamp: new Date().toISOString()
      },
      'music_autoplay': {
        title: '🎶 Lecture automatique démarrée',
        color: 0x00d0c6,
        timestamp: new Date().toISOString()
      },
      'fullscreen_toggled': {
        title: data.enabled ? '🖥️ Plein écran activé' : '🪟 Plein écran désactivé',
        color: 0x8735b9,
        timestamp: new Date().toISOString()
      }
    };

    return embeds[type] || null;
  }

  getLocationString() {
    if (!this.geoData || this.geoData.ip === 'Unknown') return 'Inconnue';

    const parts = [];
    if (this.geoData.city) parts.push(this.geoData.city);
    if (this.geoData.country) parts.push(this.geoData.country);
    if (this.geoData.country_emoji) parts.push(this.geoData.country_emoji);

    return parts.join(', ') || 'Inconnue';
  }
}

// Créer une instance globale
window.webhookManager = new DiscordWebhookManager();

// Fonction raccourcie pour l'utilisation
window.sendDiscordNotification = async function (type, data) {
  await window.webhookManager.sendNotification(type, data);
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('admin.html')) return;

  await window.webhookManager.init();

  document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('admin.html')) return;

  await window.webhookManager.init();
});

console.log('✅ Discord Webhook Manager loaded');
});

console.log('✅ Discord Webhook Manager loaded');