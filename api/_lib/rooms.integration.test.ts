import dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { HttpError } from './http.js';
import { createRoom, deleteRoom, joinRoom, playMove } from './rooms.js';

dotenv.config({ path: '.env.local', quiet: true });

const integration = describe.runIf(process.env.RUN_REDIS_INTEGRATION === '1');

integration('API de salas com Upstash', () => {
  it('serializa entradas simultâneas e aceita somente um convidado', async () => {
    const host = await createRoom('Host Concorrente');
    const attempts = await Promise.allSettled([
      joinRoom(host.room.id, 'Convidado Um'),
      joinRoom(host.room.id, 'Convidado Dois'),
    ]);

    expect(attempts.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(attempts.filter(result => result.status === 'rejected')).toHaveLength(1);
    await deleteRoom(host.room.id, host.playerToken);
  });

  it('valida turno, calcula jogadas e restringe exclusão ao host', async () => {
    const host = await createRoom('Host Seguro');
    const guest = await joinRoom(host.room.id, 'Convidado Seguro');

    await expect(playMove(host.room.id, guest.playerToken, 0)).rejects.toMatchObject({
      status: 409,
    } satisfies Partial<HttpError>);

    const afterHostMove = await playMove(host.room.id, host.playerToken, 0);
    expect(afterHostMove.gameState.board[0]).toBe('X');
    expect(afterHostMove.gameState.currentPlayer).toBe('O');

    const afterGuestMove = await playMove(host.room.id, guest.playerToken, 4);
    expect(afterGuestMove.gameState.board[4]).toBe('O');

    await expect(deleteRoom(host.room.id, guest.playerToken)).rejects.toMatchObject({
      status: 403,
    } satisfies Partial<HttpError>);
    await deleteRoom(host.room.id, host.playerToken);
  });
});
