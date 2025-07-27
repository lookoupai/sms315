import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Shield, Mail, Lock, User as UserIcon, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface SupabaseAuthProps {
  children: React.ReactNode
  requiredRole?: string
}

const SupabaseAuth: React.FC<SupabaseAuthProps> = ({ 
  children, 
  requiredRole = 'admin' 
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  
  // 表单状态
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // 获取当前用户
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // 获取用户角色
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        
        setUserRole(profile?.role || 'user')
      }
      
      setLoading(false)
    }

    getCurrentUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
          
          setUserRole(profile?.role || 'user')
        } else {
          setUserRole(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      setEmail('')
      setPassword('')
    } catch (error: any) {
      setError(error.message || '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (password !== confirmPassword) {
      setError('密码确认不匹配')
      setSubmitting(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // 创建用户档案（默认角色为user，需要管理员手动升级为admin）
        await supabase
          .from('user_profiles')
          .insert([{
            user_id: data.user.id,
            email: data.user.email,
            role: 'user',
            created_at: new Date().toISOString()
          }])
      }

      setError('注册成功！请检查邮箱验证链接。')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setError(error.message || '注册失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证用户身份...</p>
        </div>
      </div>
    )
  }

  // 用户已登录且有权限
  if (user && userRole === requiredRole) {
    return (
      <div>
        {/* 顶部用户信息栏 */}
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 mb-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">
                管理员：{user.email}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <LogOut className="h-4 w-4 mr-1" />
              退出登录
            </Button>
          </div>
        </div>
        {children}
      </div>
    )
  }

  // 用户已登录但权限不足
  if (user && userRole !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-red-600">
              权限不足
            </CardTitle>
            <CardDescription>
              您的账户（{user.email}）没有访问管理后台的权限。
              <br />
              当前角色：{userRole || '未知'}
              <br />
              需要角色：{requiredRole}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogout}
              className="w-full"
              variant="outline"
            >
              <LogOut className="h-4 w-4 mr-2" />
              切换账户
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 用户未登录，显示登录/注册表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {authMode === 'login' ? '管理员登录' : '管理员注册'}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            {authMode === 'login' 
              ? '请使用管理员账户登录以访问后台管理功能' 
              : '注册新的管理员账户（需要现有管理员审核）'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                邮箱地址
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  className="pl-10 min-h-[44px]"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="pl-10 min-h-[44px]"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  确认密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="pl-10 min-h-[44px]"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <Alert className={error.includes('成功') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <AlertDescription className={error.includes('成功') ? 'text-green-700' : 'text-red-700'}>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-h-[44px]"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {authMode === 'login' ? '登录中...' : '注册中...'}
                </>
              ) : (
                <>
                  {authMode === 'login' ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      登录管理后台
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-4 w-4 mr-2" />
                      注册管理账户
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {authMode === 'login' ? '没有账户？点击注册' : '已有账户？点击登录'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SupabaseAuth