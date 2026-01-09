export interface AchievementDef {
  id: string;
  nameSv: string;
  nameEn: string;
  description: string;
  icon: string;
  category: 'progress' | 'skill' | 'streak' | 'special';
}

export const achievements: AchievementDef[] = [
  // Progress achievements
  {
    id: 'first-steps',
    nameSv: 'Första stegen',
    nameEn: 'First Steps',
    description: 'Klara din första nivå',
    icon: '👣',
    category: 'progress',
  },
  {
    id: 'judaism-expert',
    nameSv: 'Judisk expert',
    nameEn: 'Judaism Expert',
    description: 'Besegra judendombossen',
    icon: '✡️',
    category: 'progress',
  },
  {
    id: 'christianity-expert',
    nameSv: 'Kristen expert',
    nameEn: 'Christianity Expert',
    description: 'Besegra kristendombossen',
    icon: '✝️',
    category: 'progress',
  },
  {
    id: 'islam-expert',
    nameSv: 'Islamisk expert',
    nameEn: 'Islam Expert',
    description: 'Besegra islambossen',
    icon: '☪️',
    category: 'progress',
  },
  {
    id: 'master',
    nameSv: 'Lärdommästaren',
    nameEn: 'The Scholar',
    description: 'Besegra slutbossen',
    icon: '🎓',
    category: 'progress',
  },

  // Skill achievements
  {
    id: 'perfect-level',
    nameSv: 'Perfekt!',
    nameEn: 'Perfect!',
    description: 'Få 100% rätt på en nivå',
    icon: '⭐',
    category: 'skill',
  },
  {
    id: 'speed-demon',
    nameSv: 'Snabbansen',
    nameEn: 'Speed Demon',
    description: 'Svara på 10 frågor under 3 sekunder var',
    icon: '⚡',
    category: 'skill',
  },
  {
    id: 'three-stars',
    nameSv: 'Tre stjärnor',
    nameEn: 'Three Stars',
    description: 'Få tre stjärnor på en nivå',
    icon: '🌟',
    category: 'skill',
  },
  {
    id: 'combo-5',
    nameSv: 'Fem i rad!',
    nameEn: 'Five in a row!',
    description: 'Svara rätt 5 gånger i rad',
    icon: '🔥',
    category: 'skill',
  },
  {
    id: 'combo-10',
    nameSv: 'Tio i rad!',
    nameEn: 'Ten in a row!',
    description: 'Svara rätt 10 gånger i rad',
    icon: '💥',
    category: 'skill',
  },

  // Streak achievements
  {
    id: 'streak-3',
    nameSv: 'Tre dagar i rad',
    nameEn: 'Three Day Streak',
    description: 'Spela tre dagar i rad',
    icon: '📅',
    category: 'streak',
  },
  {
    id: 'streak-5',
    nameSv: 'Fem dagar i rad',
    nameEn: 'Five Day Streak',
    description: 'Spela fem dagar i rad',
    icon: '🔥',
    category: 'streak',
  },

  // Special achievements
  {
    id: 'memory-master',
    nameSv: 'Minnesmästare',
    nameEn: 'Memory Master',
    description: 'Flytta ett kort från "Ny" till "Kan!"',
    icon: '🧠',
    category: 'special',
  },
  {
    id: 'explorer',
    nameSv: 'Utforskaren',
    nameEn: 'Explorer',
    description: 'Prova alla tre religioner',
    icon: '🗺️',
    category: 'special',
  },
  {
    id: 'dedicated',
    nameSv: 'Hängiven',
    nameEn: 'Dedicated',
    description: 'Studera i totalt 30 minuter',
    icon: '📚',
    category: 'special',
  },
  {
    id: 'hundred-cards',
    nameSv: '100 kort',
    nameEn: '100 Cards',
    description: 'Svara på 100 kort totalt',
    icon: '💯',
    category: 'special',
  },
];

export function getAchievementById(id: string): AchievementDef | undefined {
  return achievements.find(a => a.id === id);
}

export function getAchievementsByCategory(category: AchievementDef['category']): AchievementDef[] {
  return achievements.filter(a => a.category === category);
}
