import jwt from 'jsonwebtoken';
import { User } from '../SocketManager';
import { WebSocket } from 'ws';
import { JWT_SECRET } from '../constants';

export interface userJwtClaims {    
  userId: string;
  name: string;
  isGuest?: boolean;
} 

export const extractAuthUser = (token: string, ws: WebSocket): User => {
  const decoded = jwt.verify(token, JWT_SECRET) as userJwtClaims;
  //@ts-ignore
  return new User(ws, decoded.userId, decoded.name); 
};   
