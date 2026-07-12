
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
          classes += ' is-fading';
        }
      }
    });
    
    return classes;
  };

  const getCellContent = (index: number) => {
    const value = board[index];
    if (!value) return '';
    
    return value;
  };

  return (
    <div className="game-board" aria-label="Tabuleiro do jogo">
      {board.map((_, index) => (
        <button
          key={index}
          className={getCellClasses(index)}
          onClick={() => !disabled && onCellClick(index)}
          disabled={disabled || board[index] !== null}
          aria-label={`Célula ${index + 1}`}
          data-symbol={board[index] ?? undefined}
        >
          <span key={`${index}-${board[index]}`} className="game-mark">
            {getCellContent(index)}
          </span>
        </button>
      ))}
    </div>
  );
};

export default GameBoard;
