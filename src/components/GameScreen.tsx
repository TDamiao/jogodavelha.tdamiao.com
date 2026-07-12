
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Share2, Crown, Bot, Swords, Wifi } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GameBoard from './GameBoard';
import GameStats from './GameStats';
import { GameState, GameStats as GameStatsType, PlayerSession, Room } from '../types/game';
import { makeMove, getBestMove } from '../utils/gameLogic';
import { updateStatsOnGameStart, updateStatsOnGameEnd, getStats } from '../utils/statsManager';
import { getRoom, playRoomMove, resetRoom } from '../utils/roomManager';

interface GameScreenProps {
  initialGameState: GameState;
  playerName: string;
  onBack: () => void;
  roomId?: string;
  playerSession?: PlayerSession;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  initialGameState, 
  playerName, 
  onBack,
  roomId,
  playerSession,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [stats, setStats] = useState<GameStatsType>(getStats());
  const [isThinking, setIsThinking] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(true); // Para multiplayer
  const [roomInfo, setRoomInfo] = useState<Room | null>(null);
  const hasReportedMatchFinished = useRef(false);
  const hasRecordedStats = useRef(false);

  useEffect(() => {
    const init = async () => {
      const newStats = updateStatsOnGameStart();
      setStats(newStats);

      window.Android?.onMatchRestarted?.();

      if (roomId && gameState.gameMode === 'multiplayer') {
        const room = await getRoom(roomId);
        if (room) {
          setRoomInfo(room);
          setGameState(room.gameState);
          setIsMyTurn(room.gameState.currentPlayer === playerSession?.symbol);
        }
      }
    };

    void init();
  }, [gameState.gameMode, roomId, playerSession?.symbol]);

  // Sincronização em tempo real para multiplayer
  useEffect(() => {
    if (!roomId || gameState.gameMode !== 'multiplayer') return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const room = await getRoom(roomId);
        if (!cancelled && room.version !== roomInfo?.version) {
          setGameState(room.gameState);
          setRoomInfo(room);
          setIsMyTurn(room.gameState.currentPlayer === playerSession?.symbol);
        }
      } catch (error) {
        console.error('Erro ao sincronizar sala', error);
      } finally {
        if (!cancelled) {
          const delay = document.visibilityState === 'hidden' ? 5000 : 1500;
          timeout = setTimeout(poll, delay);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [roomId, roomInfo?.version, playerSession?.symbol, gameState.gameMode]);

  const handleMove = useCallback(async (position: number) => {
    if (gameState.board[position] !== null || gameState.winner) return;

    // Para multiplayer, verifica se é o turno do jogador
    if (gameState.gameMode === 'multiplayer' && !isMyTurn) {
      toast({
        title: "Não é sua vez!",
        description: "Aguarde a jogada do adversário.",
        variant: "destructive"
      });
      return;
    }

    if (roomId && playerSession && gameState.gameMode === 'multiplayer') {
      try {
        const room = await playRoomMove(roomId, playerSession.token, position);
        setGameState(room.gameState);
        setRoomInfo(room);
        setIsMyTurn(room.gameState.currentPlayer === playerSession.symbol);
      } catch (error) {
        toast({
          title: 'Jogada não realizada',
          description: error instanceof Error ? error.message : 'Tente novamente.',
          variant: 'destructive',
        });
      }
      return;
    }

    setGameState(makeMove(gameState, position, gameState.currentPlayer));
  }, [gameState, isMyTurn, roomId, playerSession]);

  useEffect(() => {
    // Bot faz sua jogada
    if (gameState.gameMode === 'bot' &&
        gameState.currentPlayer === 'O' &&
        gameState.gameStatus === 'playing' &&
        !gameState.winner) {

      setIsThinking(true);
      const timer = setTimeout(() => {
        const botMove = getBestMove(gameState);
        if (botMove !== -1) {
          void handleMove(botMove);
        }
        setIsThinking(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [gameState, handleMove]);

  useEffect(() => {
    if (gameState.gameStatus === 'finished' && !hasReportedMatchFinished.current) {
      hasReportedMatchFinished.current = true;
      window.Android?.onMatchFinished?.();
    } else if (gameState.gameStatus !== 'finished') {
      hasReportedMatchFinished.current = false;
    }
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (!gameState.winner || hasRecordedStats.current) return;
    hasRecordedStats.current = true;

    const playerSymbol = gameState.gameMode === 'multiplayer' ? playerSession?.symbol : 'X';
    const won = gameState.winner === playerSymbol;
    const newStats = updateStatsOnGameEnd(won);
    setStats(newStats);

    if (gameState.gameMode === 'multiplayer' && roomInfo) {
      const playerWon = won;

      if (playerWon) {
        toast({
          title: "🎉 Vitória!",
          description: "Parabéns! Você venceu o jogo!",
        });
      } else {
        toast({
          title: "😞 Derrota",
          description: "Não foi dessa vez. Tente novamente!",
        });
      }
    } else if (gameState.gameMode === 'bot') {
      if (won) {
        toast({
          title: "🎉 Vitória!",
          description: "Parabéns! Você venceu o jogo!",
        });
      } else {
        toast({
          title: "😞 Derrota",
          description: "Não foi dessa vez. Tente novamente!",
        });
      }
    }
  }, [gameState.winner, gameState.gameMode, roomInfo, playerSession?.symbol]);

  const resetGame = async () => {
    const newGameState: GameState = {
      ...initialGameState,
      board: Array(9).fill(null),
      currentPlayer: 'X' as const,
      winner: null,
      winningLine: [],
      playerPositions: { X: [], O: [] },
      gameStatus: 'playing' as const
    };

    hasReportedMatchFinished.current = false;
    hasRecordedStats.current = false;
    window.Android?.onMatchRestarted?.();
    
    // Se é multiplayer, sincroniza o reset
    if (roomId && playerSession && gameState.gameMode === 'multiplayer') {
      try {
        const room = await resetRoom(roomId, playerSession.token);
        setGameState(room.gameState);
        setRoomInfo(room);
        setIsMyTurn(room.gameState.currentPlayer === playerSession.symbol);
      } catch (error) {
        toast({
          title: 'Não foi possível reiniciar',
          description: error instanceof Error ? error.message : 'Tente novamente.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      setGameState(newGameState);
    }
    
    const newStats = updateStatsOnGameStart();
    setStats(newStats);
  };

  const shareRoom = () => {
    if (roomId) {
      const url = `${window.location.origin}?room=${roomId}`;
      void navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link copiado!",
          description: "Compartilhe este link com seu amigo para jogar juntos.",
        });
      }).catch(() => {
        toast({
          title: 'Não foi possível copiar',
          description: url,
          variant: 'destructive',
        });
      });
    }
  };

  const getCurrentPlayerName = () => {
    if (gameState.gameMode === 'bot') {
      return gameState.currentPlayer === 'X' ? playerName : 'Bot';
    }

    if (gameState.gameMode === 'multiplayer' && roomInfo) {
      const currentPlayerObj = roomInfo.players.find(
        p => p.symbol === gameState.currentPlayer
      );
      return currentPlayerObj ? currentPlayerObj.name : 'Adversário';
    }

    return gameState.currentPlayer === 'X' ? playerName : 'Adversário';
  };

  const getGameStatusMessage = () => {
    if (gameState.winner) {
      if (gameState.gameMode === 'multiplayer' && roomInfo) {
        const winnerPlayer = roomInfo.players.find(
          p => p.symbol === gameState.winner
        );
        return `${winnerPlayer?.name || 'Jogador'} Venceu!`;
      }
      return gameState.winner === 'X'
        ? `${playerName} Venceu!`
        : gameState.gameMode === 'bot'
          ? 'Bot Venceu!'
          : 'Adversário Venceu!';
    }
    
    if (gameState.gameMode === 'multiplayer') {
      return isMyTurn ? 'Sua vez!' : `Vez de ${getCurrentPlayerName()}`;
    }
    
    return `Vez de ${getCurrentPlayerName()}`;
  };

  const getPlayerName = (symbol: 'X' | 'O') => {
    if (gameState.gameMode === 'bot') return symbol === 'X' ? playerName : 'Bot';
    return roomInfo?.players.find(player => player.symbol === symbol)?.name
      ?? (symbol === playerSession?.symbol ? playerName : 'Adversário');
  };

  const winnerName = gameState.winner ? getPlayerName(gameState.winner) : null;

  return (
    <main className="arena-shell min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="arena-grid" aria-hidden="true" />
      {gameState.winner && (
        <div className="victory-burst" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-5 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="hidden items-center gap-2 text-sm font-semibold text-zinc-400 sm:flex">
            <Swords className="h-4 w-4 text-amber-400" />
            ARENA 3 EM LINHA
          </div>

          <div className="flex gap-2">
            {roomId && (
              <Button 
                variant="ghost"
                onClick={shareRoom}
                size="icon"
                className="text-zinc-300 hover:bg-white/10 hover:text-white"
                title="Compartilhar sala"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost"
              onClick={resetGame}
              size="icon"
              className="text-zinc-300 hover:bg-white/10 hover:text-white"
              title="Reiniciar partida"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <section className="match-stage">
          <div className="player-versus-grid">
            <div className={`player-banner player-x ${gameState.currentPlayer === 'X' && !gameState.winner ? 'is-active' : ''} ${gameState.winner === 'X' ? 'is-winner' : ''}`}>
              <div className="player-symbol">X</div>
              <div className="min-w-0">
                <div className="player-kicker">JOGADOR X</div>
                <div className="truncate text-lg font-bold text-white sm:text-xl">{getPlayerName('X')}</div>
              </div>
              {gameState.winner === 'X' && <Crown className="winner-crown" />}
            </div>

            <div className="versus-mark" aria-hidden="true">VS</div>

            <div className={`player-banner player-o ${gameState.currentPlayer === 'O' && !gameState.winner ? 'is-active' : ''} ${gameState.winner === 'O' ? 'is-winner' : ''}`}>
              <div className="player-symbol">O</div>
              <div className="min-w-0 text-right">
                <div className="player-kicker">{gameState.gameMode === 'bot' ? 'DESAFIANTE' : 'JOGADOR O'}</div>
                <div className="truncate text-lg font-bold text-white sm:text-xl">{getPlayerName('O')}</div>
              </div>
              {gameState.gameMode === 'bot' && <Bot className="h-5 w-5 text-amber-300" />}
              {gameState.winner === 'O' && <Crown className="winner-crown" />}
            </div>
          </div>

          <div className={`match-callout ${gameState.winner ? 'match-callout-winner' : ''}`} role="status" aria-live="polite">
            {gameState.winner ? (
              <>
                <Crown className="h-5 w-5 text-amber-300" />
                <span><strong>{winnerName}</strong> dominou a arena!</span>
              </>
            ) : (
              <>
                <span className={`turn-dot ${gameState.currentPlayer === 'X' ? 'turn-dot-x' : 'turn-dot-o'}`} />
                <span className={isThinking ? 'animate-pulse' : ''}>
                  {isThinking ? 'Bot calculando a próxima jogada...' : getGameStatusMessage()}
                </span>
                {roomId && <Wifi className="h-4 w-4 text-emerald-400" aria-label="Partida conectada" />}
              </>
            )}
          </div>

          <div className="board-zone">
            <GameBoard 
              gameState={gameState}
              onCellClick={handleMove}
              disabled={isThinking || gameState.winner !== null || (gameState.gameMode === 'multiplayer' && !isMyTurn)}
            />
          </div>

          {gameState.winner && (
            <div className="mt-5 flex justify-center">
              <Button onClick={resetGame} className="h-12 bg-amber-400 px-6 font-bold text-zinc-950 hover:bg-amber-300">
                <RotateCcw className="mr-2 h-4 w-4" />
                Jogar revanche
              </Button>
            </div>
          )}
        </section>

        <section className="mt-6">
          <GameStats
            stats={stats}
            currentGameTime={Math.floor((Date.now() - stats.currentGameStartTime) / 1000)}
          />
        </section>
      </div>
    </main>
  );
};

export default GameScreen;
