
import React from 'react';
import { GameState } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCellClick, disabled = false }) => {
  const { board, winningLine, playerPositions } = gameState;

  const getCellClasses = (index: number) => {
    let classes = 'game-cell';
    
    if (board[index] !== null) {
      classes += ' occupied';
      classes += board[index] === 'X' ? ' player1' : ' player2';
    }
    
    if (winningLine.includes(index)) {
      classes += ' winning';
    }
    
    // Destaca as posições mais antigas (que serão removidas na próxima jogada)
    ['X', 'O'].forEach(player => {
      if (playerPositions[player as 'X' | 'O'].length === 3 && !disabled) {
        const oldestPosition = playerPositions[player as 'X' | 'O'][0];
        if (index === oldestPosition && board[index] === player) {
          classes += ' opacity-60 ring-2 ring-yellow-500';
        }
      }
    });
    
    return classes;
  };

  const getCellContent = (index: number) => {
    const value = board[index];
    if (!value) return '';
    
    return value === 'X' ? '✕' : '⭕';
  };

  return (
    <div className="grid grid-cols-3 gap-3 p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50">
      {board.map((_, index) => (
        <button
          key={index}
          className={getCellClasses(index)}
          onClick={() => !disabled && onCellClick(index)}
          disabled={disabled || board[index] !== null}
          aria-label={`Célula ${index + 1}`}
        >
          <span className="animate-bounce-in">
            {getCellContent(index)}
          </span>
        </button>
      ))}
    </div>
  );
};

export default GameBoard;
