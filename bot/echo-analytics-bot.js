const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const PREFIX = '!'; // Préfixe des commandes

// 📊 FONCTION : Générer le rapport
async function generateReport(period = 'week') {
  let startDate;
  const now = new Date();
  
  switch(period) {
    case 'day':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
  }
  
  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('*')
    .gte('started_at', startDate.toISOString());
  
  if (error) throw error;
  
  if (!sessions || sessions.length === 0) {
    return {
      title: '📊 Rapport Echo Analytics',
      description: `Aucune activité détectée sur les dernières ${period === 'day' ? '24h' : period === 'week' ? '7 jours' : '30 jours'}.`,
      color: 0x888888
    };
  }
  
  // Stats globales
  const totalSessions = sessions.length;
  const uniqueIPs = new Set(sessions.map(s => s.ip_address)).size;
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const avgDuration = Math.round(totalDuration / totalSessions);
  const totalEvents = sessions.reduce((acc, s) => acc + (s.events_count || 0), 0);
  
  // Device stats
  const deviceStats = sessions.reduce((acc, s) => {
    const device = s.device || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  
  const deviceText = Object.entries(deviceStats)
    .sort((a, b) => b[1] - a[1])
    .map(([device, count]) => {
      const percent = Math.round((count / totalSessions) * 100);
      return `${device}: **${count}** (${percent}%)`;
    })
    .join('\n');
  
  // Browser stats
  const browserStats = sessions.reduce((acc, s) => {
    const browser = s.browser || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});
  
  const browserText = Object.entries(browserStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([browser, count]) => {
      const percent = Math.round((count / totalSessions) * 100);
      return `${browser}: **${count}** (${percent}%)`;
    })
    .join('\n');
  
  // Top locations
  const locationStats = sessions.reduce((acc, s) => {
    const loc = s.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});
  
  const topLocations = Object.entries(locationStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([loc, count]) => `${loc}: **${count}**`)
    .join('\n');
  
  // Utilisateurs connus
  const knownUserSessions = sessions.filter(s => s.tracked_user_id);
  
  const periodLabel = {
    'day': 'Dernières 24h',
    'week': 'Derniers 7 jours',
    'month': 'Derniers 30 jours'
  }[period];
  
  return {
    title: '📊 Rapport Echo Analytics',
    description: `**${periodLabel}** • ${startDate.toLocaleDateString('fr-FR')} → ${now.toLocaleDateString('fr-FR')}`,
    color: 0x00d0c6,
    fields: [
      {
        name: '🌍 Vue d\'ensemble',
        value: `**${totalSessions}** sessions (${uniqueIPs} IPs uniques)\n` +
               `**${Math.floor(totalDuration/3600)}h ${Math.floor((totalDuration%3600)/60)}m** de temps total\n` +
               `**${Math.floor(avgDuration/60)}m ${avgDuration%60}s** par session en moyenne\n` +
               `**${totalEvents}** interactions totales`,
        inline: false
      },
      {
        name: '👥 Utilisateurs',
        value: `Connus: **${knownUserSessions.length}**\nAnonymes: **${totalSessions - knownUserSessions.length}**`,
        inline: true
      },
      {
        name: '📈 Engagement',
        value: `Interactions/session: **${Math.round(totalEvents/totalSessions)}**`,
        inline: true
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true
      },
      {
        name: '📱 Appareils',
        value: deviceText || 'Aucune donnée',
        inline: true
      },
      {
        name: '🌐 Navigateurs',
        value: browserText || 'Aucune donnée',
        inline: true
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true
      },
      {
        name: '📍 Top 5 Localisations',
        value: topLocations || 'Aucune donnée',
        inline: false
      }
    ],
    footer: {
      text: `Echo Analytics v2.3 • Généré sur demande`,
      icon_url: 'https://florian-croiset.github.io/jeusite/assets/favicon.ico'
    },
    timestamp: new Date().toISOString()
  };
}

// 📊 FONCTION : Stats en temps réel
async function getLiveStats() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const { data: activeSessions } = await supabase
    .from('user_sessions')
    .select('*')
    .gte('started_at', fiveMinutesAgo.toISOString())
    .is('ended_at', null);
  
  const { data: todaySessions } = await supabase
    .from('user_sessions')
    .select('id')
    .gte('started_at', new Date().setHours(0,0,0,0));
  
  return {
    title: '⚡ Stats en temps réel',
    description: 'Activité actuelle du site',
    color: 0xff6b6b,
    fields: [
      {
        name: '👥 Visiteurs actifs (5 min)',
        value: `**${activeSessions?.length || 0}** en ligne`,
        inline: true
      },
      {
        name: '📊 Sessions aujourd\'hui',
        value: `**${todaySessions?.length || 0}** visites`,
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };
}

// 🔍 FONCTION : Rechercher un utilisateur
async function searchUser(query) {
  const { data: users } = await supabase
    .from('tracked_users')
    .select('*')
    .or(`first_name.ilike.%${query}%,ip_address.ilike.%${query}%`)
    .eq('is_active', true);
  
  if (!users || users.length === 0) {
    return {
      title: '🔍 Recherche utilisateur',
      description: `Aucun résultat pour "${query}"`,
      color: 0x888888
    };
  }
  
  const userList = users.slice(0, 10).map(u => 
    `**${u.first_name}**\n└ IP: \`${u.ip_address}\`\n└ Créé: ${new Date(u.started_at).toLocaleDateString('fr-FR')}`
  ).join('\n\n');
  
  return {
    title: '🔍 Résultats de recherche',
    description: userList,
    color: 0x00d0c6,
    footer: { text: `${users.length} utilisateur(s) trouvé(s)` }
  };
}

// 📋 FONCTION : Dernières sessions
async function getRecentSessions(limit = 5) {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  
  if (!sessions || sessions.length === 0) {
    return {
      title: '📋 Dernières sessions',
      description: 'Aucune session récente',
      color: 0x888888
    };
  }
  
  const sessionList = sessions.map(s => {
    const duration = s.duration_seconds 
      ? `${Math.floor(s.duration_seconds/60)}m ${s.duration_seconds%60}s`
      : 'En cours';
    return `**${s.location || 'Unknown'}** • ${s.device}\n` +
           `└ IP: \`${s.ip_address}\`\n` +
           `└ Durée: ${duration}\n` +
           `└ ${new Date(s.started_at).toLocaleString('fr-FR')}`;
  }).join('\n\n');
  
  return {
    title: '📋 Dernières sessions',
    description: sessionList,
    color: 0x00d0c6
  };
}

// 🤖 ÉVÉNEMENT : Bot prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('Echo Analytics', { type: 'WATCHING' });
});

// 💬 ÉVÉNEMENT : Message reçu
client.on('messageCreate', async (message) => {
  // Ignorer les bots
  if (message.author.bot) return;
  
  // Vérifier le préfixe
  if (!message.content.startsWith(PREFIX)) return;
  
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  try {
    // 📊 COMMANDE : !report [day|week|month]
    if (command === 'report' || command === 'stats') {
      const period = args[0] || 'week';
      
      if (!['day', 'week', 'month'].includes(period)) {
        return message.reply('❌ Période invalide. Utilise `day`, `week` ou `month`.');
      }
      
      await message.channel.sendTyping();
      const reportData = await generateReport(period);
      const embed = new EmbedBuilder(reportData);
      
      await message.reply({ embeds: [embed] });
    }
    
    // ⚡ COMMANDE : !live
    else if (command === 'live' || command === 'now') {
      await message.channel.sendTyping();
      const liveData = await getLiveStats();
      const embed = new EmbedBuilder(liveData);
      
      await message.reply({ embeds: [embed] });
    }
    
    // 🔍 COMMANDE : !search <nom ou ip>
    else if (command === 'search' || command === 'find') {
      const query = args.join(' ');
      
      if (!query) {
        return message.reply('❌ Usage: `!search <nom ou IP>`');
      }
      
      await message.channel.sendTyping();
      const searchData = await searchUser(query);
      const embed = new EmbedBuilder(searchData);
      
      await message.reply({ embeds: [embed] });
    }
    
    // 📋 COMMANDE : !recent [nombre]
    else if (command === 'recent' || command === 'sessions') {
      const limit = parseInt(args[0]) || 5;
      
      if (limit > 10) {
        return message.reply('❌ Maximum 10 sessions.');
      }
      
      await message.channel.sendTyping();
      const recentData = await getRecentSessions(limit);
      const embed = new EmbedBuilder(recentData);
      
      await message.reply({ embeds: [embed] });
    }
    
    // ❓ COMMANDE : !help
    else if (command === 'help' || command === 'commands') {
      const helpEmbed = new EmbedBuilder({
        title: '🤖 Echo Analytics Bot - Commandes',
        description: 'Voici toutes les commandes disponibles :',
        color: 0x8735b9,
        fields: [
          {
            name: '📊 `!report [day|week|month]`',
            value: 'Génère un rapport détaillé\nExemples: `!report`, `!report day`, `!report month`',
            inline: false
          },
          {
            name: '⚡ `!live`',
            value: 'Stats en temps réel (visiteurs actifs)',
            inline: false
          },
          {
            name: '🔍 `!search <nom ou IP>`',
            value: 'Recherche un utilisateur tracké\nExemple: `!search Jean`, `!search 192.168`',
            inline: false
          },
          {
            name: '📋 `!recent [nombre]`',
            value: 'Affiche les dernières sessions\nExemple: `!recent 10` (max 10)',
            inline: false
          },
          {
            name: '❓ `!help`',
            value: 'Affiche cette aide',
            inline: false
          }
        ],
        footer: { text: 'Echo Analytics v2.3' }
      });
      
      await message.reply({ embeds: [helpEmbed] });
    }
    
    // ❌ Commande inconnue
    else {
      await message.reply(`❌ Commande inconnue. Tape \`${PREFIX}help\` pour voir les commandes disponibles.`);
    }
    
  } catch (error) {
    console.error('Erreur commande:', error);
    await message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
  }
});

// Démarrer le bot
client.login(process.env.DISCORD_BOT_TOKEN);

console.log('🤖 Démarrage du bot...');
