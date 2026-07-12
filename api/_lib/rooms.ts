import { randomBytes, randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { Player, Room } from '../../src/types/game.js';
import { createInitialGameState, makeMove } from '../../src/utils/gameLogic.js';
import { HttpError } from './http.js';

const ROOM_PREFIX = 'room:';
const ROOM_TTL_SECONDS = 60 * 60;
const LOCK_TTL_MS = 5_000;
const LOCK_RETRIES = 20;

interface StoredRoom extends Room {
  sessions: Record<string, 'X' | 'O'>;
  hostToken: string;
}

let redis: Redis | undefined;

function getRedis(): Redis {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Credenciais do Upstash não configuradas no servidor');
  redis = new Redis({ url, token });
  return redis;
}

function roomKey(roomId: string): string {
  return `${ROOM_PREFIX}${roomId}`;
}

function publicRoom(room: StoredRoom): Room {
  return {
    id: room.id,
    players: room.players,
    gameState: room.gameState,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    version: room.version,
  };
}

function validateName(value: unknown): string {
  if (typeof value !== 'string') throw new HttpError(400, 'Nome inválido');
  const name = value.trim();
  if (name.length < 2 || name.length > 20) {
    throw new HttpError(400, 'O nome deve ter entre 2 e 20 caracteres');
  }
  return name;
}

async function getStoredRoom(roomId: string): Promise<StoredRoom | null> {
  return getRedis().get<StoredRoom>(roomKey(roomId));
}

async function saveStoredRoom(room: StoredRoom): Promise<void> {
  room.updatedAt = Date.now();
  room.version += 1;
  await getRedis().set(roomKey(room.id), room, { ex: ROOM_TTL_SECONDS });
}

async function releaseLock(lockKey: string, lockToken: string): Promise<void> {
  await getRedis().eval(
    "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0",
    [lockKey],
    [lockToken],
  );
}

async function withRoomLock<T>(roomId: string, operation: () => Promise<T>): Promise<T> {
  const lockKey = `${roomKey(roomId)}:lock`;
  const lockToken = randomUUID();

  for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
    const acquired = await getRedis().set(lockKey, lockToken, { nx: true, px: LOCK_TTL_MS });
    if (acquired === 'OK') {
      try {
        return await operation();
      } finally {
        await releaseLock(lockKey, lockToken);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 50 + attempt * 10));
  }

  throw new HttpError(409, 'A sala está ocupada. Tente novamente');
}

function authenticate(room: StoredRoom, token: string): 'X' | 'O' {
  const symbol = room.sessions[token];
  if (!symbol) throw new HttpError(401, 'Sessão do jogador inválida');
  return symbol;
}

export async function createRoom(hostNameValue: unknown): Promise<{ room: Room; playerToken: string }> {
  const hostName = validateName(hostNameValue);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = randomBytes(5).toString('hex').toUpperCase();
    const playerToken = randomBytes(32).toString('base64url');
    const now = Date.now();
    const host: Player = { id: randomUUID(), name: hostName, symbol: 'X', isReady: true };
    const room: StoredRoom = {
      id,
      players: [host],
      gameState: createInitialGameState('multiplayer'),
      createdAt: now,
      updatedAt: now,
      version: 1,
      sessions: { [playerToken]: 'X' },
      hostToken: playerToken,
    };
    const created = await getRedis().set(roomKey(id), room, { nx: true, ex: ROOM_TTL_SECONDS });
    if (created === 'OK') return { room: publicRoom(room), playerToken };
  }

  throw new HttpError(503, 'Não foi possível gerar uma sala');
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const room = await getStoredRoom(roomId);
  return room ? publicRoom(room) : null;
}

export async function joinRoom(
  roomId: string,
  playerNameValue: unknown,
): Promise<{ room: Room; playerToken: string }> {
  const playerName = validateName(playerNameValue);
  return withRoomLock(roomId, async () => {
    const room = await getStoredRoom(roomId);
    if (!room) throw new HttpError(404, 'Sala não encontrada ou expirada');
    if (room.players.length >= 2) throw new HttpError(409, 'Esta sala já está cheia');

    const playerToken = randomBytes(32).toString('base64url');
    room.players.push({ id: randomUUID(), name: playerName, symbol: 'O', isReady: true });
    room.sessions[playerToken] = 'O';
    room.gameState.gameStatus = 'playing';
    await saveStoredRoom(room);
    return { room: publicRoom(room), playerToken };
  });
}

export async function playMove(roomId: string, token: string, positionValue: unknown): Promise<Room> {
  if (!Number.isInteger(positionValue) || Number(positionValue) < 0 || Number(positionValue) > 8) {
    throw new HttpError(400, 'Posição inválida');
  }

  return withRoomLock(roomId, async () => {
    const room = await getStoredRoom(roomId);
    if (!room) throw new HttpError(404, 'Sala não encontrada ou expirada');
    const symbol = authenticate(room, token);
    const position = Number(positionValue);

    if (room.players.length !== 2) throw new HttpError(409, 'Aguardando o segundo jogador');
    if (room.gameState.gameStatus !== 'playing' || room.gameState.winner) {
      throw new HttpError(409, 'Esta partida já terminou');
    }
    if (room.gameState.currentPlayer !== symbol) throw new HttpError(409, 'Não é sua vez');
    if (room.gameState.board[position] !== null) throw new HttpError(409, 'Essa posição já está ocupada');

    room.gameState = makeMove(room.gameState, position, symbol);
    await saveStoredRoom(room);
    return publicRoom(room);
  });
}

export async function resetRoom(roomId: string, token: string): Promise<Room> {
  return withRoomLock(roomId, async () => {
    const room = await getStoredRoom(roomId);
    if (!room) throw new HttpError(404, 'Sala não encontrada ou expirada');
    authenticate(room, token);
    room.gameState = createInitialGameState('multiplayer');
    await saveStoredRoom(room);
    return publicRoom(room);
  });
}

export async function deleteRoom(roomId: string, token: string): Promise<void> {
  await withRoomLock(roomId, async () => {
    const room = await getStoredRoom(roomId);
    if (!room) return;
    if (room.hostToken !== token) throw new HttpError(403, 'Somente o host pode encerrar a sala');
    await getRedis().del(roomKey(roomId));
  });
}
