// Debug script to test team logo matching
const API_TEAM_MAPPING = {
  33: { name: 'Manchester United', league: 'premier-league', leagueId: 39 },
  40: { name: 'Liverpool', league: 'premier-league', leagueId: 39 },
  42: { name: 'Arsenal', league: 'premier-league', leagueId: 39 },
  50: { name: 'Manchester City', league: 'premier-league', leagueId: 39 },
  49: { name: 'Chelsea', league: 'premier-league', leagueId: 39 },
  541: { name: 'Real Madrid', league: 'la-liga', leagueId: 140 },
  529: { name: 'Barcelona', league: 'la-liga', leagueId: 140 },
  535: { name: 'Atletico Madrid', league: 'la-liga', leagueId: 140 },
  726: { name: 'Valencia', league: 'la-liga', leagueId: 140 },
  540: { name: 'Sevilla', league: 'la-liga', leagueId: 140 },
  489: { name: 'Juventus', league: 'serie-a', leagueId: 135 },
  492: { name: 'AC Milan', league: 'serie-a', leagueId: 135 },
  496: { name: 'Inter Milan', league: 'serie-a', leagueId: 135 },
  500: { name: 'Napoli', league: 'serie-a', leagueId: 135 },
  505: { name: 'AS Roma', league: 'serie-a', leagueId: 135 },
  157: { name: 'Bayern Munich', league: 'bundesliga', leagueId: 78 },
  165: { name: 'Borussia Dortmund', league: 'bundesliga', leagueId: 78 },
  168: { name: 'RB Leipzig', league: 'bundesliga', leagueId: 78 },
  173: { name: 'Bayer Leverkusen', league: 'bundesliga', leagueId: 78 },
  178: { name: 'Eintracht Frankfurt', league: 'bundesliga', leagueId: 78 },
  85: { name: 'PSG', league: 'ligue-1', leagueId: 61 },
  80: { name: 'Lyon', league: 'ligue-1', leagueId: 61 },
  58: { name: 'Marseille', league: 'ligue-1', leagueId: 61 },
  77: { name: 'Monaco', league: 'ligue-1', leagueId: 61 },
  91: { name: 'Lille', league: 'ligue-1', leagueId: 61 }
};

// Test the matching logic
function getTeamLogoUrl(clubName) {
  if (!clubName || !clubName.trim()) {
    return null;
  }

  const normalizedName = clubName.trim().toLowerCase();
  
  const teamEntry = Object.entries(API_TEAM_MAPPING).find(([_, team]) => {
    const mappingName = team.name.toLowerCase();
    return mappingName === normalizedName;
  });

  if (!teamEntry) {
    return null;
  }

  const teamId = teamEntry[0];
  return `https://media.api-sports.io/football/teams/${teamId}.png`;
}

// Test cases from actual database
const testTeams = [
  'Manchester City',    // Should match
  'Man City',          // Should NOT match
  'Atletico Madrid',   // Should match  
  'Atlético',          // Should NOT match
  'Real Madrid',       // Should match
  'Bournemouth',       // Should NOT match
  'Tottenham',         // Should NOT match
  'Crystal Palace',    // Should NOT match
  'Liverpool',         // Should match
  'Arsenal',           // Should match
  'Chelsea',           // Should match
  'Barcelona',         // Should match
  'Sevilla',           // Should match
  'Valencia',          // Should match
  'Juventus',          // Should match
  'AC Milan',          // Should match
  'Inter Milan',       // Should match
  'Napoli',            // Should match
  'AS Roma'            // Should match
];

console.log('Team Logo Matching Test Results:');
console.log('=====================================');

testTeams.forEach(team => {
  const url = getTeamLogoUrl(team);
  console.log(`${team.padEnd(20)}: ${url ? '✅ LOGO (ID: ' + url.match(/teams\/(\d+)\.png/)[1] + ')' : '❌ INITIALS'}`);
});
