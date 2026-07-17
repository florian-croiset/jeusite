// Détection IP avec fallback multi-APIs et enrichissement géoloc
class IPDetectionService {
    constructor() {
        this.ipData = null;
        this.enrichmentPromise = null;
        this.services = [
            {
    name: 'ipify-v4',
    url: 'https://api4.ipify.org?format=json',
    parse: (data) => ({ ip: data.ip })
},
        ];
    }

    async detect() {
        for (const service of this.services) {
            try {
                const response = await fetch(service.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
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
                    data.ip = this.normalizeIP(data.ip);
                    this.ipData = data;

                    if (!data.city || service.name === 'ipify-v4') {
                        await this.enrichData();
                    }

                    return this.ipData;
                }
            } catch (error) {
                continue;
            }
        }

        this.ipData = {
            ip: 'Unknown',
            city: 'Unknown',
            country: 'Unknown',
            timezone: 'Unknown',
            isp: 'Unknown'
        };
        
        return this.ipData;
    }

    normalizeIP(ip) {
        if (!ip || !ip.includes(':')) return ip; // IPv4, inchangée
        try {
            const sections = ip.split(':');
            return sections.map(s => parseInt(s, 16).toString(16)).join(':');
        } catch(e) { return ip; }
    }

    async enrichData() {
        if (!this.ipData) return;

        if (this.ipData.city && this.ipData.city !== 'Unknown' && this.ipData.isp && this.ipData.isp !== 'Unknown') {
            return;
        }

        const enrichmentServices = [
            {
                name: 'ipapi',
                url: `https://ipapi.co/${this.ipData.ip}/json/`,
                parse: (data) => ({
                    city: data.city,
                    region: data.region,
                    country: data.country_name,
                    country_emoji: this.getCountryEmoji(data.country_code),
                    timezone: data.timezone,
                    isp: data.org
                })
            }
        ];

        for (const service of enrichmentServices) {
            try {
                const response = await fetch(service.url);
                if (response.ok) {
                    const data = await response.json();
                    const enrichedData = service.parse(data);

                    this.ipData = {
                        ...this.ipData,
                        ...enrichedData
                    };

                    return;
                }
            } catch (error) {
                continue;
            }
        }
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

window.ipDetector = new IPDetectionService();
window.IPDetectionService = IPDetectionService;

window.ipDetector.detect();