import React, { useState, useEffect } from 'react';
import StartScreen from '../components/StartScreen';
import GameScreen from '../components/GameScreen';
import WaitingRoom from '../components/WaitingRoom';
import { GameState } from '../types/game';
import { createInitialGameState } from '../utils/gameLogic';
import { createRoom, cleanupOldRooms, deleteRoom } from '../utils/roomManager';

type AppState = 'start' | 'waiting' | 'game' | 'joining';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Limpa salas antigas ao carregar
    void cleanupOldRooms();

    // Verifica se há um parâmetro de sala na URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');

    if (roomParam) {
      setRoomId(roomParam);
      setIsGuest(true);
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
        const room = await createRoom(name);
        setRoomId(room.id);
        setIsGuest(false);
        setAppState('waiting');
      } catch (err) {
        console.error('Erro ao criar sala', err);
        alert('Não foi possível criar a sala. Verifique as credenciais do Upstash.');
      }
    }
  };

  const handleJoinGame = (name: string) => {
    setPlayerName(name);
    // Simula entrada na sala como convidado
    const initialState = createInitialGameState('multiplayer');
    setGameState(initialState);
    setAppState('game');
  };

  const handleBackToStart = async () => {
    if (roomId) {
      await deleteRoom(roomId);
    }
    setAppState('start');
    setPlayerName('');
    setGameState(null);
    setRoomId(null);
    setIsGuest(false);

    // Remove parâmetro da URL se existir
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  };

  const handleGameStart = () => {
    const initialState = createInitialGameState('multiplayer');
    setGameState(initialState);
    setAppState('game');
  };

  if (appState === 'start') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  if (appState === 'joining' && roomId) {
    return (
      <WaitingRoom
        roomId={roomId}
        hostName=""
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
        hostName={playerName}
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
      />
    );
  }

  return <StartScreen onStartGame={handleStartGame} />;
};

export default Index;
