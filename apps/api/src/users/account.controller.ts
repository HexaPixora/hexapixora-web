import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  ChangeEmailDto,
  VerifyEmailDto,
} from './dto/account.dto';

// Self-service account actions. Authenticated routes act on the caller's OWN
// account; the verify route is a PUBLIC magic-link handler.
@Controller('account')
export class AccountController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@CurrentUser() user: { id: string }, @Body() body: UpdateProfileDto) {
    return this.users.updateProfile(user.id, { name: body.name });
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('change-password')
  changePassword(@CurrentUser() user: { id: string }, @Body() body: ChangePasswordDto) {
    return this.users.changePassword(user.id, body.currentPassword, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('change-email')
  changeEmail(@CurrentUser() user: { id: string }, @Body() body: ChangeEmailDto) {
    return this.users.requestEmailChange(user.id, body.newEmail);
  }

  // --- Public magic-link endpoints (user is not logged in) ---

  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('verify-email')
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.users.confirmEmailChange(body.token);
  }
}
