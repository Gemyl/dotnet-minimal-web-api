import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/products',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/categories',
    renderMode: RenderMode.Server
  },
  {
    path: 'auth',
    renderMode: RenderMode.Server,
  },
  {
    path: 'auth/login',
    renderMode: RenderMode.Server
  },
  {
    path: 'auth/signup',
    renderMode: RenderMode.Server
  }
];
