/* =========================================================
   BUTTONS.JS - VERSION CORRIGÉE COMPLÈTE
   ========================================================= */

// 1. VARIABLES GLOBALES
window.jeuDispo = false;
window.jeuUrl = '#'; 
window.jeuVersion = '';
window.isTestMode = false; 
window.testInterval = null; 
window._countdownInterval = null;
window._countdownHasDecided = false; // ✅ Flag pour mémoriser la décision du countdown

// ---------------------------------------------------------
// 2. LOGIQUE MOBILE
// ---------------------------------------------------------
function estSurMobile() {
  return window.innerWidth <= 768;
}

// ---------------------------------------------------------
// 3. MISE À JOUR VISUELLE DES BOUTONS
// ---------------------------------------------------------
function appliquerDisponibiliteBouton(bouton) {
  if (!bouton) return;

  let infoSpan = bouton.querySelector('.info-span');
  if (!infoSpan) {
    infoSpan = document.createElement('span');
    infoSpan.className = 'info-span';
    Object.assign(infoSpan.style, {
        position: 'absolute', 
        bottom: '6px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        fontSize: '0.65rem', 
        opacity: '0.8', 
        pointerEvents: 'none', 
        fontWeight: 'normal', 
        whiteSpace: 'nowrap'
    });
    bouton.appendChild(infoSpan);
    bouton.style.position = 'relative';
  }

  if (estSurMobile()) {
    bouton.innerHTML = '<i class="fa-solid fa-download fa-bounce"></i> Télécharger';
    infoSpan.innerHTML = '<span class="icon-stack"><i class="fa-solid fa-mobile-alt"></i><i class="fa-solid fa-slash"></i></span> PC Uniquement';
    bouton.classList.add('disabled');
    bouton.style.opacity = '0.5';
    bouton.style.pointerEvents = 'none';
    if(bouton.tagName === 'A') bouton.removeAttribute('href');
  } 
  else {
    if (window.jeuDispo) {
      bouton.innerHTML = '<i class="fa-solid fa-download fa-bounce"></i> Télécharger le jeu';
      infoSpan.textContent = window.jeuVersion ? `v${window.jeuVersion}` : 'Téléchargement direct';
      
      bouton.classList.remove('disabled');
      bouton.style.opacity = '1';
      bouton.style.cursor = 'pointer';
      bouton.style.pointerEvents = 'auto';
      bouton.style.borderColor = 'var(--success, #00ff88)';
      bouton.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
      bouton.style.animation = 'pulse 2s infinite';

      if (bouton.tagName === 'A') {
          bouton.href = window.jeuUrl;
          bouton.setAttribute('download', '');
      } else {
          bouton.onclick = () => window.location.href = window.jeuUrl;
      }
    } else {
      bouton.innerHTML = '<i class="fa-solid fa-lock"></i> Télécharger le jeu';
      infoSpan.innerHTML = '<i class="fa-solid fa-ban fa-fade"></i> Temporairement désactivé';
      
      bouton.classList.add('disabled');
      bouton.style.opacity = '0.5';
      bouton.style.cursor = 'not-allowed';
      bouton.style.pointerEvents = 'none';
      bouton.style.borderColor = 'var(--danger, #ff0055)'; 
      bouton.style.boxShadow = '';
      bouton.style.animation = '';
      
      // ✅ SÉCURITÉ : Empêcher TOUS les clics
      if (bouton.tagName === 'A') {
        bouton.removeAttribute('href');
        bouton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        };
      } else {
        bouton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        };
      }
    }
  }
  
  if(!bouton.contains(infoSpan)) bouton.appendChild(infoSpan);
}

const btnHero = document.querySelector('.hero .btn-primary');
const btnTelecharger = document.querySelector('#telecharger .btn-primary');

// ---------------------------------------------------------
// 4. CONNECTION AVEC LA DATABASE
// ---------------------------------------------------------
window.updateDownloadState = function(isAvailable, url, version) {
    if (window.isTestMode) {
        console.log("Mode Test actif : update DB ignorée.");
        return; 
    }
    
    // ✅ PROTECTION : Si le compte à rebours a déjà bloqué, on ne peut pas réactiver
    if (window._countdownHasDecided && !isAvailable && window.jeuDispo === false) {
        console.log("⏰ Décision du compte à rebours prioritaire : téléchargement bloqué");
        return;
    }
    
    console.log(`Mise à jour via DB : Dispo=${isAvailable}, URL=${url}, Version=${version}`);
    window.jeuDispo = isAvailable;
    window.jeuUrl = url;
    window.jeuVersion = version;
    
    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);
};

// ---------------------------------------------------------
// 5. VÉRIFICATION DE L'ÉTAT ADMIN
// ---------------------------------------------------------
async function verifierDisponibiliteAdmin() {
    try {
        if (typeof window.EchoDB === 'undefined') return false;

        // 1️⃣ Vérifier le switch global
        const { data: settings } = await window.EchoDB.supabase
            .from('download_settings')
            .select('enabled')
            .single();

        if (!settings || !settings.enabled) {
            console.log("🚫 Téléchargements globalement désactivés");
            return false;
        }

        // 2️⃣ Récupérer la dernière version publiée
        const now = new Date().toISOString();
        const { data, error } = await window.EchoDB.supabase
            .from('game_versions')
            .select('*')
            .eq('is_published', true)  // ✅ Versions publiées
            .lte('release_date', now)  // ✅ Date passée
            .order('release_date', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            console.log("❌ Aucune version disponible");
            return false;
        }

        return {
            available: true,
            url: data.download_url,
            version: data.version
        };
    } catch (err) {
        console.error('Erreur vérification:', err);
        return false;
    }
}

// ---------------------------------------------------------
// 6. FONCTION "FIN DU COMPTE À REBOURS" (CORRIGÉE)
// ---------------------------------------------------------
window.finishCountdown = async function(isTest = false) {
    console.log("🎉 FIN DU COMPTE À REBOURS");

    window._countdownHasDecided = true;

    if (window.testInterval) clearInterval(window.testInterval);
    if (window._countdownInterval) clearInterval(window._countdownInterval);

    // 2. CIBLER LA SECTION ENTIÈRE
    const sectionCountdown = document.querySelector('.countdown-section');

    if (sectionCountdown) {
       sectionCountdown.innerHTML = `
            <div class="countdown-finished-message" style="text-align:center; animation: fadeInUp 0.8s ease; ">
                <div style="font-size: 3.5rem; margin-bottom: 15px; filter: drop-shadow(0 0 10px var(--cyan));">
                    🎉
                </div>
                <h2 style="color: var(--cyan); font-size: 2rem; margin: 0 0 10px 0; text-transform: uppercase; text-shadow: 0 0 20px var(--cyan);">
                    Lancé !
                </h2>
                <!--<div class="countdown-item"><span class="countdown-value">🎉</span><span class="countdown-label">Lancé&nbsp;!</span></div>-->
                <p style="color: #e0e0e0; font-size: 1.1rem;" id="countdown-status-message">
                    Vérification de la disponibilité...
                </p>
            </div>
       `;
    } 
    // ✅ NOUVEAU : Auto-publier la version associée au countdown
    if (!isTest && typeof window.EchoDB !== 'undefined') {
        try {
            const countdown = await window.EchoDB.Countdown.getActive();
            
            if (countdown && countdown.version_id) {
                console.log("🚀 Publication automatique de la version:", countdown.version_id);
                
                await window.EchoDB.supabase
                    .from('game_versions')
                    .update({ is_published: true })
                    .eq('id', countdown.version_id);
                
                console.log("✅ Version publiée automatiquement");
            }
        } catch (err) {
            console.error("❌ Erreur auto-publication:", err);
        }
    }

    // Reste du code inchangé...

    // 3. VÉRIFIER L'ÉTAT ADMIN AVANT D'ACTIVER
    if (isTest) {
        console.log('🧪 Mode test : activation immédiate');
        window.jeuDispo = true;
        window.jeuUrl = 'executable/Echo_Setup_Test.exe';
        window.jeuVersion = 'TEST';
        
        const statusMsg = document.getElementById('countdown-status-message');
        if (statusMsg) {
            statusMsg.innerHTML = '<i class="fa-solid fa-check-circle"></i> Le jeu est prêt à être téléchargé !';
        }
    } else {
        const adminState = await verifierDisponibiliteAdmin();
        const statusMsg = document.getElementById('countdown-status-message');
        
        if (adminState && adminState.available) {
            console.log('✅ Activation du téléchargement');
            window.jeuDispo = true;
            window.jeuUrl = adminState.url;
            window.jeuVersion = adminState.version;
            
            if (statusMsg) {
                statusMsg.innerHTML = '<i class="fa-solid fa-check-circle"></i> Le jeu est prêt à être téléchargé !';
                statusMsg.style.color = 'var(--success, #00ff88)';
            }
        } else {
            console.log('🚫 Téléchargement bloqué par admin');
            window.jeuDispo = false;
            
            if (statusMsg) {
                statusMsg.innerHTML = '<i class="fa-solid fa-lock"></i> Téléchargement temporairement désactivé par l\'équipe.';
                statusMsg.style.color = 'var(--warning, #ffaa00)';
            }
        }
    }
    
    // 4. Mettre à jour les boutons
    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);

    // 5. Animation de célébration si activé
    if (window.jeuDispo) {
        creerAnimationCelebration();
    }
};

// ---------------------------------------------------------
// 7. ANIMATION DE CÉLÉBRATION
// ---------------------------------------------------------
function creerAnimationCelebration() {
    const colors = ['#00d0c6', '#60F4D7', '#037778', '#338A90'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// Ajouter le CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ---------------------------------------------------------
// 8. GESTION DU MODE TEST (SABLIER)
// ---------------------------------------------------------
const sablierBtn = document.getElementById('sablierBtn');

if (sablierBtn) {
  sablierBtn.addEventListener('click', () => {
    console.log("🧪 Lancement du Mode Test");
    
    window.isTestMode = true;

    if (window.testInterval) clearInterval(window.testInterval);
    if (window._countdownInterval) clearInterval(window._countdownInterval);
    
    const sectionCountdown = document.querySelector('.countdown-section');
    if (sectionCountdown) {
        sectionCountdown.innerHTML = `
            <div class="countdown-title"><i class="fa-solid fa-vial fa-beat"></i> Simulation de lancement...</div>
            <div class="countdown-timer">
                <div class="countdown-item"><span class="countdown-value" id="days">00</span><span class="countdown-label">Jours</span></div>
                <div class="countdown-item"><span class="countdown-value" id="hours">00</span><span class="countdown-label">Heures</span></div>
                <div class="countdown-item"><span class="countdown-value" id="minutes">00</span><span class="countdown-label">Minutes</span></div>
                <div class="countdown-item"><span class="countdown-value" id="seconds">10</span><span class="countdown-label">Secondes</span></div>
            </div>
        `;
    }

    window.jeuDispo = false;
    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);

    sablierBtn.style.color = 'var(--cyan)';
    sablierBtn.style.transform = 'rotate(180deg)';

    let timeLeft = 10;
    
    window.testInterval = setInterval(() => {
        timeLeft--;
        const secElement = document.getElementById('seconds');
        if(secElement) secElement.textContent = timeLeft.toString().padStart(2, '0');
        
        if (timeLeft <= 0) {
            clearInterval(window.testInterval);
            window.finishCountdown(true);
        }
    }, 1000);
  });
}

// ---------------------------------------------------------
// 9. INITIALISATION AU CHARGEMENT
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation buttons.js');
    
    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);
    
    // Attendre que database.js soit chargé
    setTimeout(() => {
        // ✅ CORRECTION : On vérifie TOUJOURS l'état admin.
        // On ne vérifie plus si le countdown existe ou non.
        // La volonté de l'Admin (BDD) est prioritaire sur l'affichage du compteur.
        verifierDisponibiliteAdmin().then(state => {
            if (state && state.available) {
                console.log("✅ Admin force l'ouverture du téléchargement (Priority Override)");
                window.updateDownloadState(true, state.url, state.version);
            } else {
                // Si l'admin a désactivé, on s'assure que updateDownloadState reçoit l'info
                // Utile si le bouton était ouvert par défaut ou par cache
                if(window.jeuDispo) {
                     window.updateDownloadState(false, '#', '');
                }
            }
        });
    }, 1000);
});