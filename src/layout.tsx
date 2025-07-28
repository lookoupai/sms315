import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Home, List } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            {/* 标题区域 */}
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
              <h1 className="text-base md:text-lg font-bold text-gray-900">{t('nav.title')}</h1>
            </div>
            
            {/* 导航区域 - 简化版 */}
            <nav className="flex items-center space-x-2">
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                asChild
                className="px-3 py-2 h-9 text-sm"
                size="sm"
              >
                <Link to="/" className="flex items-center space-x-1">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.guide')}</span>
                  <span className="sm:hidden">{t('nav.guideShort')}</span>
                </Link>
              </Button>
              <Button
                variant={location.pathname.startsWith('/submit') ? 'default' : 'ghost'}
                asChild
                className="px-3 py-2 h-9 text-sm"
                size="sm"
              >
                <Link to="/submit" className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.submit')}</span>
                  <span className="sm:hidden">{t('nav.submitShort')}</span>
                </Link>
              </Button>
              <LanguageSwitcher />
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {children}
      </main>

      {/* 底部信息 */}
      <footer className="bg-white border-t mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="text-center text-sm text-gray-600">
            <Card className="inline-block p-3 md:p-4 bg-yellow-50 border-yellow-200 max-w-full">
              <div className="flex items-center justify-center space-x-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{t('footer.importantReminder')}</span>
              </div>
              <p className="mt-2 text-yellow-700 text-xs md:text-sm">
                {t('footer.reminderText')}
              </p>
            </Card>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
