import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, getBearerToken, getRoomId, handleApiError } from '../../_lib/http.js';
import { leaveRoom } from '../../_lib/rooms.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    const result = await leaveRoom(getRoomId(req), getBearerToken(req));
    res.status(200).json({ result });
  } catch (error) {
    handleApiError(error, res);
  }
}
