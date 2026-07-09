import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(
    @GetUser('id') userId: string,
    @GetUser('email') email: string,
  ) {
    return this.usersService.getProfile(userId, email);
  }

  @Get('preferences')
  async getMyPreferences(
    @GetUser('id') userId: string,
    @GetUser('email') email: string,
  ) {
    return this.usersService.getPreferences(userId, email);
  }

  @Patch('preferences')
  async updateMyPreferences(
    @GetUser('id') userId: string,
    @GetUser('email') email: string,
    @Body() dto: UpdateUserPreferencesDto,
  ) {
    return this.usersService.updatePreferences(userId, email, dto);
  }
}
