import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Globe,
  Building,
  Users,
  BarChart3,
  Save,
  X
} from 'lucide-react'
import { 
  getWebsites, 
  getCountries, 
  getProjects, 
  getSubmissions 
} from '../services/database'
import { supabase } from '../lib/supabase'
import type { Website, Country, Project, Submission } from '../lib/supabase'
import AdminAuth from '../components/admin-auth'

function AdminPageContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'websites' | 'countries' | 'projects' | 'submissions'>('overview')
  const [loading, setLoading] = useState(false)
  
  // 数据状态
  const [websites, setWebsites] = useState<Website[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  
  // 表单状态
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null)
  const [newWebsite, setNewWebsite] = useState({ name: '', url: '', status: 'active' as const })
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [newCountry, setNewCountry] = useState({ name: '', code: '', phone_code: '' })
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({ name: '', code: '' })
  
  // 搜索状态
  const [countrySearch, setCountrySearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  // 过滤国家列表
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    (country.phone_code && country.phone_code.includes(countrySearch))
  )

  // 过滤项目列表
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.code.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [websitesData, countriesData, projectsData, submissionsData] = await Promise.all([
        getWebsites(),
        getCountries(),
        getProjects(),
        getSubmissions()
      ])
      
      setWebsites(websitesData)
      setCountries(countriesData)
      setProjects(projectsData)
      setSubmissions(submissionsData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 添加网站
  const handleAddWebsite = async () => {
    if (!newWebsite.name || !newWebsite.url) return
    
    try {
      const { error } = await supabase
        .from('websites')
        .insert([newWebsite])
      
      if (!error) {
        setNewWebsite({ name: '', url: '', status: 'active' })
        await loadAllData()
      }
    } catch (error) {
      console.error('添加网站失败:', error)
    }
  }

  // 更新网站
  const handleUpdateWebsite = async () => {
    if (!editingWebsite) return
    
    try {
      const { error } = await supabase
        .from('websites')
        .update({
          name: editingWebsite.name,
          url: editingWebsite.url,
          status: editingWebsite.status
        })
        .eq('id', editingWebsite.id)
      
      if (!error) {
        setEditingWebsite(null)
        await loadAllData()
      }
    } catch (error) {
      console.error('更新网站失败:', error)
    }
  }

  // 删除网站
  const handleDeleteWebsite = async (id: string) => {
    if (!confirm('确定要删除这个网站吗？')) return
    
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id)
      
      if (!error) {
        await loadAllData()
      }
    } catch (error) {
      console.error('删除网站失败:', error)
    }
  }

  // 添加国家
  const handleAddCountry = async () => {
    if (!newCountry.name || !newCountry.code) return
    
    try {
      const { error } = await supabase
        .from('countries')
        .insert([{
          name: newCountry.name,
          code: newCountry.code.toLowerCase(),
          phone_code: newCountry.phone_code
        }])
      
      if (!error) {
        setNewCountry({ name: '', code: '', phone_code: '' })
        await loadAllData()
      }
    } catch (error) {
      console.error('添加国家失败:', error)
    }
  }

  // 更新国家
  const handleUpdateCountry = async () => {
    if (!editingCountry) return
    
    try {
      const { error } = await supabase
        .from('countries')
        .update({
          name: editingCountry.name,
          code: editingCountry.code.toLowerCase(),
          phone_code: editingCountry.phone_code
        })
        .eq('id', editingCountry.id)
      
      if (!error) {
        setEditingCountry(null)
        await loadAllData()
      }
    } catch (error) {
      console.error('更新国家失败:', error)
    }
  }

  // 删除国家
  const handleDeleteCountry = async (id: string) => {
    if (!confirm('确定要删除这个国家吗？')) return
    
    try {
      const { error } = await supabase
        .from('countries')
        .delete()
        .eq('id', id)
      
      if (!error) {
        await loadAllData()
      }
    } catch (error) {
      console.error('删除国家失败:', error)
    }
  }

  // 添加项目
  const handleAddProject = async () => {
    if (!newProject.name || !newProject.code) return
    
    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          name: newProject.name,
          code: newProject.code.toLowerCase()
        }])
      
      if (!error) {
        setNewProject({ name: '', code: '' })
        await loadAllData()
      }
    } catch (error) {
      console.error('添加项目失败:', error)
    }
  }

  // 更新项目
  const handleUpdateProject = async () => {
    if (!editingProject) return
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editingProject.name,
          code: editingProject.code.toLowerCase()
        })
        .eq('id', editingProject.id)
      
      if (!error) {
        setEditingProject(null)
        await loadAllData()
      }
    } catch (error) {
      console.error('更新项目失败:', error)
    }
  }

  // 删除项目
  const handleDeleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (!error) {
        await loadAllData()
      }
    } catch (error) {
      console.error('删除项目失败:', error)
    }
  }

  // 删除提交记录
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return
    
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id)
      
      if (!error) {
        await loadAllData()
      }
    } catch (error) {
      console.error('删除记录失败:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const tabs = [
    { id: 'overview', name: '概览', icon: BarChart3 },
    { id: 'websites', name: '网站管理', icon: Globe },
    { id: 'countries', name: '国家管理', icon: Building },
    { id: 'projects', name: '项目管理', icon: Building },
    { id: 'submissions', name: '提交记录', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 页面标题 - 移动端优化 */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Settings className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              管理后台
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-lg px-4">
            管理网站数据和用户提交记录
          </p>
        </div>

        {/* 标签页导航 - 移动端优化 */}
        <div className="flex flex-wrap gap-2 mb-6 md:mb-8 justify-center px-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4 py-2 min-h-[44px]"
                  size="sm"
                >
                  <Icon className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">
                    {tab.name.replace('管理', '').replace('记录', '')}
                  </span>
                </Button>
            )
          })}
        </div>

        {/* 概览页面 - 移动端优化 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 md:p-6 text-center">
                <Globe className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-blue-600">{websites.length}</div>
                <div className="text-xs md:text-sm text-gray-600">接码网站</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 md:p-6 text-center">
                <Building className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-green-600">{countries.length}</div>
                <div className="text-xs md:text-sm text-gray-600">国家</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 md:p-6 text-center">
                <Building className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-purple-600">{projects.length}</div>
                <div className="text-xs md:text-sm text-gray-600">项目</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 md:p-6 text-center">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-xl md:text-2xl font-bold text-orange-600">{submissions.length}</div>
                <div className="text-xs md:text-sm text-gray-600">提交记录</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 网站管理 */}
        {activeTab === 'websites' && (
          <div className="space-y-4 md:space-y-6">
            {/* 添加网站表单 */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  添加新网站
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">网站名称</Label>
                    <Input
                      value={newWebsite.name}
                      onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                      placeholder="例如: SMS-Activate"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">网站网址</Label>
                    <Input
                      value={newWebsite.url}
                      onChange={(e) => setNewWebsite({...newWebsite, url: e.target.value})}
                      placeholder="例如: https://sms-activate.io"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">状态</Label>
                    <Select value={newWebsite.status} onValueChange={(value: any) => setNewWebsite({...newWebsite, status: value})}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">正常</SelectItem>
                        <SelectItem value="inactive">维护中</SelectItem>
                        <SelectItem value="discontinued">已关闭</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddWebsite} className="w-full min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  添加网站
                </Button>
              </CardContent>
            </Card>

            {/* 网站列表 */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">网站列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {websites.map(website => (
                    <div key={website.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex-1">
                        <div className="font-medium text-sm md:text-base">{website.name}</div>
                        <div className="text-xs md:text-sm text-gray-500 break-all">{website.url}</div>
                        <div className="flex items-center gap-2 mt-2 md:mt-1">
                          <Badge variant={website.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {website.status === 'active' ? '正常' : website.status === 'inactive' ? '维护中' : '已关闭'}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {formatDate(website.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingWebsite(website)}
                          className="flex-1 md:flex-none min-h-[36px]"
                        >
                          <Edit className="h-4 w-4 mr-1 md:mr-0" />
                          <span className="md:hidden">编辑</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteWebsite(website.id)}
                          className="flex-1 md:flex-none min-h-[36px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1 md:mr-0" />
                          <span className="md:hidden">删除</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 国家管理 */}
        {activeTab === 'countries' && (
          <div className="space-y-4 md:space-y-6">
            {/* 添加国家表单 */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  添加新国家
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">国家名称</Label>
                    <Input
                      value={newCountry.name}
                      onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
                      placeholder="例如: 中国"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">国家代码</Label>
                    <Input
                      value={newCountry.code}
                      onChange={(e) => setNewCountry({...newCountry, code: e.target.value})}
                      placeholder="例如: cn"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">区号</Label>
                    <Input
                      value={newCountry.phone_code}
                      onChange={(e) => setNewCountry({...newCountry, phone_code: e.target.value})}
                      placeholder="例如: +86"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <Button onClick={handleAddCountry} className="w-full min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  添加国家
                </Button>
              </CardContent>
            </Card>

            {/* 国家列表 */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">国家列表</CardTitle>
                <CardDescription>当前有 {countries.length} 个国家</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="搜索国家名称、代码或区号..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full min-h-[44px]"
                  />
                </div>
                <div className="space-y-3 md:space-y-4">
                  {filteredCountries.map(country => (
                    <div key={country.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex-1">
                        <div className="font-medium text-sm md:text-base">{country.name}</div>
                        <div className="text-xs md:text-sm text-gray-500">
                          {country.code} • {country.phone_code}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingCountry(country)}
                          className="flex-1 md:flex-none min-h-[36px]"
                        >
                          <Edit className="h-4 w-4 mr-1 md:mr-0" />
                          <span className="md:hidden">编辑</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCountry(country.id)}
                          className="flex-1 md:flex-none min-h-[36px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1 md:mr-0" />
                          <span className="md:hidden">删除</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 项目管理 */}
        {activeTab === 'projects' && (
          <div className="space-y-4 md:space-y-6">
            {/* 添加项目表单 */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  添加新项目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">项目名称</Label>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="例如: Telegram (TG)"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">项目代码</Label>
                    <Input
                      value={newProject.code}
                      onChange={(e) => setNewProject({...newProject, code: e.target.value})}
                      placeholder="例如: tg"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <Button onClick={handleAddProject} className="w-full min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  添加项目
                </Button>
              </CardContent>
            </Card>

            {/* 项目列表 */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">项目列表</CardTitle>
                <CardDescription>当前有 {projects.length} 个项目</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="搜索项目名称或代码..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full min-h-[44px]"
                  />
                </div>
                <div className="space-y-3 md:space-y-4">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex-1">
                        <div className="font-medium text-sm md:text-base">{project.name}</div>
                        <div className="text-xs md:text-sm text-gray-500">{project.code}</div>
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingProject(project)}
                          className="flex-1 md:flex-none min-h-[36px]"
                        >
                          <Edit className="h-4 w-4 mr-1 md:mr-0" />
                          <span className="md:hidden">编辑</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteProject(project.id)}
                          className="flex-1 md:flex-none min-h-[36px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1 md:mr-0" />
                          <span className="md:hidden">删除</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 提交记录管理 */}
        {activeTab === 'submissions' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">提交记录管理</CardTitle>
              <CardDescription>查看和管理用户提交的接码记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="p-3 md:p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={submission.result === 'failure' ? 'destructive' : 'default'} className="text-xs">
                            {submission.result === 'failure' ? '失败' : '成功'}
                          </Badge>
                          <span className="text-xs md:text-sm text-gray-500">
                            {formatDate(submission.created_at)}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs md:text-sm">
                          <div><strong>网站:</strong> {submission.website?.name}</div>
                          <div><strong>国家:</strong> {submission.country?.name} ({submission.country?.code})</div>
                          <div><strong>项目:</strong> {submission.project?.name}</div>
                          {submission.note && (
                            <div><strong>备注:</strong> {submission.note}</div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteSubmission(submission.id)}
                        className="mt-3 md:mt-0 min-h-[36px]"
                      >
                        <Trash2 className="h-4 w-4 mr-1 md:mr-0" />
                        <span className="md:hidden">删除</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 编辑网站弹窗 - 移动端优化 */}
        {editingWebsite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
            <Card className="bg-white w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    编辑网站
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingWebsite(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">网站名称</Label>
                    <Input
                      value={editingWebsite.name}
                      onChange={(e) => setEditingWebsite({...editingWebsite, name: e.target.value})}
                      placeholder="例如: SMS-Activate"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">网站网址</Label>
                    <Input
                      value={editingWebsite.url}
                      onChange={(e) => setEditingWebsite({...editingWebsite, url: e.target.value})}
                      placeholder="例如: https://sms-activate.io"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">状态</Label>
                    <Select 
                      value={editingWebsite.status} 
                      onValueChange={(value: any) => setEditingWebsite({...editingWebsite, status: value})}
                    >
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">正常</SelectItem>
                        <SelectItem value="inactive">维护中</SelectItem>
                        <SelectItem value="discontinued">已关闭</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Button onClick={handleUpdateWebsite} className="flex-1 min-h-[44px]">
                    <Save className="h-4 w-4 mr-2" />
                    保存更改
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingWebsite(null)}
                    className="flex-1 min-h-[44px]"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 编辑国家弹窗 - 移动端优化 */}
        {editingCountry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
            <Card className="bg-white w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    编辑国家
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingCountry(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">国家名称</Label>
                    <Input
                      value={editingCountry.name}
                      onChange={(e) => setEditingCountry({...editingCountry, name: e.target.value})}
                      placeholder="例如: 中国"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">国家代码</Label>
                    <Input
                      value={editingCountry.code}
                      onChange={(e) => setEditingCountry({...editingCountry, code: e.target.value})}
                      placeholder="例如: cn"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">区号</Label>
                    <Input
                      value={editingCountry.phone_code || ''}
                      onChange={(e) => setEditingCountry({...editingCountry, phone_code: e.target.value})}
                      placeholder="例如: +86"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Button onClick={handleUpdateCountry} className="flex-1 min-h-[44px]">
                    <Save className="h-4 w-4 mr-2" />
                    保存更改
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingCountry(null)}
                    className="flex-1 min-h-[44px]"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 编辑项目弹窗 - 移动端优化 */}
        {editingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
            <Card className="bg-white w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    编辑项目
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingProject(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">项目名称</Label>
                    <Input
                      value={editingProject.name}
                      onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                      placeholder="例如: Telegram (TG)"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">项目代码</Label>
                    <Input
                      value={editingProject.code}
                      onChange={(e) => setEditingProject({...editingProject, code: e.target.value})}
                      placeholder="例如: tg"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Button onClick={handleUpdateProject} className="flex-1 min-h-[44px]">
                    <Save className="h-4 w-4 mr-2" />
                    保存更改
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingProject(null)}
                    className="flex-1 min-h-[44px]"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authSuccess, setAuthSuccess] = useState(false)

  return (
    <AdminAuth onAuthSuccess={() => setAuthSuccess(true)}>
      <AdminPageContent />
    </AdminAuth>
  )
}
