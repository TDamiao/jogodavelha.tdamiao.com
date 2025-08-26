import { Room, Player } from '../types/game';
import { createInitialGameState } from './gameLogic';

const ROOMS_KEY = 'tic-tac-toe-rooms';

export const generateRoomId = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export const createRoom = (hostName: string): Room => {
  const roomId = generateRoomId();
  const host: Player = {
    id: '1',
    name: hostName,
    symbol: 'X',
    isReady: true
  };
  
  const room: Room = {
    id: roomId,
    players: [host],
    gameState: createInitialGameState('multiplayer'),
    createdAt: Date.now()
  };
  
  console.log('🔥 CRIANDO SALA:', {
    roomId,
    hostName,
    room
  });
  
  saveRoom(room);
  
  // Verificação imediata após salvar
  const verificacao = getRoom(roomId);
  console.log('🔍 VERIFICAÇÃO IMEDIATA APÓS CRIAR:', verificacao ? '✅ ENCONTRADA' : '❌ NÃO ENCONTRADA');
  
  return room;
};

export const saveRoom = (room: Room): void => {
  try {
    console.log('💾 SALVANDO SALA:', room.id);
    
    // Pega todas as salas existentes
    const rooms = getRooms();
    console.log('📦 SALAS ANTES DE SALVAR:', Object.keys(rooms));
    
    // Adiciona a nova sala
    rooms[room.id] = room;
    console.log('📦 SALAS APÓS ADICIONAR:', Object.keys(rooms));
    
    // Salva no localStorage
    const jsonData = JSON.stringify(rooms);
    localStorage.setItem(ROOMS_KEY, jsonData);
    console.log('💾 DADOS SALVOS NO LOCALSTORAGE:', jsonData);
    
    // Verificação imediata
    const verificacao = localStorage.getItem(ROOMS_KEY);
    console.log('🔍 VERIFICAÇÃO IMEDIATA DO LOCALSTORAGE:', verificacao);
    
  } catch (error) {
    console.error('💥 ERRO AO SALVAR SALA:', error);
  }
};

export const getRooms = (): Record<string, Room> => {
  try {
    const saved = localStorage.getItem(ROOMS_KEY);
    console.log('📋 DADOS BRUTOS DO LOCALSTORAGE:', saved);
    
    if (!saved) {
      console.log('📋 NENHUM DADO NO LOCALSTORAGE, RETORNANDO OBJETO VAZIO');
      return {};
    }
    
    const parsed = JSON.parse(saved);
    console.log('📋 DADOS PARSEADOS:', parsed);
    console.log('📋 CHAVES DAS SALAS:', Object.keys(parsed));
    
    return parsed;
  } catch (error) {
    console.error('💥 ERRO AO CARREGAR SALAS:', error);
    return {};
  }
};

export const getRoom = (roomId: string): Room | null => {
  console.log('🔍 BUSCANDO SALA:', roomId);
  
  try {
    const rooms = getRooms();
    console.log('🗂️ SALAS DISPONÍVEIS:', Object.keys(rooms));
    
    // Busca exata
    if (rooms[roomId]) {
      console.log('✅ SALA ENCONTRADA (BUSCA EXATA):', rooms[roomId]);
      return rooms[roomId];
    }
    
    // Busca case-insensitive
    const roomKey = Object.keys(rooms).find(key => 
      key.toLowerCase() === roomId.toLowerCase()
    );
    
    if (roomKey && rooms[roomKey]) {
      console.log('✅ SALA ENCONTRADA (BUSCA CASE-INSENSITIVE):', rooms[roomKey]);
      return rooms[roomKey];
    }
    
    console.log('❌ SALA NÃO ENCONTRADA');
    console.log('🔍 DETALHES DA BUSCA:', {
      roomIdBuscado: roomId,
      salasDisponiveis: Object.keys(rooms),
      totalSalas: Object.keys(rooms).length
    });
    
    return null;
  } catch (error) {
    console.error('💥 ERRO AO BUSCAR SALA:', error);
    return null;
  }
};

export const verifyRoomExists = (roomId: string): boolean => {
  console.log('🔍 VERIFICANDO EXISTÊNCIA DA SALA:', roomId);
  
  // Força uma nova leitura do localStorage
  const rawData = localStorage.getItem(ROOMS_KEY);
  console.log('📋 DADOS RAW PARA VERIFICAÇÃO:', rawData);
  
  if (!rawData) {
    console.log('❌ NENHUM DADO NO LOCALSTORAGE');
    return false;
  }
  
  try {
    const rooms = JSON.parse(rawData);
    console.log('📋 SALAS PARSEADAS PARA VERIFICAÇÃO:', Object.keys(rooms));
    
    const exists = rooms[roomId] !== undefined;
    console.log('📊 RESULTADO DA VERIFICAÇÃO:', exists ? '✅ EXISTE' : '❌ NÃO EXISTE');
    
    return exists;
  } catch (error) {
    console.error('💥 ERRO NA VERIFICAÇÃO:', error);
    return false;
  }
};

export const joinRoom = (roomId: string, playerName: string): Room | null => {
  console.log('Tentando entrar na sala:', roomId, 'com nome:', playerName);
  
  const room = getRoom(roomId);
  console.log('Sala encontrada:', room);
  
  if (!room) {
    console.log('Sala não encontrada para ID:', roomId);
    return null;
  }
  
  if (room.players.length >= 2) {
    console.log('Sala já está cheia. Jogadores atuais:', room.players.length);
    return null;
  }
  
  // Verifica se o jogador já não está na sala
  const existingPlayer = room.players.find(p => p.name === playerName);
  if (existingPlayer) {
    console.log('Jogador já está na sala');
    return room;
  }
  
  const guest: Player = {
    id: '2',
    name: playerName,
    symbol: 'O',
    isReady: true
  };
  
  room.players.push(guest);
  room.gameState.gameStatus = 'playing';
  
  saveRoom(room);
  console.log('Jogador adicionado à sala. Total de jogadores:', room.players.length);
  
  // Notifica que o jogo pode começar
  localStorage.setItem(`room-${roomId}-ready`, 'true');
  
  return room;
};

export const updateRoomGameState = (roomId: string, gameState: any): void => {
  const room = getRoom(roomId);
  if (room) {
    room.gameState = gameState;
    saveRoom(room);
    
    // Atualiza o timestamp da última jogada para sincronização
    localStorage.setItem(`room-${roomId}-lastMove`, Date.now().toString());
  }
};

export const getLastMoveTimestamp = (roomId: string): number => {
  const timestamp = localStorage.getItem(`room-${roomId}-lastMove`);
  return timestamp ? parseInt(timestamp) : 0;
};

export const checkRoomReady = (roomId: string): boolean => {
  const ready = localStorage.getItem(`room-${roomId}-ready`);
  return ready === 'true';
};

export const cleanupOldRooms = (): void => {
  const rooms = getRooms();
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 horas
  
  const activeRooms: Record<string, Room> = {};
  let removedCount = 0;
  
  Object.values(rooms).forEach(room => {
    if (now - room.createdAt < twentyFourHours) {
      activeRooms[room.id] = room;
    } else {
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(activeRooms));
    console.log(`🧹 Limpeza: ${removedCount} salas removidas`);
  }
};
