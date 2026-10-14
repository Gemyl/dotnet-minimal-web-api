import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'products',
    renderMode: RenderMode.Server
  },
  {
    path: 'categories',
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
