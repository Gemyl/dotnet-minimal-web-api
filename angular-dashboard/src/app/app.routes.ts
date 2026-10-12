import { Routes } from '@angular/router';
import { Main } from './features/layouts/main/main';
import { authGuardGuard } from './core/guards/auth-guard-guard';

export const routes: Routes = [
    {
        path: '',
        component: Main,
        canActivate: [authGuardGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'products'
            },
            {
                path: 'products',
                loadComponent: () => import('./features/components/products/products').then((c) => c.Products)
            },
            {
                path: 'categories',
                loadComponent: () => import('./features/components/categories/categories').then((c) => c.Categories)
            },
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./core/components/auth/login/login').then((c) => c.Login)
    }
];
