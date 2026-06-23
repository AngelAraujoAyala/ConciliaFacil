import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SupabaseAuthGuard extends AuthGuard('supabase') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // 🔍 LOG CRÍTICO: Imprime los headers que van llegando al backend
    console.log('📨 Headers recibidos en /api/users/me:', request.headers);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // 🔍 LOG DE FALLO: Imprime por qué Passport rechazó el token
      console.error(
        '❌ Passport rechazó la petición. Info del error:',
        info?.message || info,
      );
      throw (
        err ||
        new UnauthorizedException('Acceso denegado: Token inválido o ausente')
      );
    }
    return user;
  }
}
