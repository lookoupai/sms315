import { supabase } from '../lib/supabase'
import type { Website, Country, Project, Submission } from '../lib/supabase'

// 获取所有网站
export async function getWebsites(includePersonal: boolean = false): Promise<Website[]> {
  let query = supabase
    .from('websites')
    .select('*')
  
  if (includePersonal) {
    // 包含个人服务：显示 active 和 personal 状态
    query = query.in('status', ['active', 'personal'])
  } else {
    // 默认只显示正规平台
    query = query.eq('status', 'active')
  }
  
  const { data, error } = await query.order('name')
  
  if (error) {
    console.error('获取网站列表失败:', error)
    return []
  }
  
  return data || []
}

// 获取所有网站（管理后台用）
export async function getAllWebsitesForAdmin(): Promise<Website[]> {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('获取网站列表失败:', error)
    return []
  }
  
  return data || []
}

// 获取所有国家
export async function getCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('获取国家列表失败:', error)
    return []
  }
  
  return data || []
}

// 获取所有项目
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('获取项目列表失败:', error)
    return []
  }
  
  return data || []
}

// 获取提交记录（带关联数据和分页）
export async function getSubmissions(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    search?: string
    result?: 'all' | 'success' | 'failure'
    website?: string
    country?: string
    project?: string
  }
): Promise<{ data: Submission[]; total: number; hasMore: boolean }> {
  let query = supabase
    .from('submissions')
    .select(`
      *,
      website:websites(*),
      country:countries(*),
      project:projects(*)
    `, { count: 'exact' })

  // 应用筛选条件
  if (filters?.result && filters.result !== 'all') {
    query = query.eq('result', filters.result)
  }

  // 搜索功能需要在前端处理，因为涉及关联表的文本搜索
  // 这里先获取数据，然后在前端进行搜索筛选

  const offset = (page - 1) * pageSize
  
  const { data, error, count } = await query
    .order('result', { ascending: true }) // 失败记录优先
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  
  if (error) {
    console.error('获取提交记录失败:', error)
    return { data: [], total: 0, hasMore: false }
  }
  
  const total = count || 0
  const hasMore = offset + pageSize < total
  
  return { 
    data: data || [], 
    total,
    hasMore
  }
}

// 保留原有的简单获取函数，用于向后兼容
export async function getAllSubmissions(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      website:websites(*),
      country:countries(*),
      project:projects(*)
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    console.error('获取提交记录失败:', error)
    return []
  }
  
  return data || []
}

// 提交新记录
export async function createSubmission(submission: {
  website_id: string | null
  country_id: string | null
  project_id: string | null
  result: 'success' | 'failure'
  note?: string
  ip_address?: string
  custom_website?: { name: string; url: string } | null
  custom_country?: { name: string; code: string; phone_code: string } | null
  custom_project?: { name: string; code: string } | null
}): Promise<boolean> {
  try {
    // 处理自定义网站
    let finalWebsiteId = submission.website_id
    if (submission.custom_website && submission.custom_website.name && submission.custom_website.url) {
      const { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .insert([{
          name: submission.custom_website.name,
          url: submission.custom_website.url,
          status: 'pending' // 待审核状态
        }])
        .select()
        .single()
      
      if (!websiteError && websiteData) {
        finalWebsiteId = websiteData.id
      }
    }

    // 处理自定义国家
    let finalCountryId = submission.country_id
    if (submission.custom_country && submission.custom_country.name && submission.custom_country.code) {
      const { data: countryData, error: countryError } = await supabase
        .from('countries')
        .insert([{
          name: submission.custom_country.name,
          code: submission.custom_country.code.toLowerCase(),
          phone_code: submission.custom_country.phone_code || ''
        }])
        .select()
        .single()
      
      if (!countryError && countryData) {
        finalCountryId = countryData.id
      }
    }

    // 处理自定义项目
    let finalProjectId = submission.project_id
    if (submission.custom_project && submission.custom_project.name && submission.custom_project.code) {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: submission.custom_project.name,
          code: submission.custom_project.code.toLowerCase()
        }])
        .select()
        .single()
      
      if (!projectError && projectData) {
        finalProjectId = projectData.id
      }
    }

    // 提交主记录
    const { error } = await supabase
      .from('submissions')
      .insert([{
        website_id: finalWebsiteId,
        country_id: finalCountryId,
        project_id: finalProjectId,
        result: submission.result,
        note: submission.note,
        ip_address: submission.ip_address
      }])
    
    if (error) {
      console.error('提交记录失败:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('提交过程中发生错误:', error)
    return false
  }
}

// 检查IP频率限制
export async function checkIpLimit(ip_address: string): Promise<boolean> {
  // const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  const { data, error } = await supabase
    .from('ip_logs')
    .select('request_count, last_request_at')
    .eq('ip_address', ip_address)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('检查IP限制失败:', error)
    return false
  }
  
  if (!data) {
    // 新IP，创建记录
    await supabase
      .from('ip_logs')
      .insert([{ ip_address, request_count: 1 }])
    return true
  }
  
  // 检查是否超过限制（每小时10次）
  const lastRequest = new Date(data.last_request_at)
  const now = new Date()
  
  if (now.getTime() - lastRequest.getTime() < 60 * 60 * 1000) {
    if (data.request_count >= 10) {
      return false // 超过限制
    }
  }
  
  // 更新请求计数
  const newCount = now.getTime() - lastRequest.getTime() < 60 * 60 * 1000 
    ? data.request_count + 1 
    : 1
  
  await supabase
    .from('ip_logs')
    .update({ 
      request_count: newCount, 
      last_request_at: now.toISOString() 
    })
    .eq('ip_address', ip_address)
  
  return true
}

// 获取用户IP地址
export function getUserIP(): string {
  // 在实际部署中，这个会通过服务器端获取
  // 这里返回一个模拟IP用于开发测试
  return '127.0.0.1'
}