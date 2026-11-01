import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientThrottlerGuard } from './common/guards/client-throttler.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { RevalidateInterceptor } from './common/interceptors/revalidate.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MediaModule } from './modules/media/media.module';
import { LeadsModule } from './modules/leads/leads.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PagesModule } from './modules/pages/pages.module';
import { LayoutsModule } from './modules/layouts/layouts.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { AutomationModule } from './modules/automation/automation.module';
import { RevalidateModule } from './modules/revalidate/revalidate.module';
import { ThemesModule } from './modules/themes/themes.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Global baseline rate limit: 100 requests / minute / IP.
    // Sensitive routes (e.g. login) tighten this further with @Throttle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    BlogsModule,
    CategoriesModule,
    MediaModule,
    LeadsModule,
    NewsletterModule,
    SettingsModule,
    PagesModule,
    LayoutsModule,
    SearchModule,
    NotificationsModule,
    TokensModule,
    AutomationModule,
    RevalidateModule,
    ThemesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ClientThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: RevalidateInterceptor },
  ],
})
export class AppModule {}
