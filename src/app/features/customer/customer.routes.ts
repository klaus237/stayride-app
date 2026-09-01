import { Routes } from '@angular/router';
import { LandingPage } from '../home/landing/landing.page';
import { authGuard } from '../../core/guards';

export const CUSTOMER_ROUTES: Routes = [
  { path: 'home', component: LandingPage },
  {
    path: 'trips',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../home/landing/landing.page').then((m) => m.LandingPage),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
