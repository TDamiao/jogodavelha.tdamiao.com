import { Room, Player, GameState } from '../types/game';
import { createInitialGameState } from './gameLogic';
import { redisSet, redisGet, redisDel } from '../lib/redis';

const ROOM_PREFIX = 'room:';
const TTL_SECONDS = 60 * 60; // 1 hour

export const generateRoomId = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export const createRoom = async (hostName: string): Promise<Room> => {
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

  await saveRoom(room);
  return room;
};

export const saveRoom = async (room: Room): Promise<void> => {
  await redisSet(`${ROOM_PREFIX}${room.id}`, JSON.stringify(room), TTL_SECONDS);
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  const data = await redisGet(`${ROOM_PREFIX}${roomId}`);
  return data ? JSON.parse(data) : null;
};

export const verifyRoomExists = async (roomId: string): Promise<boolean> => {
  const data = await redisGet(`${ROOM_PREFIX}${roomId}`);
  return data !== null;
};

export const joinRoom = async (roomId: string, playerName: string): Promise<Room | null> => {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.players.length >= 2) return null;

  const existingPlayer = room.players.find(p => p.name === playerName);
  if (existingPlayer) return room;

  const guest: Player = {
    id: '2',
    name: playerName,
    symbol: 'O',
    isReady: true
  };

  room.players.push(guest);
  room.gameState.gameStatus = 'playing';

  await saveRoom(room);
  await redisSet(`${ROOM_PREFIX}${roomId}:ready`, 'true', TTL_SECONDS);

  return room;
};

export const updateRoomGameState = async (roomId: string, gameState: GameState): Promise<void> => {
  const room = await getRoom(roomId);
  if (room) {
    room.gameState = gameState;
    await saveRoom(room);
    await redisSet(`${ROOM_PREFIX}${roomId}:lastMove`, Date.now().toString(), TTL_SECONDS);
  }
};

export const getLastMoveTimestamp = async (roomId: string): Promise<number> => {
  const ts = await redisGet(`${ROOM_PREFIX}${roomId}:lastMove`);
  return ts ? parseInt(ts) : 0;
};

export const checkRoomReady = async (roomId: string): Promise<boolean> => {
  const ready = await redisGet(`${ROOM_PREFIX}${roomId}:ready`);
  return ready === 'true';
};

export const cleanupOldRooms = async (): Promise<void> => {
  // TTL handles cleanup automatically
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await redisDel(`${ROOM_PREFIX}${roomId}`);
  await redisDel(`${ROOM_PREFIX}${roomId}:ready`);
  await redisDel(`${ROOM_PREFIX}${roomId}:lastMove`);
};
