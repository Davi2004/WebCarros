import { createRoot } from 'react-dom/client'
import { router } from './App'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import AuthProvider from './contexts/AuthContext'

import { register } from 'swiper/element/bundle'

register();
import 'swiper/swiper-bundle.css';

import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Toaster
      position="top-right"
      reverseOrder={false}
    />
    <RouterProvider router={router} />
  </AuthProvider>
)