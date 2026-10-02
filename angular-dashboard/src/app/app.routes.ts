import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
    },
    {
        path: 'products',
        loadComponent: () => import('./components/products/products').then((c) => c.Products)
    },
    {
        path: 'categories',
        loadComponent: () => import('./components/categories/categories').then((c) => c.Categories)
    }
];
