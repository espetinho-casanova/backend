import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { env } from "../config/env";

interface Payload {
  sub: string;
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).end();
  }

  const [, token] = authToken.split(" ");

  try {
    const { sub } = verify(token, env.JWT_SECRET) as Payload;
    req.userId = sub;
    return next();
  } catch (err) {
    return res.status(401).end();
  }
}
