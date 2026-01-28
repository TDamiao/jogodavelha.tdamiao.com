
export type GameMode = 'bot' | 'multiplayer';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type CellValue = 'X' | 'O' | null;

export interface GameState {
  board: CellValue[];
  currentPlayer: CellValue;
  winner: CellValue;
  winningLine: number[];
  playerPositions: {
    X: number[];
    O: number[];
  };
  gameStatus: GameStatus;
  gameMode: GameMode;
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalTimePlayedSeconds: number;
  fastestWinSeconds: number | null;
  currentGameStartTime: number;
}

export interface Player {
  id: string;
  name: string;
  symbol: 'X' | 'O';
  isReady: boolean;
}

export interface Room {
  id: string;
  players: Player[];
  gameState: GameState;
  createdAt: number;
}
