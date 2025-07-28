import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { AlertTriangle, Heart, Send, CheckCircle, XCircle, Loader2, ChevronDown, Search, X } from 'lucide-react'
import { getWebsites, getCountries, getProjects, createSubmission, checkIpLimit, getUserIP } from '../services/database'
import { getLocalizedCountries } from '../utils/country-names'
import type { Website, Country, Project } from '../lib/supabase'
import SearchableCountrySelect from '../components/SearchableCountrySelect'

// 内联可搜索网站选择组件
function InlineSearchableWebsiteSelect({
  websites,
  value,
  onValueChange,
  placeholder = "请选择网站"
}: {
  websites: Website[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>(websites)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedWebsite = websites.find(website => website.id === value)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredWebsites(websites)
    } else {
      const filtered = websites.filter(website =>
        website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredWebsites(filtered)
    }
  }, [searchTerm, websites])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:border-gray-400"
      >
        <span className={selectedWebsite ? "text-gray-900" : "text-gray-500"}>
          {selectedWebsite 
            ? `${selectedWebsite.name} (${selectedWebsite.url})`
            : placeholder
          }
        </span>
        <div className="flex items-center gap-1">
          {selectedWebsite && (
            <X 
              className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation()
                onValueChange('')
              }}
            />
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('submit.searchWebsites')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {searchTerm && (
              <X 
                className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer ml-2" 
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>
          <div className="max-h-48 overflow-auto">
            {filteredWebsites.length > 0 ? (
              <>
                {filteredWebsites.map(website => (
                  <button
                    key={website.id}
                    type="button"
                    onClick={() => {
                      onValueChange(website.id)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-left"
                  >
                    <span className="flex-1">
                      {website.name} ({website.url})
                    </span>
                    {value === website.id && (
                      <span className="absolute right-2 h-3.5 w-3.5">✓</span>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {t('submit.noWebsitesFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 内联可搜索项目选择组件
function InlineSearchableProjectSelect({
  projects,
  value,
  onValueChange,
  placeholder = "请选择项目"
}: {
  projects: Project[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedProject = projects.find(project => project.id === value)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.code && project.code.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProjects(filtered)
    }
  }, [searchTerm, projects])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:border-gray-400"
      >
        <span className={selectedProject ? "text-gray-900" : "text-gray-500"}>
          {selectedProject ? selectedProject.name : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedProject && (
            <X 
              className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation()
                onValueChange('')
              }}
            />
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('submit.searchProjects')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {searchTerm && (
              <X 
                className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer ml-2" 
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>
          <div className="max-h-48 overflow-auto">
            {filteredProjects.length > 0 ? (
              <>
                {filteredProjects.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      onValueChange(project.id)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-left"
                  >
                    <span className="flex-1">{project.name}</span>
                    {value === project.id && (
                      <span className="absolute right-2 h-3.5 w-3.5">✓</span>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {t('submit.noProjectsFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SubmitPageNew() {
  const { t, i18n } = useTranslation()
  const [websites, setWebsites] = useState<Website[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [localizedCountries, setLocalizedCountries] = useState<(Country & { localizedName: string })[]>([])
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

  // 当语言或国家数据变化时，更新本地化的国家列表
  useEffect(() => {
    if (countries.length > 0) {
      const localized = getLocalizedCountries(countries, i18n.language)
      setLocalizedCountries(localized)
    }
  }, [countries, i18n.language])

  const loadData = async () => {
    setLoading(true)
    try {
      const [websitesData, countriesData, projectsData] = await Promise.all([
        getWebsites(),
        getCountries(),
        getProjects()
      ])
      
      setWebsites(websitesData)
      setCountries(countriesData)
      setProjects(projectsData)
    } catch (error) {
      console.error('加载数据失败:', error)
      setErrorMessage(t('submit.loadDataFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedWebsite || !selectedCountry || !selectedProject || !result) {
      setErrorMessage(t('submit.fillAllRequired'))
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    
    try {
      const userIP = getUserIP()
      const canSubmit = await checkIpLimit(userIP)
      
      if (!canSubmit) {
        setErrorMessage(t('submit.submitTooFrequent'))
        setSubmitting(false)
        return
      }

      const submissionData = {
        website_id: selectedWebsite === 'custom' ? null : selectedWebsite,
        country_id: selectedCountry === 'custom' ? null : selectedCountry,
        project_id: selectedProject === 'custom' ? null : selectedProject,
        result,
        note: note.trim() || undefined,
        ip_address: userIP,
        custom_website: selectedWebsite === 'custom' ? customWebsite : null,
        custom_country: selectedCountry === 'custom' ? customCountry : null,
        custom_project: selectedProject === 'custom' ? customProject : null
      }

      const success = await createSubmission(submissionData)

      if (success) {
        setSubmitStatus('success')
        setSelectedWebsite('')
        setSelectedCountry('')
        setSelectedProject('')
        setResult('')
        setNote('')
        
        setTimeout(() => {
          setSubmitStatus('idle')
        }, 3000)
      } else {
        setErrorMessage(t('submit.submitFailed'))
      }
    } catch (error) {
      console.error('提交失败:', error)
      setErrorMessage(t('submit.networkError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('submit.loadingForm')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 md:py-8">
      <div className="max-w-2xl mx-auto px-4">

        {/* 页面标题 - 移动端优化 */}
        <div className="text-center mb-4 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Heart className="h-5 w-5 md:h-8 md:w-8 text-red-500 flex-shrink-0" />
            <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              {t('submit.title')}
            </h1>
          </div>
          <p className="text-gray-600 text-sm md:text-lg px-2 md:px-4">
            {t('submit.subtitle')}
          </p>
        </div>

        {/* 提交表单 - 移动端优化 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-xl">
              <AlertTriangle className="h-4 w-4 md:h-6 md:w-6 text-orange-500 flex-shrink-0" />
              <span className="leading-tight">{t('submit.formTitle')}</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-base text-gray-600 leading-relaxed">
              {t('submit.formDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-2 md:pt-4">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* 网站选择 */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-sm font-medium block">
                  {t('submit.websiteLabel')} <span className="text-red-500">{t('submit.required')}</span>
                  <span className="text-xs text-blue-600 ml-1 md:ml-2">{t('submit.websiteSearchHint')}</span>
                </Label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <InlineSearchableWebsiteSelect
                      websites={websites}
                      value={selectedWebsite === 'custom' ? '' : selectedWebsite}
                      onValueChange={setSelectedWebsite}
                      placeholder={t('submit.websitePlaceholder')}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedWebsite(selectedWebsite === 'custom' ? '' : 'custom')}
                    className={`px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                      selectedWebsite === 'custom' 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    {t('submit.customWebsite')}
                  </Button>
                </div>
                
                {selectedWebsite === 'custom' && (
                  <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-800">
                      {t('submit.customWebsiteInfo')}
                    </Label>
                    <Input
                      placeholder={t('submit.websiteNamePlaceholder')}
                      className="bg-white"
                      value={customWebsite.name}
                      onChange={(e) => setCustomWebsite({...customWebsite, name: e.target.value})}
                    />
                    <Input
                      placeholder={t('submit.websiteUrlPlaceholder')}
                      className="bg-white"
                      value={customWebsite.url}
                      onChange={(e) => setCustomWebsite({...customWebsite, url: e.target.value})}
                    />
                    <p className="text-xs text-blue-600">
                      {t('submit.customWebsiteNote')}
                    </p>
                  </div>
                )}
              </div>

              {/* 国家选择 */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-sm font-medium block">
                  {t('submit.countryLabel')} <span className="text-red-500">{t('submit.required')}</span>
                  <span className="text-xs text-green-600 ml-1 md:ml-2">{t('submit.countrySearchHint')}</span>
                </Label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <SearchableCountrySelect
                      countries={localizedCountries.map(country => ({
                        ...country,
                        name: country.localizedName
                      }))}
                      value={selectedCountry === 'custom' ? '' : selectedCountry}
                      onValueChange={setSelectedCountry}
                      placeholder={t('submit.countryPlaceholder')}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedCountry(selectedCountry === 'custom' ? '' : 'custom')}
                    className={`px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                      selectedCountry === 'custom' 
                        ? 'bg-green-100 border-green-300 text-green-700' 
                        : 'hover:bg-green-50'
                    }`}
                  >
                    {t('submit.customCountry')}
                  </Button>
                </div>
                
                {selectedCountry === 'custom' && (
                  <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-sm font-medium text-green-800">
                      {t('submit.customCountryInfo')}
                    </Label>
                    <Input
                      placeholder={t('submit.countryNamePlaceholder')}
                      className="bg-white"
                      value={customCountry.name}
                      onChange={(e) => setCustomCountry({...customCountry, name: e.target.value})}
                    />
                    <Input
                      placeholder={t('submit.countryCodePlaceholder')}
                      className="bg-white"
                      value={customCountry.code}
                      onChange={(e) => setCustomCountry({...customCountry, code: e.target.value})}
                    />
                    <Input
                      placeholder={t('submit.phoneCodePlaceholder')}
                      className="bg-white"
                      value={customCountry.phone_code}
                      onChange={(e) => setCustomCountry({...customCountry, phone_code: e.target.value})}
                    />
                    <p className="text-xs text-green-600">
                      {t('submit.customCountryNote')}
                    </p>
                  </div>
                )}
              </div>

              {/* 项目选择 */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-sm font-medium block">
                  {t('submit.projectLabel')} <span className="text-red-500">{t('submit.required')}</span>
                  <span className="text-xs text-purple-600 ml-1 md:ml-2">{t('submit.projectSearchHint')}</span>
                </Label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <InlineSearchableProjectSelect
                      projects={projects}
                      value={selectedProject === 'custom' ? '' : selectedProject}
                      onValueChange={setSelectedProject}
                      placeholder={t('submit.projectPlaceholder')}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedProject(selectedProject === 'custom' ? '' : 'custom')}
                    className={`px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                      selectedProject === 'custom' 
                        ? 'bg-purple-100 border-purple-300 text-purple-700' 
                        : 'hover:bg-purple-50'
                    }`}
                  >
                    {t('submit.customProject')}
                  </Button>
                </div>
                
                {selectedProject === 'custom' && (
                  <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Label className="text-sm font-medium text-purple-800">
                      {t('submit.customProjectInfo')}
                    </Label>
                    <Input
                      placeholder={t('submit.projectNamePlaceholder')}
                      className="bg-white"
                      value={customProject.name}
                      onChange={(e) => setCustomProject({...customProject, name: e.target.value})}
                    />
                    <Input
                      placeholder={t('submit.projectCodePlaceholder')}
                      className="bg-white"
                      value={customProject.code}
                      onChange={(e) => setCustomProject({...customProject, code: e.target.value})}
                    />
                    <p className="text-xs text-purple-600">
                      {t('submit.customProjectNote')}
                    </p>
                  </div>
                )}
              </div>

              {/* 结果选择 */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-sm font-medium block">
                  {t('submit.resultLabel')} <span className="text-red-500">{t('submit.required')}</span>
                </Label>
                <div className="grid grid-cols-1 gap-2 md:gap-3">
                  <label className="flex items-center space-x-3 p-3 md:p-4 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors border-red-200 bg-red-50/50">
                    <input
                      type="radio"
                      name="result"
                      value="failure"
                      checked={result === 'failure'}
                      onChange={(e) => setResult(e.target.value as 'failure')}
                      className="w-4 h-4 text-red-600 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-red-700 text-sm md:text-base">{t('submit.failureResult')}</div>
                        <div className="text-xs md:text-sm text-red-600">{t('submit.failureResultDesc')}</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 md:p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border-green-200 bg-green-50/50">
                    <input
                      type="radio"
                      name="result"
                      value="success"
                      checked={result === 'success'}
                      onChange={(e) => setResult(e.target.value as 'success')}
                      className="w-4 h-4 text-green-600 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-green-700 text-sm md:text-base">{t('submit.successResult')}</div>
                        <div className="text-xs md:text-sm text-green-600">{t('submit.successResultDesc')}</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 备注输入 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('submit.noteLabel')}
                </Label>
                <Textarea
                  placeholder={t('submit.notePlaceholder')}
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
                    <span className="text-sm">{t('submit.submitSuccess')}</span>
                  </div>
                </div>
              )}

              {/* 提交按钮 - 移动端优化 */}
              <Button 
                type="submit" 
                disabled={submitting}
                className="btn-primary w-full py-3 md:py-4 px-4 md:px-6 text-base md:text-lg flex items-center justify-center gap-2 font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    <span>{t('submit.submitting')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                    <span>{t('submit.submitShare')}</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}