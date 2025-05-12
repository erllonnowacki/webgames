import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '',
  },
  {
    path: 'bubble-shooter',
    loadComponent: () =>
      import('./games/bubble-shooter/bubble-shooter.component').then(
        (m) => m.BubbleShooterComponent
      ),
  },
  {
    path: 'brick-breaker',
    loadComponent: () =>
      import('./games/brick-breaker/brick-breaker.component').then(
        (m) => m.BrickBreakerComponent
      ),
  },
];
