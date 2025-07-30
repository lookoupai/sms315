import { useState, useEffect, useCallback, useMemo } from 'react'
import { getLinkReplacements, replaceLinksInText, replaceSingleUrl } from '../services/linkReplacement'
import type { LinkReplacement } from '../lib/supabase'

// 全局状态，避免重复请求
let globalReplacements: LinkReplacement[] = []
let globalLoading = false
let globalError: string | null = null
let subscribers: Set<() => void> = new Set()

// 通知所有订阅者
function notifySubscribers() {
  subscribers.forEach(callback => callback())
}

// 加载替换规则
async function loadReplacements() {
  if (globalLoading) return
  
  globalLoading = true
  globalError = null
  notifySubscribers()
  
  try {
    const replacements = await getLinkReplacements()
    globalReplacements = replacements
    globalError = null
  } catch (error) {
    globalError = error instanceof Error ? error.message : '加载链接替换规则失败'
    console.error('加载链接替换规则失败:', error)
  } finally {
    globalLoading = false
    notifySubscribers()
  }
}

// 主要的链接替换 Hook
export function useLinkReplacement() {
  const [, forceUpdate] = useState({})
  
  // 订阅全局状态变化
  useEffect(() => {
    const callback = () => forceUpdate({})
    subscribers.add(callback)
    
    // 如果还没有加载过，立即加载
    if (globalReplacements.length === 0 && !globalLoading) {
      loadReplacements()
    }
    
    return () => {
      subscribers.delete(callback)
    }
  }, [])
  
  // 替换文本中的链接 - 使用 useCallback 避免重复创建函数
  const replaceLinks = useCallback((text: string): string => {
    if (!text || globalReplacements.length === 0) {
      return text
    }
    return replaceLinksInText(text, globalReplacements)
  }, [globalReplacements.length]) // 只在替换规则数量变化时重新创建
  
  // 替换单个URL - 使用 useCallback 避免重复创建函数
  const replaceUrl = useCallback((url: string): string => {
    if (!url || globalReplacements.length === 0) {
      return url
    }
    return replaceSingleUrl(url, globalReplacements)
  }, [globalReplacements.length])
  
  // 手动刷新替换规则
  const refresh = useCallback(() => {
    loadReplacements()
  }, [])
  
  return {
    replaceLinks,
    replaceUrl,
    refresh,
    loading: globalLoading,
    error: globalError,
    hasReplacements: globalReplacements.length > 0
  }
}

// 轻量级 Hook，只用于检查是否有替换规则
export function useHasLinkReplacements(): boolean {
  const [, forceUpdate] = useState({})
  
  useEffect(() => {
    const callback = () => forceUpdate({})
    subscribers.add(callback)
    
    if (globalReplacements.length === 0 && !globalLoading) {
      loadReplacements()
    }
    
    return () => {
      subscribers.delete(callback)
    }
  }, [])
  
  return globalReplacements.length > 0
}

// 用于管理员页面的 Hook，提供完整的 CRUD 功能
export function useLinkReplacementAdmin() {
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  
  const { replaceLinks, replaceUrl, refresh, loading, error, hasReplacements } = useLinkReplacement()
  
  // 强制刷新（管理员操作后调用）
  const forceRefresh = useCallback(async () => {
    setLocalLoading(true)
    setLocalError(null)
    
    try {
      // 清除全局缓存
      globalReplacements = []
      await loadReplacements()
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : '刷新失败')
    } finally {
      setLocalLoading(false)
    }
  }, [])
  
  return {
    replaceLinks,
    replaceUrl,
    refresh,
    forceRefresh,
    loading: loading || localLoading,
    error: error || localError,
    hasReplacements,
    replacements: globalReplacements
  }
}

// 性能优化的文本替换组件 Hook
export function useOptimizedTextReplacement(text: string) {
  const { replaceLinks, hasReplacements } = useLinkReplacement()
  
  // 使用 useMemo 缓存替换结果，只在文本或替换规则变化时重新计算
  const replacedText = useMemo(() => {
    if (!hasReplacements || !text) {
      return text
    }
    return replaceLinks(text)
  }, [text, hasReplacements, replaceLinks])
  
  return replacedText
}

// 性能优化的URL替换 Hook
export function useOptimizedUrlReplacement(url: string) {
  const { replaceUrl, hasReplacements } = useLinkReplacement()
  
  // 使用 useMemo 缓存替换结果
  const replacedUrl = useMemo(() => {
    if (!hasReplacements || !url) {
      return url
    }
    return replaceUrl(url)
  }, [url, hasReplacements, replaceUrl])
  
  return replacedUrl
}