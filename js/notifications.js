// =============================================
// SYSTÈME DE NOTIFICATIONS EN TEMPS RÉEL
// Fichier : js/notifications.js
// =============================================

class NotificationSystem {
    constructor() {
        this.channel = null;
        this.notifications = [];
        this.unreadCount = 0;
        this.isAdmin = false;
        this.userId = null;
        this.init();
    }

    async init() {
        // Créer le conteneur de notifications
        this.createNotificationUI();
        
        // Vérifier si l'utilisateur est connecté
        await this.checkAuth();
        
        // Initialiser les notifications en temps réel
        this.initRealtimeChannel();
        
        // Charger les notifications existantes
        await this.loadNotifications();
        
        console.log('✅ Système de notifications initialisé');
    }

    async checkAuth() {
        try {
            const { data: { user } } = await window.EchoDB.supabase.auth.getUser();
            
            if (user) {
                this.userId = user.id;
                
                const { data: profile } = await window.EchoDB.supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                
                this.isAdmin = profile?.role === 'admin' || profile?.role === 'collaborator';
            }
        } catch (error) {
            console.error('Erreur vérification auth:', error);
        }
    }

    createNotificationUI() {
        // Conteneur principal des notifications
        const container = document.createElement('div');
        container.id = 'notification-system';
        container.innerHTML = `
            <!-- Bouton notification flottant -->
            <button id="notification-bell" class="notification-bell" title="Notifications">
                <i class="fa-solid fa-bell"></i>
                <span class="notification-badge" id="notification-badge">0</span>
            </button>

            <!-- Panel des notifications -->
            <div id="notification-panel" class="notification-panel">
                <div class="notification-header">
                    <h3><i class="fa-solid fa-bell"></i> Notifications</h3>
                    <div class="notification-actions">
                        <button id="mark-all-read" class="btn-icon" title="Tout marquer comme lu">
                            <i class="fa-solid fa-check-double"></i>
                        </button>
                        <button id="clear-all-notifications" class="btn-icon" title="Tout supprimer">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <button id="close-notification-panel" class="btn-icon" title="Fermer">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="notification-filters">
                    <button class="filter-btn active" data-filter="all">Toutes</button>
                    <button class="filter-btn" data-filter="info">Info</button>
                    <button class="filter-btn" data-filter="success">Succès</button>
                    <button class="filter-btn" data-filter="warning">Alertes</button>
                </div>
                <div id="notification-list" class="notification-list">
                    <div class="notification-empty">
                        <i class="fa-solid fa-bell-slash"></i>
                        <p>Aucune notification</p>
                    </div>
                </div>
            </div>

            <!-- Conteneur pour les toasts -->
            <div id="toast-container" class="toast-container"></div>
        `;
        
        document.body.appendChild(container);
        
        // Ajouter les styles
        this.injectStyles();
        
        // Ajouter les événements
        this.attachEvents();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Bouton notification flottant */
            .notification-bell {
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--cyan), var(--purple));
                border: 2px solid var(--cyan);
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
                transition: all 0.3s ease;
                z-index: 999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .notification-bell:hover {
                transform: scale(1.1) rotate(15deg);
                box-shadow: 0 12px 35px rgba(0, 255, 255, 0.6);
            }

            .notification-bell.has-unread {
                animation: bellRing 2s infinite;
            }

            @keyframes bellRing {
                0%, 100% { transform: rotate(0deg); }
                10%, 30% { transform: rotate(-10deg); }
                20%, 40% { transform: rotate(10deg); }
            }

            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: var(--danger, #ff0055);
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                border: 2px solid var(--dark, #0a0a0f);
                box-shadow: 0 0 10px rgba(255, 0, 85, 0.8);
                animation: pulse 2s infinite;
            }

            .notification-badge.hidden {
                display: none;
            }

            /* Panel des notifications */
            .notification-panel {
                position: fixed;
                top: 0;
                right: -450px;
                width: 450px;
                max-width: 90vw;
                height: 100vh;
                background: var(--dark-card, #16213e);
                border-left: 2px solid var(--cyan);
                box-shadow: -5px 0 30px rgba(0, 0, 0, 0.7);
                transition: right 0.3s ease;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .notification-panel.open {
                right: 0;
            }

            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 2px solid var(--purple);
            }

            .notification-header h3 {
                color: var(--cyan);
                margin: 0;
                font-size: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notification-actions {
                display: flex;
                gap: 10px;
            }

            .btn-icon {
                background: transparent;
                border: 1px solid var(--purple);
                color: var(--text);
                width: 35px;
                height: 35px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .btn-icon:hover {
                background: var(--purple);
                transform: scale(1.1);
            }

            .notification-filters {
                display: flex;
                gap: 10px;
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid var(--purple);
                overflow-x: auto;
            }

            .filter-btn {
                padding: 8px 16px;
                background: rgba(157, 0, 255, 0.2);
                border: 1px solid var(--purple);
                border-radius: 20px;
                color: var(--text);
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.3s;
                white-space: nowrap;
            }

            .filter-btn:hover {
                background: rgba(157, 0, 255, 0.4);
            }

            .filter-btn.active {
                background: var(--cyan);
                border-color: var(--cyan);
                color: var(--dark);
            }

            .notification-list {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }

            .notification-list::-webkit-scrollbar {
                width: 8px;
            }

            .notification-list::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
            }

            .notification-list::-webkit-scrollbar-thumb {
                background: var(--purple);
                border-radius: 4px;
            }

            .notification-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: var(--text-dim);
                gap: 15px;
            }

            .notification-empty i {
                font-size: 48px;
                opacity: 0.3;
            }

            /* Item de notification */
            .notification-item {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid var(--purple);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s;
                animation: slideInRight 0.3s ease;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .notification-item:hover {
                transform: translateX(-5px);
                border-color: var(--cyan);
                box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
            }

            .notification-item.unread {
                border-left: 4px solid var(--cyan);
                background: rgba(0, 255, 255, 0.05);
            }

            .notification-item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }

            .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .notification-icon.info {
                background: rgba(0, 255, 255, 0.2);
                color: var(--cyan);
            }

            .notification-icon.success {
                background: rgba(0, 255, 136, 0.2);
                color: var(--success);
            }

            .notification-icon.warning {
                background: rgba(255, 170, 0, 0.2);
                color: var(--warning);
            }

            .notification-icon.danger {
                background: rgba(255, 0, 85, 0.2);
                color: var(--danger);
            }

            .notification-content {
                flex: 1;
                margin-left: 12px;
            }

            .notification-title {
                color: var(--cyan);
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
            }

            .notification-message {
                color: var(--text);
                font-size: 13px;
                line-height: 1.5;
            }

            .notification-time {
                color: var(--text-dim);
                font-size: 11px;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .notification-delete {
                background: transparent;
                border: none;
                color: var(--text-dim);
                cursor: pointer;
                padding: 5px;
                transition: all 0.3s;
            }

            .notification-delete:hover {
                color: var(--danger);
                transform: scale(1.2);
            }

            /* Toasts (notifications temporaires) */
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            }

            .toast-notification {
                background: var(--dark-card);
                border: 2px solid var(--cyan);
                border-radius: 12px;
                padding: 15px 20px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                gap: 15px;
                min-width: 300px;
                animation: slideInDown 0.3s ease;
                cursor: pointer;
            }

            @keyframes slideInDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .toast-notification.info { border-color: var(--cyan); }
            .toast-notification.success { border-color: var(--success); }
            .toast-notification.warning { border-color: var(--warning); }
            .toast-notification.danger { border-color: var(--danger); }

            .toast-icon {
                font-size: 24px;
                flex-shrink: 0;
            }

            .toast-notification.info .toast-icon { color: var(--cyan); }
            .toast-notification.success .toast-icon { color: var(--success); }
            .toast-notification.warning .toast-icon { color: var(--warning); }
            .toast-notification.danger .toast-icon { color: var(--danger); }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: bold;
                margin-bottom: 3px;
                font-size: 14px;
            }

            .toast-message {
                font-size: 13px;
                opacity: 0.9;
            }

            .toast-close {
                background: transparent;
                border: none;
                color: var(--text-dim);
                cursor: pointer;
                font-size: 18px;
                padding: 5px;
                transition: all 0.3s;
            }

            .toast-close:hover {
                color: var(--text);
                transform: rotate(90deg);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .notification-panel {
                    width: 100vw;
                    right: -100vw;
                }

                .toast-container {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .toast-notification {
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    attachEvents() {
        // Ouvrir/Fermer le panel
        document.getElementById('notification-bell').addEventListener('click', () => {
            this.togglePanel();
        });

        document.getElementById('close-notification-panel').addEventListener('click', () => {
            this.closePanel();
        });

        // Marquer tout comme lu
        document.getElementById('mark-all-read').addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Supprimer toutes les notifications
        document.getElementById('clear-all-notifications').addEventListener('click', () => {
            this.clearAllNotifications();
        });

        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterNotifications(e.target.dataset.filter);
            });
        });

        // Fermer en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notification-panel');
            const bell = document.getElementById('notification-bell');
            
            if (panel.classList.contains('open') && 
                !panel.contains(e.target) && 
                !bell.contains(e.target)) {
                this.closePanel();
            }
        });
    }

    initRealtimeChannel() {
        // S'abonner aux notifications en temps réel
        this.channel = window.EchoDB.supabase
            .channel('public:notifications')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'notifications',
                    //filter: this.userId ? `recipient_id=eq.${this.userId}` : undefined
                }, 
                (payload) => {
                    console.log('🔔 Nouvelle notification reçue:', payload.new);
                    this.handleNewNotification(payload.new);
                }
            )
            .subscribe((status) => {
                console.log('📡 Canal notifications:', status);
            });
    }

    async loadNotifications() {
        try {
            let query = window.EchoDB.supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            // Si utilisateur connecté, charger ses notifications
            /*if (this.userId) {
                query = query.or(`recipient_id.eq.${this.userId},is_global.eq.true`);
            } else {*/
                // Sinon, seulement les notifications globales
                //query = query.eq('is_global', true);
            //}

            const { data, error } = await query;

            if (error) throw error;

            this.notifications = data || [];
            this.updateUI();
            this.updateBadge();
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        }
    }

    handleNewNotification(notification) {
        // Ajouter au début de la liste
        this.notifications.unshift(notification);
        
        // Afficher un toast
        this.showToast(notification);
        
        // Mettre à jour l'UI
        this.updateUI();
        this.updateBadge();
        
        // Jouer un son (optionnel)
        this.playNotificationSound();
    }

    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${notification.type || 'info'}`;
        
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            danger: 'fa-exclamation-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${icons[notification.type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        document.getElementById('toast-container').appendChild(toast);

        // Fermer au clic
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideInDown 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        });

        toast.addEventListener('click', () => {
            this.openPanel();
        });

        // Auto-fermer après 5 secondes
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideInDown 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    updateUI() {
        const listContainer = document.getElementById('notification-list');
        
        if (this.notifications.length === 0) {
            listContainer.innerHTML = `
                <div class="notification-empty">
                    <i class="fa-solid fa-bell-slash"></i>
                    <p>Aucune notification</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.notifications.map(notif => this.createNotificationItem(notif)).join('');

        // Ajouter les événements
        document.querySelectorAll('.notification-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.markAsRead(this.notifications[index].id);
            });

            item.querySelector('.notification-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNotification(this.notifications[index].id);
            });
        });
    }

    createNotificationItem(notif) {
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            danger: 'fa-exclamation-circle'
        };

        const timeAgo = this.getTimeAgo(new Date(notif.created_at));

        return `
            <div class="notification-item ${notif.is_read ? '' : 'unread'}" data-id="${notif.id}">
                <div class="notification-item-header">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div class="notification-icon ${notif.type || 'info'}">
                            <i class="fa-solid ${icons[notif.type] || icons.info}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${notif.title}</div>
                            <div class="notification-message">${notif.message}</div>
                            <div class="notification-time">
                                <i class="fa-solid fa-clock"></i>
                                ${timeAgo}
                            </div>
                        </div>
                    </div>
                    <button class="notification-delete" title="Supprimer">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
        
        return date.toLocaleDateString('fr-FR');
    }

    updateBadge() {
        const unread = this.notifications.filter(n => !n.is_read).length;
        this.unreadCount = unread;
        
        const badge = document.getElementById('notification-badge');
        const bell = document.getElementById('notification-bell');
        
        if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.classList.remove('hidden');
            bell.classList.add('has-unread');
        } else {
            badge.classList.add('hidden');
            bell.classList.remove('has-unread');
        }
    }

    async markAsRead(id) {
        try {
            const { error } = await window.EchoDB.supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            // Mettre à jour localement
            const notif = this.notifications.find(n => n.id === id);
            if (notif) notif.is_read = true;

            this.updateUI();
            this.updateBadge();
        } catch (error) {
            console.error('Erreur marquage lu:', error);
        }
    }

    async markAllAsRead() {
        try {
            const unreadIds = this.notifications
                .filter(n => !n.is_read)
                .map(n => n.id);

            if (unreadIds.length === 0) return;

            const { error } = await window.EchoDB.supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .in('id', unreadIds);

            if (error) throw error;

            this.notifications.forEach(n => n.is_read = true);
            this.updateUI();
            this.updateBadge();
        } catch (error) {
            console.error('Erreur marquage tout lu:', error);
        }
    }

    async deleteNotification(id) {
        try {
            const { error } = await window.EchoDB.supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.notifications = this.notifications.filter(n => n.id !== id);
            this.updateUI();
            this.updateBadge();
        } catch (error) {
            console.error('Erreur suppression notification:', error);
        }
    }

    async clearAllNotifications() {
        if (!confirm('Supprimer toutes les notifications ?')) return;

        try {
            const ids = this.notifications.map(n => n.id);

            const { error } = await window.EchoDB.supabase
                .from('notifications')
                .delete()
                .in('id', ids);

            if (error) throw error;

            this.notifications = [];
            this.updateUI();
            this.updateBadge();
        } catch (error) {
            console.error('Erreur suppression toutes notifications:', error);
        }
    }

    filterNotifications(filter) {
        const items = document.querySelectorAll('.notification-item');
        
        items.forEach(item => {
            const type = item.querySelector('.notification-icon').className.split(' ').pop();
            
            if (filter === 'all' || type === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    togglePanel() {
        const panel = document.getElementById('notification-panel');
        panel.classList.toggle('open');
    }

    openPanel() {
        const panel = document.getElementById('notification-panel');
        panel.classList.add('open');
    }

    closePanel() {
        const panel = document.getElementById('notification-panel');
        panel.classList.remove('open');
    }

    /*playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjaJ0fPTgjMGHW7A7uihUhELTKXh8bllHAY2jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGO57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBSh+zPLaizsIGGS57OmmVBQLTKXh8bllHAY1jdXzzn0vBQ==');
            audio.volume = 0.3;
            audio.play().catch(() => {});*/
}