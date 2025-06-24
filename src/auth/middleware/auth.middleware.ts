import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

interface JWTUser {
  id: number;
  email: string;
}

export interface UserRequest extends Request {
  jwtUser: JWTUser;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const auth_header = req.headers.authorization;

    console.log(
      'Checking is something is comming or not',
      auth_header?.startsWith('Bearer'),
    );

    if (!auth_header) {
      throw new UnauthorizedException(
        'Invalid or missing Authorization header',
      );
    }

    const token = auth_header.split(' ')[1];
    console.log('Extracted token:', token);

    try {
      const decoded = await this.jwtService.verifyAsync<JWTUser>(token, {
        secret: 'what@123',
      });

      if (!decoded.id) {
        throw new UnauthorizedException('Authrizaton or.Invalid token payload');
      }

      console.log('Token decoded successfully:', decoded);

      (req as UserRequest).jwtUser = decoded;

      // console.log('checking the request ---->', req);
      next();
    } catch (err) {
      console.error('JWT verification error:', err);
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
