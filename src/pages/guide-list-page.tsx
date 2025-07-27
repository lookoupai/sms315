import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, CheckCircle, Search, Filter, Clock, ExternalLink } from 'lucide-react'
import { getSubmissions } from '../services/database'
import type { Submission } from '../lib/supabase'

const GuideListPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [filters, setFilters] = useState({
    search: '',
    result: 'all',
    website: 'all',
    country: 'all',
    project: 'all'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const data = await getSubmissions()
        setSubmissions(data)
      } catch (error) {
        console.error('加载提交记录失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  useEffect(() => {
    let filtered = submissions

    // 搜索过滤 - 支持网站、国家名称、国家代码、电话区号、项目、备注
    if (filters.search) {
      filtered = filtered.filter(item =>
        (item.website?.name && item.website.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.country?.name && item.country.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.country?.code && item.country.code.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.country?.phone_code && item.country.phone_code.includes(filters.search)) ||
        (item.project?.name && item.project.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // 结果过滤
    if (filters.result !== 'all') {
      filtered = filtered.filter(item => item.result === filters.result)
    }

    // 网站过滤
    if (filters.website !== 'all') {
      filtered = filtered.filter(item => item.website?.name === filters.website)
    }

    // 国家过滤
    if (filters.country !== 'all') {
      filtered = filtered.filter(item => item.country?.name === filters.country)
    }

    // 项目过滤
    if (filters.project !== 'all') {
      filtered = filtered.filter(item => item.project?.name === filters.project)
    }

    // 按结果排序：失败记录优先
    filtered.sort((a, b) => {
      if (a.result === 'failure' && b.result === 'success') return -1
      if (a.result === 'success' && b.result === 'failure') return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    setFilteredSubmissions(filtered)
  }, [submissions, filters])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return '刚刚'
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffHours < 48) return '昨天'
    return date.toLocaleDateString('zh-CN')
  }

  const getUniqueValues = (key: string) => {
    const values = submissions.map(item => {
      if (key === 'website') return item.website?.name
      if (key === 'country') return item.country?.name
      if (key === 'project') return item.project?.name
      return ''
    })
    return [...new Set(values)].filter(Boolean)
  }

  const failureCount = filteredSubmissions.filter(item => item.result === 'failure').length
  const successCount = filteredSubmissions.filter(item => item.result === 'success').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 - 移动端优化 */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
          <span>接码避坑指南</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base px-4">查看最新的接码失败记录，避免重复踩坑</p>
      </div>

      {/* 统计信息 - 移动端优化 */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-2 text-center md:text-left">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500 mb-1 md:mb-0" />
              <div>
                <p className="text-lg md:text-2xl font-bold text-red-600">{failureCount}</p>
                <p className="text-xs md:text-sm text-gray-600">失败记录</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-2 text-center md:text-left">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mb-1 md:mb-0" />
              <div>
                <p className="text-lg md:text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs md:text-sm text-gray-600">成功记录</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-2 text-center md:text-left">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mb-1 md:mb-0" />
              <div>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{filteredSubmissions.length}</p>
                <p className="text-xs md:text-sm text-gray-600">总记录数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>筛选条件</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">搜索</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索网站、国家、区号、项目..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 min-h-[44px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">结果类型</label>
              <Select value={filters.result} onValueChange={(value) => setFilters({...filters, result: value})}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部结果</SelectItem>
                  <SelectItem value="failure">仅失败记录</SelectItem>
                  <SelectItem value="success">仅成功记录</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">网站</label>
              <Select value={filters.website} onValueChange={(value) => setFilters({...filters, website: value})}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部网站</SelectItem>
                  {getUniqueValues('website').map(website => (
                    <SelectItem key={website} value={website || ''}>{website}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 记录列表 */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">没有找到符合条件的记录</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map(submission => (
            <Card 
              key={submission.id} 
              className={`${
                submission.result === 'failure' 
                  ? 'border-l-4 border-l-red-500 bg-red-50' 
                  : 'border-l-4 border-l-green-500 bg-green-50'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        {submission.result === 'failure' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <Badge 
                          variant={submission.result === 'failure' ? 'destructive' : 'default'}
                          className="font-medium"
                        >
                          {submission.result === 'failure' ? '接码失败' : '接码成功'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(submission.created_at)}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">网站：</span>
                        <div className="flex items-center space-x-1 mt-1">
                          <span>{submission.website?.name || '未知网站'}</span>
                          {submission.website?.url && (
                            <>
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500 text-xs break-all">({submission.website.url})</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">国家：</span>
                        <div className="mt-1">
                          <span>{submission.country?.name || '未知国家'}</span>
                          {submission.country?.code && (
                            <span className="text-gray-500"> ({submission.country.code})</span>
                          )}
                          {submission.country?.phone_code && (
                            <span className="text-gray-500"> {submission.country.phone_code}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">项目：</span>
                        <div className="mt-1">
                          <span>{submission.project?.name || '未知项目'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {submission.note && (
                      <div className="bg-white p-3 rounded border">
                        <span className="font-medium text-gray-700">备注：</span>
                        <p className="text-gray-600 mt-1">{submission.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default GuideListPage