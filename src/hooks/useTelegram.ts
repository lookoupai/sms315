import { useEffect, useState } from 'react'

export const useTelegram = () => {
  const [isTelegram, setIsTelegram] = useState(false)
  const [webApp, setWebApp] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegram(true)
      setWebApp(window.Telegram.WebApp)
    }
  }, [])

  return {
    isTelegram,
    webApp,
    // 便捷方法
    isReady: isTelegram && webApp !== null,
    themeParams: webApp?.themeParams || {}
  }
}
