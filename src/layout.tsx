import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Home, List, Settings } from 'lucide-react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* 标题区域 */}
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              <h1 className="text-lg md:text-xl font-bold text-gray-900">接码避坑指南</h1>
            </div>
            
            {/* 导航区域 - 移动端优化 */}
            <nav className="mobile-nav flex justify-center md:justify-end space-x-2 md:space-x-4">
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                asChild
                className="mobile-nav-btn mobile-btn"
                size="sm"
              >
                <Link to="/" className="flex items-center space-x-1 md:space-x-2">
                  <List className="h-4 w-4" />
                  <span className="text-sm md:text-base">避坑指南</span>
                </Link>
              </Button>
              <Button
                variant={location.pathname === '/submit' ? 'default' : 'ghost'}
                asChild
                className="mobile-nav-btn mobile-btn"
                size="sm"
              >
                <Link to="/submit" className="flex items-center space-x-1 md:space-x-2">
                  <Home className="h-4 w-4" />
                  <span className="text-sm md:text-base">提交避坑</span>
                </Link>
              </Button>
              <Button
                variant={location.pathname === '/admin' ? 'default' : 'ghost'}
                asChild
                className="mobile-nav-btn mobile-btn"
                size="sm"
              >
                <Link to="/admin" className="flex items-center space-x-1 md:space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm md:text-base">管理后台</span>
                </Link>
              </Button>
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
                <span className="font-medium">重要提醒</span>
              </div>
              <p className="mt-2 text-yellow-700 text-xs md:text-sm">
                失败信息有时效性，但近期的失败记录参考价值很高，建议避开这些组合
              </p>
            </Card>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
