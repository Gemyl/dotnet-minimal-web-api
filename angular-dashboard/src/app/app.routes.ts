import { Routes } from '@angular/router';
import { Main } from './features/layouts/main/main';

export const routes: Routes = [
    {
        path: '',
        component: Main,
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
