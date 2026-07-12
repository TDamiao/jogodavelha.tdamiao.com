import type { VercelRequest, VercelResponse } from '@vercel/node';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function allowMethods(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  if (req.method && methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({ error: 'Método não permitido' });
  return false;
}

export function getBearerToken(req: VercelRequest): string {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Sessão do jogador não informada');
  }
  return authorization.slice(7);
}

export function getRoomId(req: VercelRequest): string {
  const value = Array.isArray(req.query.roomId) ? req.query.roomId[0] : req.query.roomId;
  if (!value || !/^[A-Z0-9]{8,12}$/i.test(value)) {
    throw new HttpError(400, 'Código de sala inválido');
  }
  return value.toUpperCase();
}

export function handleApiError(error: unknown, res: VercelResponse): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor' });
}
