
import { GameStats } from '../types/game';

const STATS_KEY = 'tic-tac-toe-stats';

export const getStats = (): GameStats => {
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalTimePlayedSeconds: 0,
    fastestWinSeconds: null,
    currentGameStartTime: Date.now()
  };
};

export const saveStats = (stats: GameStats): void => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const updateStatsOnGameStart = (): GameStats => {
  const stats = getStats();
  stats.currentGameStartTime = Date.now();
  saveStats(stats);
  return stats;
};

export const updateStatsOnGameEnd = (won: boolean): GameStats => {
  const stats = getStats();
  const gameTime = Math.floor((Date.now() - stats.currentGameStartTime) / 1000);
  
  stats.gamesPlayed += 1;
  stats.totalTimePlayedSeconds += gameTime;
  
  if (won) {
    stats.wins += 1;
    if (stats.fastestWinSeconds === null || gameTime < stats.fastestWinSeconds) {
      stats.fastestWinSeconds = gameTime;
    }
  } else {
    stats.losses += 1;
  }
  
  saveStats(stats);
  return stats;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
