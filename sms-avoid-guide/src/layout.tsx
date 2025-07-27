import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from './components/ui/button'
import { AlertTriangle, List, Home, Settings } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            {/* 标题区域 */}
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
              <h1 className="text-base md:text-lg font-bold text-gray-900">接码避坑指南</h1>
            </div>
            {/* 导航区域 - 移动端优化 */}
            <nav className="flex justify-center md:justify-end space-x-2">
              <Button
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                asChild
                className="px-3 py-2 h-9 text-sm"
                size="sm"
              >
                <Link to="/" className="flex items-center space-x-1">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">避坑指南</span>
                  <span className="sm:hidden">指南</span>
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
                  <span className="hidden sm:inline">提交避坑</span>
                  <span className="sm:hidden">提交</span>
                </Link>
              </Button>
              <Button
                variant={location.pathname.startsWith('/admin') ? 'default' : 'ghost'}
                asChild
                className="px-3 py-2 h-9 text-sm"
                size="sm"
              >
                <Link to="/admin" className="flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">管理后台</span>
                  <span className="sm:hidden">管理</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}