import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AuthService } from './core/auth/auth.service';
import { PlatformSettingsService } from './core/services/platform-settings.service';

function appInitFactory(
  authService: AuthService,
  settingsService: PlatformSettingsService,
) {
  return async () => {
    await Promise.all([
      authService.bootstrap(),
      settingsService.loadSettings(),
    ]);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideIonicAngular({ mode: 'ios', animated: true }),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      deps: [AuthService, PlatformSettingsService],
      multi: true,
    },
  ],
};
