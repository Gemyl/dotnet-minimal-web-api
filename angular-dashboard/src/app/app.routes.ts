import { Routes } from '@angular/router';
import { Main } from './features/layouts/main/main';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: Main,
        canActivate: [AuthGuard],
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
    },
    {
        path: 'signup',
        loadComponent: () => import('./core/components/auth/signup/signup').then((c) => c.Signup)
    }
];
