import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, getBearerToken, getRoomId, handleApiError } from '../../_lib/http';
import { deleteRoom, getRoom } from '../../_lib/rooms';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!allowMethods(req, res, ['GET', 'DELETE'])) return;
  try {
    const roomId = getRoomId(req);
    if (req.method === 'DELETE') {
      await deleteRoom(roomId, getBearerToken(req));
      res.status(204).end();
      return;
    }

    const room = await getRoom(roomId);
    if (!room) {
      res.status(404).json({ error: 'Sala não encontrada ou expirada' });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ room });
  } catch (error) {
    handleApiError(error, res);
  }
}
