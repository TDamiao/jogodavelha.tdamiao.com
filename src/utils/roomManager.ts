import type { Room } from '../types/game';

export class RoomApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface RoomSessionResponse {
  room: Room;
  playerToken: string;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Falha ao comunicar com o servidor' }));
    throw new RoomApiError(response.status, data.error ?? 'Falha ao comunicar com o servidor');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function authorization(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function createRoom(hostName: string): Promise<RoomSessionResponse> {
  return apiRequest('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({ hostName }),
  });
}

export async function getRoom(roomId: string): Promise<Room> {
  const result = await apiRequest<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomId)}`);
  return result.room;
}

export async function verifyRoomExists(roomId: string): Promise<boolean> {
  try {
    await getRoom(roomId);
    return true;
  } catch (error) {
    if (error instanceof RoomApiError && error.status === 404) return false;
    throw error;
  }
}

export async function joinRoom(roomId: string, playerName: string): Promise<RoomSessionResponse> {
  return apiRequest(`/api/rooms/${encodeURIComponent(roomId)}/join`, {
    method: 'POST',
    body: JSON.stringify({ playerName }),
  });
}

export async function playRoomMove(roomId: string, token: string, position: number): Promise<Room> {
  const result = await apiRequest<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomId)}/move`, {
    method: 'POST',
    headers: authorization(token),
    body: JSON.stringify({ position }),
  });
  return result.room;
}

export async function resetRoom(roomId: string, token: string): Promise<Room> {
  const result = await apiRequest<{ room: Room }>(`/api/rooms/${encodeURIComponent(roomId)}/reset`, {
    method: 'POST',
    headers: authorization(token),
  });
  return result.room;
}

export async function deleteRoom(roomId: string, token: string): Promise<void> {
  await apiRequest(`/api/rooms/${encodeURIComponent(roomId)}`, {
    method: 'DELETE',
    headers: authorization(token),
  });
}

export async function leaveRoom(roomId: string, token: string, keepalive = false): Promise<void> {
  await apiRequest(`/api/rooms/${encodeURIComponent(roomId)}/leave`, {
    method: 'POST',
    headers: authorization(token),
    keepalive,
  });
}
