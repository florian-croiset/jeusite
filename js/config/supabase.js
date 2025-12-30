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