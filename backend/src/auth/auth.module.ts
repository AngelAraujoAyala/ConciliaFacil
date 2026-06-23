import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'supabase' })],
  providers: [SupabaseStrategy, SupabaseAuthGuard],
  exports: [SupabaseAuthGuard, PassportModule],
})
export class AuthModule {}
