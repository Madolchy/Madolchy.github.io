import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './views/Login.tsx';
import Desktop from './views/Desktop.tsx';
import Register from './views/Register.tsx';
import { Authenticated, Unauthenticated } from './components/Authenticated.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BlobProvider } from './context/BlobProvider.tsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Authenticated>
        <Desktop />
      </Authenticated>
    ),
  },
  {
    path: '/login',
    element: (
      <Unauthenticated>
        <Login />
      </Unauthenticated>
    ),
  },
  {
    path: '/register',
    element: (
      <Unauthenticated>
        <Register />
      </Unauthenticated>
    ),
  },
  {
    path: '/desktop',
    element: (
      <Authenticated>
        <Desktop />
      </Authenticated>
    ),
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BlobProvider>
        <RouterProvider router={router} />
      </BlobProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)