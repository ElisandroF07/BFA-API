import { Request, Response, NextFunction } from "express";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
const  authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autorização em falta!' });
  }

  // Verifique se o token está no formato correto (por exemplo, "Bearer token")
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const token = parts[1];

  // Verifique se o token é válido, por exemplo, se não expirou

  // Se o token for válido, chame next() para continuar com a próxima middleware
  next();
}
