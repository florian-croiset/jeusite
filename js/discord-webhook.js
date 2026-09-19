class DiscordWebhookManager {
constructor() {
    this.webhooks = {
      main: null,
      refresh: null,
      feedback: null
    };
    this.adminRoleId = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      await this.loadWebhooks();

      this.initialized = true;
      console.log('✅ Discord Webhook Manager initialized');
    } catch (error) {
      console.error('❌ Webhook manager init error:', error);
      this.mainWebhook = '';
    }
  }

  waitForEchoDB() {
    return new Promise((resolve, reject) => {
        if (window.EchoDB) return resolve();

        const onReady = () => { clearInterval(check); resolve(); };
        window.addEventListener('EchoDBReady', onReady, { once: true });

        const check = setInterval(() => {
            if (window.EchoDB) {
                clearInterval(check);
                window.removeEventListener('EchoDBReady', onReady);
                resolve();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(check);
            window.removeEventListener('EchoDBReady', onReady);
            reject(new Error('EchoDB timeout'));
        }, 10000);
    });
}

  async loadWebhooks() {
    if (typeof window.EchoDB === 'undefined') return;

    try {
      const { data: settings } = await window.EchoDB.supabase
        .from('webhook_settings')
        .select('setting_key, webhook_url')
        .eq('is_active', true);

      if (settings) {
        settings.forEach(s => {
          if (s.setting_key === 'main_webhook') this.webhooks.main = s.webhook_url;
          if (s.setting_key === 'refresh_webhook') this.webhooks.refresh = s.webhook_url;
          if (s.setting_key === 'feedback_webhook') this.webhooks.feedback = s.webhook_url;
        });
      }

      const { data: roleData } = await window.EchoDB.supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'discord_admin_role_id')
        .single();

      if (roleData) this.adminRoleId = roleData.setting_value;
    } catch (e) { console.error("Erreur chargement webhooks DB:", e); }
  }

  async sendNotification(type, data) {
    if (!this.initialized) await this.init();

    let targetUrl = this.webhooks.main;

    if (type === 'remote_refresh_triggered') {
      targetUrl = this.webhooks.refresh || this.webhooks.main;
    }
    else if (type === 'new_feedback') {
      targetUrl = this.webhooks.feedback || this.webhooks.main;
    }

    if (!targetUrl) return;

    const embed = this.createEmbed(type, data);
    const payload = {
      username: 'Echo System',
      avatar_url: 'https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png',
      embeds: [embed]
    };

    // Ping le rôle admin seulement pour le refresh distant
    if (type === 'remote_refresh_triggered' && this.adminRoleId) {
      payload.content = this.adminRoleId === 'everyone' ? '@everyone' : `<@&${this.adminRoleId}>`;
    }

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) { console.error('Discord send error:', error); }
  }

  createEmbed(type, data) {
    const embeds = {
      'new_feedback': {
        title: '💬 Nouveau feedback reçu',
        description: `Note : ${'⭐'.repeat(data.rating || 0)}`,
        color: 0x00d0c6,
        fields: [
          { name: '👤 De', value: data.name || 'Anonyme', inline: true },
          { name: '📧 Email', value: data.email || 'Non renseigné', inline: true },
          { name: '👍 Avis', value: (data.positive || 'Pas de commentaire').substring(0, 1000), inline: false },
          { name: '👎 A améliorer', value: (data.negative || '_').substring(0, 1000), inline: false },
          { name: '💡 Suggestions', value: (data.suggestions || '_').substring(0, 1000), inline: false }
        ],
        timestamp: new Date().toISOString()
      },
      'new_download': {
        title: '🎮 Nouveau joueur télécharge Echo !',
        description: `Un nouveau joueur découvre Echo avec la version **${data.version}** ! 🚀`,
        color: 0xFFD700,
        fields: [
          {
            name: '📦 Version téléchargée',
            value: `\`${data.version}\``,
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
          }
        ],
        thumbnail: {
          url: 'https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png'
        },
        footer: {
          text: 'Que la partie commence !',
          icon_url: 'https://florian-croiset.github.io/jeusite/assets/favicon.ico'
        },
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
      'remote_refresh_triggered': {
    title: '🔄 REFRESH GÉNÉRAL LANCÉ',
    description: `Commande exécutée par : **${data.triggered_by}**\nMessage : *${data.username}*`,
    color: 0xFF0000,
    timestamp: new Date().toISOString()
},
      'download_disabled': {
        title: '🚫 Téléchargements désactivés',
        description: 'Les téléchargements ont été bloqués',
        color: 0xff0055,
        timestamp: new Date().toISOString()
      },
    };

    return embeds[type] || null;
  }
}

window.webhookManager = new DiscordWebhookManager();

window.sendDiscordNotification = async function (type, data) {
  await window.webhookManager.sendNotification(type, data);
};

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('admin.html')) return;

  await window.webhookManager.init();

  console.log('✅ Discord Webhook Manager loaded');
});
