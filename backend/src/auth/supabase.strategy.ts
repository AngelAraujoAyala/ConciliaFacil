import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// 1. Definimos una interfaz para el payload de Supabase
interface SupabaseJwtPayload {
  sub: string;
  email: string;
  [key: string]: any; // Por si vienen más datos en el JWT que quieras ignorar
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    // 2. Validación defensiva para TypeScript (y para asegurar que no rompa en runtime)
    if (!jwtSecret) {
      throw new Error(
        'SUPABASE_JWT_SECRET no está definida en las variables de entorno',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // 3. Quitamos el 'async' (ya no genera error) y tipamos correctamente el payload
  validate(payload: SupabaseJwtPayload | null) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return { id: payload.sub, email: payload.email }; // Esto se inyectará en req.user
  }
}
