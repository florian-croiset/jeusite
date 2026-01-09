// =============================================
// SERVICE DE DÉTECTION IP ROBUSTE - v2.1
// Fichier: js/ip-detection.js
// Utilise plusieurs APIs en fallback
// =============================================

class IPDetectionService {
    constructor() {
        this.ipData = null;
        this.enrichmentPromise = null;
        this.services = [
            // Service 1: ipify (simple et rapide)
            {
                name: 'ipify',
                url: 'https://api.ipify.org?format=json',
                parse: (data) => ({ ip: data.ip })
            },
            // Service 2: ip-api.com (gratuit, détaillé)
            {
                name: 'ip-api',
                url: 'http://ip-api.com/json/',
                parse: (data) => ({
                    ip: data.query,
                    city: data.city,
                    region: data.regionName,
                    country: data.country,
                    country_emoji: this.getCountryEmoji(data.countryCode),
                    timezone: data.timezone,
                    isp: data.isp,
                    latitude: data.lat,
                    longitude: data.lon
                })
            },
            // Service 3: ipwhois (sans limite)
            {
                name: 'ipwhois',
                url: 'https://ipwho.is/',
                parse: (data) => ({
                    ip: data.ip,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    country_emoji: data.flag?.emoji || '',
                    timezone: data.timezone?.id,
                    isp: data.connection?.isp
                })
            },
            // Service 4: Cloudflare Trace (très rapide)
            {
                name: 'cloudflare',
                url: 'https://www.cloudflare.com/cdn-cgi/trace',
                parse: (text) => {
                    const lines = text.split('\n');
                    const data = {};
                    lines.forEach(line => {
                        const [key, value] = line.split('=');
                        if (key && value) data[key] = value;
                    });
                    return {
                        ip: data.ip,
                        country: data.loc
                    };
                },
                isText: true
            }
        ];
    }

    async detect() {
        // Essayer chaque service dans l'ordre
        for (const service of this.services) {
            try {
                //console.log(`🔍 Tentative avec ${service.name}...`);
                
                const response = await fetch(service.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    //console.warn(`⚠️ ${service.name} failed: ${response.status}`);
                    continue;
                }

                let data;
                if (service.isText) {
                    const text = await response.text();
                    data = service.parse(text);
                } else {
                    const json = await response.json();
                    data = service.parse(json);
                }

                if (data.ip) {
                    this.ipData = data;
                    //console.log(`✅ IP détectée avec ${service.name}:`, data.ip);
                    
                    // ✅ CORRECTION: Enrichir IMMÉDIATEMENT si nécessaire
                    if (!data.city || service.name === 'ipify' || service.name === 'cloudflare') {
                        //console.log('🔄 Enrichissement immédiat en cours...');
                        await this.enrichData();
                    } else {
                        //console.log('✅ Données déjà complètes');
                    }
                    
                    return this.ipData;
                }
            } catch (error) {
                //console.warn(`❌ ${service.name} error:`, error.message);
                continue;
            }
        }

        // Si tous échouent, utiliser une IP par défaut
        //console.warn('⚠️ Tous les services ont échoué, utilisation IP par défaut');
        this.ipData = {
            ip: 'Unknown',
            city: 'Unknown',
            country: 'Unknown',
            timezone: 'Unknown',
            isp: 'Unknown'
        };
        
        return this.ipData;
    }

    async enrichData() {
        // Si on a seulement l'IP (via ipify), essayer d'obtenir plus d'infos
        if (!this.ipData) {
            //console.warn('⚠️ Pas de données IP à enrichir');
            return;
        }

        if (this.ipData.city && this.ipData.city !== 'Unknown' && this.ipData.isp && this.ipData.isp !== 'Unknown') {
            //console.log('✅ Données déjà enrichies');
            return;
        }

        // Essayer plusieurs services pour l'enrichissement
        const enrichmentServices = [
            {
                name: 'ip-api',
                url: `http://ip-api.com/json/${this.ipData.ip}`,
                parse: (data) => ({
                    city: data.city,
                    region: data.regionName,
                    country: data.country,
                    country_emoji: this.getCountryEmoji(data.countryCode),
                    timezone: data.timezone,
                    isp: data.isp
                })
            },
            {
                name: 'ipwhois',
                url: `https://ipwho.is/${this.ipData.ip}`,
                parse: (data) => ({
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    country_emoji: data.flag?.emoji || '',
                    timezone: data.timezone?.id,
                    isp: data.connection?.isp
                })
            }
        ];

        for (const service of enrichmentServices) {
            try {
                //console.log(`🔄 Enrichissement via ${service.name}...`);
                
                const response = await fetch(service.url);
                if (response.ok) {
                    const data = await response.json();
                    const enrichedData = service.parse(data);
                    
                    // Fusionner les données enrichies
                    this.ipData = {
                        ...this.ipData,
                        ...enrichedData
                    };
                    
                    //console.log('✅ Données enrichies:', this.ipData);
                    return;
                }
            } catch (error) {
                //console.warn(`❌ Enrichissement ${service.name} échoué:`, error.message);
                continue;
            }
        }

        //console.warn('⚠️ Enrichissement échoué pour tous les services');
    }

    getCountryEmoji(countryCode) {
        if (!countryCode || countryCode.length !== 2) return '';
        
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        
        return String.fromCodePoint(...codePoints);
    }

    getIP() {
        return this.ipData?.ip || 'Unknown';
    }

    getData() {
        return this.ipData;
    }

    getLocationString() {
        if (!this.ipData) return 'Unknown';
        
        const parts = [];
        if (this.ipData.city) parts.push(this.ipData.city);
        if (this.ipData.country) parts.push(this.ipData.country);
        if (this.ipData.country_emoji) parts.push(this.ipData.country_emoji);
        
        return parts.join(', ') || 'Unknown';
    }
}

// Instance globale
window.ipDetector = new IPDetectionService();

// Export pour utilisation
window.IPDetectionService = IPDetectionService;

// ✅ AUTO-DÉMARRAGE: Détecter l'IP dès le chargement
//console.log('🚀 Démarrage auto de la détection IP...');
window.ipDetector.detect().then(() => {
    //console.log('✅ Détection IP terminée au chargement');
});