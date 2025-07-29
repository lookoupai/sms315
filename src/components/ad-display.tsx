import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { incrementViewCount, incrementClickCount } from '../services/ads'
import { useAdsCache } from '../hooks/use-ads-cache'
import { adRefreshManager } from '../utils/ad-refresh-manager'
import type { Ad } from '../services/ads'

interface AdDisplayProps {
  position: 'banner' | 'sidebar' | 'popup' | 'notice'
  className?: string
  maxAds?: number
  enableAutoRefresh?: boolean // 是否启用自动刷新
  refreshInterval?: number // 刷新间隔（毫秒），默认5分钟
  key?: string // 添加key属性来强制重新渲染
}

export default function AdDisplay({ 
  position, 
  className = '', 
  maxAds = 3, 
  enableAutoRefresh = false, // 默认关闭自动刷新
  refreshInterval = 300000 // 默认5分钟
}: AdDisplayProps) {
  const { ads, loading, error, refreshAds, getCacheInfo } = useAdsCache({
    position,
    maxAds,
    cacheTime: 300000 // 5分钟缓存
  })

  // 调试信息
  useEffect(() => {
    const cacheInfo = getCacheInfo()
    console.log(`AdDisplay[${position}] 缓存信息:`, cacheInfo)
    console.log(`AdDisplay[${position}] 当前广告:`, ads)
  }, [ads, position, getCacheInfo])
  
  const [closedAds, setClosedAds] = useState<Set<number>>(new Set())

  useEffect(() => {
    // 记录展示次数（只对新加载的广告记录一次）
    ads.forEach(ad => {
      incrementViewCount(ad.id).catch(console.error)
    })
  }, [ads])

  useEffect(() => {
    // 只在启用自动刷新时设置定时器
    if (enableAutoRefresh) {
      const interval = setInterval(() => {
        refreshAds()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [enableAutoRefresh, refreshInterval, refreshAds])

  useEffect(() => {
    // 监听广告刷新事件
    const unsubscribe = adRefreshManager.addListener(() => {
      console.log(`AdDisplay[${position}] 收到刷新通知，正在刷新...`)
      refreshAds()
    })

    return unsubscribe
  }, [position, refreshAds])

  const handleAdClick = async (ad: Ad) => {
    try {
      await incrementClickCount(ad.id)
      if (ad.link_url) {
        if (ad.target_blank) {
          window.open(ad.link_url, '_blank', 'noopener,noreferrer')
        } else {
          window.location.href = ad.link_url
        }
      }
    } catch (error) {
      console.error('处理广告点击失败:', error)
    }
  }

  const handleCloseAd = (adId: number) => {
    setClosedAds(prev => new Set([...prev, adId]))
  }

  const getImageUrl = (ad: Ad) => {
    // 移动端优先使用移动端图片
    if (window.innerWidth < 768 && ad.mobile_image_url) {
      return ad.mobile_image_url
    }
    return ad.image_url
  }

  if (loading || ads.length === 0) {
    return null
  }

  const visibleAds = ads.filter(ad => !closedAds.has(ad.id))

  if (visibleAds.length === 0) {
    return null
  }

  // 横幅广告样式
  if (position === 'banner') {
    return (
      <div className={`space-y-4 ${className}`}>
        {visibleAds.map(ad => (
          <div
            key={ad.id}
            className="relative bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center p-4 md:p-6">
              {getImageUrl(ad) && (
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <img
                    src={getImageUrl(ad)}
                    alt={ad.title}
                    className="w-full md:w-32 h-20 md:h-20 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {ad.title}
                </h3>
                {ad.content && (
                  <p className="text-gray-600 text-sm md:text-base mb-3">
                    {ad.content}
                  </p>
                )}
                {ad.link_url && (
                  <button
                    onClick={() => handleAdClick(ad)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    了解更多
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {ad.type === 'ad' && (
              <button
                onClick={() => handleCloseAd(ad.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {ad.type === 'notice' ? '公告' : '推广'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 侧边栏广告样式
  if (position === 'sidebar') {
    return (
      <div className={`space-y-4 ${className}`}>
        {visibleAds.map(ad => (
          <div
            key={ad.id}
            className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            {getImageUrl(ad) && (
              <div className="w-full h-32 overflow-hidden">
                <img
                  src={getImageUrl(ad)}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                {ad.title}
              </h4>
              {ad.content && (
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {ad.content}
                </p>
              )}
              {ad.link_url && (
                <button
                  onClick={() => handleAdClick(ad)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  查看详情
                </button>
              )}
            </div>
            {ad.type === 'ad' && (
              <button
                onClick={() => handleCloseAd(ad.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {ad.type === 'notice' ? '公告' : '推广'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 公告栏样式
  if (position === 'notice') {
    return (
      <div className={`space-y-2 ${className}`}>
        {visibleAds.map(ad => (
          <div
            key={ad.id}
            className="relative bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm md:text-base mb-1">
                  {ad.title}
                </h4>
                {ad.content && (
                  <p className="text-gray-700 text-xs md:text-sm">
                    {ad.content}
                  </p>
                )}
                {ad.link_url && (
                  <button
                    onClick={() => handleAdClick(ad)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-xs md:text-sm underline"
                  >
                    查看详情
                  </button>
                )}
              </div>
              {ad.type === 'ad' && (
                <button
                  onClick={() => handleCloseAd(ad.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 弹窗广告样式
  if (position === 'popup') {
    return (
      <>
        {visibleAds.map(ad => (
          <div
            key={ad.id}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {getImageUrl(ad) && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(ad)}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {ad.title}
                  </h3>
                  {ad.content && (
                    <p className="text-gray-600 mb-4">
                      {ad.content}
                    </p>
                  )}
                  <div className="flex gap-3">
                    {ad.link_url && (
                      <button
                        onClick={() => handleAdClick(ad)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        了解更多
                      </button>
                    )}
                    <button
                      onClick={() => handleCloseAd(ad.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      关闭
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleCloseAd(ad.id)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {ad.type === 'notice' ? '公告' : '推广'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    )
  }

  return null
}