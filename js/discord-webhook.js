// 🔔 WEBHOOK DISCORD
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1457161042294734890/J2LL5UUthHqsjh9lKv2vmvpTeIVAqPgN0KEP55CNoBuZnIka_Hsq0Kyy6Dk9KcCvWAFC';

// ⭐ NOUVEAU : ID du rôle à ping (voir comment l'obtenir ci-dessous)
const PING_ROLE_ID = '1457164285162684516'; // Remplacer par votre ID de rôle

async function sendDiscordNotification(type, data) {
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
      title: '💬 Nouveau feedback reçu',
      description: `Note : ${'⭐'.repeat(data.rating || 0)}`,
      color: 0x00d0c6,
      fields: [
        { name: '👤 De', value: data.name || 'Anonyme', inline: true },
        { name: '📧 Email', value: data.email || 'Non renseigné', inline: true },
        { name: '👍 Avis', value: (data.positive || 'Pas de commentaire').substring(0, 5000), inline: false },
        { name: '👎 A améliorer', value: (data.negative || '_').substring(0, 5000), inline: false },
        { name: '💡 Suggestions', value: (data.suggestions || '_').substring(0, 5000), inline: false }
      ],
      timestamp: new Date().toISOString()
    },
    'new_download': {
      title: '⬇️ Nouveau téléchargement',
      description: `Version **${data.version}** téléchargée`,
      color: 0x00ff88,
      fields: [
        { name: '📦 Version', value: data.version || 'Inconnue', inline: true }
      ],
      timestamp: new Date().toISOString()
    },
    'exit_site': {
      title: '🚪 Clic vers un lien externe',
      description: `Sortie vers : **${data.version}**`,
      color: 0x00ff88,
      fields: [
        { name: '🆔 IP', value: data.ip || 'Masquée', inline: true },
        { name: '📄 Page', value: data.page || '/', inline: true }
        /*{ name: '📦 Version', value: data.version || 'Inconnue', inline: true }*/
      ],
      timestamp: new Date().toISOString()
    },    
    'countdown_finished': {
      title: '🎉 Compte à rebours terminé !',
      description: 'Le jeu est maintenant disponible !',
      color: 0xff0055,
      timestamp: new Date().toISOString()
    },
    'user_registered': {
      title: '👤 Nouvel utilisateur inscrit',
      description: `**${data.username}** vient de s'inscrire`,
      color: 0x00d0c6,
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
    'new_visit': {
      title: '🛰️ Nouvelle Session / Relance Page',
      color: 0x00ff00,
      fields: [
        { name: '📍 Localisation', value: data.location || 'Inconnue', inline: true },
        { name: '🌐 Source', value: data.source || 'Direct', inline: true },
        { name: '📱 Appareil', value: data.device || 'Inconnu', inline: true },
        { name: '🖥️ Browser', value: data.browser || 'Inconnu', inline: true },
        { name: '🆔 IP', value: data.ip || 'Masquée', inline: true },
        { name: '📄 Page', value: data.page || '/', inline: true }
      ],
      timestamp: new Date().toISOString()
    },
    'session_end': {
  title: '⏱️ Session Terminée',
  color: 0x5865f2, // Blurple Discord
  fields: [
    { name: '⏳ Durée', value: data.duration, inline: true },
    { name: '🆔 IP', value: data.ip, inline: true },
    { name: '📄 Dernière Page', value: data.page, inline: true }
  ],
  timestamp: new Date().toISOString()
}
  };

  const embed = embeds[type];
  if (!embed) {
    console.error('Type de notification inconnu:', type);
    return;
  }

  // Préparation du message
  const payload = {
    username: 'Echo Analytics',
    avatar_url: 'https://florian-croiset.github.io/jeusite/assets/pngLogoTeam.png',
    embeds: [embed]
  };

  // On ne ping le rôle que pour les trucs critiques (pas les visites)
  if (type !== 'new_visit') {
      payload.content = `<@&${PING_ROLE_ID}>`;
  }

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Erreur Discord:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('admin.html')) return;

    let userIp = 'Masquée'; // Variable pour stocker l'IP et la réutiliser au clic

    try {
        const geoRes = await fetch('https://ipapi.co/json/');
        const geo = await geoRes.json();
        userIp = geo.ip; // On sauvegarde l'IP ici

        const visitDetails = {
            page: window.location.pathname,
            ip: geo.ip,
            location: `${geo.city}, ${geo.country_name} ${geo.country_emoji || ''}`,
            device: /Android|iPhone|iPad/i.test(navigator.userAgent) ? '📱 Mobile' : '💻 PC',
            browser: navigator.userAgent.split(') ')[1]?.split(' ')[0] || 'Inconnu',
            source: document.referrer ? new URL(document.referrer).hostname : 'Direct',
            screen: `${window.screen.width}x${window.screen.height}`
        };

        // ENVOI UNIQUEMENT DE LA VISITE AU CHARGEMENT
        await sendDiscordNotification('new_visit', visitDetails);

        // --- L'APPEL À EXIT_SITE A ÉTÉ SUPPRIMÉ D'ICI ---

    } catch (e) {
        sendDiscordNotification('new_visit', {
            page: window.location.pathname,
            location: 'Bloqué (Adblock)',
            device: 'Inconnu',
            browser: 'Inconnu',
            source: 'Direct'
        });
    }

    // GESTION DES CLICS SORTANTS (Correction de la promesse fetch)
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (link.hostname !== window.location.hostname) {
                sendDiscordNotification('exit_site', { 
                    version: link.href, 
                    ip: userIp, // Utilise l'IP récupérée au début
                    page: window.location.pathname
                });
            }
        });
    });
});



// --- CONFIGURATION & GLOBALES ---
let startTime = Date.now();
let userIP = 'Chargement...';


// CONFIGURATION DE SUIVI
const TRACKING_CONFIG = {
    // Dossiers à surveiller pour les téléchargements
    downloadPaths: ['executable/', 'assets/', 'css', '.js'],
    // Extensions de fichiers
    extensions: ['.zip', '.exe', '.png', '.mp3', '.mp4', '.svg', '.jpg', '.ico', '.rar', '.7z', '.css', '.js']
};

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('admin.html')) return;

    try {
        // 1. Récupérer les infos IP
        const geoRes = await fetch('https://ipapi.co/json/');
        const geo = await geoRes.json();
        userIP = geo.ip || 'Anonyme';

        // 2. Préparer les détails de visite
        const visitDetails = {
            page: window.location.pathname,
            ip: userIP,
            location: `${geo.city}, ${geo.country_name} ${geo.country_emoji || ''}`,
            device: /Android|iPhone|iPad/i.test(navigator.userAgent) ? '📱 Mobile' : '💻 PC',
            browser: navigator.userAgent.split(') ')[1]?.split(' ')[0] || 'Inconnu',
            source: document.referrer ? new URL(document.referrer).hostname : 'Direct'
        };

        // 3. Envoyer la notif dans un "Thread" spécial pour cette IP
        // Note: On utilise le nom de l'IP comme "thread_name"
        await sendToDiscordActivity(userIP, visitDetails);

    } catch (e) {
        console.error('Erreur tracking:', e);
    }
});

// FONCTION SPÉCIALE POUR LE SUIVI PAR IP (Threads)
async function sendToDiscordActivity(ip, details) {
    const payload = {
        username: `Sesssion: ${ip}`,
        embeds: [{
            title: '🛰️ Activité Détectée',
            color: 0x3498db,
            fields: [
                { name: '📄 Page', value: details.page, inline: true },
                { name: '📍 Lieu', value: details.location, inline: true },
                { name: '🖥️ Appareil', value: details.device, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// DÉTECTION DES TÉLÉCHARGEMENTS (executable/ ou assets/)
document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.href;
    
    // Vérifie si le lien contient executable/ ou assets/ OU une extension
    const isSpecialPath = TRACKING_CONFIG.downloadPaths.some(path => href.includes(path));
    const isFile = TRACKING_CONFIG.extensions.some(ext => href.toLowerCase().endsWith(ext));

    if (isSpecialPath || isFile) {
        // On récupère l'IP pour le log
        const geoRes = await fetch('https://ipapi.co/json/');
        const geo = await geoRes.json();

        sendDiscordNotification('new_download', {
            version: href.split('/').pop(), // Nom du fichier
            ip: geo.ip,
            path: href
        });
        
        // Alerte spécifique pour ton salon de log
        console.log(`🚀 Téléchargement détecté: ${href}`);
    }
});


// --- TRACKING SORTIE DE PAGE (TIMER) ---
window.addEventListener('beforeunload', () => {
    if (window.location.pathname.includes('admin.html')) return;

    const durationMs = Date.now() - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    const durationText = `${minutes}m ${seconds}s`;

    // Préparation du message pour Discord
    const payload = JSON.stringify({
        username: `Logout: ${userIP}`,
        embeds: [{
            title: '⏱️ Fin de session',
            description: `Le joueur a quitté le site.\n**Page de sortie :** \`${window.location.pathname}\`\n**Temps passé :** \`${durationText}\``,
            color: 0x5865f2,
            timestamp: new Date().toISOString()
        }]
    });
    
    // Le Blob est OBLIGATOIRE pour que Discord accepte le sendBeacon
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(DISCORD_WEBHOOK_URL, blob);
});


window.sendDiscordNotification = sendDiscordNotification;