import { describe, expect, it } from 'vitest';
import type { GameState } from '../types/game';
import { checkWinner, createInitialGameState, getBestMove, makeMove } from './gameLogic';

function state(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialGameState('multiplayer'), ...overrides };
}

describe('checkWinner', () => {
  it('detecta linhas horizontais e retorna suas posições', () => {
    expect(checkWinner(['X', 'X', 'X', null, null, null, null, null, null])).toEqual({
      winner: 'X',
      winningLine: [0, 1, 2],
    });
  });

  it('não declara vencedor em um tabuleiro sem linha completa', () => {
    expect(checkWinner(['X', 'O', 'X', null, 'O', null, 'O', null, 'X'])).toEqual({
      winner: null,
      winningLine: [],
    });
  });
});

describe('makeMove', () => {
  it('alterna o jogador depois de uma jogada válida', () => {
    const result = makeMove(state(), 4, 'X');
    expect(result.board[4]).toBe('X');
    expect(result.currentPlayer).toBe('O');
  });

  it('remove a peça mais antiga na quarta jogada do jogador', () => {
    const game = state({
      board: ['X', null, 'X', null, null, null, 'X', null, null],
      playerPositions: { X: [0, 2, 6], O: [] },
    });
    const result = makeMove(game, 8, 'X');
    expect(result.board[0]).toBeNull();
    expect(result.board[8]).toBe('X');
    expect(result.playerPositions.X).toEqual([2, 6, 8]);
  });

  it('não altera uma posição ocupada', () => {
    const game = state({ board: ['O', null, null, null, null, null, null, null, null] });
    expect(makeMove(game, 0, 'X')).toBe(game);
  });
});

describe('getBestMove', () => {
  it('escolhe uma vitória imediata para o bot', () => {
    const game = state({
      board: ['O', 'O', null, 'X', null, 'X', null, null, null],
      currentPlayer: 'O',
      playerPositions: { X: [3, 5], O: [0, 1] },
    });
    expect(getBestMove(game)).toBe(2);
  });
});
