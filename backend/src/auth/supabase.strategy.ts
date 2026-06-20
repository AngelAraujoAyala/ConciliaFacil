import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Definimos la estructura exacta que inyecta Supabase en el JWT
interface SupabaseJwtPayload {
  sub: string;
  email: string;
  [key: string]: unknown;
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('Falta la variable de entorno SUPABASE_JWT_SECRET');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: SupabaseJwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
