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
// MODULE DE CONTENU DU SITE
// =============================================

const Content = {
  // Récupérer le contenu d'une section
  async getSection(sectionName) {
    const { data, error } = await supabaseClient
      .from('site_content')
      .select('*')
      .eq('section', sectionName)
      .eq('is_published', true)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Erreur contenu:', error);
      return [];
    }
    return data;
  },

  // Mettre à jour le contenu (admin uniquement)
  async updateContent(id, updates) {
    const { data, error } = await supabaseClient
      .from('site_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur mise à jour:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  // Créer un nouveau contenu (admin)
  async createContent(content) {
    const user = await Auth.getCurrentUser();
    const { data, error } = await supabaseClient
      .from('site_content')
      .insert({
        ...content,
        created_by: user?.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur création:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
};

// =============================================
// MODULE MÉDIAS
// =============================================

const Media = {
  // Upload d'un fichier
  async uploadFile(file, folder = 'uploads') {
    try {
      const user = await Auth.getCurrentUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Générer un nom unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabaseClient.storage
        .from('media')
        .getPublicUrl(filePath);

      // Enregistrer dans la base de données
      const { data, error: dbError } = await supabaseClient
        .from('media')
        .insert({
          name: file.name,
          type: file.type.split('/')[0],
          url: publicUrl,
          mime_type: file.type,
          file_size: file.size,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return { success: true, data };
    } catch (error) {
      console.error('Erreur upload:', error);
      return { success: false, error: error.message };
    }
  },

  // Liste des médias
  async getMedia(type = null, limit = 50) {
    let query = supabaseClient
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur récupération médias:', error);
      return [];
    }
    return data;
  }
};

// =============================================
// MODULE VERSIONS DU JEU
// =============================================

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
// MODULE ACTUALITÉS
// =============================================

const News = {
  // Récupérer tous les articles publiés
  async getPublished(limit = 10) {
    const { data, error } = await supabaseClient
      .from('news')
      .select(`
        *,
        author:profiles(username, display_name),
        cover:media(url, name)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erreur actualités:', error);
      return [];
    }
    return data;
  },

  // Récupérer un article par slug
  async getBySlug(slug) {
    const { data, error } = await supabaseClient
      .from('news')
      .select(`
        *,
        author:profiles(username, display_name),
        cover:media(url, name)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    if (error) {
      console.error('Erreur article:', error);
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
    Content,
    Media,
    GameVersions,
    Countdown,
    Forms,
    News,
    supabase: supabaseClient // Accès direct au client si besoin
  };
  console.log('✅ Echo Database initialisée avec succès');
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
            // Attendre que EchoDB soit disponible
            if (typeof window.EchoDB === 'undefined') {
                await this.waitForEchoDB();
            }

            // S'abonner aux événements de refresh
            await this.subscribeToRefreshEvents();
            
            console.log('✅ Remote Refresh Manager initialized');
        } catch (error) {
            console.error('❌ Remote Refresh Manager init error:', error);
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

    async subscribeToRefreshEvents() {
        // Créer un canal Realtime sur la table 'remote_commands'
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
        
        // Vérifier le cooldown pour éviter les refresh en boucle
        if (now - this.lastRefreshTime < this.refreshCooldown) {
            console.log('⏳ Cooldown actif, refresh ignoré');
            return;
        }

        this.lastRefreshTime = now;

        const data = payload.new;
        
        // Afficher une notification avant le refresh
        if (typeof window.sendDiscordNotification === 'function') {
  window.sendDiscordNotification('remote_refresh_triggered', {});
}
        this.showRefreshNotification(data.message || 'Mise à jour disponible');

        // Attendre 2 secondes puis refresh
        setTimeout(() => {
            console.log('🔄 Rafraîchissement de la page...');
            window.location.reload();
        }, 2000);
    }

    showRefreshNotification(message) {
        // Créer une notification visuelle
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
                    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
                </div>
            </div>
        `;

        // Ajouter l'animation CSS
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

    // Méthode pour déclencher un refresh depuis l'admin
    static async triggerRefresh(message = 'Le site va se rafraîchir...') {
        try {
            if (typeof window.EchoDB === 'undefined') {
                throw new Error('EchoDB not available');
            }

            // Insérer une commande dans la table
            const { data, error } = await window.EchoDB.supabase
                .from('remote_commands')
                .insert({
                    command: 'force_refresh',
                    message: message,
                    triggered_by: 'admin',
                    triggered_at: new Date().toISOString()
                });

            if (error) throw error;

            // ✅ AJOUT : Envoi de la notif qui sera routée vers le webhook réservé avec PING
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

// =============================================
// INITIALISATION AUTOMATIQUE
// =============================================

// Créer une instance globale (sauf sur la page admin)
if (!window.location.pathname.includes('admin.html')) {
    window.remoteRefreshManager = new RemoteRefreshManager();
    
    document.addEventListener('DOMContentLoaded', () => {
        window.remoteRefreshManager.init();
    });
}

// =============================================
// FONCTION HELPER POUR L'ADMIN
// =============================================

window.forceRefreshAllClients = async (message) => {
    return await RemoteRefreshManager.triggerRefresh(message);
};

console.log('✅ Remote Refresh Manager loaded');


// =============================================
// EXEMPLE D'UTILISATION DEPUIS LA CONSOLE ADMIN:
// =============================================
/*

// Forcer le refresh de tous les clients:
await forceRefreshAllClients('Nouvelle version disponible !');

// Ou avec le message par défaut:
await forceRefreshAllClients();

*/