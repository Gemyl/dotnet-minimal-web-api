import { Routes } from '@angular/router';
import { Main } from './layouts/main/main';
import { authGuard } from './guards/auth/auth-guard-guard';

export const routes: Routes = [
    {
        path: '',
        component: Main,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'products'
            },
            {
                path: 'products',
                loadComponent: () => import('./components/products/products').then((c) => c.Products)
            },
            {
                path: 'categories',
                loadComponent: () => import('./components/categories/categories').then((c) => c.Categories)
            },
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then((c) => c.Login)
    }
];
