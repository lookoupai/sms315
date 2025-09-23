import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLocalizedCountryName } from '../utils/country-names'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, ExternalLink, User, Home } from 'lucide-react'
import { getSubmissionById } from '../services/database'
import type { Submission } from '../lib/supabase'
import { UrlLinkReplacer, SmartLinkReplacer } from '../components/link-replacer'
import AdDisplay from '../components/ad-display'

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const data = await getSubmissionById(id)
        if (data) {
          setSubmission(data)
        } else {
          setError(t('detail.recordNotFound'))
        }
      } catch (err) {
        console.error('获取记录详情失败:', err)
        setError(t('detail.fetchRecordFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [id])

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
    if (submission) {
      const localizedCountryName = submission.country?.name ? getLocalizedCountryName(submission.country.name, i18n.language) : t('guide.unknownCountry')
      const title = `${submission.website?.name || t('guide.unknownWebsite')} - ${localizedCountryName} - ${submission.project?.name || t('guide.unknownProject')} - ${submission.result === 'success' ? t('detail.success') : t('detail.failure')}记录`
      const description = `用户分享的接码${submission.result === 'success' ? t('detail.success') : t('detail.failure')}经历：网站${submission.website?.name}，国家${localizedCountryName}，项目${submission.project?.name}。${submission.note || '无备注'}`
      
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
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "datePublished": submission.created_at,
        "author": {
          "@type": "Organization",
          "name": t('nav.title')
        },
        "publisher": {
          "@type": "Organization", 
          "name": t('nav.title')
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
  }, [submission, t])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('detail.loadingRecord')}</p>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('detail.error')}</h3>
            <p className="text-gray-600 mb-4">{error || t('detail.recordNotFound')}</p>
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
      <div className="max-w-4xl mx-auto px-4">
        {/* 公告栏 */}
        <AdDisplay 
          position="notice" 
          className="mb-6"
        />
        
        {/* 面包屑导航 */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <Home className="h-4 w-4 mr-1" />
            {t('detail.home')}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{t('detail.recordDetail')}</span>
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

        {/* 记录详情卡片 */}
        <Card className={`mb-8 ${
          submission.result === 'failure' 
            ? 'border-l-4 border-l-red-500 bg-red-50' 
            : 'border-l-4 border-l-green-500 bg-green-50'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {submission.result === 'failure' ? (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
                <span>
                  {submission.result === 'failure' ? t('detail.smsFailureRecord') : t('detail.smsSuccessRecord')}
                </span>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{formatDate(submission.created_at)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 网站信息 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">{t('detail.websiteInfo')}</h3>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-lg">{submission.website?.name || t('guide.unknownWebsite')}</div>
                      {submission.website?.url && (
                        <div className="text-sm text-gray-600 mt-1">
                          <UrlLinkReplacer 
                            href={submission.website.url}
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {submission.website.url}
                          </UrlLinkReplacer>
                        </div>
                      )}
                    </div>
                    {submission.website?.status === 'personal' && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-blue-600" />
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {t('guide.personalServiceBadge')}
                        </Badge>
                      </div>
                    )}
                    {submission.website?.status === 'scammer' && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <Badge variant="destructive" className="text-xs">
                          {t('guide.scammerBadge')}
                        </Badge>
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
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
                {submission.website && (
                  <div className="mt-3">
                    <Link 
                      to={`/website/${submission.website.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {t('detail.viewAllWebsiteRecords')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 国家信息 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">{t('detail.countryInfo')}</h3>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-lg">
                  {submission.country?.name ? getLocalizedCountryName(submission.country.name, i18n.language) : t('guide.unknownCountry')}
                  {submission.country?.code && (
                    <span className="text-gray-500 ml-2">({submission.country.code})</span>
                  )}
                  {submission.country?.phone_code && (
                    <span className="text-gray-500 ml-2">{submission.country.phone_code}</span>
                  )}
                </div>
                {submission.country && (
                  <div className="mt-3">
                    <Link 
                      to={`/country/${submission.country.code}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {t('detail.viewAllCountryRecords')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 项目信息 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">{t('detail.projectInfo')}</h3>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-lg">
                  {submission.project?.name || t('guide.unknownProject')}
                </div>
                {submission.project && (
                  <div className="mt-3">
                    <Link 
                      to={`/project/${submission.project.code}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {t('detail.viewAllProjectRecords')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 备注 */}
            {submission.note && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">{t('detail.note')}</h3>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-gray-700">
                    <SmartLinkReplacer>{submission.note}</SmartLinkReplacer>
                  </div>
                </div>
              </div>
            )}

            {/* 状态标签 */}
            <div className="flex justify-center">
              <Badge 
                variant={submission.result === 'failure' ? 'destructive' : 'default'}
                className="text-lg px-4 py-2"
              >
                {submission.result === 'failure' ? t('guide.smsFailure') : t('guide.smsSuccess')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 横幅广告 */}
        <AdDisplay 
          position="banner" 
          className="mb-8"
        />

        {/* 相关记录建议 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('detail.relatedRecords')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.website && (
                <Link 
                  to={`/website/${submission.website.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">{submission.website.name}{t('detail.allRecordsOf')}</h4>
                  <p className="text-sm text-gray-600 mt-1">{t('detail.viewAllRecordsOfWebsite')}</p>
                </Link>
              )}
              {submission.country && (
                <Link 
                  to={`/country/${submission.country.code}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">{getLocalizedCountryName(submission.country.name, i18n.language)}{t('detail.allRecordsOf')}</h4>
                  <p className="text-sm text-gray-600 mt-1">{t('detail.viewAllRecordsOfCountry')}</p>
                </Link>
              )}
              {submission.project && (
                <Link 
                  to={`/project/${submission.project.code}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">{submission.project.name}{t('detail.allRecordsOf')}</h4>
                  <p className="text-sm text-gray-600 mt-1">{t('detail.viewAllRecordsOfProject')}</p>
                </Link>
              )}
              <Link 
                to="/"
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium">{t('detail.latestRecords')}</h4>
                <p className="text-sm text-gray-600 mt-1">{t('detail.viewAllLatestRecords')}</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}