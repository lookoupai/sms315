import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { AlertTriangle, Search, Filter, Clock, ExternalLink, User } from 'lucide-react'
import { getSubmissions, getAllWebsitesForAdmin, getCountries, getProjects } from '../services/database'
import type { Submission, Website, Country, Project } from '../lib/supabase'

export default function GuidePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWebsite, setSelectedWebsite] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedResult, setSelectedResult] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [submissionsResult, websitesData, countriesData, projectsData] = await Promise.all([
        getSubmissions(),
        getAllWebsitesForAdmin(),
        getCountries(),
        getProjects()
      ])
      
      setSubmissions(submissionsResult.data) // 只取数据部分
      setWebsites(websitesData)
      setCountries(countriesData)
      setProjects(projectsData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 筛选提交记录
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = !searchTerm || 
      submission.website?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.country?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.note?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesWebsite = !selectedWebsite || submission.website_id === selectedWebsite
    const matchesCountry = !selectedCountry || submission.country_id === selectedCountry
    const matchesProject = !selectedProject || submission.project_id === selectedProject
    const matchesResult = !selectedResult || submission.result === selectedResult
    
    return matchesSearch && matchesWebsite && matchesCountry && matchesProject && matchesResult
  })

  // 按结果分组
  const failureSubmissions = filteredSubmissions.filter(s => s.result === 'failure')
  const successSubmissions = filteredSubmissions.filter(s => s.result === 'success')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '刚刚'
    if (diffInHours < 24) return `${diffInHours}小时前`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedWebsite('')
    setSelectedCountry('')
    setSelectedProject('')
    setSelectedResult('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载避坑指南...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              避坑指南
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            查看其他用户分享的接码经历，避开已知失败的组合
          </p>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              搜索和筛选
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索网站、国家、项目或备注..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                清除筛选
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                <SelectTrigger>
                  <SelectValue placeholder="选择网站" />
                </SelectTrigger>
                <SelectContent>
                  {websites.map(website => (
                    <SelectItem key={website.id} value={website.id}>
                      {website.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="选择国家" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedResult} onValueChange={setSelectedResult}>
                <SelectTrigger>
                  <SelectValue placeholder="选择结果" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="failure">失败</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-red-50/80 backdrop-blur-sm border-red-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {failureSubmissions.length}
              </div>
              <div className="text-red-700 font-medium">失败记录</div>
              <div className="text-sm text-red-600 mt-1">需要避开的组合</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50/80 backdrop-blur-sm border-green-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {successSubmissions.length}
              </div>
              <div className="text-green-700 font-medium">成功记录</div>
              <div className="text-sm text-green-600 mt-1">可以参考的组合</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {filteredSubmissions.length}
              </div>
              <div className="text-blue-700 font-medium">总记录数</div>
              <div className="text-sm text-blue-600 mt-1">当前筛选结果</div>
            </CardContent>
          </Card>
        </div>

        {/* 失败记录 - 优先显示 */}
        {failureSubmissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              ⚠️ 失败记录 - 建议避开
            </h2>
            <div className="grid gap-4">
              {failureSubmissions.map(submission => (
                <Card key={submission.id} className="bg-red-50/80 backdrop-blur-sm border-red-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">失败</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {formatDate(submission.created_at)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">网站:</span>
                            <div className="flex items-center gap-1">
                              <span>{submission.website?.name}</span>
                              {submission.website?.status === 'personal' && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">个人</span>
                                </div>
                              )}
                            </div>
                            {submission.website?.url && (
                              <a 
                                href={submission.website.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">国家:</span> {submission.country?.name} ({submission.country?.code})
                          </div>
                          <div>
                            <span className="font-medium">项目:</span> {submission.project?.name}
                          </div>
                          {submission.note && (
                            <div className="mt-2 p-3 bg-white/50 rounded-lg">
                              <span className="font-medium">备注:</span> {submission.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 成功记录 */}
        {successSubmissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
              ✅ 成功记录 - 可以参考
            </h2>
            <div className="grid gap-4">
              {successSubmissions.map(submission => (
                <Card key={submission.id} className="bg-green-50/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800 border-green-300">成功</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {formatDate(submission.created_at)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">网站:</span>
                            <div className="flex items-center gap-1">
                              <span>{submission.website?.name}</span>
                              {submission.website?.status === 'personal' && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">个人</span>
                                </div>
                              )}
                            </div>
                            {submission.website?.url && (
                              <a 
                                href={submission.website.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">国家:</span> {submission.country?.name} ({submission.country?.code})
                          </div>
                          <div>
                            <span className="font-medium">项目:</span> {submission.project?.name}
                          </div>
                          {submission.note && (
                            <div className="mt-2 p-3 bg-white/50 rounded-lg">
                              <span className="font-medium">备注:</span> {submission.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 无数据提示 */}
        {filteredSubmissions.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无数据</h3>
              <p className="text-gray-500 mb-4">
                {submissions.length === 0 
                  ? '还没有用户分享接码经历，成为第一个分享者吧！'
                  : '没有找到符合筛选条件的记录，试试调整筛选条件。'
                }
              </p>
              <Button asChild>
                <a href="/submit">分享你的经历</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}