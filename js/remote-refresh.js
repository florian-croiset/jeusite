// =============================================
// CONFIGURATION SUPABASE POUR ECHO
// Fichier : js/config/supabase.js
// =============================================

// ⚠️ REMPLACEZ ces valeurs par vos identifiants Supabase
const SUPABASE_URL = 'https://apwhdqpdugvhwdvjlbee.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_U4b6xa4sBwEEs1heHmcEGg_M7MA5sB1';

// Vérifier que Supabase SDK est chargé
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase SDK non chargé ! Vérifiez que le script CDN est inclus AVANT supabase.js');
}

// Initialisation du client Supabase (pas de redéclaration)
let supabaseClient;
if (!window.EchoSupabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.EchoSupabase = supabaseClient;
} else {
  supabaseClient = window.EchoSupabase;
}


// =============================================
// MODULE D'AUTHENTIFICATION
// =============================================

const Auth = {
  // Inscription d'un nouvel utilisateur
  async signUp(email, password, username) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username
          }
        }
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Connexion
  async signIn(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: error.message };
    }
  },

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  },

  // Récupérer le profil complet
  async getUserProfile(userId) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erreur profil:', error);
      return null;
    }
    return data;
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

// =============================================
// MODULE VERSIONS DU JEU
// =============================================

const GameVersions = {
  // Récupérer toutes les versions
  async getAll() {
    const { data, error } = await supabaseClient
      .from('game_versions')
      .select('*')
      .order('release_date', { ascending: false });
    
    if (error) {
      console.error('Erreur versions:', error);
      return [];
    }
    return data;
  },

// Récupérer la dernière version dont l'heure de sortie est passée
// Dans GameVersions
async getLatest() {
    const now = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('game_versions')
      .select('*')
      .eq('is_published', true)  // ✅ Changé : is_published au lieu de is_active
      .lte('release_date', now)
      .order('release_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) return null;
    return data;
}
};

// =============================================
// MODULE COMPTE À REBOURS
// =============================================

const Countdown = {
  // Récupérer le compte à rebours actif
  async getActive() {
    const { data, error } = await supabaseClient
      .from('countdown')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erreur countdown:', error);
      return null;
    }
    return data;
  }
};

// =============================================
// MODULE FORMULAIRES
// =============================================

const Forms = {
  // Soumettre une réponse
  async submitResponse(formId, responses) {
    try {
      const user = await Auth.getCurrentUser();
      
      const { data, error } = await supabaseClient
        .from('form_responses')
        .insert({
          form_id: formId,
          user_id: user?.id,
          responses
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur soumission:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer un formulaire
  async getForm(formId) {
    const { data, error } = await supabaseClient
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Erreur formulaire:', error);
      return null;
    }
    return data;
  }
};

// =============================================
// EXPORT DES MODULES
// =============================================

// Exporter seulement si pas déjà défini
if (!window.EchoDB) {
  window.EchoDB = {
    Auth,
    GameVersions,
    Countdown,
    Forms,
    supabase: supabaseClient // Accès direct au client si besoin
  };
  console.log('✅ Echo Database initialisée avec succès');
  // Signaler que EchoDB est prêt
  window.dispatchEvent(new CustomEvent('EchoDBReady'));
} else {
  console.log('⚠️ EchoDB déjà initialisé');
}

class RemoteRefreshManager {
    constructor() {
        this.channel = null;
        this.isListening = false;
        this.lastRefreshTime = 0;
        this.refreshCooldown = 5000; // 5 secondes minimum entre 2 refresh
    }

    async init() {
        try {
            if (typeof window.EchoDB === 'undefined') {
                await this.waitForEchoDB();
            }

            await this.subscribeToRefreshEvents();

            console.log('✅ Remote Refresh Manager initialized');
        } catch (error) {
            console.error('❌ Remote Refresh Manager init error:', error);
        }
    }

    waitForEchoDB() {
        return new Promise((resolve, reject) => {
            if (window.EchoDB) return resolve();

            const onReady = () => {
                clearInterval(check);
                resolve();
            };
            window.addEventListener('EchoDBReady', onReady, { once: true });

            // Polling en fallback, au cas où l'event EchoDBReady soit raté
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
                reject(new Error('EchoDB timeout - non initialisé après 10s'));
            }, 10000);
        });
    }

    async subscribeToRefreshEvents() {
        this.channel = window.EchoDB.supabase
            .channel('remote-refresh')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'remote_commands',
                    filter: 'command=eq.force_refresh'
                },
                (payload) => this.handleRefreshCommand(payload)
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('🔔 Abonné aux commandes de refresh à distance');
                    this.isListening = true;
                }
            });
    }

    handleRefreshCommand(payload) {
        console.log('📡 Commande de refresh reçue:', payload);

        const now = Date.now();

        if (now - this.lastRefreshTime < this.refreshCooldown) {
            console.log('⏳ Cooldown actif, refresh ignoré');
            return;
        }

        this.lastRefreshTime = now;

        const data = payload.new;

        if (typeof window.sendDiscordNotification === 'function') {
            window.sendDiscordNotification('remote_refresh_triggered', {});
        }
        this.showRefreshNotification(data.message || 'Mise à jour disponible');

        setTimeout(() => {
            console.log('🔄 Rafraîchissement de la page...');
            window.location.reload();
        }, 2000);
    }

    showRefreshNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 16px;
            animation: slideIn 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fa-solid fa-sync-alt fa-spin" style="font-size: 24px;"></i>
                <div>
                    <div style="font-weight: bold; margin-bottom: 4px;">Mise à jour</div>
                    <div style="font-size: 14px; opacity: 0.9;" id="_refresh-msg"></div>
                </div>
            </div>
        `;
        // L'élément doit être dans le DOM avant qu'on puisse le récupérer par ID
        document.body.appendChild(notification);
        document.getElementById('_refresh-msg').textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
    }

    static async triggerRefresh(message = 'Le site va se rafraîchir...') {
        try {
            if (typeof window.EchoDB === 'undefined') {
                throw new Error('EchoDB not available');
            }

            const { data: { user } } = await window.EchoDB.supabase.auth.getUser();

            const { data, error } = await window.EchoDB.supabase
                .from('remote_commands')
                .insert({
                    command: 'force_refresh',
                    message: message,
                    triggered_by: user?.id || 'unknown',
                    triggered_at: new Date().toISOString()
                });

            if (error) throw error;

            if (window.sendDiscordNotification) {
                await window.sendDiscordNotification('remote_refresh_triggered', {
                    message: message,
                    triggered_by: 'Admin Panel'
                });
            }

            return data;
        } catch (error) {
            console.error(error);
        }
    }

    destroy() {
        if (this.channel) {
            window.EchoDB.supabase.removeChannel(this.channel);
            console.log('🔌 Déconnexion du canal de refresh');
        }
    }
}

// Pas d'auto-refresh sur la page admin elle-même
if (!window.location.pathname.includes('admin.html')) {
    window.remoteRefreshManager = new RemoteRefreshManager();
    
    document.addEventListener('DOMContentLoaded', () => {
        window.remoteRefreshManager.init();
    });
}

window.forceRefreshAllClients = async (message) => {
    return await RemoteRefreshManager.triggerRefresh(message);
};

console.log('✅ Remote Refresh Manager loaded');