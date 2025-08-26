
import { GameState, CellValue } from '../types/game';

// Verifica se há uma linha vencedora
export const checkWinner = (board: CellValue[]): { winner: CellValue; winningLine: number[] } => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas horizontais
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Linhas verticais
    [0, 4, 8], [2, 4, 6] // Diagonais
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: line };
    }
  }

  return { winner: null, winningLine: [] };
};

// Faz uma jogada e gerencia as 3 posições máximas
export const makeMove = (
  gameState: GameState, 
  position: number, 
  player: CellValue
): GameState => {
  if (!player || gameState.board[position] !== null) {
    return gameState;
  }

  const newBoard = [...gameState.board];
  const newPlayerPositions = { ...gameState.playerPositions };
  
  // Adiciona a nova posição
  newPlayerPositions[player] = [...newPlayerPositions[player], position];
  
  // Se o jogador já tem 3 posições, remove a primeira (mais antiga)
  if (newPlayerPositions[player].length > 3) {
    const removedPosition = newPlayerPositions[player].shift()!;
    newBoard[removedPosition] = null;
  }
  
  // Adiciona a nova jogada
  newBoard[position] = player;
  
  // Verifica se há vencedor
  const { winner, winningLine } = checkWinner(newBoard);
  
  return {
    ...gameState,
    board: newBoard,
    playerPositions: newPlayerPositions,
    winner,
    winningLine,
    currentPlayer: winner ? player : (player === 'X' ? 'O' : 'X'),
    gameStatus: winner ? 'finished' : 'playing'
  };
};

// Algoritmo Minimax para o bot
export const getBestMove = (gameState: GameState): number => {
  const availableMoves = getAvailableMoves(gameState);
  
  if (availableMoves.length === 0) return -1;
  
  let bestScore = -Infinity;
  let bestMove = availableMoves[0];
  
  for (const move of availableMoves) {
    const newState = makeMove(gameState, move, 'O');
    const score = minimax(newState, 0, false);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
};

const getAvailableMoves = (gameState: GameState): number[] => {
  return gameState.board
    .map((cell, index) => cell === null ? index : -1)
    .filter(index => index !== -1);
};

const minimax = (gameState: GameState, depth: number, isMaximizing: boolean): number => {
  const { winner } = checkWinner(gameState.board);
  
  if (winner === 'O') return 10 - depth; // Bot vence
  if (winner === 'X') return depth - 10; // Jogador vence
  
  const availableMoves = getAvailableMoves(gameState);
  if (availableMoves.length === 0) return 0; // Empate (não deveria acontecer com nossas regras)
  
  if (depth > 6) return 0; // Limita a profundidade para performance
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of availableMoves) {
      const newState = makeMove(gameState, move, 'O');
      const score = minimax(newState, depth + 1, false);
      maxScore = Math.max(score, maxScore);
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of availableMoves) {
      const newState = makeMove(gameState, move, 'X');
      const score = minimax(newState, depth + 1, true);
      minScore = Math.min(score, minScore);
    }
    return minScore;
  }
};

// Cria um estado inicial do jogo
export const createInitialGameState = (gameMode: 'bot' | 'multiplayer'): GameState => ({
  board: Array(9).fill(null),
  currentPlayer: gameMode === 'bot' ? 'O' : 'X', // Bot sempre começa primeiro
  winner: null,
  winningLine: [],
  playerPositions: { X: [], O: [] },
  gameStatus: 'playing',
  gameMode
});
