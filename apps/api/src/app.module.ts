import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServicesModule } from './services/services.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { BlogsModule } from './blogs/blogs.module';
import { TeamModule } from './team/team.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { FaqModule } from './faq/faq.module';
import { MediaModule } from './media/media.module';
import { LeadsModule } from './leads/leads.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { SettingsModule } from './settings/settings.module';
import { PagesModule } from './pages/pages.module';
import { LayoutsModule } from './layouts/layouts.module';

@Module({
  imports: [AuthModule, UsersModule, RolesModule, PrismaModule, ServicesModule, PortfolioModule, BlogsModule, TeamModule, TestimonialsModule, FaqModule, MediaModule, LeadsModule, NewsletterModule, SettingsModule, PagesModule, LayoutsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
