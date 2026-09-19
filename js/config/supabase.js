const SUPABASE_URL = 'https://apwhdqpdugvhwdvjlbee.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_U4b6xa4sBwEEs1heHmcEGg_M7MA5sB1';

if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase SDK non chargé ! Vérifiez que le script CDN est inclus AVANT supabase.js');
}

let supabaseClient;
if (!window.EchoSupabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.EchoSupabase = supabaseClient;
} else {
  supabaseClient = window.EchoSupabase;
}

// ===== AUTHENTIFICATION =====

const Auth = {
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

  async getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  },

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

  onAuthStateChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

// ===== VERSIONS DU JEU =====

const GameVersions = {
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

async getLatest() {
    const now = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('game_versions')
      .select('*')
      .eq('is_published', true)
      .lte('release_date', now)
      .order('release_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) return null;
    return data;
}
};

// ===== COMPTE À REBOURS =====

const Countdown = {
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

// ===== FORMULAIRES =====

const Forms = {
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

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        // Si on est sur une page protégée, rediriger vers le login
        const isProtectedPage = window.location.pathname.includes('admin');
        if (isProtectedPage) {
            console.warn('Session expirée, redirection...');
            window.location.href = '/admin.html';
        }
    }
});

// ===== EXPORT =====

if (!window.EchoDB) {
  window.EchoDB = {
    Auth,
    GameVersions,
    Countdown,
    Forms,
    supabase: supabaseClient
  };
  console.log('✅ Echo Database initialisée avec succès');
  window.dispatchEvent(new CustomEvent('EchoDBReady'));
} else {
  console.log('⚠️ EchoDB déjà initialisé');
}