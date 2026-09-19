// Gère l'état (disponible / verrouillé / mobile) des boutons de téléchargement du jeu
window.jeuDispo = false;
window.jeuUrl = '#';
window.jeuVersion = '';
window.isTestMode = false;
window.testInterval = null;
window._countdownInterval = null;
window._countdownHasDecided = false; // évite qu'une mise à jour DB écrase la décision du countdown
let currentVersionId = null;

function estSurMobile() {
  return window.innerWidth <= 768;
}

async function trackVersionDownload(versionId) {
  try {
    if (typeof window.EchoDB === 'undefined') return;
    const user = await window.EchoDB.Auth.getCurrentUser();
    await window.EchoDB.supabase
      .from('downloads')
      .insert({
        version: window.jeuVersion || 'unknown',
        user_id: user?.id || null,
        download_url: window.jeuUrl || null,
        user_agent: navigator.userAgent,
        platform: navigator.platform || 'unknown'
      });
  } catch (error) {
    console.error('Erreur tracking téléchargement:', error);
  }
}

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

const handleDownloadClick = async (e) => {
    console.log('🎮 Téléchargement déclenché');

    if (e) e.preventDefault();

    // Marque qu'il s'agit d'un téléchargement et non d'une sortie de page (lu par le tracker)
    window._isDownloading = true;

    try {
        if (typeof window.sendDiscordNotification === 'function') {
            await window.sendDiscordNotification('new_download', {
                version: window.jeuVersion || 'unknown',
                url: window.jeuUrl || '#',
                versionId: currentVersionId
            });
        }

        if (currentVersionId) {
            await trackVersionDownload(currentVersionId);
        }
    } catch (error) {
        console.error('❌ Erreur tracking téléchargement:', error);
    }

    // Lien invisible pour déclencher le téléchargement sans quitter la page
    const link = document.createElement('a');
    const safeUrl = window.jeuUrl;
    if (!safeUrl.startsWith('http') && !safeUrl.startsWith('/') && !safeUrl.startsWith('executable/')) {
        console.error('URL de téléchargement invalide');
        return;
    }
    link.href = safeUrl;
    link.download = window.jeuUrl.split('/').pop();
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        window._isDownloading = false;
    }, 2000);
};

if (bouton.tagName === 'A') {
    bouton.href = '#'; // Empêcher la navigation directe
    bouton.onclick = handleDownloadClick;
} else {
    bouton.onclick = handleDownloadClick;
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
      
      if (bouton.tagName === 'A') {
        bouton.removeAttribute('href');
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
const btnInstaller = document.querySelector('#install .btn-primary');

window.updateDownloadState = function(isAvailable, url, version, versionId = null) {
    if (window.isTestMode) {
        console.log("Mode Test actif : update DB ignorée.");
        return;
    }

    if (window._countdownHasDecided && !isAvailable && window.jeuDispo === false) {
        console.log("⏰ Décision du compte à rebours prioritaire : téléchargement bloqué");
        return;
    }

    window.jeuDispo = isAvailable;
    window.jeuUrl = url;
    window.jeuVersion = version;
    currentVersionId = versionId;

    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);
    appliquerDisponibiliteBouton(btnInstaller);
};

async function verifierDisponibiliteAdmin() {
    try {
        if (typeof window.EchoDB === 'undefined') return false;

        const { data: settings } = await window.EchoDB.supabase
            .from('download_settings')
            .select('enabled')
            .single();

        if (!settings || !settings.enabled) {
            console.log("🚫 Téléchargements globalement désactivés");
            return false;
        }

        const now = new Date().toISOString();
        const { data, error } = await window.EchoDB.supabase
            .from('game_versions')
            .select('*')
            .eq('is_published', true)
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
            version: data.version,
            id: data.id
        };
    } catch (err) {
        console.error('Erreur vérification:', err);
        return false;
    }
}

window.finishCountdown = async function(isTest = false) {
    console.log("🎉 FIN DU COMPTE À REBOURS");

    window._countdownHasDecided = true;

    if (window.testInterval) clearInterval(window.testInterval);
    if (window._countdownInterval) clearInterval(window._countdownInterval);

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
                <p style="color: #e0e0e0; font-size: 1.1rem;" id="countdown-status-message">
                    Vérification de la disponibilité...
                </p>
            </div>
       `;
    }

    // Publie automatiquement la version associée à ce countdown
    if (!isTest && typeof window.EchoDB !== 'undefined') {
        try {
            const countdown = await window.EchoDB.Countdown.getActive();

            if (countdown && countdown.version_id) {
                console.log("🚀 Publication automatique de la version:", countdown.version_id);

                await window.EchoDB.supabase
                    .from('game_versions')
                    .update({ is_published: true })
                    .eq('id', countdown.version_id);

                if (window.sendDiscordNotification) {
                    await window.sendDiscordNotification('countdown_finished', {});
                }
            }
        } catch (err) {
            console.error("❌ Erreur auto-publication:", err);
        }
    }

    if (isTest) {
        console.log('🧪 Mode test : activation immédiate');
        window.jeuDispo = true;
        window.jeuUrl = 'executable/Echo_TeamNightberry_v1.exe';
        window.jeuVersion = '*test*';
        
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

    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);
    appliquerDisponibiliteBouton(btnInstaller);

    if (window.jeuDispo) {
        creerAnimationCelebration();
    }
};

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

const sablierBtn = document.getElementById('sablierBtn');

if (sablierBtn) {
  sablierBtn.addEventListener('click', () => {
    console.log("🧪 Lancement du Mode Test");
    if (typeof window.sendDiscordNotification === 'function') {
        window.sendDiscordNotification('test_mode_activated', {
            countdown: 10
        });
    }

    window.isTestMode = true;

    if (window.testInterval) clearInterval(window.testInterval);
    if (window._countdownInterval) clearInterval(window._countdownInterval);
    
    const sectionCountdown = document.querySelector('.countdown-section');
    if (sectionCountdown) {
        sectionCountdown.innerHTML = `
            <div class="countdown-title"><i class="fa-solid fa-vial fa-beat"></i> Simulation de lancement...</div>
            <div class="countdown-timer">
                <div class="countdown-item"><span class="countdown-value" id="days">0</span><span class="countdown-label">Jours</span></div>
                <div class="countdown-item"><span class="countdown-value" id="hours">0</span><span class="countdown-label">Heures</span></div>
                <div class="countdown-item"><span class="countdown-value" id="minutes">0</span><span class="countdown-label">Minutes</span></div>
                <div class="countdown-item"><span class="countdown-value" id="seconds">10</span><span class="countdown-label">Secondes</span></div>
            </div>
        `;
    }

    window.jeuDispo = false;
    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);
    appliquerDisponibiliteBouton(btnInstaller);

    sablierBtn.style.color = 'var(--cyan)';
    sablierBtn.style.transform = 'rotate(180deg)';

    let timeLeft = 10;
    
    window.testInterval = setInterval(() => {
        timeLeft--;
        const secElement = document.getElementById('seconds');
        if(secElement) secElement.textContent = timeLeft.toString();

        if (timeLeft <= 0) {
            clearInterval(window.testInterval);
            window.finishCountdown(true);
        }
    }, 1000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation buttons.js');

    appliquerDisponibiliteBouton(btnHero);
    appliquerDisponibiliteBouton(btnTelecharger);
    appliquerDisponibiliteBouton(btnInstaller);

    setTimeout(() => {
        verifierDisponibiliteAdmin().then(state => {
            if (state && state.available) {
                console.log("✅ Admin force l'ouverture du téléchargement");
                window.updateDownloadState(true, state.url, state.version, state.id);
            } else {
                if(window.jeuDispo) {
                     window.updateDownloadState(false, '#', '', null);
                }
            }
        });
    }, 1000);
});
