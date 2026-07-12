import type { VercelRequest, VercelResponse } from '@vercel/node';
import { allowMethods, handleApiError } from '../_lib/http';
import { createRoom } from '../_lib/rooms';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    const result = await createRoom(req.body?.hostName);
    res.status(201).json(result);
  } catch (error) {
    handleApiError(error, res);
  }
}
