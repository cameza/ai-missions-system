import { createClient } from '@supabase/supabase-js';

// Types for API-Football player data
export interface PlayerDetails {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: {
    date: string; // ISO date
    place: string;
    country: string;
  };
  nationality: string;
  height: string;
  weight: string;
  photo: string;
}

export interface PlayerStatistics {
  team: { id: number; name: string; };
  league: { id: number; name: string; };
  games: { position: string; }; // "Goalkeeper", "Defender", "Midfielder", "Attacker"
}

export interface PlayerResponse {
  player: PlayerDetails;
  statistics: PlayerStatistics[];
}

export interface EnrichedPlayerData {
  position: string | null;
  age: number | null;
  nationality: string;
  playerPhotoUrl: string;
}

// Rate limiting interface
export interface APIRateLimiter {
  throttledRequest<T>(fn: () => Promise<T>): Promise<T>;
}

export class PlayerEnrichmentService {
  private baseUrl = 'https://v3.football.api-sports.io';
  private apiKey: string;
  private rateLimiter: APIRateLimiter;
  
  constructor(apiKey: string, rateLimiter: APIRateLimiter) {
    this.apiKey = apiKey;
    this.rateLimiter = rateLimiter;
  }
  
  async fetchPlayerDetails(playerId: number, season: number): Promise<PlayerResponse> {
    return this.rateLimiter.throttledRequest(async () => {
      const response = await fetch(
        `${this.baseUrl}/players?id=${playerId}&season=${season}`,
        {
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        throw new Error(`No player data found for ID: ${playerId}`);
      }
      
      return data.response[0]; // { player: PlayerDetails, statistics: PlayerStatistics[] }
    });
  }
  
  normalizePosition(statistics: PlayerStatistics[]): string | null {
    // Extract most common position from statistics
    const positions = statistics
      .map(s => s.games.position)
      .filter(Boolean);
    
    if (positions.length === 0) return null;
    
    // Map to standard positions
    const positionMap: Record<string, string> = {
      'Goalkeeper': 'Goalkeeper',
      'Defender': 'Defender',
      'Midfielder': 'Midfielder',
      'Attacker': 'Attacker',
    };
    
    // Find most frequent position
    const positionCounts = positions.reduce((acc, pos) => {
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonPosition = Object.entries(positionCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
    
    return positionMap[mostCommonPosition] || null;
  }
  
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
  
  normalizeNationality(nationality: string): string {
    // Map to ISO 3166-1 alpha-3 country codes
    const nationalityMap: Record<string, string> = {
      'England': 'ENG',
      'Spain': 'ESP',
      'France': 'FRA',
      'Germany': 'GER',
      'Italy': 'ITA',
      'Brazil': 'BRA',
      'Argentina': 'ARG',
      'Portugal': 'POR',
      'Netherlands': 'NED',
      'Belgium': 'BEL',
      'Croatia': 'HRV',
      'Denmark': 'DNK',
      'Finland': 'FIN',
      'Norway': 'NOR',
      'Sweden': 'SWE',
      'Switzerland': 'CHE',
      'Austria': 'AUT',
      'Poland': 'POL',
      'Czech Republic': 'CZE',
      'Hungary': 'HUN',
      'Romania': 'ROU',
      'Serbia': 'SRB',
      'Greece': 'GRC',
      'Turkey': 'TUR',
      'Russia': 'RUS',
      'Ukraine': 'UKR',
      'Wales': 'WLS',
      'Scotland': 'SCO',
      'Northern Ireland': 'NIR',
      'Republic of Ireland': 'IRL',
      'United States': 'USA',
      'Canada': 'CAN',
      'Mexico': 'MEX',
      'Uruguay': 'URY',
      'Chile': 'CHL',
      'Colombia': 'COL',
      'Peru': 'PER',
      'Ecuador': 'ECU',
      'Venezuela': 'VEN',
      'Bolivia': 'BOL',
      'Paraguay': 'PRY',
      'Japan': 'JPN',
      'South Korea': 'KOR',
      'China': 'CHN',
      'Australia': 'AUS',
      'New Zealand': 'NZL',
      'South Africa': 'ZAF',
      'Morocco': 'MAR',
      'Egypt': 'EGY',
      'Nigeria': 'NGA',
      'Ghana': 'GHA',
      'Ivory Coast': 'CIV',
      'Senegal': 'SEN',
      'Cameroon': 'CMR',
      'Algeria': 'DZA',
      'Tunisia': 'TUN',
      'Gambia': 'GMB',
      'Guinea': 'GIN',
      'Mali': 'MLI',
      'Burkina Faso': 'BFA',
      'Niger': 'NER',
      'Benin': 'BEN',
      'Togo': 'TGO',
      'Sierra Leone': 'SLE',
      'Liberia': 'LBR',
      'Guinea-Bissau': 'GNB',
      'Cape Verde': 'CPV',
      'São Tomé and Príncipe': 'STP',
      'Equatorial Guinea': 'GNQ',
      'Gabon': 'GAB',
      'Congo': 'COG',
      'DR Congo': 'COD',
      'Central African Republic': 'CAF',
      'Chad': 'TCD',
      'Sudan': 'SDN',
      'South Sudan': 'SSD',
      'Eritrea': 'ERI',
      'Djibouti': 'DJI',
      'Somalia': 'SOM',
      'Ethiopia': 'ETH',
      'Kenya': 'KEN',
      'Uganda': 'UGA',
      'Rwanda': 'RWA',
      'Burundi': 'BDI',
      'Tanzania': 'TZA',
      'Zambia': 'ZMB',
      'Malawi': 'MWI',
      'Mozambique': 'MOZ',
      'Zimbabwe': 'ZWE',
      'Botswana': 'BWA',
      'Namibia': 'NAM',
      'Lesotho': 'LSO',
      'Eswatini': 'SWZ',
      'Madagascar': 'MDG',
      'Mauritius': 'MUS',
      'Seychelles': 'SYC',
      'Comoros': 'COM',
      'Mauritania': 'MRT',
      'Western Sahara': 'ESH',
      'Israel': 'ISR',
      'Jordan': 'JOR',
      'Lebanon': 'LBN',
      'Syria': 'SYR',
      'Iraq': 'IRQ',
      'Iran': 'IRN',
      'Afghanistan': 'AFG',
      'Pakistan': 'PAK',
      'India': 'IND',
      'Bangladesh': 'BGD',
      'Sri Lanka': 'LKA',
      'Myanmar': 'MMR',
      'Thailand': 'THA',
      'Vietnam': 'VNM',
      'Cambodia': 'KHM',
      'Laos': 'LAO',
      'Malaysia': 'MYS',
      'Singapore': 'SGP',
      'Indonesia': 'IDN',
      'Philippines': 'PHL',
      'Brunei': 'BRN',
      'East Timor': 'TLS',
      'Papua New Guinea': 'PNG',
      'Fiji': 'FJI',
      'Solomon Islands': 'SLB',
      'Vanuatu': 'VUT',
      'Samoa': 'WSM',
      'Tonga': 'TON',
      'Kiribati': 'KIR',
      'Tuvalu': 'TUV',
      'Nauru': 'NRU',
      'Palau': 'PLW',
      'Marshall Islands': 'MHL',
      'Micronesia': 'FSM',
      'Costa Rica': 'CRI',
      'Panama': 'PAN',
      'Nicaragua': 'NIC',
      'Honduras': 'HND',
      'El Salvador': 'SLV',
      'Guatemala': 'GTM',
      'Belize': 'BLZ',
      'Cuba': 'CUB',
      'Jamaica': 'JAM',
      'Haiti': 'HTI',
      'Dominican Republic': 'DOM',
      'Puerto Rico': 'PRI',
      'Trinidad and Tobago': 'TTO',
      'Barbados': 'BRB',
      'Bahamas': 'BHS',
      'Grenada': 'GRD',
      'Saint Lucia': 'LCA',
      'Saint Vincent and the Grenadines': 'VCT',
      'Dominica': 'DMA',
      'Saint Kitts and Nevis': 'KNA',
      'Antigua and Barbuda': 'ATG',
    };
    
    const mapped = nationalityMap[nationality];
    if (mapped) return mapped;
    
    // Fallback: use first 3 letters, uppercase
    const fallback = nationality.substring(0, 3).toUpperCase();
    return fallback.length === 3 ? fallback : 'UNK';
  }
  
  enrichPlayerData(playerResponse: PlayerResponse): EnrichedPlayerData {
    const { player, statistics } = playerResponse;
    
    return {
      position: this.normalizePosition(statistics),
      age: player.age || this.calculateAge(player.birth.date),
      nationality: this.normalizeNationality(player.nationality),
      playerPhotoUrl: player.photo,
    };
  }
}
