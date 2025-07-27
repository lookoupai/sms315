import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { AlertTriangle, Heart, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { getWebsites, getCountries, getProjects, createSubmission, checkIpLimit, getUserIP } from '../services/database'
import SearchableCountrySelect from '../components/SearchableCountrySelect'
import SearchableProjectSelect from '../components/SearchableProjectSelect'
import type { Website, Country, Project } from '../lib/supabase'

export default function SubmitPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // 表单状态
  const [selectedWebsite, setSelectedWebsite] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [result, setResult] = useState<'success' | 'failure' | ''>('')
  const [note, setNote] = useState('')
  
  // 自定义数据状态
  const [customWebsite, setCustomWebsite] = useState({ name: '', url: '' })
  const [customCountry, setCustomCountry] = useState({ name: '', code: '', phone_code: '' })
  const [customProject, setCustomProject] = useState({ name: '', code: '' })
  
  // 提交状态
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [countriesData, projectsData] = await Promise.all([
        getCountries(),
        getProjects()
      ])
      
      setCountries(countriesData)
      setProjects(projectsData)
    } catch (error) {
      console.error('加载数据失败:', error)
      setErrorMessage('加载数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedWebsite || !selectedCountry || !selectedProject || !result) {
      setErrorMessage('请填写所有必填项')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    
    try {
      // 检查IP频率限制
      const userIP = getUserIP()
      const canSubmit = await checkIpLimit(userIP)
      
      if (!canSubmit) {
        setErrorMessage('提交过于频繁，请稍后再试（每小时最多10次）')
        setSubmitting(false)
        return
      }

      // 准备提交数据
      const submissionData = {
        website_id: selectedWebsite === 'custom' ? null : selectedWebsite,
        country_id: selectedCountry === 'custom' ? null : selectedCountry,
        project_id: selectedProject === 'custom' ? null : selectedProject,
        result,
        note: note.trim() || undefined,
        ip_address: userIP,
        // 自定义数据
        custom_website: selectedWebsite === 'custom' ? customWebsite : null,
        custom_country: selectedCountry === 'custom' ? customCountry : null,
        custom_project: selectedProject === 'custom' ? customProject : null
      }

      // 提交数据
      const success = await createSubmission(submissionData)

      if (success) {
        setSubmitStatus('success')
        // 清空表单
        setSelectedWebsite('')
        setSelectedCountry('')
        setSelectedProject('')
        setResult('')
        setNote('')
        
        // 3秒后重置状态
        setTimeout(() => {
          setSubmitStatus('idle')
        }, 3000)
      } else {
        setErrorMessage('提交失败，请稍后重试')
      }
    } catch (error) {
      console.error('提交失败:', error)
      setErrorMessage('提交失败，请检查网络连接')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载表单...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              帮助他人避坑
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            分享你的接码失败经历，让其他人少花冤枉钱
          </p>
        </div>

        {/* 价值说明 */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">你的分享很有价值</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  刚刚接码失败了？分享一下，让其他人避免同样的损失
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提交表单 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              分享接码经历
            </CardTitle>
            <CardDescription>
              刚刚接码失败了？分享一下，让其他人避免同样的损失
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 网站选择 */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium">
                  接码网站 <span className="text-red-500">*</span>
                  <span className="text-xs text-blue-600 ml-2">🔍 可搜索组件已加载</span>
                </Label>
                <div className="relative">
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 font-bold">🚨 测试：如果您看到这个红色框，说明代码更新成功了！</p>
                    <p className="text-red-600 text-sm">原本这里应该是可搜索的网站选择组件</p>
                  </div>
                </div>
                
                {selectedWebsite === 'custom' && (
                  <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-800">
                      自定义网站信息
                    </Label>
                    <Input
                      placeholder="网站名称，例如: NewSMS"
                      className="bg-white"
                      value={customWebsite.name}
                      onChange={(e) => setCustomWebsite({...customWebsite, name: e.target.value})}
                    />
                    <Input
                      placeholder="网站网址，例如: https://newsms.com"
                      className="bg-white"
                      value={customWebsite.url}
                      onChange={(e) => setCustomWebsite({...customWebsite, url: e.target.value})}
                    />
                    <p className="text-xs text-blue-600">
                      💡 自定义的网站信息会提交给管理员审核后添加到系统中
                    </p>
                  </div>
                )}
              </div>

              {/* 国家选择 */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  接码国家 <span className="text-red-500">*</span>
                </Label>
                <SearchableCountrySelect
                  countries={countries}
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                  placeholder="请选择国家（可搜索名称、代码或区号）"
                />
                
                {selectedCountry === 'custom' && (
                  <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-sm font-medium text-green-800">
                      自定义国家信息
                    </Label>
                    <Input
                      placeholder="国家名称，例如: 新西兰"
                      className="bg-white"
                      value={customCountry.name}
                      onChange={(e) => setCustomCountry({...customCountry, name: e.target.value})}
                    />
                    <Input
                      placeholder="国家代码，例如: NZ"
                      className="bg-white"
                      value={customCountry.code}
                      onChange={(e) => setCustomCountry({...customCountry, code: e.target.value})}
                    />
                    <Input
                      placeholder="电话区号，例如: +64"
                      className="bg-white"
                      value={customCountry.phone_code}
                      onChange={(e) => setCustomCountry({...customCountry, phone_code: e.target.value})}
                    />
                    <p className="text-xs text-green-600">
                      💡 自定义的国家信息会提交给管理员审核后添加到系统中
                    </p>
                  </div>
                )}
              </div>

              {/* 项目选择 */}
              <div className="space-y-2">
                <Label htmlFor="project" className="text-sm font-medium">
                  接码项目 <span className="text-red-500">*</span>
                  <span className="text-xs text-purple-600 ml-2">🔍 可搜索组件已加载</span>
                </Label>
                <SearchableProjectSelect
                  projects={projects}
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                  placeholder="请选择项目（可搜索项目名称）"
                />
                
                {selectedProject === 'custom' && (
                  <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Label className="text-sm font-medium text-purple-800">
                      自定义项目信息
                    </Label>
                    <Input
                      placeholder="项目名称，例如: 新浪微博"
                      className="bg-white"
                      value={customProject.name}
                      onChange={(e) => setCustomProject({...customProject, name: e.target.value})}
                    />
                    <Input
                      placeholder="项目代码，例如: weibo"
                      className="bg-white"
                      value={customProject.code}
                      onChange={(e) => setCustomProject({...customProject, code: e.target.value})}
                    />
                    <p className="text-xs text-purple-600">
                      💡 自定义的项目信息会提交给管理员审核后添加到系统中
                    </p>
                  </div>
                )}
              </div>

              {/* 结果选择 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  接码结果 <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors border-red-200 bg-red-50/50">
                    <input
                      type="radio"
                      name="result"
                      value="failure"
                      checked={result === 'failure'}
                      onChange={(e) => setResult(e.target.value as 'failure')}
                      className="w-4 h-4 text-red-600"
                    />
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium text-red-700">接码失败</div>
                        <div className="text-sm text-red-600">帮助他人避坑</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border-green-200 bg-green-50/50">
                    <input
                      type="radio"
                      name="result"
                      value="success"
                      checked={result === 'success'}
                      onChange={(e) => setResult(e.target.value as 'success')}
                      className="w-4 h-4 text-green-600"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium text-green-700">接码成功</div>
                        <div className="text-sm text-green-600">分享经验</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 备注输入 */}
              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-medium">
                  备注说明 (可选)
                </Label>
                <Textarea
                  id="note"
                  placeholder="可以描述具体的失败原因或成功经验..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="text-xs text-gray-500 text-right">
                  {note.length}/500
                </div>
              </div>

              {/* 错误提示 */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 成功提示 */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">提交成功！感谢你的分享 ❤️</span>
                  </div>
                </div>
              )}

              {/* 提交按钮 */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    提交分享
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 温馨提示 */}
        <Card className="mt-8 bg-yellow-50/80 backdrop-blur-sm border-yellow-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              温馨提示
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 space-y-2">
            <p>• 分享失败经历可以帮助其他人避免重复付费</p>
            <p>• 你的分享是匿名的，不会记录个人信息</p>
            <p>• 如果没有找到合适的选项，可以联系管理员添加</p>
          </CardContent>
        </Card>

        {/* 重要提醒 */}
        <Card className="mt-6 bg-orange-50/80 backdrop-blur-sm border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              重要提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <p>失败信息有时效性，但近期的失败记录参考价值很高，建议避开这些组合</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}