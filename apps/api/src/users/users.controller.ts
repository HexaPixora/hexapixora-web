import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@repo/database';
import { CreateUserDto, UpdateUserDto, InviteUserDto } from './dto/user.dto';

// Team-member / user management. Restricted to ADMIN and SUPER_ADMIN.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAllSafe();
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.createMember(body);
  }

  // Invite-only onboarding: create the user (no password) + email an accept link.
  @Post('invite')
  invite(@Body() body: InviteUserDto, @CurrentUser() current: { name?: string }) {
    return this.usersService.invite(body, current?.name);
  }

  @Post(':id/resend-invite')
  resendInvite(@Param('id') id: string, @CurrentUser() current: { name?: string }) {
    return this.usersService.resendInvite(id, current?.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateMember(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() current: { id: string }) {
    if (current?.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    return this.usersService.remove(id);
  }
}
