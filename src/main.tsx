import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './globals.css'
import './i18n'

// Telegram WebApp 支持
if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
  const tg = (window as any).Telegram.WebApp
  tg.ready()
  tg.expand()
  tg.enableClosingConfirmation()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
