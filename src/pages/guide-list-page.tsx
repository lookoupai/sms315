import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, CheckCircle, Search, Filter, Clock, RefreshCw } from 'lucide-react'
import { getSubmissions, getWebsites, getCountries, getProjects } from '../services/database'
import { Pagination } from '../components/pagination'
import { SearchableSelect } from '../components/searchable-select'
import { getLocalizedCountries } from '../utils/country-names'
import type { Submission, Website, Country, Project } from '../lib/supabase'
import AdDisplay from '../components/ad-display'
import { UrlLinkReplacer, SmartLinkReplacer } from '../components/link-replacer'

const GuideListPage = () => {
  const { t, i18n } = useTranslation()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [localizedCountries, setLocalizedCountries] = useState<(Country & { localizedName: string })[]>([])
  const [, setProjects] = useState<Project[]>([])
  const [filters, setFilters] = useState({
    search: '',
    result: 'all',
    website: 'all',
    country: 'all',
    project: 'all'
  })
  const [includePersonal, setIncludePersonal] = useState(true)
  const [includeScammer, setIncludeScammer] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [, setHasMore] = useState(false)
  const pageSize = 20

  // 加载基础数据（网站、国家、项目列表）
  useEffect(() => {
    const loadBasicData = async () => {
      try {
        const [websitesData, countriesData, projectsData] = await Promise.all([
          getWebsites(includePersonal, includeScammer), // 同时传入两个参数
          getCountries(),
          getProjects()
        ])
        setWebsites(websitesData)
        setCountries(countriesData)
        setProjects(projectsData)
      } catch (error) {
        console.error('加载基础数据失败:', error)
      }
    }
    loadBasicData()
  }, [includePersonal, includeScammer]) // 添加 includeScammer 作为依赖

  // 当语言或国家数据变化时，更新本地化的国家列表
  useEffect(() => {
    if (countries.length > 0) {
      const localized = getLocalizedCountries(countries, i18n.language)
      setLocalizedCountries(localized)
    }
  }, [countries, i18n.language])

  // 加载提交记录
  const loadSubmissions = useCallback(async (page: number = 1, showLoading: boolean = true) => {
    if (showLoading) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const result = await getSubmissions(page, pageSize, {
        result: filters.result as 'all' | 'success' | 'failure',
        website: filters.website === 'all' ? undefined : filters.website,
        country: filters.country === 'all' ? undefined : filters.country,
        project: filters.project === 'all' ? undefined : filters.project
      })
      
      setSubmissions(result.data)
      setTotalItems(result.total)
      setHasMore(result.hasMore)
      setCurrentPage(page)
    } catch (error) {
      console.error('加载提交记录失败:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters])

  // 初始加载
  useEffect(() => {
    loadSubmissions(1, true)
  }, [loadSubmissions])

  // 前端搜索筛选（因为涉及关联表的文本搜索）
  useEffect(() => {
    let filtered = submissions

    // 服务类型过滤
    filtered = filtered.filter(item => {
      if (!item.website) return true;
      
      if (item.website.status === 'personal' && !includePersonal) return false;
      if (item.website.status === 'scammer' && !includeScammer) return false;
      
      return true;
    });

    // 搜索过滤 - 支持网站名称、网站URL、国家名称、国家代码、电话区号、项目、备注
    if (filters.search) {
      filtered = filtered.filter(item =>
        (item.website?.name && item.website.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.website?.url && item.website.url.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.country?.name && item.country.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.country?.code && item.country.code.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.country?.phone_code && item.country.phone_code.includes(filters.search)) ||
        (item.project?.name && item.project.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }
    
    // 网站筛选
    if (filters.website && filters.website !== 'all') {
      // 从 value 中提取网站名称（格式为 "name_id"）
      const websiteName = filters.website.split('_')[0];
      filtered = filtered.filter(item => 
        item.website?.name === websiteName
      );
    }
    
    // 国家筛选
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(item => 
        item.country?.name === filters.country
      );
    }
    
    // 项目筛选
    if (filters.project && filters.project !== 'all') {
      filtered = filtered.filter(item => 
        item.project?.name === filters.project
      );
    }

    setFilteredSubmissions(filtered)
  }, [submissions, filters, includePersonal, includeScammer])

  // 搜索输入
  const [searchTerm, setSearchTerm] = useState('');

  // 处理筛选器变化
  const handleFilterChange = (key: string, value: string) => {
    // 更新筛选条件
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // 对于结果筛选，我们需要重新加载数据
    if (key === 'result') {
      // 重置到第一页
      setCurrentPage(1);
      loadSubmissions(1, false);
    }
    // 对于网站、国家和项目筛选，我们在前端进行筛选，不需要重新加载数据
  }
  
  // 处理搜索提交
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }

  // 处理页面变化
  const handlePageChange = (page: number) => {
    loadSubmissions(page, false)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 刷新数据
  const handleRefresh = () => {
    loadSubmissions(currentPage, false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return '刚刚'
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffHours < 48) return '昨天'
    return date.toLocaleDateString('zh-CN')
  }

  const failureCount = filteredSubmissions.filter(item => item.result === 'failure').length
  const successCount = filteredSubmissions.filter(item => item.result === 'success').length
  const totalPages = Math.ceil(totalItems / pageSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 公告栏 */}
      <AdDisplay 
        position="notice" 
        className="mb-4"
      />

      {/* 页面标题 - 移动端优化 */}
      <div className="text-center space-y-2 mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-5 w-5 md:h-8 md:w-8 text-red-500 flex-shrink-0" />
          <span className="leading-tight">{t('guide.title')}</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base px-2 md:px-4 leading-relaxed">{t('guide.subtitle')}</p>
      </div>

      {/* 横幅广告 */}
      <AdDisplay 
        position="banner" 
        className="mb-6"
      />

      {/* 统计信息 - 移动端优化 */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-2 text-center md:text-left">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500 mb-1 md:mb-0" />
              <div>
                <p className="text-lg md:text-2xl font-bold text-red-600">{failureCount}</p>
                <p className="text-xs md:text-sm text-gray-600">{t('guide.failureRecords')}</p>
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
                <p className="text-xs md:text-sm text-gray-600">{t('guide.successRecords')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="flex flex-col md:flex-row items-center md:space-x-2 text-center md:text-left">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mb-1 md:mb-0" />
              <div>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{totalItems}</p>
                <p className="text-xs md:text-sm text-gray-600">{t('guide.totalRecords')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 服务类型筛选 - 独立区域 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{t('submit.personalService')}</h3>
                  <p className="text-sm text-blue-700">{t('submit.personalServiceDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePersonal}
                  onChange={(e) => setIncludePersonal(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between border-t border-blue-200 pt-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">{t('guide.showScammers')}</h3>
                  <p className="text-sm text-red-700">{t('guide.showScammersDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScammer}
                  onChange={(e) => setIncludeScammer(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>{t('guide.filterConditions')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('common.refresh')}</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.search')}</label>
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative flex">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <div className="relative flex-1">
                    <Input
                      placeholder={t('guide.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-8 min-h-[44px] w-full rounded-r-none"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setFilters(prev => ({ ...prev, search: '' }));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="rounded-l-none"
                  >
                    搜索
                  </Button>
                </div>
              </form>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('guide.resultType')}</label>
              <Select value={filters.result} onValueChange={(value) => handleFilterChange('result', value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('guide.allResults')}</SelectItem>
                  <SelectItem value="failure">{t('guide.failureOnly')}</SelectItem>
                  <SelectItem value="success">{t('guide.successOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('guide.website')}</label>
              <SearchableSelect
                options={[
                  { value: 'all', label: t('guide.allWebsites') },
                  ...websites.map(website => ({
                    value: `${website.name}_${website.id}`, // 使用网站名称和ID组合作为唯一值
                    label: website.name
                  }))
                ]}
                value={filters.website}
                onValueChange={(value) => handleFilterChange('website', value)}
                placeholder={t('guide.allWebsites')}
                searchPlaceholder={t('guide.searchWebsites')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('guide.country')}</label>
              <SearchableSelect
                options={[
                  { value: 'all', label: t('guide.allCountries') },
                  ...localizedCountries.map(country => ({
                    value: country.name,
                    label: `${country.localizedName} ${country.code ? `(${country.code})` : ''}`
                  }))
                ]}
                value={filters.country}
                onValueChange={(value) => handleFilterChange('country', value)}
                placeholder={t('guide.allCountries')}
                searchPlaceholder={t('guide.searchCountries')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 记录列表 */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">{t('guide.noRecordsFound')}</p>
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
                          {submission.result === 'failure' ? t('guide.smsFailure') : t('guide.smsSuccess')}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(submission.created_at)}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">{t('guide.websiteLabel')}</span>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="flex items-center space-x-2">
                          {submission.website?.status === 'personal' && (
                              <div className="flex items-center space-x-1">
                                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">{t('guide.personalServiceBadge')}</Badge>
                              </div>
                            )}
                          {submission.website?.status === 'scammer' && (
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <Badge variant="destructive" className="text-xs">{t('guide.scammerBadge')}</Badge>
                              </div>
                            )}
                            <span>{submission.website?.name || t('guide.unknownWebsite')}</span>
                          </div>
                          {submission.website?.url && (
                            <>
                              <span className="text-gray-500">(</span>
                              <UrlLinkReplacer 
                                href={submission.website.url}
                                className="text-blue-600 hover:text-blue-800 underline text-xs"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {submission.website.url}
                              </UrlLinkReplacer>
                              <span className="text-gray-500">)</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{t('guide.countryLabel')}</span>
                        <div className="mt-1">
                          <span>
                            {submission.country 
                              ? localizedCountries.find(c => c.id === submission.country?.id)?.localizedName || 
                                (submission.country.name && /^[a-zA-Z\s\(\)]+$/.test(submission.country.name) 
                                  ? submission.country.name 
                                  : t('guide.unknownCountry'))
                              : t('guide.unknownCountry')
                            }
                          </span>
                          {submission.country?.code && (
                            <span className="text-gray-500"> ({submission.country.code})</span>
                          )}
                          {submission.country?.phone_code && (
                            <span className="text-gray-500"> {submission.country.phone_code}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{t('guide.projectLabel')}</span>
                        <div className="mt-1">
                          <span>{submission.project?.name || t('guide.unknownProject')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {submission.note && (
                      <div className="bg-white p-3 rounded border">
                        <span className="font-medium text-gray-700">{t('guide.noteLabel')}</span>
                        <div className="text-gray-600 mt-1">
                          <SmartLinkReplacer>{submission.note}</SmartLinkReplacer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 分页组件 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={pageSize}
          />
        </div>
      )}
    </div>
  )
}

export default GuideListPage