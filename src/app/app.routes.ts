import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { UserRole } from './core/models';
import { LandingPage } from './features/home/landing/landing.page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'app/home', component: LandingPage },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'auth/verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.page').then(
        (m) => m.VerifyEmailPage,
      ),
  },

  // Routes app/* spécifiques AVANT la route app générique
  {
    path: 'app/book',
    loadComponent: () =>
      import('./features/booking/booking.page').then((m) => m.BookingPage),
  },
  {
    path: 'app/payment',
    loadComponent: () =>
      import('./features/payment/payment.page').then((m) => m.PaymentPage),
  },
  {
    path: 'app/trips',
    loadComponent: () =>
      import('./features/trips/trips.page').then((m) => m.TripsPage),
  },

  // Route app générique APRÈS
  {
    path: 'app',
    loadChildren: () =>
      import('./features/customer/customer.routes').then(
        (m) => m.CUSTOMER_ROUTES,
      ),
  },

  // {
  //   path: 'owner',
  //   canActivate: [authGuard, roleGuard(UserRole.OWNER)],
  //   loadChildren: () =>
  //     import('./features/owner/owner.routes').then((m) => m.OWNER_ROUTES),
  // },
  // {
  //   path: 'concierge',
  //   canActivate: [authGuard, roleGuard(UserRole.CONCIERGE)],
  //   loadChildren: () =>
  //     import('./features/concierge/concierge.routes').then(
  //       (m) => m.CONCIERGE_ROUTES,
  //     ),
  // },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(UserRole.ADMIN)],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  {
    path: 'search-modal',
    loadComponent: () =>
      import('./features/home/search-modal/search-modal.page').then(
        (m) => m.SearchModalPage,
      ),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/home/search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'properties/add',
    loadComponent: () =>
      import('./features/properties/add/add-property.page').then(
        (m) => m.AddPropertyPage,
      ),
  },
  {
    path: 'properties/:slug',
    loadComponent: () =>
      import('./features/properties/detail/property-detail.page').then(
        (m) => m.PropertyDetailPage,
      ),
  },
  {
    path: 'cars',
    loadComponent: () =>
      import('./features/cars/list/cars-list.page').then((m) => m.CarsListPage),
  },
  {
    path: 'cars/add',
    loadComponent: () =>
      import('./features/cars/add/add-car.page').then((m) => m.AddCarPage),
  },
  {
    path: 'cars/:slug',
    loadComponent: () =>
      import('./features/cars/detail/car-detail.page').then(
        (m) => m.CarDetailPage,
      ),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard(UserRole.ADMIN)],
    loadComponent: () =>
      import('./features/admin/dashboard/admin-dashboard.page').then(
        (m) => m.AdminDashboardPage,
      ),
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/home/not-found/not-found.page').then(
        (m) => m.NotFoundPage,
      ),
  },
];
