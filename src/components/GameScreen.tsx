
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Share2, Crown, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GameBoard from './GameBoard';
import GameStats from './GameStats';
import { GameState, GameStats as GameStatsType, Room } from '../types/game';
import { makeMove, getBestMove } from '../utils/gameLogic';
import { updateStatsOnGameStart, updateStatsOnGameEnd, getStats } from '../utils/statsManager';
import { updateRoomGameState, getRoom, getLastMoveTimestamp } from '../utils/roomManager';

interface GameScreenProps {
  initialGameState: GameState;
  playerName: string;
  onBack: () => void;
  roomId?: string;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  initialGameState, 
  playerName, 
  onBack,
  roomId 
}) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [stats, setStats] = useState<GameStatsType>(getStats());
  const [isThinking, setIsThinking] = useState(false);
  const [lastMoveTimestamp, setLastMoveTimestamp] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(true); // Para multiplayer
  const [roomInfo, setRoomInfo] = useState<Room | null>(null);
  const hasReportedMatchFinished = useRef(false);

  useEffect(() => {
    const init = async () => {
      const newStats = updateStatsOnGameStart();
      setStats(newStats);

      window.Android?.onMatchRestarted?.();

      if (roomId && gameState.gameMode === 'multiplayer') {
        const room = await getRoom(roomId);
        if (room) {
          setRoomInfo(room);
          const isHost = room.players[0].name === playerName;
          const playerSymbol = isHost ? 'X' : 'O';
          setIsMyTurn(room.gameState.currentPlayer === playerSymbol);
        }
      }
    };

    void init();
  }, [gameState.gameMode, playerName, roomId]);

  // Sincronização em tempo real para multiplayer
  useEffect(() => {
    if (!roomId || gameState.gameMode !== 'multiplayer') return;

    const interval = setInterval(async () => {
      const currentTimestamp = await getLastMoveTimestamp(roomId);
      if (currentTimestamp > lastMoveTimestamp) {
        const room = await getRoom(roomId);
        if (room && room.gameState) {
          setGameState(room.gameState);
          setLastMoveTimestamp(currentTimestamp);
          setRoomInfo(room);

          const isHost = room.players[0].name === playerName;
          const playerSymbol = isHost ? 'X' : 'O';
          setIsMyTurn(room.gameState.currentPlayer === playerSymbol);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, lastMoveTimestamp, playerName, gameState.gameMode]);

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

    const newGameState = makeMove(gameState, position, gameState.currentPlayer);
    setGameState(newGameState);

    // Se é multiplayer, sincroniza com a sala
    if (roomId && gameState.gameMode === 'multiplayer') {
      await updateRoomGameState(roomId, newGameState);
      setLastMoveTimestamp(Date.now());

      const room = await getRoom(roomId);
      if (room) {
        setRoomInfo(room);
        const isHost = room.players[0].name === playerName;
        const playerSymbol = isHost ? 'X' : 'O';
        setIsMyTurn(newGameState.currentPlayer === playerSymbol);
      }
    }
  }, [gameState, isMyTurn, roomId, playerName]);

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
    if (!gameState.winner) return;

    const won = gameState.winner === 'X';
    const newStats = updateStatsOnGameEnd(won);
    setStats(newStats);

    if (gameState.gameMode === 'multiplayer' && roomInfo) {
      const isHost = roomInfo.players[0].name === playerName;
      const playerSymbol = isHost ? 'X' : 'O';
      const playerWon = gameState.winner === playerSymbol;

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
  }, [gameState.winner, gameState.gameMode, roomInfo, playerName]);

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

    setGameState(newGameState);
    hasReportedMatchFinished.current = false;
    window.Android?.onMatchRestarted?.();
    
    // Se é multiplayer, sincroniza o reset
    if (roomId && gameState.gameMode === 'multiplayer') {
      await updateRoomGameState(roomId, newGameState);
      setLastMoveTimestamp(Date.now());

      const room = await getRoom(roomId);
      if (room) {
        setRoomInfo(room);
        const isHost = room.players[0].name === playerName;
        const playerSymbol = isHost ? 'X' : 'O';
        setIsMyTurn(newGameState.currentPlayer === playerSymbol);
      }
    }
    
    const newStats = updateStatsOnGameStart();
    setStats(newStats);
  };

  const shareRoom = () => {
    if (roomId) {
      const url = `${window.location.origin}?room=${roomId}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "Compartilhe este link com seu amigo para jogar juntos.",
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

  const getPlayerIcon = () => {
    if (gameState.gameMode === 'bot' && gameState.currentPlayer === 'O') {
      return <Bot className="w-5 h-5" />;
    }
    return <Crown className="w-5 h-5" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            {roomId && (
              <Button 
                variant="outline" 
                onClick={shareRoom}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={resetGame}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Game Status */}
        <Card className="bg-card/90 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">
              {gameState.winner ? (
                <div className="flex items-center justify-center gap-2 text-2xl">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  {getGameStatusMessage()}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {getPlayerIcon()}
                  <span className={isThinking ? 'animate-pulse' : ''}>
                    {isThinking ? 'Bot pensando...' : getGameStatusMessage()}
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex justify-center">
            <GameBoard 
              gameState={gameState}
              onCellClick={handleMove}
              disabled={isThinking || gameState.winner !== null || (gameState.gameMode === 'multiplayer' && !isMyTurn)}
            />
          </CardContent>
        </Card>

        {/* Statistics */}
        <GameStats 
          stats={stats} 
          currentGameTime={Math.floor((Date.now() - stats.currentGameStartTime) / 1000)} 
        />
      </div>
    </div>
  );
};

export default GameScreen;
