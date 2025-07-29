import { useState, useEffect, useCallback } from 'react'
import { getActiveAds } from '../services/ads'
import type { Ad } from '../services/ads'

interface AdsCacheOptions {
  position?: string
  maxAds?: number
  cacheTime?: number // 缓存时间（毫秒），默认5分钟
}

interface AdsCacheState {
  ads: Ad[]
  loading: boolean
  error: string | null
  lastUpdate: number
}

// 全局缓存存储
const adsCache = new Map<string, { data: Ad[], timestamp: number }>()

export function useAdsCache({ 
  position, 
  maxAds = 3, 
  cacheTime = 300000 // 5分钟缓存
}: AdsCacheOptions = {}) {
  const [state, setState] = useState<AdsCacheState>({
    ads: [],
    loading: true,
    error: null,
    lastUpdate: 0
  })

  const cacheKey = `announcements-${position || 'all'}-${maxAds}`

  const loadAds = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // 检查缓存
      const cached = adsCache.get(cacheKey)
      const now = Date.now()
      
      // 如果不是强制刷新，且有缓存，且缓存未过期
      if (!forceRefresh && cached && (now - cached.timestamp) < cacheTime) {
        console.log(`使用缓存数据: ${cacheKey}, 缓存年龄: ${Math.round((now - cached.timestamp) / 1000)}秒`)
        setState({
          ads: cached.data.slice(0, maxAds),
          loading: false,
          error: null,
          lastUpdate: cached.timestamp
        })
        return
      }

      // 从数据库获取新数据
      console.log(`从数据库获取广告数据: ${position || 'all'}, 强制刷新: ${forceRefresh}`)
      const adsData = await getActiveAds(position)
      const limitedAds = adsData.slice(0, maxAds)

      // 更新缓存
      adsCache.set(cacheKey, {
        data: adsData,
        timestamp: now
      })

      setState({
        ads: limitedAds,
        loading: false,
        error: null,
        lastUpdate: now
      })

      console.log(`缓存已更新: ${cacheKey}, 获取到 ${adsData.length} 个广告`, adsData)
    } catch (error) {
      console.error('加载广告失败:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载失败'
      }))
    }
  }, [position, maxAds, cacheKey, cacheTime])

  // 手动刷新缓存
  const refreshAds = useCallback(() => {
    loadAds(true)
  }, [loadAds])

  // 清除指定缓存
  const clearCache = useCallback((key?: string) => {
    if (key) {
      adsCache.delete(key)
    } else {
      adsCache.clear()
    }
  }, [])

  // 获取缓存状态
  const getCacheInfo = useCallback(() => {
    const cached = adsCache.get(cacheKey)
    return {
      hasCached: !!cached,
      cacheAge: cached ? Date.now() - cached.timestamp : 0,
      cacheSize: adsCache.size
    }
  }, [cacheKey])

  useEffect(() => {
    loadAds()
    
    // 监听缓存清除事件
    const handleCacheCleared = () => {
      console.log(`收到缓存清除事件，重新加载: ${cacheKey}`)
      loadAds(true) // 强制刷新
    }
    
    const handleCacheUpdated = () => {
      console.log(`收到缓存更新事件，重新加载: ${cacheKey}`)
      loadAds(false) // 正常加载（会使用新缓存）
    }
    
    window.addEventListener('ads-cache-cleared', handleCacheCleared)
    window.addEventListener('ads-cache-updated', handleCacheUpdated)
    
    return () => {
      window.removeEventListener('ads-cache-cleared', handleCacheCleared)
      window.removeEventListener('ads-cache-updated', handleCacheUpdated)
    }
  }, [loadAds])

  return {
    ...state,
    refreshAds,
    clearCache,
    getCacheInfo
  }
}

// 全局缓存管理工具
export const AdsCacheManager = {
  // 清除所有缓存
  clearAll: () => {
    const beforeSize = adsCache.size
    adsCache.clear()
    console.log(`已清除 ${beforeSize} 个广告缓存项`)
    
    // 触发所有使用缓存的组件重新加载
    window.dispatchEvent(new CustomEvent('ads-cache-cleared'))
  },
  
  // 预加载广告数据
  preload: async (positions: string[] = ['notice', 'banner', 'sidebar']) => {
    console.log('开始预加载广告数据...', positions)
    const promises = positions.map(async (position) => {
      try {
        const data = await getActiveAds(position)
        // 为不同的maxAds值创建缓存
        const cacheKeys = [`announcements-${position}-3`, `announcements-${position}-1`, `announcements-${position}-5`]
        
        cacheKeys.forEach(cacheKey => {
          adsCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          })
        })
        
        console.log(`预加载完成: ${position}, 获取到 ${data.length} 个公告，缓存键: ${cacheKeys.join(', ')}`)
        return { position, count: data.length, success: true, cacheKeys }
      } catch (error) {
        console.error(`预加载失败: ${position}`, error)
        return { position, error, success: false }
      }
    })
    
    const results = await Promise.all(promises)
    console.log('广告数据预加载完成:', results)
    
    // 触发组件更新
    window.dispatchEvent(new CustomEvent('ads-cache-updated'))
    
    return results
  },
  
  // 获取缓存统计
  getStats: () => {
    const stats = {
      totalCached: adsCache.size,
      cacheKeys: Array.from(adsCache.keys()),
      totalMemory: 0
    }
    
    adsCache.forEach((value) => {
      stats.totalMemory += JSON.stringify(value).length
    })
    
    return stats
  }
}