import { useState, useEffect } from 'react';
import StartScreen from '../components/StartScreen';
import GameScreen from '../components/GameScreen';
import WaitingRoom from '../components/WaitingRoom';
import { GameState, PlayerSession, Room } from '../types/game';
import { createInitialGameState } from '../utils/gameLogic';
import { createRoom, deleteRoom } from '../utils/roomManager';

type AppState = 'start' | 'waiting' | 'game' | 'joining';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null);

  useEffect(() => {
    // Verifica se há um parâmetro de sala na URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');

    if (roomParam) {
      setRoomId(roomParam);
      setAppState('joining');
    }
  }, []);

  const handleStartGame = async (name: string, mode: 'bot' | 'multiplayer') => {
    setPlayerName(name);

    if (mode === 'bot') {
      const initialState = createInitialGameState('bot');
      setGameState(initialState);
      setAppState('game');
    } else {
      // Modo multiplayer - criar sala
      try {
        const { room, playerToken } = await createRoom(name);
        setRoomId(room.id);
        setPlayerSession({ token: playerToken, symbol: 'X', isHost: true });
        setAppState('waiting');
      } catch (err) {
        console.error('Erro ao criar sala', err);
        alert(err instanceof Error ? err.message : 'Não foi possível criar a sala. Tente novamente.');
      }
    }
  };

  const handleJoinGame = (room: Room, name?: string, playerToken?: string) => {
    if (!name || !playerToken) return;
    setPlayerName(name);
    setPlayerSession({ token: playerToken, symbol: 'O', isHost: false });
    setGameState(room.gameState);
    setAppState('game');
  };

  const handleBackToStart = async () => {
    if (roomId && playerSession?.isHost) {
      try {
        await deleteRoom(roomId, playerSession.token);
      } catch (error) {
        console.error('Erro ao encerrar sala', error);
      }
    }
    setAppState('start');
    setPlayerName('');
    setGameState(null);
    setRoomId(null);
    setPlayerSession(null);

    // Remove parâmetro da URL se existir
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  };

  const handleGameStart = (room: Room) => {
    setGameState(room.gameState);
    setAppState('game');
  };

  if (appState === 'start') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  if (appState === 'joining' && roomId) {
    return (
      <WaitingRoom
        roomId={roomId}
        onBack={handleBackToStart}
        onGameStart={handleJoinGame}
        isGuest={true}
      />
    );
  }

  if (appState === 'waiting' && roomId) {
    return (
      <WaitingRoom
        roomId={roomId}
        onBack={handleBackToStart}
        onGameStart={handleGameStart}
        isGuest={false}
      />
    );
  }

  if (appState === 'game' && gameState) {
    return (
      <GameScreen
        initialGameState={gameState}
        playerName={playerName}
        onBack={handleBackToStart}
        roomId={roomId || undefined}
        playerSession={playerSession || undefined}
      />
    );
  }

  return <StartScreen onStartGame={handleStartGame} />;
};

export default Index;
