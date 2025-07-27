import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Shield, Eye, EyeOff, Lock } from 'lucide-react'

interface AdminAuthProps {
  children: React.ReactNode
  onAuthSuccess: () => void
}

const AdminAuth: React.FC<AdminAuthProps> = ({ children, onAuthSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 管理员密码 - 优先使用环境变量，否则使用默认值
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sms315admin2024'

  useEffect(() => {
    // 检查是否已经认证过（使用sessionStorage，关闭浏览器后需要重新认证）
    const authToken = sessionStorage.getItem('admin_auth_token')
    const authTime = sessionStorage.getItem('admin_auth_time')
    
    if (authToken && authTime) {
      const now = Date.now()
      const authTimestamp = parseInt(authTime)
      // 认证有效期2小时
      if (now - authTimestamp < 2 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
        onAuthSuccess()
        return
      } else {
        // 认证过期，清除存储
        sessionStorage.removeItem('admin_auth_token')
        sessionStorage.removeItem('admin_auth_time')
      }
    }
  }, [onAuthSuccess])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (password === ADMIN_PASSWORD) {
      // 生成简单的认证令牌
      const authToken = btoa(`admin_${Date.now()}_${Math.random()}`)
      sessionStorage.setItem('admin_auth_token', authToken)
      sessionStorage.setItem('admin_auth_time', Date.now().toString())
      
      setIsAuthenticated(true)
      onAuthSuccess()
      setPassword('')
    } else {
      setError('密码错误，请重试')
      // 防止暴力破解，错误后延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth_token')
    sessionStorage.removeItem('admin_auth_time')
    setIsAuthenticated(false)
    setPassword('')
  }

  if (isAuthenticated) {
    return (
      <div>
        {/* 顶部认证状态栏 */}
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 mb-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">管理员已认证</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <Lock className="h-4 w-4 mr-1" />
              退出登录
            </Button>
          </div>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              管理员认证
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            请输入管理员密码以访问后台管理功能
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                管理员密码
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入管理员密码"
                  className="pr-10 min-h-[44px]"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-700 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-h-[44px]"
              disabled={loading || !password.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  验证中...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  登录管理后台
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-700">
              <div className="font-medium mb-1">🔒 安全提示：</div>
              <ul className="space-y-1 text-blue-600">
                <li>• 认证有效期：2小时</li>
                <li>• 关闭浏览器后需重新认证</li>
                <li>• 请勿在公共设备上使用</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminAuth