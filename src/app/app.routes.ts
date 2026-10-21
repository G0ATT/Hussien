import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'funds',
    loadComponent: () => import('./pages/funds.component').then(m => m.FundsComponent)
  },
  {
    path: 'funds/:id',
    loadComponent: () => import('./pages/fund-detail.component').then(m => m.FundDetailComponent)
  },
  {
    path: 'members',
    loadComponent: () => import('./pages/members.component').then(m => m.MembersComponent)
  },
  {
    path: 'members/:id',
    loadComponent: () => import('./pages/member-profile.component').then(m => m.MemberProfileComponent)
  },
  {
    path: 'payments',
    loadComponent: () => import('./pages/payments.component').then(m => m.PaymentsComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
