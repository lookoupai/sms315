import { supabase } from '../lib/supabase'
import type { LinkReplacement } from '../lib/supabase'

// 缓存替换规则，减少数据库查询
let cachedReplacements: LinkReplacement[] = []
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 60分钟缓存，减少数据库请求

// 获取所有活跃的链接替换规则
export async function getLinkReplacements(): Promise<LinkReplacement[]> {
  const now = Date.now()
  
  // 如果缓存仍然有效，直接返回缓存
  if (cachedReplacements.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
    return cachedReplacements
  }
  
  try {
    const { data, error } = await supabase
      .from('link_replacements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取链接替换规则失败:', error)
      return cachedReplacements // 返回旧缓存
    }
    
    // 更新缓存
    cachedReplacements = data || []
    cacheTimestamp = now
    
    return cachedReplacements
  } catch (error) {
    console.error('获取链接替换规则异常:', error)
    return cachedReplacements
  }
}

// 清除缓存（管理员更新规则时调用）
export function clearLinkReplacementCache(): void {
  cachedReplacements = []
  cacheTimestamp = 0
}

// 替换文本中的链接
export function replaceLinksInText(text: string, replacements: LinkReplacement[]): string {
  if (!text || replacements.length === 0) {
    return text
  }
  
  let result = text
  
  // 按匹配类型分组处理，提高效率
  const exactMatches = replacements.filter(r => r.match_type === 'exact')
  const domainMatches = replacements.filter(r => r.match_type === 'domain')
  const containsMatches = replacements.filter(r => r.match_type === 'contains')
  
  // 精确匹配 - 最快
  exactMatches.forEach(replacement => {
    if (result.includes(replacement.original_url)) {
      result = result.replace(
        new RegExp(escapeRegExp(replacement.original_url), 'g'),
        replacement.replacement_url
      )
    }
  })
  
  // 域名匹配
  domainMatches.forEach(replacement => {
    const domainRegex = new RegExp(
      `https?://${escapeRegExp(replacement.original_url)}(?:/[^\\s]*)?`,
      'gi'
    )
    result = result.replace(domainRegex, (match) => {
      // 保留原URL的路径和参数，只替换域名部分
      const url = new URL(match)
      return replacement.replacement_url + url.pathname + url.search + url.hash
    })
  })
  
  // 包含匹配 - 最慢，放在最后
  containsMatches.forEach(replacement => {
    if (result.includes(replacement.original_url)) {
      result = result.replace(
        new RegExp(escapeRegExp(replacement.original_url), 'g'),
        replacement.replacement_url
      )
    }
  })
  
  return result
}

// 替换URL（用于直接的URL替换）
export function replaceSingleUrl(url: string, replacements: LinkReplacement[]): string {
  if (!url || replacements.length === 0) {
    return url
  }
  
  // 优先精确匹配
  const exactMatch = replacements.find(r => 
    r.match_type === 'exact' && r.original_url === url
  )
  if (exactMatch) {
    return exactMatch.replacement_url
  }
  
  // 域名匹配
  try {
    const urlObj = new URL(url)
    const domainMatch = replacements.find(r => 
      r.match_type === 'domain' && urlObj.hostname === r.original_url
    )
    if (domainMatch) {
      return domainMatch.replacement_url + urlObj.pathname + urlObj.search + urlObj.hash
    }
  } catch (e) {
    // URL 解析失败，继续其他匹配
  }
  
  // 包含匹配
  const containsMatch = replacements.find(r => 
    r.match_type === 'contains' && url.includes(r.original_url)
  )
  if (containsMatch) {
    return url.replace(containsMatch.original_url, containsMatch.replacement_url)
  }
  
  return url
}

// 转义正则表达式特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 管理员操作：添加链接替换规则
export async function addLinkReplacement(replacement: Omit<LinkReplacement, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('link_replacements')
      .insert([replacement])
    
    if (error) {
      console.error('添加链接替换规则失败:', error)
      return false
    }
    
    // 清除缓存，强制重新获取
    clearLinkReplacementCache()
    return true
  } catch (error) {
    console.error('添加链接替换规则异常:', error)
    return false
  }
}

// 管理员操作：更新链接替换规则
export async function updateLinkReplacement(id: string, updates: Partial<LinkReplacement>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('link_replacements')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('更新链接替换规则失败:', error)
      return false
    }
    
    // 清除缓存
    clearLinkReplacementCache()
    return true
  } catch (error) {
    console.error('更新链接替换规则异常:', error)
    return false
  }
}

// 管理员操作：删除链接替换规则
export async function deleteLinkReplacement(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('link_replacements')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除链接替换规则失败:', error)
      return false
    }
    
    // 清除缓存
    clearLinkReplacementCache()
    return true
  } catch (error) {
    console.error('删除链接替换规则异常:', error)
    return false
  }
}

// 获取所有链接替换规则（管理员用）
export async function getAllLinkReplacements(): Promise<LinkReplacement[]> {
  try {
    const { data, error } = await supabase
      .from('link_replacements')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取所有链接替换规则失败:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('获取所有链接替换规则异常:', error)
    return []
  }
}