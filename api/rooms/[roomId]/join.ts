import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, getRoomId, handleApiError } from '../../_lib/http';
import { joinRoom } from '../../_lib/rooms';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    const result = await joinRoom(getRoomId(req), req.body?.playerName);
    res.status(200).json(result);
  } catch (error) {
    handleApiError(error, res);
  }
}
