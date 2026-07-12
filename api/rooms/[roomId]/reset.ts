import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, getBearerToken, getRoomId, handleApiError } from '../../_lib/http.js';
import { resetRoom } from '../../_lib/rooms.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    const room = await resetRoom(getRoomId(req), getBearerToken(req));
    res.status(200).json({ room });
  } catch (error) {
    handleApiError(error, res);
  }
}
