import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ThemesController],
  providers: [ThemesService],
})
export class ThemesModule {}
