
// Inscription
/*document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    
    if (password !== confirmPassword) {
        if (window.showNotification) {
            showNotification('❌ Les mots de passe ne correspondent pas', 'error');
        } else {
            alert('Les mots de passe ne correspondent pas');
        }
        return;
    }
    
    if (!acceptTerms) {
        if (window.showNotification) {
            showNotification('❌ Veuillez accepter les conditions', 'error');
        } else {
            alert('Veuillez accepter les conditions d\'utilisation');
        }
        return;
    }
    
    setButtonLoading(submitBtn, true);
    
    try {
        if (!window.supabase) {
            throw new Error('Connexion à la base de données indisponible');
        }
        
        const { data, error } = await window.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (error) throw error;
        
        if (window.showNotification) {
            showNotification('✅ Inscription réussie ! Vérifiez votre email.', 'success');
        } else {
            alert('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
        }
        
        closeSignupModal();
        
        setTimeout(() => {
            if (window.showNotification) {
                showNotification('💡 Vous pouvez maintenant vous connecter', 'info');
            }
            openLoginModal();
        }, 3000);
        
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        
        if (window.showNotification) {
            showNotification(`❌ Erreur : ${error.message}`, 'error');
        } else {
            alert(`Erreur d'inscription : ${error.message}`);
        }
    } finally {
        setButtonLoading(submitBtn, false);
    }
});*/

// =============================================
// AUTHENTIFICATION SOCIALE
// =============================================

/*async function loginWithGoogle() {
    try {
        if (!window.supabase) {
            throw new Error('Connexion à la base de données indisponible');
        }
        
        const { error } = await window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Erreur Google:', error);
        if (window.showNotification) {
            showNotification(`❌ Erreur : ${error.message}`, 'error');
        } else {
            alert(`Erreur : ${error.message}`);
        }
    }
}

async function signupWithGoogle() {
    loginWithGoogle(); // Même processus pour l'inscription
}*/


// Attendre que le DOM et buttons.js soient prêts
/*window.addEventListener('load', () => {
    setTimeout(() => {
        const countdownSection = document.querySelector('.countdown-section');
        const isCountdownFinished = countdownSection && 
                                   countdownSection.querySelector('.countdown-finished-message');
        
        if (!isCountdownFinished) {
            checkGameAvailability();
        } else {
            console.log('⏰ Compte à rebours terminé détecté, respect de son état');
        }
    }, 1500);
});*/

/*function openSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm('signupForm');
}

function switchToSignup() {
    closeLoginModal();
    setTimeout(openSignupModal, 300);
}

function switchToLogin() {
    closeSignupModal();
    setTimeout(openLoginModal, 300);
}
*/

    <!-- 4. Scripts de test/démo -->
    <script>
        // Attendre que tout soit chargé
        window.addEventListener('load', () => {
            console.log('✅ Page chargée');
            
            // Initialiser l'upload de test
            document.getElementById('test-upload')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && window.EchoComplete) {
                    await EchoComplete.uploadImage(file);
                    await EchoComplete.loadGallery();
                }
            });
        });

        // Fonction de test pour mettre à jour le contenu
        async function testContentUpdate() {
            if (!window.EchoComplete) {
                alert('⚠️ Database non initialisée');
                return;
            }
            
            const result = await EchoComplete.updateHomeContent(
                'hero',
                'Echo - Nouvelle Version',
                'Découvrez la dernière mise à jour de Echo avec des fonctionnalités incroyables!'
            );
            
            if (result.success) {
                alert('✅ Contenu mis à jour! Rechargez la page pour voir les changements.');
            } else {
                alert('❌ Erreur: ' + result.error);
            }
        }

        // Tester les notifications
        function testNotification() {
            if (!window.showNotification) {
                alert('⚠️ Système de notifications non disponible');
                return;
            }
            
            showNotification('🎉 Ceci est une notification de test!', 'success');
            
            setTimeout(() => {
                showNotification('⚠️ Notification d\'avertissement', 'warning');
            }, 2000);
            
            setTimeout(() => {
                showNotification('❌ Notification d\'erreur', 'error');
            }, 4000);
        }

        // Afficher les statistiques
        async function showStats() {
            if (!window.EchoDB) {
                alert('⚠️ Database non disponible');
                return;
            }
            
            try {
                const [users, media, content] = await Promise.all([
                    EchoDB.supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    EchoDB.supabase.from('media').select('id', { count: 'exact', head: true }),
                    EchoDB.supabase.from('site_content').select('id', { count: 'exact', head: true })
                ]);
                
                alert(`📊 Statistiques:
                
👥 Utilisateurs: ${users.count || 0}
🎨 Médias: ${media.count || 0}
📝 Contenus: ${content.count || 0}`);
            } catch (error) {
                alert('❌ Erreur: ' + error.message);
            }
        }

        // Focus sur la recherche
        function focusSearch() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.value = 'echo';
                searchInput.dispatchEvent(new Event('input'));
            }
        }


    </script>



    
<!-- MODALE D'INSCRIPTION -->
<!--<div id="signupModal" class="auth-modal">
    <div class="auth-modal-content">
        <button class="auth-close" onclick="closeSignupModal()">&times;</button>
        
        <div class="auth-header">
            <i class="fa-solid fa-user-plus"></i>
            <h2>Inscription</h2>
            <p>Rejoignez la communauté Echo</p>
        </div>
        
        <form id="signupForm" class="auth-form">
            <div class="auth-input-group">
                <i class="fa-solid fa-user"></i>
                <input 
                    type="text" 
                    id="signupUsername" 
                    placeholder="Nom d'utilisateur"
                    required
                    minlength="3"
                    autocomplete="username"
                >
            </div>
            
            <div class="auth-input-group">
                <i class="fa-solid fa-envelope"></i>
                <input 
                    type="email" 
                    id="signupEmail" 
                    placeholder="Email"
                    required
                    autocomplete="email"
                >
            </div>
            
            <div class="auth-input-group">
                <i class="fa-solid fa-lock"></i>
                <input 
                    type="password" 
                    id="signupPassword" 
                    placeholder="Mot de passe"
                    required
                    minlength="6"
                    autocomplete="new-password"
                >
                <button 
                    type="button" 
                    class="toggle-password" 
                    onclick="togglePassword('signupPassword')"
                    title="Afficher/Masquer"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>
            
            <div class="password-strength" id="passwordStrength">
                <div class="strength-bar">
                    <div class="strength-fill"></div>
                </div>
                <span class="strength-text">Force du mot de passe</span>
            </div>
            
            <div class="auth-input-group">
                <i class="fa-solid fa-lock"></i>
                <input 
                    type="password" 
                    id="signupConfirmPassword" 
                    placeholder="Confirmer le mot de passe"
                    required
                    minlength="6"
                    autocomplete="new-password"
                >
                <button 
                    type="button" 
                    class="toggle-password" 
                    onclick="togglePassword('signupConfirmPassword')"
                    title="Afficher/Masquer"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>
            
            <label class="auth-checkbox">
                <input type="checkbox" id="acceptTerms" required>
                <span>J'accepte les <a href="#" onclick="showTerms(); return false;">conditions d'utilisation</a></span>
            </label>
            
            <button type="submit" class="auth-submit-btn">
                <span class="btn-text">Créer mon compte</span>
                <span class="btn-loader" style="display: none;">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                </span>
            </button>
            
            <div class="auth-divider">
                <span>OU</span>
            </div>
            
            <button type="button" class="auth-social-btn" onclick="signupWithGoogle()">
                <i class="fa-brands fa-google"></i>
                S'inscrire avec Google
            </button>
            
            <div class="auth-switch">
                Déjà un compte ? 
                <a href="#" onclick="switchToLogin(); return false;">Se connecter</a>
            </div>
        </form>
    </div>
</div>-->


    <!-- SECTION 6: DÉMO DES FONCTIONNALITÉS -->
    <section class="demo-section">
        <h2>🚀 Fonctionnalités Disponibles</h2>
        
        <div class="demo-grid">
            <!-- Gestion du contenu -->
            <div class="demo-card">
                <h3>📝 Gestion du Contenu</h3>
                <p>Modifier dynamiquement le texte de toutes les sections du site depuis la base de données.</p>
                <div class="demo-actions">
                    <button onclick="testContentUpdate()" class="btn btn-primary">Tester</button>
                </div>
            </div>

            <!-- Upload d'images -->
            <div class="demo-card">
                <h3>🖼️ Upload d'Images</h3>
                <p>Uploader des images qui apparaissent automatiquement dans la galerie.</p>
                <div class="demo-actions">
                    <input type="file" id="test-upload" accept="image/*" style="display:none;">
                    <button onclick="document.getElementById('test-upload').click()" class="btn btn-primary">Upload</button>
                </div>
            </div>

            <!-- Notifications temps réel -->
            <div class="demo-card">
                <h3>🔔 Notifications</h3>
                <p>Système de notifications en temps réel pour tous les utilisateurs connectés.</p>
                <div class="demo-actions">
                    <button onclick="testNotification()" class="btn btn-primary">Tester</button>
                </div>
            </div>

            <!-- Statistiques -->
            <div class="demo-card">
                <h3>📊 Statistiques</h3>
                <p>Suivi en temps réel des téléchargements, visites et interactions.</p>
                <div class="demo-actions">
                    <button onclick="showStats()" class="btn btn-primary">Voir Stats</button>
                </div>
            </div>

            <!-- Recherche -->
            <div class="demo-card">
                <h3>🔍 Recherche</h3>
                <p>Recherche intelligente dans tout le contenu du site avec résultats en temps réel.</p>
                <div class="demo-actions">
                    <button onclick="focusSearch()" class="btn btn-primary">Essayer</button>
                </div>
            </div>

            <!-- Versions du jeu -->
            <div class="demo-card">
                <h3>🎮 Gestion Versions</h3>
                <p>Ajouter et gérer les versions du jeu avec changelog automatique.</p>
                <div class="demo-actions">
                    <button onclick="EchoComplete.openVersionModal()" class="btn btn-primary">Nouvelle Version</button>
                </div>
            </div>
        </div>
    </section>

    
    <!-- SECTION 3: GALERIE D'IMAGES -->
    <section class="demo-section">
        <h2>🎨 Galerie</h2>
        <div id="gallery" class="media-grid">
            <p style="text-align: center; color: #9d00ff;">Chargement de la galerie...</p>
        </div>
    </section>

    <!-- SECTION 4: ACTUALITÉS -->
    <section class="demo-section">
        <h2>📰 Actualités</h2>
        <div id="news-container">
            <p style="text-align: center; color: #9d00ff;">Chargement des actualités...</p>
        </div>
    </section>