import React from 'react'
import { useTelegram } from '@/hooks/useTelegram'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Smartphone } from 'lucide-react'

const TelegramTestPage = () => {
  const { isTelegram, webApp, isReady, themeParams } = useTelegram()

  const handleClose = () => {
    if (webApp) {
      webApp.close()
    }
  }

  const handleBackButton = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(() => {
        console.log('返回按钮被点击')
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="h-12 w-12 mx-auto mb-4 text-blue-500" />
        <h1 className="text-2xl font-bold mb-2">Telegram WebApp 测试</h1>
        <p className="text-gray-600">检测当前环境是否为 Telegram 小程序</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">环境检测</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            {isTelegram ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>
              {isTelegram ? '✅ 运行在 Telegram 环境中' : '❌ 运行在普通浏览器中'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {isReady ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>
              {isReady ? '✅ Telegram WebApp 已就绪' : '❌ Telegram WebApp 未就绪'}
            </span>
          </div>
        </div>
      </Card>

      {isTelegram && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">主题参数</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>背景色: {themeParams.bg_color || '未设置'}</div>
            <div>文字色: {themeParams.text_color || '未设置'}</div>
            <div>提示色: {themeParams.hint_color || '未设置'}</div>
            <div>链接色: {themeParams.link_color || '未设置'}</div>
            <div>按钮色: {themeParams.button_color || '未设置'}</div>
            <div>按钮文字色: {themeParams.button_text_color || '未设置'}</div>
          </div>
        </Card>
      )}

      {isTelegram && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">功能测试</h2>
          <div className="space-y-3">
            <Button onClick={handleBackButton} className="w-full">
              显示返回按钮
            </Button>
            <Button onClick={handleClose} variant="destructive" className="w-full">
              关闭小程序
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">使用说明</h2>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• 在普通浏览器中访问：显示为普通网页</p>
          <p>• 在 Telegram 中访问：自动适配为小程序界面</p>
          <p>• 所有功能保持一致，无需额外配置</p>
        </div>
      </Card>
    </div>
  )
}

export default TelegramTestPage