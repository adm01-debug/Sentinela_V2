export interface GamificationProfile {
  userId: string;
  points: number;
  level: number;
  badges: Badge[];
  streak: number;
  lastActivityDate: string;
  rank: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  entries: LeaderboardEntry[];
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  points: number;
  rank: number;
  change: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  criteria: string;
  points: number;
  progress: number;
  completed: boolean;
}
