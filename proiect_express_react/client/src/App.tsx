import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import ViteHome from './views/ViteHome'
import VirtualDesktop from './components/Desktop'
import Desktop from './views/Desktop'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './views/Register'



function App() {
  return (
    // <Desktop />
    <Login />
  )
}

export default App
