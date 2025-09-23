import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLocalizedCountryName } from '../utils/country-names'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, ExternalLink, User, Globe } from 'lucide-react'
import { getSubmissionsByWebsiteId, getWebsiteById } from '../services/database'
import type { Submission, Website } from '../lib/supabase'
import { UrlLinkReplacer, SmartLinkReplacer } from '../components/link-replacer'
import AdDisplay from '../components/ad-display'
import { Pagination } from '../components/pagination'

export default function WebsiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [website, setWebsite] = useState<Website | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 20

  useEffect(() => {
    const fetchWebsiteData = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // 获取网站详情
        const websiteData = await getWebsiteById(id)
        if (websiteData) {
          setWebsite(websiteData)
          
          // 获取该网站的提交记录
          const submissionsData = await getSubmissionsByWebsiteId(id, currentPage, pageSize)
          setSubmissions(submissionsData.data)
          setTotalItems(submissionsData.total)
          setHasMore(submissionsData.hasMore)
        } else {
          setError(t('detail.websiteNotFound'))
        }
      } catch (err) {
        console.error('获取网站详情失败:', err)
        setError(t('detail.fetchWebsiteFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchWebsiteData()
  }, [id, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return t('detail.justNow')
    if (diffInHours < 24) return `${diffInHours}${t('detail.hoursAgo')}`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}${t('detail.daysAgo')}`
    return date.toLocaleDateString('zh-CN')
  }

  // 页面标题和描述
  useEffect(() => {
    if (website) {
      const title = `${website.name} - ${t('detail.websiteDetailTitle')}`
      const description = `查看${website.name}的所有接码记录，包括成功和失败的案例。${website.url ? t('detail.officialWebsite') + website.url : ''}`
      
      document.title = `${title} - ${t('nav.title')}`
      
      // 更新meta描述
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
      
      // 添加Open Graph标签
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', title)
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', description)
      if (!document.querySelector('meta[property="og:description"]')) {
        document.head.appendChild(ogDescription)
      }
      
      const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      ogUrl.setAttribute('content', window.location.href)
      if (!document.querySelector('meta[property="og:url"]')) {
        document.head.appendChild(ogUrl)
      }
      
      // 添加结构化数据
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": window.location.href,
        "mainEntity": {
          "@type": "Organization",
          "name": website.name,
          "url": website.url || undefined
        }
      }
      
      let scriptTag = document.getElementById('structured-data')
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.setAttribute('id', 'structured-data')
        scriptTag.setAttribute('type', 'application/ld+json')
        document.head.appendChild(scriptTag)
      }
      scriptTag.textContent = JSON.stringify(structuredData)
    }
  }, [website, t])

  const failureCount = submissions.filter(s => s.result === 'failure').length
  const successCount = submissions.filter(s => s.result === 'success').length
  const totalPages = Math.ceil(totalItems / pageSize)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('detail.loadingWebsite')}</p>
        </div>
      </div>
    )
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('detail.error')}</h3>
            <p className="text-gray-600 mb-4">{error || t('detail.websiteNotFound')}</p>
            <Button onClick={() => navigate('/')}>
              {t('detail.backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 公告栏 */}
        <AdDisplay 
          position="notice" 
          className="mb-6"
        />
        
        {/* 面包屑导航 */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <Globe className="h-4 w-4 mr-1" />
            {t('detail.home')}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{t('detail.websiteDetail')}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{website.name}</span>
        </nav>

        {/* 返回按钮 */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('detail.back')}
        </Button>

        {/* 网站信息卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-500" />
                <span>{website.name}</span>
                {website.status === 'personal' && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-blue-600" />
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {t('guide.personalServiceBadge')}
                    </Badge>
                  </div>
                )}
                {website.status === 'scammer' && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <Badge variant="destructive" className="text-xs">
                      {t('guide.scammerBadge')}
                    </Badge>
                  </div>
                )}
              </CardTitle>
              {website.url && (
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {website.url && (
              <div className="mb-4">
                <span className="font-medium text-gray-700">{t('detail.officialWebsite')}</span>
                <UrlLinkReplacer 
                  href={website.url}
                  className="text-blue-600 hover:text-blue-800 underline ml-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {website.url}
                </UrlLinkReplacer>
              </div>
            )}
            
            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{failureCount}</div>
                  <div className="text-sm text-red-700">{t('detail.failureRecords')}</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-green-700">{t('detail.successRecords')}</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                  <div className="text-sm text-blue-700">{t('detail.totalRecords')}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 提交记录列表 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('detail.smsRecords')}</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('detail.noRecords')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <Card 
                    key={submission.id} 
                    className={`${
                      submission.result === 'failure' 
                        ? 'border-l-4 border-l-red-500 bg-red-50' 
                        : 'border-l-4 border-l-green-500 bg-green-50'
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
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
                            <span className="text-sm text-gray-500 flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(submission.created_at)}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">{t('guide.countryLabel')}</span>
                              <div className="mt-1">
                                <span>
                                  {submission.country?.name ? getLocalizedCountryName(submission.country.name, i18n.language) : t('guide.unknownCountry')}
                                  {submission.country?.code && (
                                    <span className="text-gray-500"> ({submission.country.code})</span>
                                  )}
                                  {submission.country?.phone_code && (
                                    <span className="text-gray-500"> {submission.country.phone_code}</span>
                                  )}
                                </span>
                                {submission.country && (
                                  <div className="mt-1">
                                    <Link 
                                      to={`/country/${submission.country.code}`}
                                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      {t('detail.viewAllCountryRecords')}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">{t('guide.projectLabel')}</span>
                              <div className="mt-1">
                                <span>{submission.project?.name || t('guide.unknownProject')}</span>
                                {submission.project && (
                                  <div className="mt-1">
                                    <Link 
                                      to={`/project/${submission.project.code}`}
                                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      {t('detail.viewAllProjectRecords')}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {submission.note && (
                            <div className="bg-white p-3 rounded border mt-3">
                              <span className="font-medium text-gray-700">{t('guide.noteLabel')}</span>
                              <div className="text-gray-600 mt-1">
                                <SmartLinkReplacer>{submission.note}</SmartLinkReplacer>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          <Link 
                            to={`/record/${submission.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {t('detail.viewDetails')}
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* 横幅广告 */}
        <AdDisplay 
          position="banner" 
          className="mb-8"
        />
      </div>
    </div>
  )
}